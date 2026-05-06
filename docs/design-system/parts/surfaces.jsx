// ============================================================
// 09 — SURFACES : Agency Hub vs Client Self-Service
// ============================================================

const SurfaceCard = ({ kind, title, subtitle, density, children }) => (
  <div style={{
    background: "var(--color-bg-surface)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  }}>
    <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--color-border-default)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{kind}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>· {density}</span>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", margin: 0, letterSpacing: "-0.01em" }}>{title}</h3>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "3px 0 0", maxWidth: "55ch" }}>{subtitle}</p>
    </div>
    <div style={{ padding: 18, background: "var(--color-bg-base)" }}>{children}</div>
  </div>
);

const HubMockup = () => (
  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", height: 320, background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
    {/* sidebar */}
    <div style={{ background: "var(--color-bg-surface)", borderRight: "1px solid var(--color-border-default)", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px 8px", borderBottom: "1px solid var(--color-border-subtle)", marginBottom: 6 }}>
        <span style={{ width: 18, height: 18, display: "grid", placeItems: "center", border: "1px solid var(--color-border-emphasis)", borderRadius: 3 }}><SheepMark size={10}/></span>
        <span style={{ fontSize: 11, fontWeight: 600 }}>Hub</span>
      </div>
      {["Dashboard", "Chat IA", "Clients", "Settings"].map((l, i) => (
        <div key={i} style={{
          padding: "0 10px", height: 22, fontSize: 10, display: "flex", alignItems: "center",
          color: i === 2 ? "var(--color-accent-hover)" : "var(--color-text-secondary)",
          background: i === 2 ? "var(--color-accent-subtle)" : "transparent",
          borderLeft: i === 2 ? "2px solid var(--color-accent)" : "2px solid transparent",
          paddingLeft: i === 2 ? 8 : 10,
          borderRadius: 3,
        }}>{l}</div>
      ))}
      <div style={{ marginTop: 8, padding: "0 12px 4px", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.08em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Clients · 6</div>
      {["Boulangerie Martin", "Pizzeria Roma", "Garage Dupont", "Boucherie Lefèvre", "Concept Élise"].map((c, i) => (
        <div key={c} style={{ padding: "0 12px", height: 20, fontSize: 10, display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-secondary)" }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: i % 2 ? "#1877F2" : "#EA4335" }}/>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</span>
        </div>
      ))}
    </div>
    {/* main */}
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Tous les clients</span>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", padding: "2px 6px", background: "var(--color-bg-elevated)", borderRadius: 3, letterSpacing: "0.06em" }}>1–31 MARS 2026</span>
      </div>
      {/* dense KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {[
          { l: "DÉPENSE TOTALE", v: "7 856 €" },
          { l: "LEADS",          v: "558" },
          { l: "CPL MOY.",       v: "14,08 €" },
          { l: "CAMPAGNES",      v: "16" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: 4, padding: "8px 10px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>{s.l}</div>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: "var(--color-text-primary)" }}>{s.v}</div>
          </div>
        ))}
      </div>
      {/* dense table */}
      <div style={{ flex: 1, background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr 0.6fr 0.7fr 0.5fr", padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.08em", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border-default)", textTransform: "uppercase" }}>
          <span>Client</span><span style={{ textAlign: "right" }}>Dép.</span><span style={{ textAlign: "right" }}>Leads</span><span style={{ textAlign: "right" }}>CPL</span><span style={{ textAlign: "right" }}>Statut</span>
        </div>
        {[
          ["Boulangerie Martin",  "1 234 €", "99",  "12,40 €", "✓"],
          ["Pizzeria Roma",       "2 458 €", "131", "18,72 €", "✓"],
          ["Garage Dupont",       "487 €",   "20",  "24,36 €", "‖"],
          ["Boucherie Lefèvre",   "943 €",   "62",  "15,21 €", "✓"],
          ["Concept Store Élise", "1 822 €", "188", "9,71 €",  "✓"],
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr 0.6fr 0.7fr 0.5fr", padding: "4px 10px", fontSize: 10, color: "var(--color-text-primary)", borderBottom: i < 4 ? "1px solid var(--color-border-subtle)" : "none" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r[0]}</span>
            <span className="mono" style={{ textAlign: "right", color: "var(--color-text-secondary)" }}>{r[1]}</span>
            <span className="mono" style={{ textAlign: "right", color: "var(--color-text-secondary)" }}>{r[2]}</span>
            <span className="mono" style={{ textAlign: "right", color: "var(--color-text-secondary)" }}>{r[3]}</span>
            <span style={{ textAlign: "right", color: r[4] === "✓" ? "var(--color-success)" : "var(--color-warning)" }}>{r[4]}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SelfServiceMockup = () => (
  <div style={{ height: 320, background: "var(--color-bg-base)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
    {/* topbar */}
    <div style={{ height: 38, padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-default)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 16, height: 16, display: "grid", placeItems: "center", border: "1px solid var(--color-border-emphasis)", borderRadius: 3 }}><SheepMark size={9}/></span>
        <span style={{ fontSize: 11, fontWeight: 600 }}>Boulangerie Martin</span>
      </div>
      <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>Mars 2026</span>
    </div>
    {/* main */}
    <div style={{ flex: 1, padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Vue d'ensemble · mars 2026</div>
        <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "4px 0 0" }}>Bonjour,<br/>voici votre mois.</h3>
      </div>
      {/* aerated KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { l: "Dépense", v: "1 234,56 €", d: "+12,4 % vs février", up: true },
          { l: "Nouveaux clients", v: "99", d: "+22 % vs février", up: true },
          { l: "Coût par client",  v: "12,40 €", d: "−8,2 % vs février", up: true },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{s.l}</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 6 }}>{s.v}</div>
            <div className="mono" style={{ fontSize: 9, color: s.up ? "var(--color-success)" : "var(--color-danger)", marginTop: 4 }}>{s.d}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: 8, padding: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>[ Graphique de dépense quotidienne ]</span>
      </div>
    </div>
  </div>
);

const SurfaceComparison = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
    <SurfaceCard
      kind="Surface · Hub"
      title="Agency Hub — interne"
      subtitle="Multi-clients, dense, instrumenté. Pour Hamza et l'équipe agence. Inspirations : Linear, Bloomberg Terminal, Plane."
      density="DENSE · 12px base · 8px gap"
    >
      <HubMockup />
    </SurfaceCard>

    <SurfaceCard
      kind="Surface · Self-Service"
      title="Client Self-Service — externe"
      subtitle="Mono-client, aéré, pédagogique. Pour le boulanger qui ouvre son dashboard une fois par semaine. Inspirations : Stripe Dashboard, Linear changelog."
      density="AÉRÉ · 14px base · 16-24px gap"
    >
      <SelfServiceMockup />
    </SurfaceCard>
  </div>
);

const SurfaceTokensTable = () => (
  <Spec
    headers={["Token", "Hub", "Self-Service"]}
    rows={[
      ["Texte body",          "13 px",                "14 px"],
      ["Card padding",        "14 px / 18 px",        "20 px / 24 px"],
      ["Section gap",         "16 px",                "32 px"],
      ["KPI value size",      "20 px",                "26–32 px"],
      ["Sidebar nav height",  "30 px",                "36 px"],
      ["Table row height",    "30 px",                "44 px"],
      ["Border emphasis",     "border-default",       "border-subtle (plus discret)"],
      ["Background canvas",   "bg-base #0A0A0F",      "bg-base #0A0A0F (identique)"],
      ["Type weight body",    "400",                  "400"],
      ["Type weight headers", "600",                  "500–600"],
      ["Animations",          "120–180 ms · subtiles", "240–320 ms · plus respirantes"],
      ["Vocabulaire UI",      "CPL, CTR, ROAS, fréq.", "Coût/client, taux de clic, retour sur dépenses"],
      ["Empty state",         "1 ligne mono muted",   "Texte pédagogique + illustration discrète"],
    ]}
  />
);

const SurfaceSection = () => (
  <section className="ds-section" id="surfaces">
    <SectionHead num="09"
      fr="Surfaces produit"
      en="Product surfaces"
      lede="Le design system alimente DEUX surfaces avec les MÊMES tokens. Ce qui change : densité, vocabulaire, hiérarchie typographique, vitesse des animations." />

    <Demo label="surfaces.compare" tags={["dense vs aéré", "mêmes tokens"]} bg="base">
      <SurfaceComparison />
    </Demo>

    <SubHead fr="Différenciation par surface" en="Per-surface differentiation" />
    <SurfaceTokensTable />

    <Rule tone="do">Les <span className="mono">tokens</span> de couleur, ombres, radii sont strictement identiques. Seule la <strong>densité</strong> et le <strong>vocabulaire</strong> changent.</Rule>
    <Rule tone="dont">Ne pas créer un set de tokens dérivés <span className="mono">--ss-bg-base</span> ou <span className="mono">--hub-text-primary</span>. Tout part de la même source.</Rule>
  </section>
);

window.SurfaceSection = SurfaceSection;
