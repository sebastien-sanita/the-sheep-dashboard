# The Sheep — Manifesto v2

*Document de vision · mai 2026 · à valider avant tout code v2*

---

## L'angle, en une phrase

**The Sheep n'est pas un dashboard publicitaire. C'est une conversation entre un humain et son inventaire publicitaire, où l'IA exécute réellement les changements via MCP.**

Tous les concurrents (Meta Ads Manager, Google Ads, Triple Whale, AdRoll, Northbeam, Madgicx) sont des spreadsheets glorifiés. Tu fouilles dans des grilles, tu interprètes, tu agis manuellement. The Sheep retourne le pattern : tu poses la question, l'app te répond avec **une page** ; tu dictes une action, l'app **l'exécute**. La grille n'est qu'un mode de rendu parmi d'autres, pas le centre de gravité.

C'est ce que Cursor a fait pour le code, ce que Notion AI fait pour les docs. Personne ne l'a encore fait sérieusement pour la pub. C'est notre angle.

---

## Les 7 principes

**1. La conversation est la couche d'interaction primaire.**
L'IA n'est pas un widget dans un coin. Elle est l'interface. Le chat n'est jamais "à part" — il est partout, invocable au ⌘K, dockable à droite, expandable en pleine page. La grille de KPI traditionnelle disparaît au profit d'un **flux narratif** où l'IA écrit ce qui se passe.

**2. L'IA exécute, elle ne narre pas seulement.**
Grâce à MCP (Meta Ads, Google Ads, LinkedIn, TikTok), chaque message peut produire une **mutation réelle**. "Pause les campagnes Meta sous 1% CTR depuis 7 jours" → l'IA propose un draft → l'utilisateur valide → la mutation s'exécute → l'état est rafraîchi. Pas de placebo. Pas d'hallucination. Toujours **preview avant action**.

**3. Tout est éditorial avant d'être analytique.**
Les chiffres restent en JetBrains Mono tabular-nums (la rigueur), mais ils sont **enveloppés dans des phrases**. "Le CPL global a baissé de 8,2 % cette semaine, principalement grâce à *Boulangerie Martin*" plutôt que "CPL : 12,40 € (−8,2%)". On lit, on ne scanne pas.

**4. Trois rythmes, un langage.**
Le **flux** (parcourir), le **chat** (dialoguer), les **toiles** (travailler). Chacun a sa densité, sa vitesse, sa typographie. Mais les tokens sont identiques (Calm Precision v2). L'utilisateur passe d'un rythme à l'autre sans rupture.

**5. Aucune surface n'est gratuite.**
Pas de "section parce qu'on a la place". Pas de KPI orphelin. Chaque card du flux justifie sa présence en répondant à : *si l'utilisateur ne lit que cette card, qu'est-ce qu'il apprend / fait ?* Si la réponse est "rien", la card n'existe pas. Niveau d'exigence : Linear, Pitch, Stripe — pas Salesforce.

**6. La typographie fait 80 % du travail.**
Pas de couleur agressive pour distinguer. Pas d'ombres dures. La hiérarchie naît du contraste typographique : DM Sans pour la prose, JetBrains Mono pour les chiffres et commandes, Newsreader Italic occasionnellement pour les emphases éditoriales. Quatre niveaux de texte, point. Un accent (Moss). Surfaces sombres calmes, lignes hairline.

**7. Hub et Self-Service partagent le code, pas la voix.**
Hamza voit le flux dense (cockpit, 13px body, sections compactes). Le boulanger voit le flux aéré (éditorial, 15px body, cards généreuses). **Mêmes tokens, mêmes interactions, mêmes capacités** — densité différente, vocabulaire différent. "CPL" côté Hub, "Coût par client" côté Self-Service. La différenciation ne passe pas par des composants spéciaux, elle passe par un **mode** au niveau du shell.

---

## Les trois couches (architecture mentale)

```
┌────────────────────────────────────────────────────────────────┐
│  LE FLUX (home)                                                │
│  Stream chronologique d'insights, alertes, suggestions IA,     │
│  deltas. Une page Notion qui s'écrit toute seule.              │
│  Densité : ~6 cards visibles au-dessus du pli.                 │
│  Voice : éditorial. Phrases. Liens. Mini-charts inline.        │
└────────────────────────────────────────────────────────────────┘
                              ↕  ⌘K invoque le chat
┌────────────────────────────────────────────────────────────────┐
│  LE CHAT (toujours présent)                                    │
│  Toujours invocable (⌘K, dock latéral, pleine page).           │
│  Tu dialogues : l'IA répond avec des cards riches inline.      │
│  Tu dictes : l'IA propose un draft → preview → tu valides      │
│  → MCP exécute la mutation Meta/Google/etc.                    │
└────────────────────────────────────────────────────────────────┘
                              ↓  ouvre une toile
┌────────────────────────────────────────────────────────────────┐
│  LES TOILES (travail concentré)                                │
│  Pages plein écran, conçues une par une comme des slides Pitch │
│  ou pages Webflow. Pas "une table avec filtres" : une page     │
│  designée pour ce qu'elle raconte.                             │
│  Cinq toiles initiales :                                       │
│  · Toile Campagne (drilldown + édition)                        │
│  · Toile Creative (preview natif + brief IA + scoring)         │
│  · Toile Lead (timeline narrée + scoring + actions)            │
│  · Toile Client (vue agence multi-comptes)                     │
│  · Toile Chat (conversation pleine page, comme ChatGPT)        │
└────────────────────────────────────────────────────────────────┘
```

L'utilisateur descend ou remonte ces couches selon son intention. Pas de hiérarchie rigide via un sidebar à 12 entrées — la navigation est **conversationnelle ou contextuelle**.

---

## Les 5 pillars, repensés

### 1. Multi-platform ads manager
Pas de table maître. Chaque campagne est une **carte du flux** ou une **toile** à part entière. La carte raconte son histoire. Les actions ("pause", "duplicate", "ajuster budget") passent soit par le chat ("pause les campagnes Meta sous 1% CTR depuis 7j"), soit par des boutons inline sur la card. Filtres = phrases naturelles, jamais de dropdowns à 15 items.

### 2. Creative strategy autonome
Un **board éditorial**, pas une bibliothèque. Chaque creative est une page Pitch-style avec : preview format-natif (mobile mock pour Insta, search-snippet pour Google, in-feed pour TikTok), brief IA en prose ("Ce visuel cible les 25-34 actifs urbains parce que…"), scoring multi-axes, variations IA en colonne latérale. Navigation par flèches gauche/droite comme dans Pitch.

### 3. Chat IA pour éditer
Le chat n'est pas un chat — c'est une **surface de production**. Tu écris en prose, l'IA propose un draft sous forme de **carte structurée éditable** (champs comme dans une fiche Notion), tu modifies inline, tu valides. **Apply** déclenche un preview puis la mutation MCP. Pattern Cursor "diff view" appliqué à la pub.

### 4. CRM + lead management
Pipeline kanban — mais chaque lead est une **page**. Sur la page : timeline narrée par l'IA ("Marie a vu 3 ads Meta entre le 12 et le 18 mars, cliqué sur le creative #4, rempli le formulaire le 20"), score, contact, attribution multi-touch. Drag-to-stage en gestuelle douce. Le chat peut filtrer ("trouve les leads qui ont vu plus de 3 creatives sans convertir").

### 5. Dashboarding
**Le dashboarding traditionnel n'existe pas.** Le flux le remplace. Sur la home, tu vois des cards éditoriales :
- *"Cette semaine, ton CPL global a baissé de 8,2 % — principalement grâce à Boulangerie Martin qui a fait passer son creative #3 en lead. Voir la toile."*
- *"Pizzeria Roma sature : la fréquence approche 4,2 sur sa campagne principale. Je te suggère de pause demain. Approuver."*
- *"Concept Store Élise a dépensé 80% de son budget mensuel à J-7. Veux-tu réajuster ?"*

Chaque card est cliquable → ouvre une toile. C'est plus narratif qu'analytique. Les chiffres restent en mono, mais enveloppés dans des phrases.

---

## La couche MCP — pourquoi c'est central

Sans MCP, le chat IA serait un assistant rhétorique. Avec MCP, c'est un **opérateur**. Architecture :

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  Utilisateur    │  →    │  Chat IA         │  →    │  Claude API     │
│  (browser)      │       │  (Next.js front) │       │  (Anthropic)    │
└─────────────────┘       └──────────────────┘       └────────┬────────┘
                                                              │
                                                              ↓ tool_use
                                                     ┌─────────────────┐
                                                     │  MCP servers    │
                                                     │  · meta-ads     │
                                                     │  · google-ads   │
                                                     │  · linkedin-ads │
                                                     │  · tiktok-ads   │
                                                     │  · the-sheep-api│
                                                     └────────┬────────┘
                                                              │
                                                              ↓
                                                     ┌─────────────────┐
                                                     │  APIs externes  │
                                                     │  (mutations)    │
                                                     └─────────────────┘
```

### Conséquences design

**1. Toute mutation passe par un preview.** Aucune action MCP ne s'exécute sans confirmation utilisateur. Pattern : l'IA propose une "card de mutation" → l'utilisateur clique **Apply** → la mutation s'exécute → la card se transforme en "card de confirmation" avec lien vers la toile concernée.

**2. Les actions sont auditables.** Chaque mutation MCP est loggée et apparaît dans le flux ("*Tu as pausé 4 campagnes via le chat à 14:23. Voir l'historique.*"). Pas de boîte noire.

**3. Le scope est explicite.** Le chat sait toujours sur quel client / compte / campagne il opère. La signature visuelle (un "scope tag" en mono uppercase au-dessus du composer) le montre en permanence : `SCOPE · BOULANGERIE MARTIN · META ADS`.

**4. Les permissions sont visibles.** Si l'utilisateur n'a pas le droit de muter (lecture seule, ou client sur compte agency), le bouton Apply est grisé avec une raison ("*Tu es en lecture seule sur ce compte. Demande à Hamza pour appliquer.*").

---

## Le langage visuel

### Hérité de Calm Precision v2 (inchangé)
- Tokens couleur : Moss `#7f996d`, semantic posed (`#5cb88e` `#d6a64a` `#d96a6a` `#6a9ad6`), 5 niveaux de surface, 4 niveaux de texte
- Typo : DM Sans + JetBrains Mono (variable, self-hosted)
- Type scale : display 32 / title 18 / heading 14 / body 13 / small 12 / caption 11
- Motion : 120/200/350ms, ease-out, jamais de bounce
- Radii : 4/6/8/12/16

### Nouvelle couche v2 (additions)
- **Newsreader Italic** comme troisième famille typo, réservée aux **emphases éditoriales** : titres de cards de flux, intro de toile, citations IA. Pas dans les KPIs, pas dans les boutons, jamais dans des UI controls.
- **Densité éditoriale** dans le mode Self-Service / flux home : body 14-15px (au lieu de 13), section gap 48-64px (au lieu de 16), card padding 28-32px (au lieu de 14-18). Le mode Hub densité reste 13px partout.
- **Surface "cream"** pour les toiles client en light mode (à venir) : `#faf6ec` au lieu de blanc pur. Donne le feel "papier fin" Pitch / Webflow.
- **Une seule animation signature** : `cursor-ai-ambient` — un trait fin Moss qui court le long du bord supérieur de l'écran quand l'IA est en train de penser. Pas un spinner. Pas une bulle "L'IA réfléchit…". Juste un signal visuel narratif.
- **Pas d'ombre dure**. Tout en bordure hairline + gradient subtil. Linear-like. Si une card a besoin d'élévation, on monte d'un cran de surface (`bg-elevated` au lieu de `bg-surface`), pas une ombre.
- **Aucun emoji nulle part**, sauf si l'utilisateur l'a écrit lui-même. SheepMark SVG partout.

---

## Vocabulaire

| On utilise | On n'utilise pas |
|---|---|
| Le flux | Le dashboard |
| La toile | La page de détail |
| Le chat | L'assistant IA, le copilot |
| Une carte | Un widget, un module |
| Une mutation | Une action, un changement |
| Apply / Annuler | Submit / Cancel |
| Suggestion | Recommandation algorithmique |
| Scope | Contexte, perimeter |
| L'inventaire publicitaire | Tes campagnes, ton compte |

---

## Personae & deltas

|  | **Hamza · Hub** | **Annonceur · Self-Service** |
|---|---|---|
| Volume traité | 50+ clients, 100+ campagnes/jour | 1 client, 5-10 campagnes |
| Body text | 13px | 15px |
| Section gap | 16px | 48px |
| Card padding | 14/18px | 28/32px |
| Type des cards | Dense, multi-info | Éditorial, une histoire par card |
| Vocabulaire | Acronymes (CPL, CTR, ROAS, fréquence) | Termes français (coût/client, taux de clic, etc.) |
| Tone IA | Direct, technique | Pédagogique, contextualisé |
| Scope par défaut | Tous les clients | Le client connecté |

Le toggle est implicite : on détecte le mode au moment du login (rôle utilisateur), pas un switch manuel.

---

## Risques assumés

**1. Onboarding non-trivial pour les annonceurs.** "Où est mon dashboard ?" sera la première question de Marie la boulangère. Solution : un **mode tour** la première fois, qui montre où dialoguer, et un fallback "vue tableau classique" pour les premiers temps si elle insiste.

**2. Latence du chat = latence de l'app.** Si Claude API est lent ou les MCP servers timeout, l'app paraît lente. Faut investir dans : streaming, optimistic UI, fallback gracieux ("*L'IA prend plus de temps que prévu, tu peux continuer à explorer pendant ce temps*").

**3. Coûts API.** Chaque card du flux peut être générée par Claude. Coûts $$ qui scalent avec le DAU. Cache agressif. Pré-générer en batch nightly. Garder des templates pour les cas les plus fréquents.

**4. Hallucination sur les mutations.** Une mauvaise tool call peut pause une campagne par accident. Mitigation : preview obligatoire, confirmation explicite, undo/rollback de N minutes, audit log toujours visible.

**5. Marche pas en offline.** Mais Meta Ads Manager non plus, donc OK.

---

## Questions ouvertes (à trancher avant code)

- **Le chat est-il toujours visible (dock latéral) ou seulement invoqué (⌘K) ?** Dépend de la fréquence d'usage. Hamza qui utilise le chat 20×/jour préfère le dock. Marie qui l'utilise 3×/semaine préfère le ⌘K.
- **Les toiles s'ouvrent en plein écran ou en sidesheet ?** Plein écran = plus immersif, sidesheet = on garde le flux en arrière-plan. Probable réponse : sidesheet par défaut, plein écran sur action explicite.
- **L'IA peut-elle agir sans mention explicite de l'utilisateur ?** Ex : "Je viens de pauser automatiquement Pizzeria Roma car la fréquence était à 4.5". Risque : autonomie perçue comme intrusive. Question éthique. Probable réponse : seulement avec opt-in ; sinon proposer.
- **Les annonceurs voient-ils le chat IA ?** Oui — c'est même le différenciateur principal. Mais avec des prompts proposés (pas un curseur vide qui intimide).
- **Le flux est-il personnalisable ?** Probable non : la curation IA est le produit. Si l'utilisateur peut tout configurer, on perd la valeur.

---

## Ce qui suit ce document

1. **Tu lis** ce manifeste et la home en HTML (`index.html` à côté).
2. **Tu réagis** : "wow / pas wow / wow mais [X]".
3. Si **wow**, on continue : je design en HTML les autres surfaces (chat-as-page, toile creative, toile lead, toile campagne, mode Hub vs Self-Service variantes).
4. Si **pas wow**, on identifie pourquoi (langue, densité, voice, micro-interactions) et on itère sur la home avant tout.
5. Quand le système est complet en HTML, on implémente dans le repo, palier par palier.

---

*Pas de DRI. Pas de stakeholder review. C'est ta vision. Je suis le crayon.*
