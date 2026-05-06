// ============================================================
// 03 — KPI CARDS : 3 directions de densité
// ============================================================

const TrendIcon = ({ dir, size = 12 }) => {
  if (dir === "up") return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
  if (dir === "down") return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
};

const TREND_COLOR = {
  up: { bg: "var(--color-success-muted)", fg: "var(--color-success)" },
  down: { bg: "var(--color-danger-muted)", fg: "var(--color-danger)" },
  flat: { bg: "var(--color-bg-elevated)", fg: "var(--color-text-secondary)" },
};

// ── Variante A : "Calm Default" ──────────────────────────────
// Style hérité du codebase. Label · Metric · Trend pill · vs N-1.
const KpiVariantA = ({ label, value, trend, dir = "up", prev }) => {
  const t = TREND_COLOR[dir];
  return (
    <div style={{
      position: "relative",
      background: "var(--color-bg-surface)",
      border: "1px solid var(--color-border-default)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 20px 16px",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--color-accent) 0%, transparent 80%)", opacity: 0.6 }} />
      <div className="text-caption" style={{ marginBottom: 10 }}>{label}</div>
      <div className="text-metric-lg" style={{ color: "var(--color-text-primary)" }}>{value}</div>
      {trend && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 4, background: t.bg, color: t.fg, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>
            <TrendIcon dir={dir} /> {trend}
          </span>
          {prev && <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>vs {prev}</span>}
        </div>
      )}
    </div>
  );
};

// ── Variante B : "Inline Editorial" ──────────────────────────
// Plus aérée, label droite, sparkline implicite, hiérarchie typographique forte.
const KpiVariantB = ({ label, value, trend, dir = "up", prev, spark }) => {
  const t = TREND_COLOR[dir];
  return (
    <div style={{
      background: "var(--color-bg-surface)",
      border: "1px solid var(--color-border-default)",
      borderRadius: "var(--radius-lg)",
      padding: "22px 22px 18px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500 }}>{label}</span>
        {trend && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-mono)", fontSize: 11, color: t.fg, fontWeight: 600 }}>
            <TrendIcon dir={dir} size={10} /> {trend}
          </span>
        )}
      </div>
      <div className="text-metric-xl" style={{ color: "var(--color-text-primary)", marginTop: 14, fontSize: 36 }}>{value}</div>
      {spark && (
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ width: "100%", height: 22, marginTop: 10, display: "block" }}>
          <path d={spark} fill="none" stroke="var(--color-accent)" strokeWidth="1.4" />
        </svg>
      )}
      {prev && <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 8, fontFamily: "var(--font-mono)" }}>Précédent · {prev}</div>}
    </div>
  );
};

// ── Variante C : "Dense Mono" ─────────────────────────────────
// Style Bloomberg/Linear. Label en mono caps inline, métrique alignée à gauche.
const KpiVariantC = ({ label, value, trend, dir = "up", prev }) => {
  const t = TREND_COLOR[dir];
  return (
    <div style={{
      background: "var(--color-bg-surface)",
      border: "1px solid var(--color-border-default)",
      borderRadius: "var(--radius-md)",
      padding: "12px 14px",
      borderLeft: `2px solid var(--color-accent)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
        {trend && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: t.fg, fontWeight: 600 }}>
            {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"} {trend}
          </span>
        )}
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 6, letterSpacing: "-0.02em" }}>{value}</div>
      {prev && <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 4, fontFamily: "var(--font-mono)" }}>n-1 · {prev}</div>}
    </div>
  );
};

const KpiSection = () => {
  // Données réalistes : agence Meta Ads, période mars 2026
  const data = [
    { label: "Dépense totale",  value: "8 472,30 €", trend: "+12,4 %", dir: "up",   prev: "7 540,12 €", spark: "M0,18 L12,15 L24,16 L36,12 L48,14 L60,9 L72,7 L84,5 L96,3 L100,2" },
    { label: "Coût par lead",   value: "12,40 €",    trend: "−8,2 %",  dir: "up",   prev: "13,51 €",    spark: "M0,8 L12,10 L24,9 L36,12 L48,11 L60,15 L72,17 L84,19 L96,18 L100,20" },
    { label: "Leads générés",   value: "683",        trend: "+22,1 %", dir: "up",   prev: "559",        spark: "M0,20 L12,18 L24,16 L36,17 L48,13 L60,10 L72,8 L84,6 L96,4 L100,3" },
    { label: "Fréquence moy.",  value: "3,8",        trend: "+0,4",    dir: "down", prev: "3,4",        spark: "M0,14 L12,13 L24,12 L36,11 L48,10 L60,9 L72,8 L84,7 L96,6 L100,5" },
  ];

  return (
    <section className="ds-section" id="kpi">
      <SectionHead num="03"
        fr="KPI Cards"
        en="KPI Cards"
        lede="Trois directions à comparer côte-à-côte. Mêmes tokens, mêmes données (mars 2026 · agence Meta Ads). La densité change, la lecture rapide reste possible." />

      <SubHead fr="Variante A · Calm Default" en="Variant A · Calm default" tag="Hub · grille 4 col" />
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: -6, marginBottom: 14, maxWidth: "70ch" }}>
        Hérité du codebase. Accent bar 2px en haut, métrique 28px, trend pill colorée, comparatif n-1 en muted.
      </p>
      <Demo label="kpi.variant-a" tags={["28px", "trend pill", "accent bar"]} bg="base">
        <div className="ds-grid-4">
          {data.map((d, i) => <KpiVariantA key={i} {...d} />)}
        </div>
      </Demo>

      <SubHead fr="Variante B · Inline Editorial" en="Variant B · Inline editorial" tag="Self-Service · plus d'air" />
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: -6, marginBottom: 14, maxWidth: "70ch" }}>
        Trend en haut à droite (sans pill), métrique 36px, sparkline 22px en pied. Plus d'air vertical, hiérarchie typographique très forte. Idéal pour les dashboards client mono-compte.
      </p>
      <Demo label="kpi.variant-b" tags={["36px", "sparkline", "no pill"]} bg="base">
        <div className="ds-grid-4">
          {data.map((d, i) => <KpiVariantB key={i} {...d} />)}
        </div>
      </Demo>

      <SubHead fr="Variante C · Dense Mono" en="Variant C · Dense mono" tag="Hub · cockpit · grille 6 col" />
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: -6, marginBottom: 14, maxWidth: "70ch" }}>
        Bloomberg/Linear. Label en mono caps, métrique 22px, trend en flèche unicode. Hauteur ≈ 64px. Bordure accent à gauche pour le tag.
      </p>
      <Demo label="kpi.variant-c" tags={["22px", "label mono", "left border"]} bg="base">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {data.map((d, i) => <KpiVariantC key={i} {...d} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginTop: 10 }}>
          {[
            { label: "CTR",       value: "2,30 %",    trend: "+0,4",  dir: "up" },
            { label: "CPM",       value: "8,12 €",    trend: "−2,1 %", dir: "up" },
            { label: "CPC",       value: "0,42 €",    trend: "+0,03",  dir: "down" },
            { label: "Impres.",   value: "1,04 M",    trend: "+8 %",   dir: "up" },
            { label: "ROAS",      value: "3,2",       trend: "+0,1",   dir: "up" },
            { label: "Conv.",     value: "172",       trend: "+12 %",  dir: "up" },
          ].map((d, i) => <KpiVariantC key={i} {...d} />)}
        </div>
      </Demo>

      <SubHead fr="Recommandation" en="Recommendation" />
      <Spec
        headers={["Surface", "Variante", "Justification"]}
        rows={[
          ["Agency Hub — vue cockpit",     "C · Dense Mono",         "8–12 KPI affichés, monitoring multi-clients, lecture en clignotant"],
          ["Agency Hub — vue détail client","A · Calm Default",       "4 KPI, contexte fort, pill explicite"],
          ["Client Self-Service — landing","B · Inline Editorial",   "4 KPI, sparkline pédagogique, pas de jargon"],
        ]}
      />
      <Rule tone="dont">Pas de mélanger A/B/C sur le même écran. Une grille = une variante, point final.</Rule>
    </section>
  );
};

window.KpiSection = KpiSection;
