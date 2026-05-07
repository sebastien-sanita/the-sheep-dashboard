/**
 * Types du flux IA — généré par Claude, consommé par /flux/page.tsx
 *
 * Source de vérité visuelle : docs/design-system/v2-vision/index.html
 * Manifesto : docs/design-system/v2-vision/MANIFESTO.md
 *
 * Le schema est volontairement contraint : Claude doit produire des cards
 * qui matchent les composants FluxCard / FluxMutationCard sans liberté de
 * style. Toutes les emphases inline passent par <em>, <strong>, <span class="mono">,
 * <a href> — la coloration des emphases vient des styles de la page parente.
 */

/** Niveau de tone porté par la card (caption + bordure + delta). */
export type FluxCardTone = "alert" | "insight" | "suggestion" | "mutation";

/** Direction du delta (couleur du % en haut à droite). */
export type FluxCardDeltaTone = "success" | "down" | "warn";

/** Card narrative simple — pas d'action MCP attachée. */
export interface FluxNarrativeCard {
  type: "narrative";
  /** Tone de la card (couleur de bordure / accent). */
  tone: "insight" | "suggestion" | "alert";
  /** Caption mono uppercase au-dessus du titre, ex. "CETTE SEMAINE · CPL · 47 CLIENTS". */
  caption: string;
  /** Delta optionnel à droite de la caption, ex. "−8,2 %". */
  delta?: string | null;
  /** Tone du delta (success / down / warn). */
  delta_tone?: FluxCardDeltaTone | null;
  /** Headline (HTML inline) : <em>...</em>, <strong>, autres. */
  headline_html: string;
  /** Body (HTML inline) : <em>, <strong>, <span class="mono">, <a href>. */
  body_html: string;
  /** Cible cliquable optionnelle (ex. /clients/{id}). */
  href?: string | null;
  /** Label du lien si href est présent. */
  href_label?: string | null;
}

/** Card mutation MCP — bloc de preview action + boutons Apply/Modifier/Ignorer. */
export interface FluxMutationCardData {
  type: "mutation";
  /** Caption mono uppercase. */
  caption: string;
  /** Delta optionnel (ex. "SATURATION 4,2 / 4,5"). */
  delta?: string | null;
  /** Headline avec emphases. */
  headline_html: string;
  /** Body éditorial expliquant le contexte de la mutation. */
  body_html: string;
  /** Description en mono du label de mutation, ex. "Mutation MCP · Meta Ads · pause_campaign". */
  mutation_label: string;
  /** Detail de la mutation en mono, ex. "pause(<span style=\"color: var(--color-warning)\">campaign_id: 23847391</span>)". */
  mutation_detail_html: string;
  /** Économie ou gain estimé en success-tone, ex. "+ 287 € économisés". */
  saving?: string | null;
  /** Texte muted à droite du saving, ex. "effet immédiat · réversible". */
  effect?: string | null;
}

/** Union discriminée de tous les types de cards. */
export type FluxCardData = FluxNarrativeCard | FluxMutationCardData;

/** Réponse du Route Handler /api/flux/cards. */
export interface FluxCardsResponse {
  /** Timestamp ISO de génération (utile pour le caching et l'affichage). */
  generated_at: string;
  /** Scope ("all_clients" pour cette première version, plus tard "client:abc"). */
  scope: string;
  /** Modèle utilisé (claude-opus-4-7). Affiché dans la disclaimer. */
  model: string;
  /** Tokens utilisés (pour télémétrie). */
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  /** 3-5 cards éditoriales à rendre dans le flux. */
  cards: FluxCardData[];
}

/** Erreur structurée du Route Handler. */
export interface FluxCardsError {
  error: true;
  type: "configuration" | "anthropic" | "validation" | "internal";
  message: string;
}
