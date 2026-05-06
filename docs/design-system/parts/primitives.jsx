// ============================================================
// 02 — PRIMITIVES : Button · Input · Badge · Tooltip · Skeleton
// ============================================================

const VARIANT_BUTTON = {
  primary:   { bg: "var(--color-accent)",        color: "var(--color-accent-contrast)", border: "1px solid transparent" },
  secondary: { bg: "var(--color-bg-elevated)",   color: "var(--color-text-primary)",    border: "1px solid var(--color-border-default)" },
  outline:   { bg: "transparent",                color: "var(--color-text-secondary)",  border: "1px solid var(--color-border-emphasis)" },
  ghost:     { bg: "transparent",                color: "var(--color-text-secondary)",  border: "1px solid transparent" },
  danger:    { bg: "var(--color-danger)",        color: "#08080c",                      border: "1px solid transparent" },
};

const SIZE_BUTTON = {
  sm: { h: 28, px: 10, fs: 12 },
  md: { h: 32, px: 14, fs: 13 },
  lg: { h: 36, px: 18, fs: 13 },
};

const Btn = ({ variant = "primary", size = "md", icon, disabled, loading, children }) => {
  const v = VARIANT_BUTTON[variant];
  const s = SIZE_BUTTON[size];
  return (
    <button type="button" disabled={disabled || loading}
      style={{
        height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs,
        fontFamily: "var(--font-sans)", fontWeight: 500,
        background: v.bg, color: v.color, border: v.border,
        borderRadius: "var(--radius-sm)",
        display: "inline-flex", alignItems: "center", gap: 6,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--transition-fast), border-color var(--transition-fast)",
      }}
    >
      {loading ? <span style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid currentColor", borderTopColor: "transparent" }} className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

const ButtonsGallery = () => (
  <div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <Btn variant="primary">Synchroniser Meta Ads</Btn>
      <Btn variant="secondary">Annuler</Btn>
      <Btn variant="outline">Voir détail</Btn>
      <Btn variant="ghost">Skip</Btn>
      <Btn variant="danger">Supprimer le client</Btn>
    </div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 14 }}>
      <Btn variant="primary" size="sm">SM</Btn>
      <Btn variant="primary" size="md">MD</Btn>
      <Btn variant="primary" size="lg">LG</Btn>
      <Btn variant="primary" loading>En cours</Btn>
      <Btn variant="primary" disabled>Désactivé</Btn>
      <Btn variant="secondary" icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      }>Sync</Btn>
    </div>
  </div>
);

const InputGallery = () => (
  <div className="ds-grid-2">
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6, fontWeight: 500 }}>Recherche client</label>
      <div style={{ position: "relative" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input type="text" placeholder="Boulangerie, pizzeria, garage…" defaultValue="Boulangerie Martin"
          style={{ width: "100%", height: 32, padding: "0 12px 0 32px", fontSize: 13, fontFamily: "var(--font-sans)",
            background: "var(--color-bg-surface)", color: "var(--color-text-primary)",
            border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-sm)", outline: "none" }} />
      </div>
    </div>
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6, fontWeight: 500 }}>Budget mensuel · €</label>
      <input type="text" defaultValue="2 500,00"
        style={{ width: "100%", height: 32, padding: "0 12px", fontSize: 13, fontFamily: "var(--font-mono)",
          background: "var(--color-bg-surface)", color: "var(--color-text-primary)",
          border: "1px solid var(--color-accent)", borderRadius: "var(--radius-sm)", outline: "none",
          boxShadow: "0 0 0 2px var(--color-accent-muted)" }} />
      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>Focus : ring 2px accent-muted</div>
    </div>
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6, fontWeight: 500 }}>Email</label>
      <input type="email" defaultValue="hamza@"
        style={{ width: "100%", height: 32, padding: "0 12px", fontSize: 13, fontFamily: "var(--font-sans)",
          background: "var(--color-bg-surface)", color: "var(--color-text-primary)",
          border: "1px solid var(--color-danger)", borderRadius: "var(--radius-sm)", outline: "none" }} />
      <div style={{ fontSize: 11, color: "var(--color-danger)", marginTop: 4 }}>Email incomplet</div>
    </div>
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6, fontWeight: 500 }}>Période</label>
      <div style={{ display: "flex", height: 32, padding: "0 12px", alignItems: "center", justifyContent: "space-between",
        background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-sm)",
        fontSize: 12, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", cursor: "pointer" }}>
        <span>1 – 31 mars 2026</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-tertiary)" }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  </div>
);

const BadgeRow = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <span style={{ padding: "2px 8px", fontSize: 11, fontWeight: 500, color: "var(--color-success)", background: "var(--color-success-muted)", borderRadius: 999 }}>ACTIVE</span>
    <span style={{ padding: "2px 8px", fontSize: 11, fontWeight: 500, color: "var(--color-warning)", background: "var(--color-warning-muted)", borderRadius: 999 }}>PAUSED</span>
    <span style={{ padding: "2px 8px", fontSize: 11, fontWeight: 500, color: "var(--color-danger)", background: "var(--color-danger-muted)", borderRadius: 999 }}>DELETED</span>
    <span style={{ padding: "2px 8px", fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", background: "var(--color-bg-elevated)", borderRadius: 999 }}>ARCHIVED</span>
    <span style={{ padding: "2px 8px", fontSize: 11, fontWeight: 500, color: "var(--color-info)", background: "var(--color-info-muted)", borderRadius: 999 }}>BRANCHÉ</span>
    <span style={{ padding: "2px 8px", fontSize: 11, fontWeight: 500, color: "var(--color-accent-hover)", background: "var(--color-accent-muted)", borderRadius: 999 }}>SYNC</span>

    {/* Compteur */}
    <span style={{ marginLeft: 16, padding: "1px 6px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", background: "var(--color-bg-elevated)", borderRadius: 4 }}>12</span>

    {/* Platform */}
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px 2px 6px", fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-bg-elevated)", borderRadius: 999 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1877F2" }} />
      Meta · 4 comptes
    </span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px 2px 6px", fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-bg-elevated)", borderRadius: 999 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EA4335" }} />
      Google · 2 comptes
    </span>
  </div>
);

const SkeletonRow = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div className="skeleton" style={{ height: 14, width: "32%" }} />
    <div className="skeleton" style={{ height: 28, width: "55%" }} />
    <div className="skeleton" style={{ height: 12, width: "20%" }} />
  </div>
);

const PrimitivesSection = () => (
  <section className="ds-section" id="primitives">
    <SectionHead num="02"
      fr="Primitives"
      en="Primitives"
      lede="Boutons, inputs, badges, skeleton. Mêmes API en interne et en self-service. Densité ajustée par les surfaces parentes, jamais par variante de primitive." />

    <SubHead fr="Boutons" en="Buttons" tag="5 variants · 3 tailles" />
    <Demo label="button.gallery" tags={["primary", "secondary", "outline", "ghost", "danger"]}>
      <ButtonsGallery />
    </Demo>
    <Spec
      headers={["Variant", "Usage", "Densité"]}
      rows={[
        ["primary", "Action principale d'un écran. Toujours unique par surface.", "Hub & Self-Service"],
        ["secondary", "Action secondaire récurrente. Annulation, retour.", "Hub & Self-Service"],
        ["outline", "Action de granularité fine, sans hiérarchie forte.", "Hub uniquement"],
        ["ghost", "Toolbar dense, items répétés.", "Hub uniquement"],
        ["danger", "Action destructive confirmée. Avec dialogue de confirmation.", "Hub & Self-Service"],
      ]}
    />

    <SubHead fr="Inputs" en="Inputs" tag="32px par défaut" />
    <Demo label="input.gallery" tags={["text", "search", "select", "error", "focus"]}>
      <InputGallery />
    </Demo>

    <SubHead fr="Badges" en="Badges" tag="Status · Platform · Counter" />
    <Demo label="badge.row">
      <BadgeRow />
    </Demo>
    <Rule tone="do">Status badge en uppercase + 11px medium. Counter en mono 10px. Platform badge avec dot 6px puis label.</Rule>

    <SubHead fr="Squelettes" en="Skeletons" tag="Pendant les chargements API" />
    <Demo label="skeleton.kpi" bg="surface">
      <div className="ds-grid-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </Demo>
  </section>
);

window.PrimitivesSection = PrimitivesSection;
