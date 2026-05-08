"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * FluxCard — card éditoriale narrative pour le flux v2.
 *
 * Conventions Calm Precision v2 :
 *   - Caption mono uppercase letter-spacing 0.08em sur la card-head
 *   - Headline 21px max-width 38ch avec emphases en Newsreader italic
 *   - Body 14px line-height 1.7, max-width 64ch
 *   - Tokens et utilities depuis globals.css (vars CSS uniquement)
 *
 * Source de vérité visuelle : docs/design-system/v2-vision/index.html
 */

interface FluxCardProps {
  /** Caption en mono uppercase au-dessus du titre, ex. "CETTE SEMAINE · CPL GLOBAL · 47 CLIENTS". */
  caption: string;
  /** Delta optionnel à droite de la caption, ex. "−8,2 %". */
  delta?: string;
  /** Tone du delta (success / down / warn). Défaut : success (vert). */
  deltaTone?: "success" | "down" | "warn";
  /** Headline rendue en HTML pour permettre les <em>...</em> et <strong>. */
  headlineHtml: string;
  /** Body rendu en HTML pour les liens, mono spans, italics. */
  bodyHtml: string;
  /** Lien optionnel rendu en bas de la card avec son label, ex. "Voir la toile →". */
  href?: string;
  hrefLabel?: string;
  /** Sparkline SVG enfant optionnel (en bas avec le card-link). */
  sparkline?: ReactNode;
}

const DELTA_COLORS = {
  success: "var(--color-success)",
  down: "var(--color-danger)",
  warn: "var(--color-warning)",
} as const;

export function FluxCard({
  caption,
  delta,
  deltaTone = "success",
  headlineHtml,
  bodyHtml,
  href,
  hrefLabel,
  sparkline,
}: FluxCardProps) {
  return (
    <article
      style={{
        padding: "32px 40px",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-bg-surface)",
        marginBottom: 18,
        transition: "border-color var(--transition-base), background var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-emphasis)";
        e.currentTarget.style.background = "var(--color-bg-elevated)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-default)";
        e.currentTarget.style.background = "var(--color-bg-surface)";
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: 14,
        }}
      >
        {/* HTML rendering pour décoder &nbsp; et autres entités. Claude
            produit ces champs strictement (pas d'input utilisateur). */}
        <span dangerouslySetInnerHTML={{ __html: caption }} />
        {delta && (
          <span
            style={{ color: DELTA_COLORS[deltaTone], fontWeight: 600 }}
            dangerouslySetInnerHTML={{ __html: delta }}
          />
        )}
      </header>

      <h3
        style={{
          fontSize: 21,
          lineHeight: 1.4,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.015em",
          margin: "0 0 14px",
          maxWidth: "38ch",
          fontWeight: 500,
        }}
        dangerouslySetInnerHTML={{ __html: headlineHtml }}
      />

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "var(--color-text-secondary)",
          maxWidth: "64ch",
          margin: 0,
        }}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {(sparkline || href) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 18,
          }}
        >
          {sparkline && <div style={{ flex: 1 }}>{sparkline}</div>}
          {href && hrefLabel && (
            <Link
              href={href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-text-tertiary)",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-tertiary)";
              }}
            >
              {hrefLabel}
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

/* ============================================================
   FluxMutationCard — variante MCP avec preview + Apply
   ============================================================ */

interface FluxMutationCardProps {
  caption: string;
  delta?: string;
  headlineHtml: string;
  bodyHtml: string;
  /** Description en mono de la mutation, ex. "pause(campaign_id: 23847391)". */
  mutationLabel: string;
  mutationDetailHtml: string;
  /** Économie ou effet en success-tone, ex. "+ 287 € économisés". */
  saving?: string;
  /** Texte muted à droite du saving, ex. "effet immédiat · réversible". */
  effect?: string;
  /** L'IA backend MCP n'est pas encore wirée — Apply est désactivé pour le moment. */
  mcpReady?: boolean;
}

export function FluxMutationCard({
  caption,
  delta,
  headlineHtml,
  bodyHtml,
  mutationLabel,
  mutationDetailHtml,
  saving,
  effect,
  mcpReady = false,
}: FluxMutationCardProps) {
  return (
    <article
      style={{
        position: "relative",
        padding: "32px 40px",
        border: "1px solid var(--color-warning-muted)",
        borderRadius: "var(--radius-lg)",
        background:
          "linear-gradient(180deg, rgba(214, 166, 74, 0.025) 0%, var(--color-bg-surface) 100%)",
        marginBottom: 18,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: -1,
          top: 24,
          bottom: 24,
          width: 2,
          background: "var(--color-warning)",
          borderRadius: 1,
        }}
      />

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: 14,
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: caption }} />
        {delta && (
          <span
            style={{ color: "var(--color-warning)", fontWeight: 600 }}
            dangerouslySetInnerHTML={{ __html: delta }}
          />
        )}
      </header>

      <h3
        style={{
          fontSize: 21,
          lineHeight: 1.4,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.015em",
          margin: "0 0 14px",
          maxWidth: "38ch",
          fontWeight: 500,
        }}
        dangerouslySetInnerHTML={{ __html: headlineHtml }}
      />

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "var(--color-text-secondary)",
          maxWidth: "64ch",
          margin: 0,
        }}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {/* Mutation block — preview de l'action MCP */}
      <div
        style={{
          marginTop: 22,
          padding: "18px 20px",
          background: "var(--color-bg-base)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.1em",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {mutationLabel}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--color-text-primary)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.01em",
          }}
          dangerouslySetInnerHTML={{ __html: mutationDetailHtml }}
        />
        {(saving || effect) && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              marginTop: 12,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {saving && (
              <span
                style={{
                  color: "var(--color-success)",
                  fontWeight: 600,
                  marginRight: 8,
                }}
                // Rendu en HTML pour décoder &nbsp; et autres entités que
                // Claude peut produire (la locale fr-FR exige les espaces
                // insécables entre chiffres et €/%).
                dangerouslySetInnerHTML={{ __html: saving }}
              />
            )}
            {effect && (
              <span
                style={{ color: "var(--color-text-muted)" }}
                dangerouslySetInnerHTML={{ __html: effect }}
              />
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            type="button"
            disabled={!mcpReady}
            title={
              mcpReady
                ? "Exécute la mutation MCP"
                : "L'intégration MCP backend n'est pas encore wirée — bouton désactivé."
            }
            style={{
              height: 30,
              padding: "0 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              cursor: mcpReady ? "pointer" : "not-allowed",
              border: "1px solid transparent",
              background: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              opacity: mcpReady ? 1 : 0.45,
              transition: "all var(--transition-fast)",
            }}
          >
            Apply
          </button>
          <button
            type="button"
            style={{
              height: 30,
              padding: "0 14px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              background: "transparent",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border-emphasis)",
              transition: "all var(--transition-fast)",
            }}
          >
            Modifier
          </button>
          <button
            type="button"
            style={{
              height: 30,
              padding: "0 14px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              background: "transparent",
              color: "var(--color-text-tertiary)",
              border: "none",
              transition: "all var(--transition-fast)",
            }}
          >
            Ignorer
          </button>
        </div>
        {!mcpReady && (
          <div
            style={{
              marginTop: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--color-text-muted)",
              letterSpacing: "0.04em",
            }}
          >
            ⓘ MCP integration en cours · Apply désactivé pour ce sprint
          </div>
        )}
      </div>
    </article>
  );
}
