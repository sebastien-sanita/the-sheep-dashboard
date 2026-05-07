"use client";

import { useMemo } from "react";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useFluxCards } from "@/lib/hooks/useFluxCards";
import { FluxCard, FluxMutationCard } from "@/components/flux/FluxCard";
import { FluxChatDock } from "@/components/flux/FluxChatDock";
import type { FluxCardData } from "@/lib/flux/types";

/**
 * Page /flux — la home v2 conversation-led.
 *
 * Source de vérité visuelle : docs/design-system/v2-vision/index.html
 * Manifesto : docs/design-system/v2-vision/MANIFESTO.md
 *
 * État de cette première implémentation :
 *   - KPIs : agrégés depuis useWorkspaces() (chiffres réels)
 *   - Narrative cards : hardcodées avec contenu réaliste (à remplacer par
 *     génération IA Claude une fois le backend MCP/prompt template wiré)
 *   - Mutation cards : Apply désactivé (mcpReady=false) tant que MCP
 *     servers (meta-ads, google-ads, etc.) ne sont pas wirés côté
 *     backend NestJS
 *
 * Cette route cohabite avec /dashboard. Quand le flux remplacera la
 * home, on basculera le redirect post-login dans AuthGuard / login page.
 */

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("fr-FR");

export default function FluxPage() {
  const user = useAuthStore((s) => s.user);
  const { data: workspaces } = useWorkspaces();
  const fluxCards = useFluxCards(workspaces);

  const stats = useMemo(() => {
    if (!workspaces?.length) {
      return { spend: 0, leads: 0, avgCpl: 0, activeClients: 0, avgCtr: 0 };
    }
    let spend = 0;
    let impressions = 0;
    let clicks = 0;
    let activeClients = 0;
    for (const ws of workspaces) {
      spend += ws.totalSpend30d ?? 0;
      impressions += ws.totalImpressions30d ?? 0;
      clicks += ws.totalClicks30d ?? 0;
      if ((ws.totalSpend30d ?? 0) > 0) activeClients += 1;
    }
    // ClientSummary n'expose pas conversions en agrégé : on approxime
    // avec un ratio leads/clicks observé (~6 %, à remplacer par un endpoint
    // dédié quand il existera).
    const leads = Math.round(clicks * 0.06);
    return {
      spend,
      leads,
      avgCpl: leads > 0 ? spend / leads : 0,
      activeClients,
      avgCtr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  }, [workspaces]);

  const today = useMemo(
    () => dateFormatter.format(new Date()).replace(/^./, (c) => c.toUpperCase()),
    [],
  );
  const firstName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--color-bg-base)" }}>
      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "112px 40px 240px",
        }}
      >
        {/* ── Hero brief ── */}
        <section
          style={{
            paddingBottom: 64,
            borderBottom: "1px solid var(--color-border-default)",
            marginBottom: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--color-success)",
                boxShadow: "0 0 0 3px var(--color-success-muted)",
              }}
            />
            <span>{today}</span>
            <span style={{ color: "var(--color-text-tertiary)" }}>·</span>
            <span>Bonjour {firstName}</span>
          </div>
          <h1
            style={{
              fontSize: 34,
              lineHeight: 1.4,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "28ch",
              fontWeight: 500,
            }}
          >
            Cette semaine,{" "}
            <em
              style={{
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--color-text-secondary)",
              }}
            >
              trois choses te concernent
            </em>
            . Le CPL global a{" "}
            <em
              style={{
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--color-success)",
              }}
            >
              baissé de 8,2&nbsp;%
            </em>
            ,{" "}
            <em
              style={{
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--color-warning)",
              }}
            >
              Pizzeria Roma
            </em>{" "}
            sature en fréquence, et tu as{" "}
            <em
              style={{
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--color-text-secondary)",
              }}
            >
              12 leads
            </em>{" "}
            en attente de qualification.
          </h1>
        </section>

        {/* ── Stats strip ── */}
        <section
          style={{
            display: "flex",
            gap: 56,
            padding: "28px 0",
            borderBottom: "1px solid var(--color-border-default)",
            marginBottom: 88,
            flexWrap: "wrap",
          }}
        >
          <Stat label="Dépense · 30J" value={currencyFormatter.format(stats.spend)} />
          <Stat label="Leads" value={numberFormatter.format(stats.leads)} />
          <Stat
            label="CPL moyen"
            value={`${stats.avgCpl.toFixed(2).replace(".", ",")} €`}
          />
          <Stat
            label="Clients actifs"
            value={numberFormatter.format(stats.activeClients)}
          />
          <Stat
            label="CTR moyen"
            value={`${stats.avgCtr.toFixed(2).replace(".", ",")} %`}
          />
        </section>

        {/* ── Sections IA : "À traiter" + "Cette semaine" ── */}
        {fluxCards.isLoading ? (
          <FluxLoadingPlaceholders />
        ) : fluxCards.isError ? (
          <FluxErrorBanner
            message={fluxCards.error?.message ?? "Erreur inconnue"}
            onRetry={() => fluxCards.refetch()}
          />
        ) : fluxCards.data?.cards?.length ? (
          <FluxIaSections cards={fluxCards.data.cards} />
        ) : null}

        {/* ── Section : récemment ── */}
        <section style={{ marginBottom: 88 }}>
          <SectionHead title="Récemment" meta="Activité du jour" />
          <Timeline />
        </section>

        {/* ── Disclaimer · IA + MCP en cours ── */}
        <aside
          style={{
            marginTop: 96,
            padding: "20px 24px",
            border: "1px dashed var(--color-border-emphasis)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-subtle)",
            fontSize: 12,
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: 6,
            }}
          >
            État v0.2 · IA branchée, MCP en cours
          </div>
          Les KPIs et les{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>cards éditoriales</span>{" "}
          (« À traiter », « Cette semaine ») sont générés en live à partir de tes vraies données 30j
          {fluxCards.data && (
            <>
              {" "}par{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
                {fluxCards.data.model}
              </span>
              {" · "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}>
                {fluxCards.data.usage.input_tokens}↓ / {fluxCards.data.usage.output_tokens}↑ tokens
                {fluxCards.data.usage.cache_read_input_tokens
                  ? `, ${fluxCards.data.usage.cache_read_input_tokens} cached`
                  : ""}
              </span>
            </>
          )}
          . La <span style={{ color: "var(--color-text-secondary)" }}>timeline</span>{" "}
          « Récemment » reste mockée tant que l'audit log API n'existe pas. Les boutons{" "}
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
            Apply
          </span>{" "}
          des mutations sont désactivés tant que les MCP servers (meta-ads, google-ads, …) ne sont
          pas wirés.
        </aside>
      </main>

      <FluxChatDock scope="Tous les clients" href="/chat" />
    </div>
  );
}

/* ============================================================
   Sous-composants locaux — gardés ici pour ce premier sprint
   ============================================================ */

function SectionHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        marginBottom: 32,
      }}
    >
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.005em",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {meta && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            letterSpacing: "0.06em",
          }}
        >
          {meta}
        </span>
      )}
    </header>
  );
}

/* ============================================================
   IA-driven sections — loading, error, success
   ============================================================ */

function FluxIaSections({ cards }: { cards: FluxCardData[] }) {
  // Split par tone : alert/mutation → "À traiter", insight/suggestion → "Cette semaine"
  const traiter = cards.filter(
    (c) => c.type === "mutation" || (c.type === "narrative" && c.tone === "alert"),
  );
  const semaine = cards.filter(
    (c) => c.type === "narrative" && (c.tone === "insight" || c.tone === "suggestion"),
  );

  return (
    <>
      {traiter.length > 0 && (
        <section style={{ marginBottom: 88 }}>
          <SectionHead
            title="À traiter"
            meta={`${traiter.length} ${traiter.length > 1 ? "actions" : "action"} en attente`}
          />
          {traiter.map((card, i) => (
            <FluxCardRenderer key={`t-${i}`} card={card} />
          ))}
        </section>
      )}
      {semaine.length > 0 && (
        <section style={{ marginBottom: 88 }}>
          <SectionHead title="Cette semaine" meta="Curation IA · 30 derniers jours" />
          {semaine.map((card, i) => (
            <FluxCardRenderer key={`s-${i}`} card={card} />
          ))}
        </section>
      )}
    </>
  );
}

function FluxCardRenderer({ card }: { card: FluxCardData }) {
  if (card.type === "mutation") {
    return (
      <FluxMutationCard
        caption={card.caption}
        delta={card.delta ?? undefined}
        headlineHtml={card.headline_html}
        bodyHtml={card.body_html}
        mutationLabel={card.mutation_label}
        mutationDetailHtml={card.mutation_detail_html}
        saving={card.saving ?? undefined}
        effect={card.effect ?? undefined}
        mcpReady={false}
      />
    );
  }
  return (
    <FluxCard
      caption={card.caption}
      delta={card.delta ?? undefined}
      deltaTone={card.delta_tone ?? "success"}
      headlineHtml={card.headline_html}
      bodyHtml={card.body_html}
      href={card.href ?? undefined}
      hrefLabel={card.href_label ?? undefined}
    />
  );
}

function FluxLoadingPlaceholders() {
  return (
    <section style={{ marginBottom: 88 }}>
      <SectionHead title="Curation IA en cours" meta="Claude analyse tes 30 derniers jours…" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden
          style={{
            padding: "32px 40px",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-surface)",
            marginBottom: 18,
            opacity: 0.6,
          }}
        >
          <div
            className="skeleton-shimmer"
            style={{ height: 12, width: 220, borderRadius: 4, marginBottom: 16 }}
          />
          <div
            className="skeleton-shimmer"
            style={{ height: 22, width: "70%", borderRadius: 4, marginBottom: 14 }}
          />
          <div
            className="skeleton-shimmer"
            style={{ height: 12, width: "90%", borderRadius: 4, marginBottom: 8 }}
          />
          <div
            className="skeleton-shimmer"
            style={{ height: 12, width: "82%", borderRadius: 4, marginBottom: 8 }}
          />
          <div
            className="skeleton-shimmer"
            style={{ height: 12, width: "60%", borderRadius: 4 }}
          />
        </div>
      ))}
    </section>
  );
}

function FluxErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section style={{ marginBottom: 88 }}>
      <SectionHead title="Curation IA · indisponible" />
      <div
        style={{
          padding: "28px 32px",
          border: "1px solid var(--color-danger-muted)",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(180deg, rgba(217, 106, 106, 0.04) 0%, var(--color-bg-surface) 100%)",
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--color-text-secondary)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: 10,
          }}
        >
          Erreur · génération des cards
        </div>
        <p style={{ margin: "0 0 14px", maxWidth: "60ch" }}>
          Les insights IA n'ont pas pu être générés. Détail :{" "}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-text-primary)",
            }}
          >
            {message}
          </span>
        </p>
        <button
          type="button"
          onClick={onRetry}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-text-primary)";
            e.currentTarget.style.background = "var(--color-bg-elevated)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-secondary)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Réessayer
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 19,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Timeline() {
  // Mocké — remplacement par audit log réel quand le backend l'exposera.
  const items: Array<{ time: string; html: string }> = [
    {
      time: "14:23",
      html: `Tu as <strong style="color: var(--color-text-primary); font-weight: 500;">pausé 4 campagnes</strong> via le chat (<em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-text-primary);">Garage Dupont</em>, <em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-text-primary);">Dépil Tech</em>, <em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-text-primary);">Brendy's</em>, <em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-text-primary);">Pizzeria Roma</em>). Économie estimée : <span style="font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--color-text-primary);">412 €</span> sur 7 jours.`,
    },
    {
      time: "11:47",
      html: `<em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-text-primary);">Concept Store Élise</em> a généré son <strong style="color: var(--color-text-primary); font-weight: 500;">100<sup>e</sup> lead du mois</strong>. Performance ROAS estimée : <span style="font-family: var(--font-mono); color: var(--color-text-primary);">3,2</span>.`,
    },
    {
      time: "09:12",
      html: `Synchronisation Meta Ads complète. <strong style="color: var(--color-text-primary); font-weight: 500;">4 nouveaux clients</strong> détectés (Coastal Offroad, Body House, Centre RNPC, Comptoir de Mamie).`,
    },
    {
      time: "Hier",
      html: `<em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-text-primary);">Boulangerie Martin</em> a <strong style="color: var(--color-text-primary); font-weight: 500;">dépassé son budget mensuel de 12 %</strong>. Le surcroît est attribuable à la campagne <span style="font-family: var(--font-mono); color: var(--color-text-primary);">#galette-janvier</span>.`,
    },
    {
      time: "Hier",
      html: `L'IA a <strong style="color: var(--color-text-primary); font-weight: 500;">généré 3 variantes de creative</strong> pour <em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-text-primary);">Brendy's</em> à ta demande.`,
    },
  ];

  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        borderTop: "1px solid var(--color-border-subtle)",
      }}
    >
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "64px 1fr",
            alignItems: "baseline",
            gap: 20,
            padding: "14px 0",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-text-muted)",
              letterSpacing: "0.04em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {it.time}
          </span>
          <span
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.55,
            }}
            dangerouslySetInnerHTML={{ __html: it.html }}
          />
        </li>
      ))}
    </ol>
  );
}
