# Design System — Calm Precision v2

Snapshot figé du design system tel qu'il a été livré, source de vérité visuelle pour le frontend overhaul.

## Provenance

Bundle exporté depuis Claude Design (claude.ai/design) — mai 2026.
Original : `The Sheep — Design System-handoff/the-sheep-design-system/`.

## Comment ouvrir

```
open docs/design-system/index.html
```

(ou double-clic sur `index.html`). Le HTML monte 9 sections React via Babel-standalone et React UMD (CDN unpkg). Une connexion internet est nécessaire au premier rendu pour récupérer React, ReactDOM, Recharts et Babel ; les fonts sont self-hostées dans `fonts/`.

Les attributs `data-theme="dark|light"` et `data-accent="moss|amber|teal|indigo"` sur `<html>` permettent de prévisualiser les variants. Toggles disponibles en haut à droite de la page.

## Contenu

```
index.html       — entry point (10 sections React + scrollspy + toggles)
tokens.css       — tokens CSS + @font-face self-hosted
page.css         — chrome de la page de doc (sidenav, hero, swatches)
parts/*.jsx      — sections React (foundations, primitives, kpi, charts,
                   tables, chat, clients, layout, surfaces, shared)
fonts/           — 4 variable fonts (DM Sans + italic, JetBrains Mono + italic)
```

## Statut & règles

**Ces fichiers sont une copie figée.** Ne pas les éditer pour refléter une décision design : la source de vérité applicative est `src/app/globals.css`, et les composants vivent dans `src/components/`.

Quand le DS évolue : remplacer ce dossier par un nouveau snapshot (nouveau export depuis Claude Design), pas patcher en place. Cette discipline garantit que la doc et le code n'ont qu'une seule direction de désynchro possible (jamais la doc qui dérive en silence).

Les tokens du `tokens.css` ici peuvent être en **léger décalage** avec `src/app/globals.css` :

- ce dossier = tokens "design medium" (HTML/CSS/JS prototype, paths relatifs, autonome)
- `src/app/globals.css` = tokens "production" (Tailwind v4 `@theme inline`, paths `/fonts/...`, palettes Tailwind primary/slate/success/warning/danger calibrées)

Les valeurs de couleur, type scale, spacing, radii, shadows, transitions doivent **rester identiques**. Si tu trouves une divergence, fixe `src/app/globals.css` en premier.
