// ============================================================
// 01 — FOUNDATIONS : Color, Typography, Spacing, Radii, Shadows, Motion
// ============================================================

const Swatch = ({ name, token, value, light }) => (
  <div className="swatch">
    <div className="swatch-fill" style={{ background: value }} />
    <div className="swatch-meta">
      <div className="swatch-name">{name}</div>
      <div className="swatch-token">{token}</div>
    </div>
  </div>
);

const SurfacesGrid = () => {
  const surfaces = [
    { name: "Base",     token: "--color-bg-base",     value: "#08080c" },
    { name: "Subtle",   token: "--color-bg-subtle",   value: "#0d0d14" },
    { name: "Surface",  token: "--color-bg-surface",  value: "#111118" },
    { name: "Elevated", token: "--color-bg-elevated", value: "#1a1a24" },
    { name: "Overlay",  token: "--color-bg-overlay",  value: "#22222e" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {surfaces.map((s) => <Swatch key={s.token} {...s} />)}
    </div>
  );
};

const TextSwatches = () => {
  const items = [
    { name: "Primary",   token: "--color-text-primary",   value: "#f0f0f5", sample: "Aa" },
    { name: "Secondary", token: "--color-text-secondary", value: "#8b8b9e", sample: "Aa" },
    { name: "Tertiary",  token: "--color-text-tertiary",  value: "#5a5a6e", sample: "Aa" },
    { name: "Muted",     token: "--color-text-muted",     value: "#3d3d50", sample: "Aa" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
      {items.map((s) => (
        <div key={s.token} className="swatch">
          <div className="swatch-fill" style={{ background: "var(--color-bg-surface)", display: "grid", placeItems: "center", color: s.value, fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>{s.sample}</div>
          <div className="swatch-meta">
            <div className="swatch-name">{s.name}</div>
            <div className="swatch-token">{s.token}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AccentExploration = ({ activeAccent, setActiveAccent }) => {
  const accents = [
    { id: "moss",   name: "Moss",   value: "#7f996d", note: "Recommandé · sobre, instrumenté", role: "DEFAULT" },
    { id: "amber",  name: "Amber",  value: "#c98a3c", note: "Chaleureux · premium agence",       role: "ALT 1" },
    { id: "teal",   name: "Teal",   value: "#3d8585", note: "Posé · plus froid, lisible",         role: "ALT 2" },
    { id: "indigo", name: "Indigo", value: "#6366f1", note: "V1 hérité · à déprécier",            role: "DEPRECATED" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {accents.map((a) => {
          const isActive = activeAccent === a.id;
          const isDeprecated = a.id === "indigo";
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setActiveAccent(a.id)}
              style={{
                textAlign: "left",
                padding: 0,
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: `1px solid ${isActive ? "var(--color-border-emphasis)" : "var(--color-border-default)"}`,
                background: "var(--color-bg-surface)",
                cursor: "pointer",
                transition: "border-color var(--transition-fast)",
                opacity: isDeprecated ? 0.55 : 1,
              }}
            >
              <div style={{ height: 88, background: a.value, position: "relative" }}>
                <span style={{ position: "absolute", top: 8, left: 10, fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(0,0,0,0.55)", letterSpacing: "0.08em" }}>{a.role}</span>
                {isActive && (
                  <span style={{ position: "absolute", top: 8, right: 10, fontFamily: "var(--font-mono)", fontSize: 9, padding: "2px 6px", background: "rgba(0,0,0,0.4)", color: "white", borderRadius: 3, letterSpacing: "0.06em" }}>ACTIF</span>
                )}
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{a.value}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{a.note}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: "16px 18px", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-bg-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Aperçu live</span>
          <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>Cliquer pour basculer toute la page</span>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" style={{
            background: "var(--color-accent)", color: "var(--color-accent-contrast)",
            padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "none",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, cursor: "pointer"
          }}>Synchroniser Meta Ads</button>
          <button type="button" style={{
            background: "transparent", color: "var(--color-text-secondary)",
            padding: "8px 14px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-emphasis)",
            fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer"
          }}>Annuler</button>
          <span style={{ padding: "3px 8px", fontSize: 11, fontWeight: 500, color: "var(--color-accent-hover)", background: "var(--color-accent-muted)", borderRadius: 999 }}>Actif</span>
          <span className="mono" style={{ color: "var(--color-accent)", fontSize: 13 }}>1 234,56 €</span>
        </div>
      </div>
    </div>
  );
};

const TypeScale = () => {
  const samples = [
    { name: "Display",   en: "display",   token: "var(--text-display)",   spec: "32 / 700 / -0.025em",   text: "Calm Precision" },
    { name: "Title",     en: "title",     token: "var(--text-title)",     spec: "18 / 600 / -0.015em",   text: "Performances mensuelles" },
    { name: "Heading",   en: "heading",   token: "var(--text-heading)",   spec: "14 / 600 / -0.005em",   text: "Campagnes actives" },
    { name: "Body",      en: "body",      token: "var(--text-body)",      spec: "13 / 400 / 1.55",       text: "Une phrase = un fait. Le ton de l'app reste direct, technique, sans préambule." },
    { name: "Small",     en: "small",     token: "var(--text-small)",     spec: "12 / 400 / 1.5",        text: "Légende secondaire, métadonnées de table, libellés courts." },
    { name: "Caption",   en: "caption",   token: "var(--text-caption)",   spec: "11 / 600 / +0.06em / UPPER", text: "RÉSUMÉ DU CLIENT" },
  ];
  return (
    <table className="ds-spec" style={{ tableLayout: "fixed" }}>
      <thead>
        <tr>
          <th style={{ width: 110 }}>Style</th>
          <th style={{ width: 200 }}>Spec</th>
          <th>Échantillon</th>
        </tr>
      </thead>
      <tbody>
        {samples.map((s) => (
          <tr key={s.name}>
            <td className="mono">
              <div>{s.name}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 10 }}>.text-{s.en}</div>
            </td>
            <td className="mono" style={{ color: "var(--color-text-secondary)" }}>{s.spec}</td>
            <td>
              <span className={`text-${s.en}`} style={{ color: "var(--color-text-primary)" }}>{s.text}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const NumericType = () => (
  <div className="ds-grid-2">
    <div style={{ padding: 24, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-bg-surface)" }}>
      <div className="text-caption" style={{ marginBottom: 14 }}>KPI · Metric XL · 42 / 700</div>
      <div className="text-metric-xl" style={{ color: "var(--color-text-primary)" }}>1 234,56&nbsp;€</div>
      <div style={{ marginTop: 8, color: "var(--color-text-secondary)", fontSize: 12 }}>JetBrains Mono · tabular-nums · letter-spacing -0.03em</div>
    </div>
    <div style={{ padding: 24, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-bg-surface)" }}>
      <div className="text-caption" style={{ marginBottom: 14 }}>KPI · Metric LG · 28 / 700</div>
      <div className="text-metric-lg" style={{ color: "var(--color-text-primary)" }}>12,40&nbsp;€</div>
      <div style={{ marginTop: 8, color: "var(--color-text-secondary)", fontSize: 12 }}>Coût par lead · 1 – 31 mars 2026</div>
    </div>
    <div style={{ padding: 18, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-bg-surface)" }}>
      <div className="text-caption" style={{ marginBottom: 10 }}>Inline · table cell</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="mono" style={{ color: "var(--color-text-primary)" }}>2 458,00 €</span>
        <span className="mono" style={{ color: "var(--color-text-primary)" }}>  124,40 €</span>
        <span className="mono" style={{ color: "var(--color-text-primary)" }}>   18,72 €</span>
        <span className="mono" style={{ color: "var(--color-text-secondary)" }}>2,3 % · CTR</span>
        <span className="mono" style={{ color: "var(--color-text-secondary)" }}>3,8 · fréquence</span>
      </div>
    </div>
    <div style={{ padding: 18, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-bg-surface)" }}>
      <div className="text-caption" style={{ marginBottom: 10 }}>Locale fr-FR — règles</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>
        <li><span className="mono" style={{ color: "var(--color-text-primary)" }}>1 234,56</span> &nbsp; espace insécable comme séparateur de milliers</li>
        <li><span className="mono" style={{ color: "var(--color-text-primary)" }}>1 234,56 €</span> &nbsp; devise après le chiffre, espace insécable</li>
        <li><span className="mono" style={{ color: "var(--color-text-primary)" }}>2,3 %</span> &nbsp; espace insécable avant le %</li>
        <li><span className="mono" style={{ color: "var(--color-text-primary)" }}>1 – 31 mars 2026</span> &nbsp; tiret demi-cadratin</li>
      </ul>
    </div>
  </div>
);

const SpacingScale = () => {
  const steps = [
    { name: "1", value: 4 }, { name: "2", value: 8 }, { name: "3", value: 12 },
    { name: "4", value: 16 }, { name: "5", value: 20 }, { name: "6", value: 24 },
    { name: "8", value: 32 }, { name: "10", value: 40 }, { name: "12", value: 48 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {steps.map((s) => (
        <div key={s.name} style={{ display: "grid", gridTemplateColumns: "60px 90px 1fr", alignItems: "center", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <span className="mono" style={{ color: "var(--color-text-primary)", fontSize: 12 }}>--space-{s.name}</span>
          <span className="mono" style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{s.value}px</span>
          <div style={{ width: s.value, height: 14, background: "var(--color-accent-muted)", borderLeft: `2px solid var(--color-accent)`, borderRadius: 2 }} />
        </div>
      ))}
    </div>
  );
};

const RadiiShadows = () => {
  const radii = [
    { name: "xs", value: 4 }, { name: "sm", value: 6 }, { name: "md", value: 8 },
    { name: "lg", value: 12 }, { name: "xl", value: 16 },
  ];
  const shadows = [
    { name: "xs", token: "--shadow-xs", note: "Boutons, hovers subtils" },
    { name: "sm", token: "--shadow-sm", note: "Cards par défaut" },
    { name: "md", token: "--shadow-md", note: "Hover de card / KPI" },
    { name: "lg", token: "--shadow-lg", note: "Popovers, dialogues" },
  ];
  return (
    <div className="ds-grid-2">
      <div>
        <div className="text-caption" style={{ marginBottom: 12 }}>Radii</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {radii.map((r) => (
            <div key={r.name} style={{ textAlign: "center" }}>
              <div style={{ height: 56, background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", borderRadius: r.value }} />
              <div className="mono" style={{ marginTop: 8, fontSize: 10, color: "var(--color-text-muted)" }}>--radius-{r.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{r.value}px</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-caption" style={{ marginBottom: 12 }}>Shadows</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {shadows.map((s) => (
            <div key={s.name} style={{ textAlign: "center" }}>
              <div style={{ height: 56, background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: 8, boxShadow: `var(${s.token})` }} />
              <div className="mono" style={{ marginTop: 8, fontSize: 10, color: "var(--color-text-muted)" }}>{s.token}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MotionTable = () => (
  <Spec
    headers={["Token", "Durée + easing", "Usage"]}
    rows={[
      ["--transition-fast", "120ms cubic-bezier(.4,0,.2,1)", "Hover de boutons, icônes, états instantanés"],
      ["--transition-base", "200ms cubic-bezier(.16,1,.3,1)", "Lift de card, fade-in de KPI, color shift"],
      ["--transition-slow", "350ms cubic-bezier(.16,1,.3,1)", "Sidebar collapse, drawer, panel resize"],
    ]}
  />
);

const FoundationsSection = ({ activeAccent, setActiveAccent }) => (
  <section className="ds-section" id="foundations">
    <SectionHead num="01"
      fr="Fondations"
      en="Foundations"
      lede="Tokens couleur, type, espacement, radii, shadows et motion. Réutilisés tels quels par toutes les surfaces du produit. Modifier un token = propager partout — pas de surcharge locale." />

    <SubHead fr="Surfaces" en="Surfaces" tag="6 niveaux · dark by default" />
    <SurfacesGrid />
    <Rule tone="do" label="Règle">Sur dark, chaque surface monte d'un cran : <span className="mono">base &lt; subtle &lt; surface &lt; elevated &lt; overlay</span>. Pas plus de 3 niveaux empilés sur un même écran.</Rule>

    <SubHead fr="Texte" en="Text" tag="4 niveaux d'opacité" />
    <TextSwatches />

    <SubHead fr="Accent — exploration" en="Accent — exploration" tag="Cliquer pour appliquer" />
    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", maxWidth: "60ch", marginTop: -6, marginBottom: 16 }}>
      L'indigo de la V1 est trop saturé pour de la lecture data prolongée. Trois directions sobres en candidat. Recommandation par défaut : <strong style={{ color: "var(--color-text-primary)" }}>Moss</strong>.
    </p>
    <AccentExploration activeAccent={activeAccent} setActiveAccent={setActiveAccent} />

    <SubHead fr="Sémantique" en="Semantic" tag="Toujours par paire (fill / muted)" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
      <Swatch name="Success" token="--color-success" value="#5cb88e" />
      <Swatch name="Warning" token="--color-warning" value="#d6a64a" />
      <Swatch name="Danger"  token="--color-danger"  value="#d96a6a" />
      <Swatch name="Info"    token="--color-info"    value="#6a9ad6" />
    </div>
    <Rule tone="warn">Jamais utiliser le rouge sémantique pour de l'accent décoratif. <span className="mono">danger</span> = anomalie, <span className="mono">warning</span> = alerte de fréquence/budget, <span className="mono">success</span> = confirmation positive uniquement.</Rule>

    <SubHead fr="Plateformes" en="Platforms" tag="Couleurs de marque · usage parcimonieux" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      <Swatch name="Meta"      token="--color-meta"      value="#1877F2" />
      <Swatch name="Google"    token="--color-google"    value="#EA4335" />
      <Swatch name="LinkedIn"  token="--color-linkedin"  value="#0A66C2" />
      <Swatch name="TikTok"    token="--color-tiktok"    value="#ff0050" />
      <Swatch name="Instagram" token="--color-instagram" value="#E4405F" />
    </div>
    <Rule tone="dont">Pas de fond plein aux couleurs de marque. Réservé aux dots de 5–6px et aux barres de chart de 1.5px. Tout le reste est neutre.</Rule>

    <SubHead fr="Typographie" en="Typography" tag="DM Sans · JetBrains Mono" />
    <TypeScale />

    <SubHead fr="Chiffres" en="Numerals" tag="Mono · tabular-nums · partout" />
    <NumericType />
    <Rule tone="do">JetBrains Mono pour <strong style={{ color: "var(--color-text-primary)" }}>tous</strong> les chiffres : KPI, cellules de table, axes de chart, % d'évolution, dates de période. Principe non négociable.</Rule>

    <SubHead fr="Espacement" en="Spacing" tag="Multiples de 4" />
    <SpacingScale />

    <SubHead fr="Radii & ombres" en="Radii & shadows" />
    <RadiiShadows />

    <SubHead fr="Motion" en="Motion" tag="3 vitesses, point final" />
    <MotionTable />
    <Rule tone="dont">Pas d'animation entrée/sortie de plus de 350ms. Pas de bounce, pas d'overshoot. Pas de fade décoratif sur les chiffres.</Rule>
  </section>
);

window.FoundationsSection = FoundationsSection;
