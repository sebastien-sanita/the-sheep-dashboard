// ============================================================
// 07 — CLIENTS : cards + detail
// ============================================================

const ClientCard = ({ name, platforms, spend, active, accounts, freshness, ago }) => {
  const dotColor = freshness === "fresh" ? "var(--color-success)" : freshness === "stale" ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div style={{
      background: "var(--color-bg-surface)",
      border: "1px solid var(--color-border-default)",
      borderRadius: "var(--radius-lg)",
      padding: "14px 18px 16px",
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{name}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
        {platforms.map((p) => (
          <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 6px 1px 5px", fontSize: 10, color: "var(--color-text-secondary)", background: "var(--color-bg-elevated)", borderRadius: 999 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: PLATFORM_DOT[p] || "#888" }} />
            {p.charAt(0) + p.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--color-border-subtle)", margin: "12px 0 10px" }} />
      <div style={{ display: "flex", gap: 22 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Dépense</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginTop: 2 }}>{spend}</div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Actives</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginTop: 2 }}>{active}</div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Comptes</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginTop: 2 }}>{accounts}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />
        <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>Sync · {ago}</span>
      </div>
    </div>
  );
};

const ClientGalleryPreview = () => (
  <div className="ds-grid-3">
    <ClientCard name="Boulangerie Martin"  platforms={["META", "INSTAGRAM"]} spend="1 234,56 €" active={3} accounts={2} freshness="fresh" ago="il y a 2 h" />
    <ClientCard name="Pizzeria Roma"       platforms={["META", "TIKTOK"]}    spend="2 458,00 €" active={5} accounts={3} freshness="fresh" ago="il y a 4 h" />
    <ClientCard name="Garage Dupont"       platforms={["GOOGLE"]}            spend="487,20 €"   active={1} accounts={1} freshness="stale" ago="il y a 14 h" />
    <ClientCard name="Boucherie Lefèvre"   platforms={["META"]}              spend="943,10 €"   active={2} accounts={1} freshness="fresh" ago="il y a 1 h" />
    <ClientCard name="Concept Store Élise" platforms={["META", "GOOGLE", "TIKTOK"]} spend="1 822,40 €" active={4} accounts={5} freshness="fresh" ago="il y a 3 h" />
    <ClientCard name="Studio Yoga Plein Sud" platforms={["INSTAGRAM"]}        spend="312,00 €"   active={1} accounts={1} freshness="old" ago="il y a 2 j" />
  </div>
);

const ClientDetailHeader = () => (
  <div style={{ padding: "20px 24px 18px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-success)" }} className="animate-pulse-dot" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sync à jour · il y a 2 h</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0 }}>Boulangerie Martin</h2>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "4px 0 0", maxWidth: "60ch" }}>
          Boulangerie traditionnelle, Lyon 7e · 3 campagnes actives · 2 comptes connectés (Meta, Instagram).
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button type="button" style={{
          height: 32, padding: "0 12px", fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500,
          background: "transparent", color: "var(--color-text-secondary)",
          border: "1px solid var(--color-border-emphasis)", borderRadius: "var(--radius-sm)", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Synchroniser
        </button>
        <button type="button" style={{
          height: 32, padding: "0 12px", fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500,
          background: "var(--color-accent)", color: "var(--color-accent-contrast)",
          border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Demander à Claude
        </button>
      </div>
    </div>

    {/* Quick stats inline */}
    <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--color-border-subtle)", paddingTop: 16 }}>
      {[
        { l: "Dépense · mars", v: "1 234,56 €", d: "+12,4 %", up: true },
        { l: "Leads",          v: "99",         d: "+22 %",   up: true },
        { l: "CPL",            v: "12,40 €",    d: "−8,2 %",  up: true },
        { l: "Fréquence",      v: "2,4",        d: "+0,2",    up: false },
      ].map((s, i) => (
        <div key={i} style={{ paddingRight: 16, borderRight: i < 3 ? "1px solid var(--color-border-subtle)" : "none", paddingLeft: i > 0 ? 16 : 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.l}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>{s.v}</span>
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: s.up ? "var(--color-success)" : "var(--color-warning)" }}>{s.d}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ClientsSection = () => (
  <section className="ds-section" id="clients">
    <SectionHead num="07"
      fr="Clients"
      en="Clients"
      lede="Liste de clients (cards en grille) puis vue détail (header + KPI inline + tableau de campagnes). Les cards sont identiques en Hub (densité 3-col) et en Self-Service (4-col plus large)." />

    <SubHead fr="Liste · grille de cards" en="List · card grid" tag="Hub vue Clients" />
    <Demo label="clients.gallery" tags={["3 col", "hover lift", "freshness dot"]} bg="base">
      <ClientGalleryPreview />
    </Demo>
    <Spec
      headers={["Élément", "Spec", "Notes"]}
      rows={[
        ["Card",            "padding 14/18/16 · radius lg · border default", "Hover : translateY(-1px) + shadow-md + border-emphasis"],
        ["Nom",             "13px / 600",                                      "Pas de troncature, wrap à 2 lignes max"],
        ["Platform pill",   "5px dot + label capitalized · 10px",              "Couleurs de marque pour le dot uniquement"],
        ["Mini KPI block",  "label 9px caps mono · value 13px mono",          "3 KPI fixes : Dépense / Actives / Comptes"],
        ["Freshness dot",   "5px · success/warning/danger selon delta",       "fresh < 6h · stale < 24h · old > 24h"],
      ]}
    />

    <SubHead fr="Détail · header" en="Detail · header" tag="Vue Client > Dashboard" />
    <Demo label="client.detail.header" tags={["sync badge", "actions", "quick stats"]} bg="base">
      <ClientDetailHeader />
    </Demo>
  </section>
);

window.ClientsSection = ClientsSection;
