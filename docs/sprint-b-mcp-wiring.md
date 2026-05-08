# Sprint B — Connecter les boutons Apply du flux aux mutations backend

> **Document de tâches** pour wirer les mutation cards de `/flux` (frontend) au module `chat` du backend NestJS qui expose déjà des tools mutatifs Meta Ads (`pause_campaign`, `resume_campaign`, `update_campaign_budget`).

---

## TL;DR — Ce qui existe déjà

**Le backend NestJS (`sebastien-sanita/the-sheep-app`) est très avancé.** L'archi MCP-like que tu m'avais demandée est en grande partie implémentée :

- `apps/api/src/modules/chat/` — module chat complet
  - `chat.controller.ts` expose `POST /api/chat/message`, `GET/DELETE /api/chat/conversations`
  - `chat.service.ts` orchestre Anthropic + tools + persistance Conversation/Message
  - `tools/tool-definitions.ts` — 17 tools définis dont 3 mutatifs (Anthropic.Tool[] format)
  - `tools/tool-executor.ts` — exécute chaque tool, gère le pattern preview→confirm
- **Tools mutatifs déjà branchés** sur Meta Graph API :
  - `pause_campaign(workspace_id, campaign_id, confirm, dryRun)` — pause sur Meta
  - `resume_campaign(workspace_id, campaign_id, confirm, dryRun)` — reactivate
  - `update_campaign_budget(workspace_id, campaign_id, new_budget_eur, confirm, dryRun)` — change budget journalier ou lifetime, safety-guards (max 200€/jour, 5000€ lifetime, refuse increase > 200%)
- **Pattern à deux temps déjà conçu** : 1<sup>er</sup> appel sans `confirm` → preview ; 2<sup>e</sup> appel avec `confirm=true` → mutation effective
- **AuditLog Prisma model** existant — peut logger les mutations

**Le frontend (`sebastien-sanita/the-sheep-dashboard`) a déjà un hook `useChat`** qui parle SSE au backend `POST /api/chat/message`. Donc la pipe end-to-end existe pour les conversations.

**Ce qui manque pour activer les boutons Apply du flux v2** : un chemin direct backend qui n'oblige pas à passer par Claude pour exécuter une mutation déjà previewée par Claude au moment de la génération du flux. Plus l'enrichissement du prompt frontend pour qu'il produise des cards exploitables.

---

## Ce qu'on cherche à obtenir

```
┌─────────────────────────────────────────────────────────────────┐
│  /flux — flux home                                              │
│                                                                 │
│  Card mutation : « Pizzeria Roma — Promo Été approche le seuil │
│  de saturation. Pause recommandée. »                           │
│                                                                 │
│  pause(campaign_id: 23847391)                                   │
│  + 287 € économisés                                             │
│                                                                 │
│  [Apply] ← user clique                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ POST /api/workspaces/{wsId}/mutations/apply
                         │ { tool_name, tool_input }
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  apps/api : MutationsController (NEW)                           │
│  → délègue à ToolExecutor.executeTool(tool_name, input, ctx)    │
│  → ToolExecutor existant appelle Meta Graph API                 │
│  → AuditLog                                                     │
│  → retourne { ok, result, audit_id }                            │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  /flux — la card mutation se transforme en confirmation card    │
│  « ✓ Pausée. 287 € économisés. Voir l'historique »              │
└─────────────────────────────────────────────────────────────────┘
```

**Pas besoin de re-passer par Claude pour exécuter** : la card de flux a été produite par Claude lors de la génération du flux, le user a vu le preview, valider l'exécution n'a pas besoin d'un nouvel aller-retour LLM.

---

## Tâches backend (`sebastien-sanita/the-sheep-app`)

### B1. Créer le module `MutationsModule` qui expose un endpoint d'exécution directe

**Fichier** : `apps/api/src/modules/mutations/mutations.module.ts` (NEW)
**Ne pas toucher** : le module `chat` existant.

```typescript
// apps/api/src/modules/mutations/mutations.module.ts
import { Module } from '@nestjs/common';
import { MutationsController } from './mutations.controller';
import { MutationsService } from './mutations.service';
import { ChatModule } from '../chat/chat.module'; // pour réutiliser ToolExecutor

@Module({
  imports: [ChatModule], // exposer ToolExecutor comme provider partagé
  controllers: [MutationsController],
  providers: [MutationsService],
})
export class MutationsModule {}
```

**Fichier** : `apps/api/src/modules/mutations/mutations.controller.ts` (NEW)

```typescript
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from '../workspaces/guards/workspace-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplyMutationDto } from './dto/apply-mutation.dto';
import { MutationsService } from './mutations.service';

@ApiTags('mutations')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/mutations')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class MutationsController {
  constructor(private readonly service: MutationsService) {}

  @Post('apply')
  @ApiOperation({
    summary: 'Apply a previewed mutation (e.g. pause_campaign with confirm=true)',
  })
  apply(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ApplyMutationDto,
  ) {
    return this.service.apply(workspaceId, user.id, dto);
  }
}
```

**Fichier** : `apps/api/src/modules/mutations/dto/apply-mutation.dto.ts` (NEW)

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsObject, IsString } from 'class-validator';

const ALLOWED_MUTATIONS = [
  'pause_campaign',
  'resume_campaign',
  'update_campaign_budget',
] as const;

export class ApplyMutationDto {
  @ApiProperty({ enum: ALLOWED_MUTATIONS })
  @IsString()
  @IsIn(ALLOWED_MUTATIONS)
  tool_name!: (typeof ALLOWED_MUTATIONS)[number];

  @ApiProperty({
    description:
      'Tool inputs as defined by tool-definitions.ts schemas, plus confirm=true to commit',
  })
  @IsObject()
  tool_input!: Record<string, unknown>;

  @ApiProperty({ description: 'Run validations only without committing', default: false })
  @IsBoolean()
  dry_run: boolean = false;
}
```

**Fichier** : `apps/api/src/modules/mutations/mutations.service.ts` (NEW)

```typescript
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { prisma } from '@adpilot/database';
import { ToolExecutor } from '../chat/tools/tool-executor';
import { ApplyMutationDto } from './dto/apply-mutation.dto';

@Injectable()
export class MutationsService {
  private readonly logger = new Logger(MutationsService.name);

  constructor(private readonly toolExecutor: ToolExecutor) {}

  async apply(workspaceId: string, userId: string, dto: ApplyMutationDto) {
    // Force confirm=true on commit, allow dry_run override
    const input = {
      ...dto.tool_input,
      workspace_id: workspaceId, // server-side enforced, ignore client value
      confirm: !dto.dry_run,
      dryRun: dto.dry_run,
    };

    const context = { workspaceId, userId };

    const startedAt = Date.now();
    let resultJson: string;
    try {
      resultJson = await this.toolExecutor.executeTool(
        dto.tool_name,
        input,
        context,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Mutation ${dto.tool_name} failed: ${msg}`);
      throw new BadRequestException(msg);
    }

    let result: unknown;
    try {
      result = JSON.parse(resultJson);
    } catch {
      result = { raw: resultJson };
    }

    // Audit log
    const audit = await prisma.auditLog.create({
      data: {
        workspaceId,
        userId,
        action: dto.tool_name,
        entityType: 'mutation_apply',
        entityId: (input.campaign_id ?? input.adset_id ?? 'unknown') as string,
        metadata: {
          tool_input: dto.tool_input,
          dry_run: dto.dry_run,
          result,
          duration_ms: Date.now() - startedAt,
        },
      },
    });

    return {
      ok: !(result as { error?: string })?.error,
      result,
      audit_id: audit.id,
    };
  }
}
```

**Fichier à modifier** : `apps/api/src/app.module.ts` — registrer `MutationsModule` dans les imports.

**Fichier à modifier** : `apps/api/src/modules/chat/chat.module.ts` — exporter le `ToolExecutor` provider (probable qu'il ne l'exporte pas actuellement) :

```typescript
@Module({
  // ...
  providers: [ChatService, ToolExecutor],
  controllers: [ChatController],
  exports: [ToolExecutor], // ← ajouter cette ligne
})
export class ChatModule {}
```

### B2. Audit log — vérifier le schema Prisma

Vérifier que `AuditLog` a bien les champs `workspaceId`, `userId`, `action`, `entityType`, `entityId`, `metadata` (Json). Si le schema diffère, adapter le payload du `prisma.auditLog.create()` ci-dessus.

```bash
cd "C:\Users\sebas\Desktop\Developpeur\The sheep"
grep -A 20 "model AuditLog" packages/database/prisma/schema.prisma
```

### B3. Vérifier que les tools mutatifs sont bien câblés à Meta Graph (pas en stub)

Lire `apps/api/src/modules/chat/tools/tool-executor.ts` méthodes `pauseCampaign`, `resumeCampaign`, `updateCampaignBudget` pour confirmer qu'elles font de vraies API calls vers Meta. Si elles sont en stub mode (TODO logs), il faut les compléter avec le `MetaGraphService` existant.

```bash
grep -n "pauseCampaign\|resumeCampaign\|updateCampaignBudget" apps/api/src/modules/chat/tools/tool-executor.ts
```

### B4. Tests

- Tests unitaires pour `MutationsService.apply()` qui mockent `ToolExecutor.executeTool` et vérifient :
  - L'append du `confirm: true` sur le tool_input
  - L'override du `workspace_id` (sécurité — ignorer la valeur client)
  - La création d'un `AuditLog` row
  - Le retour `{ ok, result, audit_id }`
- Test e2e (si infra dispo) : `POST /api/workspaces/:wsId/mutations/apply` avec un `pause_campaign` en `dry_run: true` → vérifier que rien n'est mute en DB et que la réponse contient le preview.

```bash
cd apps/api && pnpm vitest run src/modules/mutations/
```

### B5. Swagger doc + déploiement

Vérifier que le swagger à `/api/docs` expose le nouveau `POST /api/workspaces/{workspaceId}/mutations/apply` avec son schema. Push sur `main` → auto-deploy Railway.

---

## Tâches frontend (`sebastien-sanita/the-sheep-dashboard` — ce repo)

### F1. Étendre le schema des cards IA pour inclure `tool_name` et `tool_input` structurés

**Fichier** : `src/lib/flux/types.ts` — étendre `FluxMutationCardData`

```typescript
export interface FluxMutationCardData {
  type: 'mutation';
  caption: string;
  delta?: string | null;
  headline_html: string;
  body_html: string;
  // ⬇ NEW : champs structurés pour exécuter la mutation
  tool_name: 'pause_campaign' | 'resume_campaign' | 'update_campaign_budget';
  tool_input: Record<string, unknown>; // ex: { campaign_id: '...' }
  // Affichage uniquement
  mutation_label: string;
  mutation_detail_html: string;
  saving?: string | null;
  effect?: string | null;
}
```

**Fichier** : `src/lib/flux/prompt.ts` — étendre le system prompt + le schema JSON Schema

Dans `FLUX_SYSTEM_PROMPT`, dans la section "Card mutation" :

```
- tool_name : un des 3 outils backend supportés :
  · "pause_campaign" — pour mettre en pause une campagne Meta
  · "resume_campaign" — pour réactiver une campagne pausée
  · "update_campaign_budget" — pour changer le budget journalier ou lifetime
- tool_input : objet JSON contenant les arguments pour cet outil :
  · pause_campaign : { campaign_id: "<UUID>" }
  · resume_campaign : { campaign_id: "<UUID>" }
  · update_campaign_budget : { campaign_id: "<UUID>", new_budget_eur: <number> }
  Tu n'inventes JAMAIS un campaign_id — utilise uniquement ceux fournis dans
  les data input. Si tu n'as pas de campaign_id concret, ne génère pas de
  card mutation, génère une narrative card de type "alert" à la place.
```

Dans `FLUX_OUTPUT_SCHEMA`, ajouter `tool_name` et `tool_input` au mutation card item :

```javascript
{
  type: 'object',
  required: [
    'type', 'caption', 'headline_html', 'body_html',
    'mutation_label', 'mutation_detail_html',
    'tool_name', 'tool_input', // ← NEW
  ],
  additionalProperties: false,
  properties: {
    type: { type: 'string', enum: ['mutation'] },
    // ... existant
    tool_name: { type: 'string', enum: ['pause_campaign', 'resume_campaign', 'update_campaign_budget'] },
    tool_input: { type: 'object' },
  },
}
```

⚠️ **Le aggregator doit fournir les campaign_ids dans le contexte data**. Aujourd'hui `FluxPromptInput.clients[]` n'expose pas la liste des campagnes par client. Étendre `aggregator.ts` pour inclure `top_campaigns: { id, name, status, spend_30d, freq, ctr }[]` (top 3-5 par dépense) pour que Claude ait des `campaign_id` réels à référencer.

```typescript
// src/lib/flux/aggregator.ts — étendre l'interface client
{
  name: string;
  spend_30d: number;
  // ... existant
  top_campaigns?: Array<{
    id: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED' | string;
    spend_30d: number;
    avg_frequency_7d: number;
    ctr_pct: number;
  }>;
}
```

Pour récupérer les campagnes côté frontend : appeler l'endpoint backend `/api/workspaces/:id/campaigns` (existant) en parallèle de `useWorkspaces()`. Ou créer un nouvel endpoint backend `/api/workspaces/aggregate-with-campaigns` qui retourne tout en un appel.

**Décision rapide** : pour rester simple, charger les campagnes uniquement quand le user atterrit sur `/flux`. Si trop de fetches → backend endpoint dédié.

### F2. Hook `useApplyMutation`

**Fichier** : `src/lib/hooks/useApplyMutation.ts` (NEW)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FluxMutationCardData } from '@/lib/flux/types';

interface ApplyMutationArgs {
  workspaceId: string;
  toolName: FluxMutationCardData['tool_name'];
  toolInput: Record<string, unknown>;
  dryRun?: boolean;
}

interface ApplyMutationResponse {
  ok: boolean;
  result: unknown;
  audit_id: string;
}

async function applyMutation({
  workspaceId,
  toolName,
  toolInput,
  dryRun,
}: ApplyMutationArgs): Promise<ApplyMutationResponse> {
  const res = await fetch(
    `/api/workspaces/${workspaceId}/mutations/apply`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        tool_name: toolName,
        tool_input: toolInput,
        dry_run: dryRun ?? false,
      }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? `mutations/apply HTTP ${res.status}`);
  }
  return res.json();
}

export function useApplyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: applyMutation,
    onSuccess: () => {
      // Invalide les KPIs et les cards IA
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      qc.invalidateQueries({ queryKey: ['flux-cards'] });
    },
  });
}
```

Note : `/api/workspaces/:id/mutations/apply` est routé par le rewrite Next à `https://api.the-sheep.fr/api/workspaces/:id/mutations/apply`. Pas de Route Handler local nécessaire.

### F3. Activer le bouton Apply dans `FluxMutationCard`

**Fichier** : `src/components/flux/FluxCard.tsx` — props `FluxMutationCardProps`

```typescript
interface FluxMutationCardProps {
  // ... existant
  toolName?: FluxMutationCardData['tool_name'];
  toolInput?: Record<string, unknown>;
  workspaceId?: string;
}
```

Et dans le bouton Apply :

```typescript
const apply = useApplyMutation();
// ...
<button
  type="button"
  disabled={!toolName || !workspaceId || apply.isPending}
  onClick={() => {
    if (!toolName || !workspaceId || !toolInput) return;
    apply.mutate({ workspaceId, toolName, toolInput });
  }}
  ...
>
  {apply.isPending ? 'En cours…' : 'Apply'}
</button>
```

Quand `apply.isSuccess`, remplacer le mutation_block par une confirmation block : « ✓ {action} appliquée. {effet}. Voir l'audit log → ».

### F4. Update `FluxCardRenderer` dans `/flux/page.tsx`

Passer les nouveaux props `toolName`, `toolInput`, `workspaceId` à `FluxMutationCard`. Le `workspaceId` doit venir de quelque part — tu peux soit :
- Passer le scope actuel (si "tous les clients", il faut que la card mutation porte un `workspace_id` dans `tool_input`)
- Faire que `tool_input.workspace_id` soit autoritatif et que le path API utilise une route différente sans workspaceId dans l'URL (ex. `POST /api/mutations/apply`)

**Recommandation** : la 2<sup>e</sup> option est plus propre puisque le scope d'une card peut être différent du scope actuel du flux ("tous les clients" → mutation sur "Pizzeria Roma"). Adapter la spec backend en conséquence.

```typescript
// Backend
@Post('mutations/apply')          // path = /api/mutations/apply
async apply(@Body() dto, @CurrentUser() user) {
  // workspaceId vient du tool_input, validé via WorkspaceAccessGuard custom
}
```

---

## Tâches transversales

### T1. Mise à jour mémoire / docs

Une fois Sprint B mergé en prod (frontend + backend), update `docs/design-system/v2-vision/MANIFESTO.md` pour passer la couche MCP de "à wiré" à "wiré".

### T2. Monitoring

Ajouter un événement Posthog / Mixpanel / similaire (si tu as un outil d'analytics) pour tracker les `mutations/apply` calls : tool_name, ok/error, duration. Permettra de voir si les utilisateurs cliquent vraiment sur Apply en pratique.

### T3. Permissions

Aujourd'hui `WorkspaceAccessGuard` valide juste l'appartenance à un workspace. Vérifier qu'il distingue bien les rôles (CLIENT_VIEWER ne devrait PAS pouvoir muter, seul ACCOUNT_MANAGER+ devrait). Si le check de rôle n'existe pas, l'ajouter dans `MutationsController`.

```typescript
@Post('mutations/apply')
@Roles('ACCOUNT_MANAGER', 'SUPER_ADMIN', 'CLIENT_ADMIN')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard, RolesGuard)
async apply(...) { ... }
```

---

## Ordre d'exécution recommandé

| Étape | Repo | Tâche | Estimation |
|---|---|---|---|
| 1 | backend | B1 — `MutationsModule` + endpoint `POST /api/mutations/apply` | 0,5 j |
| 2 | backend | B2 — vérif AuditLog schema + adaptation si besoin | 0,5 h |
| 3 | backend | B3 — vérif tools mutatifs vraiment câblés Meta Graph | 0,5 h |
| 4 | backend | B4 — tests unitaires + e2e | 0,5 j |
| 5 | backend | T3 — permissions par rôle | 1 h |
| 6 | backend | Push sur main → auto-deploy | — |
| 7 | frontend | F1 — étendre prompt IA + schema + aggregator (campaigns) | 0,5 j |
| 8 | frontend | F2 — hook `useApplyMutation` | 1 h |
| 9 | frontend | F3 — activer Apply button + transition success state | 0,5 j |
| 10 | frontend | F4 — passer props dans FluxCardRenderer + scope handling | 1 h |
| 11 | frontend | Push sur main → auto-deploy | — |
| 12 | both | Smoke test end-to-end : génère un flux avec mutation card, clique Apply, vérifie sur Meta Ads | 0,5 h |

**Total estimé : 2-3 jours de travail solo focused.**

---

## Risques identifiés

1. **Le backend tools mutatifs sont peut-être en stub** (B3). Si oui, c'est un sprint en soi de wirer le `MetaGraphService` correctement (OAuth refresh, error handling, retry).
2. **Le rate limit Meta API** : pause_campaign sur 50 campagnes en parallèle peut hit le rate limit. Implémenter une queue (BullMQ existe déjà côté backend).
3. **Permissions trop laxistes au début** — le `WorkspaceAccessGuard` ne vérifie peut-être pas le rôle. Risque modéré : un viewer pourrait pause une campagne accidentellement. Mitigation T3 obligatoire avant prod.
4. **L'IA peut halluciner un campaign_id qui n'existe plus** (campagne archivée). Mitigation : tools mutatifs côté backend doivent déjà valider l'existence (`prisma.unifiedCampaign.findUnique`) et retourner une erreur claire si absent.
5. **Pas d'undo natif** sur Meta API. La spec preview→confirm protège partiellement. Pour aller plus loin : dans l'AuditLog, persister l'état `before` (status/budget) et exposer un endpoint `POST /api/audit-log/:id/undo` qui ré-applique l'état précédent. Hors scope Sprint B mais à noter.

---

## Comment tu peux exécuter

Tu as deux options :

### Option 1 — Tu fais le backend toi-même

Tu suis ce document tâche par tâche. Tu peux me partager des questions précises au fur et à mesure (« le ToolExecutor est dans `chat.module.ts` mais n'est pas exporté, comment je fais sans casser le module ? »).

### Option 2 — Je fais le backend depuis cette session

Je peux ouvrir le repo backend (`C:\Users\sebas\Desktop\Developpeur\The sheep\`), faire les fichiers B1-B5 + T3 dans une feature branch, push, ouvrir une PR. Tu reviews et merges. Côté frontend (ce repo), je fais F1-F4 dans une autre PR alignée.

C'est le chemin le plus rapide. Tu valides au merge et tu vois le résultat en prod.

**Si tu veux Option 2, dis simplement « Option 2 » et je commence par le backend.**

---

*Document généré le 8 mai 2026. Source : exploration de `sebastien-sanita/the-sheep-app` ce jour, modules chat + creative-intelligence + meta-insights-ingestion analysés.*
