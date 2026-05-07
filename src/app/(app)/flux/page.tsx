"use client";

import { useMemo } from "react";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { useAuthStore } from "@/lib/stores/auth-store";
import { FluxCard, FluxMutationCard } from "@/components/flux/FluxCard";
import { FluxChatDock } from "@/components/flux/FluxChatDock";

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

        {/* ── Section : à traiter ── */}
        <section style={{ marginBottom: 88 }}>
          <SectionHead title="À traiter" meta="2 actions en attente" />

          <FluxMutationCard
            caption="Alerte · Fréquence · Pizzeria Roma"
            delta="SATURATION 4,2 / 4,5"
            headlineHtml={
              `<em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-warning);">Pizzeria Roma — Promo Été</em> approche le seuil de saturation publicitaire.`
            }
            bodyHtml={
              `La même audience a vu cette campagne <span style="font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--color-text-primary);">4,2&nbsp;fois</span> en moyenne sur les 7 derniers jours, contre un seuil critique fixé à <span style="font-family: var(--font-mono); color: var(--color-text-primary);">4,5</span>. Continuer dépense <span style="font-family: var(--font-mono); color: var(--color-text-primary);">~287&nbsp;€</span> dans les prochaines 24h sans gain marginal probable. L'IA suggère une <strong style="color: var(--color-text-primary); font-weight: 500;">pause immédiate</strong>, à reprendre quand la fréquence redescendra sous 3,5 (estimation : 4 jours).`
            }
            mutationLabel="Mutation MCP · Meta Ads · pause_campaign"
            mutationDetailHtml={
              `pause(<span style="color: var(--color-warning);">campaign_id: 23847391</span>)`
            }
            saving="+ 287 € économisés"
            effect="· effet immédiat · réversible"
            mcpReady={false}
          />

          <FluxCard
            caption="Suggestion · Concept Store Élise"
            delta="BUDGET J-7 · 80 %"
            deltaTone="success"
            headlineHtml={
              `<em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-accent-hover);">Concept Store Élise</em> a consommé 80 % de son budget mensuel à 7 jours de la fin.`
            }
            bodyHtml={
              `Sur la dernière semaine, le tempo de dépense s'est accéléré (<span style="font-family: var(--font-mono); color: var(--color-text-primary);">+34&nbsp;%</span> vs début de mois) sans gain proportionnel sur les conversions. Tu peux soit <a href="#" style="color: var(--color-accent-hover); text-decoration: underline; text-decoration-color: var(--color-accent-muted); text-underline-offset: 3px;">réduire le budget journalier de 25&nbsp;%</a>, soit <a href="#" style="color: var(--color-accent-hover); text-decoration: underline; text-decoration-color: var(--color-accent-muted); text-underline-offset: 3px;">augmenter le plafond mensuel de 200&nbsp;€</a> si la fin de mois reste prioritaire.`
            }
          />
        </section>

        {/* ── Section : cette semaine ── */}
        <section style={{ marginBottom: 88 }}>
          <SectionHead title="Cette semaine" meta="29 avril → 5 mai · curation IA" />

          <FluxCard
            caption="CPL global · 47 clients"
            delta="−8,2 %"
            deltaTone="success"
            headlineHtml={
              `Le CPL moyen a <em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-success);">baissé de 8,2&nbsp;%</em>, principalement grâce à <em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-accent-hover);">Boulangerie Martin</em>.`
            }
            bodyHtml={
              `<strong style="color: var(--color-text-primary); font-weight: 500;">Boulangerie Martin</strong> a généré <span style="font-family: var(--font-mono); color: var(--color-text-primary);">12&nbsp;leads</span> pour <span style="font-family: var(--font-mono); color: var(--color-text-primary);">11,40&nbsp;€</span> en moyenne, contre <span style="font-family: var(--font-mono); color: var(--color-text-primary);">14,80&nbsp;€</span> la semaine précédente. Le creative <span style="font-family: var(--font-mono); color: var(--color-text-primary);">#3</span> (vidéo galette) sur-performe : <span style="font-family: var(--font-mono); color: var(--color-text-primary);">2,7&nbsp;%</span> de CTR contre <span style="font-family: var(--font-mono); color: var(--color-text-primary);">1,9&nbsp;%</span> pour le pool moyen. L'effet est isolé : les autres clients restent stables.`
            }
            sparkline={
              <svg viewBox="0 0 320 28" preserveAspectRatio="none" style={{ height: 28, display: "block", width: "100%" }}>
                <path
                  d="M0,18 L20,16 L40,17 L60,14 L80,15 L100,12 L120,13 L140,10 L160,11 L180,8 L200,9 L220,7 L240,5 L260,6 L280,4 L300,3 L320,2"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="1.4"
                />
                <path
                  d="M0,18 L20,16 L40,17 L60,14 L80,15 L100,12 L120,13 L140,10 L160,11 L180,8 L200,9 L220,7 L240,5 L260,6 L280,4 L300,3 L320,2 L320,28 L0,28 Z"
                  fill="var(--color-accent)"
                  opacity="0.08"
                />
              </svg>
            }
            href="/dashboard"
            hrefLabel="Ouvrir la toile campagne →"
          />

          <FluxCard
            caption="Nouveaux leads · 7 derniers jours"
            delta="+22 %"
            deltaTone="success"
            headlineHtml={
              `<em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-success);">22 leads</em> nouveaux cette semaine, dont <em style="font-family: var(--font-serif), 'Iowan Old Style', serif; font-style: italic; font-weight: 400; color: var(--color-accent-hover);">14 sur Boulangerie Martin</em>.`
            }
            bodyHtml={
              `La part Meta Ads atteint <span style="font-family: var(--font-mono); color: var(--color-text-primary);">73&nbsp;%</span> cette semaine, en hausse de <span style="font-family: var(--font-mono); color: var(--color-text-primary);">12&nbsp;points</span> vs la moyenne 30j. Google Ads continue de baisser (<span style="font-family: var(--font-mono); color: var(--color-text-primary);">8&nbsp;leads</span> contre <span style="font-family: var(--font-mono); color: var(--color-text-primary);">18</span> la semaine dernière) mais à un coût stable, ce qui n'inquiète pas. <a href="#" style="color: var(--color-accent-hover); text-decoration: underline; text-decoration-color: var(--color-accent-muted); text-underline-offset: 3px;">Voir la répartition par plateforme →</a>`
            }
            sparkline={
              <svg viewBox="0 0 320 28" preserveAspectRatio="none" style={{ height: 28, display: "block", width: "100%" }}>
                <path
                  d="M0,22 L20,20 L40,21 L60,18 L80,16 L100,17 L120,14 L140,15 L160,12 L180,10 L200,11 L220,8 L240,9 L260,6 L280,5 L300,4 L320,3"
                  fill="none"
                  stroke="var(--color-info)"
                  strokeWidth="1.4"
                />
              </svg>
            }
            href="/clients"
            hrefLabel="Voir les 22 leads →"
          />
        </section>

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
            Première implémentation · état v0.1
          </div>
          Les KPIs au-dessus (
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
            dépense, leads, CPL, CTR
          </span>
          ) sont agrégés depuis tes données réelles. Les{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>cards narratives</span> et la{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>timeline</span> sont mockées en
          attendant que le backend Claude génère les insights ; les boutons{" "}
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
            Apply
          </span>{" "}
          des mutations sont désactivés tant que les MCP servers (meta-ads, google-ads, …) ne
          sont pas wirés. Pas d'effet réel pour l'instant.
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
