# Sprint C — Audit & repair budget data inconsistency

> **Repo cible** : `sebastien-sanita/the-sheep-app` (NestJS backend)
> **Local** : `C:\Users\sebas\Desktop\Developpeur\The sheep\`
> **Préambule** : à exécuter sur une nouvelle branche `fix/budget-data-audit` puis PR vers `main`. Comme `main` auto-deploy en prod, on **ne touche pas la production sans QA SQL préalable**.

## Contexte

Le frontend `/flux` a remonté des cards Claude avec des budgets aberrants :
- **Body House** : `dailyBudget = 33010` dans le DB mirror (= 3 campagnes ~11k €/j en euros, ou ~110 €/j si l'unité réelle est cents)
- **Ôcargo / Ôcargo Campagne Franchisé** : `dailyBudget = 1800` → 54 000 € attendus sur 30 j vs 21 526 € de spend réel = ratio 2,5×

Hypothèse forte : **certaines lignes `UnifiedCampaign.dailyBudget` / `lifetimeBudget` sont stockées en cents Meta natifs au lieu d'euros**, contrairement à la convention documentée du codebase :

> *"The DB mirror (UnifiedCampaign.dailyBudget / lifetimeBudget) also stores EUR — the read-side sync (meta-ads.transformer.ts) divides Meta's cents by 100 before persisting, so we read/write in EUR."*
> — `apps/api/src/modules/connectors/platforms/meta-write.service.ts:190-194`

## Diagnostic du code

Audit fait depuis le frontend repo, à confirmer côté backend :

| Path | Comportement | Statut |
|---|---|---|
| `apps/api/src/modules/sync/transformers/meta-ads.transformer.ts:75-79` | `parseFloat(raw.daily_budget) / 100` | ✅ OK — divise correctement |
| `apps/api/src/modules/sync/jobs/sync-meta-ads.job.ts:160,176` | utilise `transformed.budget` (déjà ÷100) | ✅ OK |
| `apps/api/src/modules/connectors/platforms/meta-write.service.ts:299,461` | lit + écrit en EUR | ✅ OK |
| `apps/api/src/modules/campaigns/campaigns.service.ts:72,95` | écrit `dto.dailyBudget` brut, **sans validation d'unité** | ⚠️ **suspect** — création manuelle peut introduire des cents |
| `apps/api/src/modules/chat/tools/tool-executor.ts:138,216` | retourne le mirror DB tel quel | ✅ OK (consommateur, pas écrivain) |

Le code est *cohérent en théorie*, mais aucune invariant n'empêche un upstream pourri d'écrire des cents en mirror.

## Tâches

### C1 — SQL audit (pas d'écriture, lecture seule)

**Objectif** : lister toutes les lignes `UnifiedCampaign` avec un `dailyBudget` ou `lifetimeBudget` qui semble être en cents (×100 trop grand) plutôt qu'en EUR.

Heuristique : croiser avec `DailyMetric.spend` agrégé sur 30j.

```sql
WITH campaign_30d_spend AS (
  SELECT
    dm."campaignId" AS campaign_id,
    SUM(dm.spend) AS spend_30d
  FROM "DailyMetric" dm
  WHERE dm.date >= CURRENT_DATE - INTERVAL '30 days'
    AND dm."campaignId" IS NOT NULL
  GROUP BY dm."campaignId"
)
SELECT
  uc.id,
  uc."workspaceId",
  uc.name,
  uc.status,
  uc."dailyBudget"::numeric AS daily_budget,
  uc."lifetimeBudget"::numeric AS lifetime_budget,
  COALESCE(s.spend_30d, 0) AS spend_30d,
  CASE
    WHEN uc."dailyBudget" IS NOT NULL AND COALESCE(s.spend_30d, 0) >= 100
      THEN ROUND((uc."dailyBudget"::numeric * 30) / s.spend_30d, 1)
    ELSE NULL
  END AS daily_to_actual_ratio,
  uc."updatedAt"
FROM "UnifiedCampaign" uc
LEFT JOIN campaign_30d_spend s ON s.campaign_id = uc.id
WHERE
  uc.status IN ('ACTIVE', 'PAUSED')
  AND (
    -- daily budgets implausibles (> 5× le spend mensuel équivalent)
    (uc."dailyBudget" IS NOT NULL
      AND COALESCE(s.spend_30d, 0) >= 100
      AND (uc."dailyBudget"::numeric * 30) / s.spend_30d > 5)
    OR
    -- daily budget > 5000 €/j tout court (probable cents)
    (uc."dailyBudget"::numeric > 5000)
    OR
    -- lifetime budget > 100 000 € (probable cents)
    (uc."lifetimeBudget"::numeric > 100000)
  )
ORDER BY daily_to_actual_ratio DESC NULLS LAST
LIMIT 200;
```

**Attendu** : une liste de 10–50 lignes. Inspecter manuellement quelques unes pour confirmer l'hypothèse cents (vérifier contre le Ads Manager Meta du compte concerné).

### C2 — Cause racine : forcer un re-sync complet

Si l'hypothèse cents/euros est confirmée sur des lignes Body House / Ôcargo, deux scenarios :

**Scenario A — Lignes vieilles, jamais re-syncées depuis ajout du ÷100** : un re-sync via `sync-meta-ads.job` corrige tout (le transformer écrasera avec les vraies valeurs en EUR). Vérifier : déclencher une sync manuelle sur Body House et ré-exécuter la query C1 — la ligne doit disparaître.

**Scenario B — Création manuelle via `campaigns.service.ts`** : ces campagnes ne sont pas en `META_ADS` ou ont `isManuallyCreated = true`. Filtrer la query C1 pour distinguer.

Pour distinguer les deux, ajouter ces colonnes au SELECT de C1 :
```sql
  uc."isManuallyCreated",
  uc.platform,
  uc."lastSyncedAt"  -- si ce champ existe, voir Prisma schema
```

### C3 — Patch préventif sur création manuelle

Dans `apps/api/src/modules/campaigns/campaigns.service.ts:72-73,95-96`, ajouter une garde **DTO-level** qui refuse les budgets > 50 000 €/j (impossible pour usage légitime) ou < 0,01 €/j. La garde doit vivre dans `CreateCampaignDto` / `UpdateCampaignDto` via `class-validator` :

```typescript
@IsOptional()
@IsNumber()
@Min(0.01)
@Max(50000, { message: 'dailyBudget > 50000 € — likely cents/euros mismatch, refuse' })
dailyBudget?: number;
```

Idem pour `lifetimeBudget` avec un Max de `1_000_000`.

### C4 — Migration de réparation (uniquement si Scenario A confirmé)

Si la majorité des lignes problématiques viennent du sync Meta (et non de création manuelle), une migration peut diviser ces budgets ÷100 sans re-sync :

```sql
-- À exécuter dans une migration Prisma, pas en prod direct
UPDATE "UnifiedCampaign"
SET "dailyBudget" = "dailyBudget" / 100
WHERE "dailyBudget" IS NOT NULL
  AND "dailyBudget" > 5000
  AND status IN ('ACTIVE', 'PAUSED')
  AND id IN (
    -- limiter aux IDs identifiés par la query C1
    'a42cb5a7-...',
    '19911b1c-...',
    -- ...
  );
```

**Plus prudent** : déclencher un re-sync sur les workspaces concernés et laisser le transformer écraser. Migration uniquement si le re-sync échoue ou si la donnée upstream Meta n'est plus disponible.

### C5 — Test d'invariant

Ajouter un test e2e qui valide la convention :
- Insérer une UnifiedCampaign avec `dailyBudget: 50` (= 50 €/j légitime)
- Vérifier que `tool-executor.executePauseCampaign` retourne `dailyBudget: 50` (pas 0.5 ni 5000)
- Refuser via DTO une création avec `dailyBudget: 50000` → 422

### C6 — (optionnel) Currency awareness

Le transformer divise toujours ÷100. Pour les comptes Meta dans une monnaie 0-décimale (JPY, KRW, VND, CLP), c'est faux : il ne faut pas diviser. Si l'app est mono-EUR pour l'instant, c'est cosmétique — sinon, lire `currency` depuis le AdAccount Meta et utiliser une table de conversion :

```typescript
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'BIF', 'DJF', 'GNF', 'KMF', 'PYG', 'RWF', 'UGX', 'XAF', 'XOF', 'XPF']);
const divisor = ZERO_DECIMAL.has(currency) ? 1 : 100;
```

Pas urgent — vérifier d'abord que tous les comptes en prod sont EUR.

## Estimation

| Tâche | Complexité | Durée |
|---|---|---|
| C1 (audit SQL) | Trivial | 15 min |
| C2 (re-sync test) | Faible | 30 min |
| C3 (DTO garde) | Faible | 30 min |
| C4 (migration, si nécessaire) | Moyen | 1–2h |
| C5 (test invariant) | Faible | 45 min |
| C6 (currency awareness) | Différé | — |

Total : **2–4 h** de travail focalisé selon scenario.

## Critères d'acceptation

1. Query C1 ré-exécutée après C2/C4 retourne 0 ligne avec `daily_to_actual_ratio > 5`
2. `/flux` ne montre plus la card "BUDGET INCOHÉRENT" sur Ôcargo
3. Test C5 passe en CI
4. Aucune régression sur le flow `pause_campaign` / `update_campaign_budget` (smoke test Subli'team conserve `dailyBudget: 18`)

## Hors scope

- Réécriture du transformer (il marche)
- Change de schéma Prisma (Decimal → Int en cents) — discussable plus tard, pas urgent
- Sync Google Ads / TikTok — focus Meta uniquement pour ce sprint
