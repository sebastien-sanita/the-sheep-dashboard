---
name: calm-precision-design-system
description: Use when implementing or refactoring UI in the-sheep-dashboard (Next.js 15 + Tailwind v4) — covers tokens, typography (DM Sans + JetBrains Mono), surfaces (Agency Hub vs Client Self-Service), accent variants (Moss/Amber/Teal/Indigo via data-attribute), and motion/density rules. Trigger on any work in src/app/, src/components/, or src/styles/ that touches color, layout, type, KPIs, charts, tables, chat, sidebar, or topbar.
---

# Calm Precision — Design System for The Sheep

## Source of truth

Open `docs/design-system/index.html` and read it top-to-bottom **before** writing UI code in this repo. It contains 9 mounted sections (Foundations, Primitives, KPI, Charts, Tables, Chat, Clients, Layout, Surfaces) with concrete pixel-perfect specs and live previews of every component.

Tokens live in two places:
- **Production**: `src/app/globals.css` — Tailwind v4 `@theme inline` bridge + CSS vars consumed by components.
- **Reference (frozen)**: `docs/design-system/tokens.css` — same values, standalone for the doc HTML.

If the two diverge, **fix `src/app/globals.css` first**. Never patch the docs to match drifted production code.

## Non-negotiable rules

1. **JetBrains Mono for every numeral** — KPI values, table cells, chart axes, %, dates, currency, frequencies. Always paired with `font-variant-numeric: tabular-nums` and `letter-spacing: -0.02em` (or `-0.03em` for metric-lg/xl). Use the `.mono`, `.text-metric`, `.text-metric-lg`, or `.text-metric-xl` utilities.
2. **DM Sans for prose** — body, headers, labels, buttons. Variable axis 100..1000 self-hosted from `/fonts/`.
3. **Surface stacking depth ≤ 3** — on dark, surfaces ladder `bg-base < bg-subtle < bg-surface < bg-elevated < bg-overlay`. Never stack more than three levels on a single screen.
4. **Semantic colors are reserved for state** — `success` = positive confirmation, `warning` = budget/frequency alert, `danger` = anomaly. Never use `--color-danger` for decorative red. Never paint a full background in a platform brand color (Meta, Google, etc.) — those are for 5–6px dots and 1.5px chart bars only.
5. **Three motion speeds, no exceptions**:
   - `--transition-fast` (120 ms, ease-in-out) — button hovers, icons, instant state flips.
   - `--transition-base` (200 ms, ease-out) — card lifts, KPI fade-in, color shifts.
   - `--transition-slow` (350 ms, ease-out) — sidebar collapse, drawers, panel resize.
   No bounce, no overshoot, no decorative fades on numbers, never longer than 350 ms.
6. **fr-FR number locale** — `1 234,56` (non-breaking space as thousands separator), `1 234,56 €` (currency after with NBSP), `2,3 %` (NBSP before %), `1 – 31 mars 2026` (en-dash for ranges).
7. **Single source of tokens** — never derive a `--ss-*` or `--hub-*` token set. Hub and Self-Service share the same tokens; only **density** and **vocabulary** differ.

## Tokens — what to use

All consumed via `var(--token-name)` or via Tailwind utilities mapped through `@theme inline`.

**Surfaces** (dark default): `--color-bg-{base,subtle,surface,elevated,overlay}`
**Borders**: `--color-border-{subtle,default,emphasis,accent}`
**Text**: `--color-text-{primary,secondary,tertiary,muted}` (4 levels of opacity, never invent a 5th)
**Accent (Moss)**: `--color-accent`, `--color-accent-{hover,active,muted,subtle,contrast}` — all flip together via `[data-accent]`
**Semantic**: `--color-{success,warning,danger,info}` paired with `*-muted`
**Type scale**: `--text-{display,title,heading,body,small,caption,metric-lg,metric-xl}` or matching `.text-*` utility classes
**Spacing**: `--space-{1..12}` (multiples of 4)
**Radii**: `--radius-{xs,sm,md,lg,xl}` (4, 6, 8, 12, 16 px)
**Shadows**: `--shadow-{xs,sm,md,lg}` + `--shadow-glow-accent`, `--shadow-glow-success`
**Layout**: `--sidebar-width` (240), `--sidebar-collapsed-width` (56), `--topbar-height` (48), `--chat-min-width` (360), `--content-max-width` (1400)

Tailwind palettes (`bg-primary-*`, `bg-success-*`, etc.) are calibrated to match: `primary-500 = Moss #7f996d`, `success-400 = #5cb88e`, `warning-400 = #d6a64a`, `danger-400 = #d96a6a`. Use them when a Tailwind utility is more ergonomic than an inline CSS var.

## Two surfaces, same tokens

| Token            | Agency Hub (interne, dense)        | Client Self-Service (externe, aéré)            |
|------------------|------------------------------------|------------------------------------------------|
| Body text        | 13 px                              | 14 px                                          |
| Card padding     | 14 / 18 px                         | 20 / 24 px                                     |
| Section gap      | 16 px                              | 32 px                                          |
| KPI value size   | 20 px                              | 26–32 px                                       |
| Sidebar nav row  | 30 px                              | 36 px                                          |
| Table row        | 30 px                              | 44 px                                          |
| Headers weight   | 600                                | 500–600                                        |
| Animations       | 120–180 ms · subtiles              | 240–320 ms · plus respirantes                  |
| Vocabulary       | CPL, CTR, ROAS, fréq.              | Coût/client, taux de clic, retour sur dépenses |
| Empty state      | 1-line muted mono                  | Pedagogical text + discrete illustration       |

**Hub** = Linear / Bloomberg Terminal / Plane vibes. **Self-Service** = Stripe Dashboard / Linear changelog vibes. Same token base.

## Toggles on `<html>`

```html
<html data-theme="dark" data-accent="moss">  <!-- defaults: omit attributes -->
<html data-theme="light">                     <!-- light surfaces override -->
<html data-accent="amber">                    <!-- warmer agency feel -->
<html data-accent="teal">                     <!-- cooler, posed -->
<html data-accent="indigo">                   <!-- deprecated v1, do not ship -->
```

`data-theme` and `data-accent` are independent. Defaults (no attribute) = `dark` + `moss`. The toggle just swaps `--color-accent*` (and surfaces for theme); every component that consumes the tokens follows automatically.

Indigo `#6366f1` is the **v1 legacy** accent. Don't ship new surfaces with it. The variant is kept only to ease the visual diff during migration.

## Anti-patterns — do not

- Hardcode `#6366f1`, `#34d399`, `#f43f5e`, etc. — those are the v1 indigo/sat colors, replaced by Moss / posed semantic. Always go through tokens.
- Mock the local `border-color` of every element — the global `* { border-color: var(--color-border-default) }` already covers it.
- Add a 4th text opacity level, a 6th surface, or a `--space-7`. The scale is closed by design.
- Use Framer Motion for entry/exit longer than 350 ms or with `bounce` / `overshoot`. Drop down to `--transition-*` instead.
- Render decimals or counts in DM Sans — break rule #1 above.
- Paint full backgrounds in Meta/Google/etc. brand colors. Use a 5–6 px dot or a 1.5 px chart bar.
- Create dual token sets like `--hub-*` or `--ss-*`. Density and vocab change, tokens don't.

## Agent workflow

**Before writing UI code in this repo:**
1. Open `docs/design-system/index.html` and read the section that maps to your task (KPI, chat, table, etc.).
2. Confirm the token names you'll use are in `src/app/globals.css`. If a token is missing, check `docs/design-system/tokens.css` first to see if it should exist; only invent a new token as a last resort and propose it explicitly.
3. Identify which surface (Hub vs Self-Service) the screen belongs to, then pick density values from the table above.

**Before opening a PR:**
- Verify no hardcoded colors, no hardcoded font sizes outside the type scale, no animations longer than 350 ms.
- Verify every numeral renders in JetBrains Mono with `tabular-nums`.
- Run `npm run dev` and toggle `<html data-theme="light">` once in DevTools — surfaces and text should remain readable. (Light theme is not in the prod toggle yet but tokens already support it.)
- Run `npm run lint` and `npm run build` — both must pass.
