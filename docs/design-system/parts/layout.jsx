// ============================================================
// 08 — LAYOUT : sidebar · topbar · split panel
// ============================================================

const PLATFORM_DOT_COLORS = { META: "#1877F2", GOOGLE: "#EA4335", LINKEDIN: "#0A66C2", TIKTOK: "#ff0050", INSTAGRAM: "#E4405F" };

const SidebarPreview = ({ collapsed = false }) => {
  const navItems = [
    { label: "Dashboard", active: false, icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z;M9 22V12h6v10" },
    { label: "Chat IA",   active: true,  icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
    { label: "Clients",   active: false, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2;M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z;M23 21v-2a4 4 0 0 0-3-3.87;M16 3.13a4 4 0 0 1 0 7.75" },
    { label: "Settings",  active: false, icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z;M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  ];
  const clients = [
    { name: "Boulangerie Martin",     dot: "META" },
    { name: "Pizzeria Roma",          dot: "META" },
    { name: "Garage Dupont",          dot: "GOOGLE" },
    { name: "Boucherie Lefèvre",      dot: "META" },
    { name: "Concept Store Élise",    dot: "GOOGLE" },
    { name: "Studio Yoga Plein Sud",  dot: "INSTAGRAM" },
  ];

  const W = collapsed ? 56 : 240;

  return (
    <aside style={{ width: W, height: 480, background: "var(--color-bg-surface)", borderRight: "1px solid var(--color-border-default)", display: "flex", flexDirection: "column", borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }}>
      {/* Logo */}
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: "1px solid var(--color-border-default)" }}>
        <span style={{ width: 22, height: 22, display: "grid", placeItems: "center", border: "1px solid var(--color-border-emphasis)", borderRadius: 4, color: "var(--color-text-primary)" }}>
          <SheepMark size={12} />
        </span>
        {!collapsed && <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--color-text-primary)" }}>The Sheep</span>}
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, padding: 8 }}>
        {navItems.map((it, i) => (
          <a key={i} href="#" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "0 10px", height: 30,
            fontSize: 12, fontWeight: it.active ? 500 : 400,
            color: it.active ? "var(--color-accent-hover)" : "var(--color-text-secondary)",
            background: it.active ? "var(--color-accent-subtle)" : "transparent",
            borderLeft: it.active ? "2px solid var(--color-accent)" : "2px solid transparent",
            paddingLeft: it.active ? 8 : 10,
            borderRadius: "var(--radius-xs)",
            textDecoration: "none",
            justifyContent: collapsed ? "center" : "flex-start",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={it.active ? "var(--color-accent)" : "var(--color-text-tertiary)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              {it.icon.split(";").map((p, j) => <path key={j} d={p}/>)}
            </svg>
            {!collapsed && <span>{it.label}</span>}
          </a>
        ))}
      </nav>

      {/* Clients section */}
      {!collapsed && (
        <>
          <div style={{ height: 1, background: "var(--color-border-default)", margin: "0 12px" }} />
          <div style={{ flex: 1, overflow: "auto", padding: "10px 6px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 12px 6px" }}>Clients</div>
            {clients.map((c, i) => (
              <button key={i} type="button" style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                height: 28, padding: "0 12px", fontSize: 11,
                color: "var(--color-text-secondary)", background: "transparent", border: "none",
                textAlign: "left", cursor: "pointer", borderRadius: "var(--radius-xs)",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: PLATFORM_DOT_COLORS[c.dot], flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ padding: 8, borderTop: "1px solid var(--color-border-default)" }}>
        {!collapsed && (
          <div style={{ padding: "0 10px 8px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>Hamza Boukraa</div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>hamza@the-sheep.fr</div>
          </div>
        )}
        <button type="button" style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          height: 28, padding: "0 10px", fontSize: 11,
          color: "var(--color-text-muted)", background: "transparent", border: "none",
          textAlign: "left", cursor: "pointer", borderRadius: "var(--radius-xs)",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points={collapsed ? "13 17 18 12 13 7" : "11 17 6 12 11 7"}/><polyline points={collapsed ? "6 17 11 12 6 7" : "18 17 13 12 18 7"}/></svg>
          {!collapsed && <span>Réduire</span>}
        </button>
      </div>
    </aside>
  );
};

const TopBarPreview = () => (
  <header style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "var(--color-bg-base)", borderBottom: "1px solid var(--color-border-default)" }}>
    <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <span style={{ color: "var(--color-text-tertiary)" }}>Clients</span>
      <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>/</span>
      <span style={{ color: "var(--color-text-tertiary)" }}>Boulangerie Martin</span>
      <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>/</span>
      <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Dashboard</span>
    </nav>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", background: "transparent", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-xs)", cursor: "pointer" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        1 – 31 mars 2026
      </button>
      <button type="button" style={{ width: 28, height: 28, display: "grid", placeItems: "center", color: "var(--color-text-tertiary)", background: "transparent", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-xs)", cursor: "pointer" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  </header>
);

const SplitPanelPreview = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 12px 360px", height: 280, background: "var(--color-bg-base)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Vue principale · Dashboard</div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div className="skeleton" style={{ borderRadius: 8 }} />
        <div className="skeleton" style={{ borderRadius: 8 }} />
        <div className="skeleton" style={{ gridColumn: "1 / -1", borderRadius: 8 }} />
      </div>
    </div>
    <div style={{ background: "var(--color-bg-base)", display: "grid", placeItems: "center", borderLeft: "1px solid var(--color-border-default)", borderRight: "1px solid var(--color-border-default)", cursor: "col-resize" }}>
      <span style={{ width: 1, height: 24, background: "var(--color-border-emphasis)" }} />
    </div>
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, background: "var(--color-bg-subtle)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Chat IA · contextuel</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10 }}>
        <div style={{ alignSelf: "flex-end", maxWidth: "70%", background: "var(--color-accent)", color: "var(--color-accent-contrast)", padding: "8px 12px", borderRadius: "12px 12px 4px 12px", fontSize: 11 }}>Pourquoi le CPL baisse ?</div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Le CPL passe de 13,51 € à 12,40 €, principalement…</div>
      </div>
    </div>
  </div>
);

const LayoutSection = () => (
  <section className="ds-section" id="layout">
    <SectionHead num="08"
      fr="Layout"
      en="Layout"
      lede="Sidebar 240px collapsable à 56px · Topbar 48px sticky · Split panel resizable pour les vues hybrides dashboard + chat." />

    <SubHead fr="Sidebar" en="Sidebar" tag="240 / 56 px" />
    <Demo label="layout.sidebar" tags={["expanded", "collapsed", "active state"]} bg="base">
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <SidebarPreview collapsed={false} />
        <SidebarPreview collapsed={true} />
      </div>
    </Demo>

    <SubHead fr="Top bar" en="Top bar" tag="48 px sticky" />
    <Demo label="layout.topbar" tags={["breadcrumb", "date preset", "new chat"]} bg="base">
      <TopBarPreview />
    </Demo>

    <SubHead fr="Split panel" en="Split panel" tag="resizable" />
    <Demo label="layout.split" tags={["main + chat", "drag handle"]} bg="base">
      <SplitPanelPreview />
    </Demo>
    <Rule tone="do">Le panneau Chat à droite est toujours min 360px. Sous 360 il se réduit à 0 ou s'ouvre en drawer mobile.</Rule>
  </section>
);

window.LayoutSection = LayoutSection;
