// ============================================================
// 04 — CHARTS : 3 traitements axes/grid/tooltip pour Recharts dark
// ============================================================

// Données mars 2026 · spend journalier en €
const SPEND_DATA = [
  { d: "01",  m: 240, g: 95  }, { d: "03", m: 260, g: 110 }, { d: "05", m: 245, g: 100 },
  { d: "07",  m: 290, g: 125 }, { d: "09", m: 310, g: 135 }, { d: "11", m: 285, g: 130 },
  { d: "13",  m: 340, g: 150 }, { d: "15", m: 360, g: 160 }, { d: "17", m: 330, g: 155 },
  { d: "19",  m: 380, g: 170 }, { d: "21", m: 390, g: 165 }, { d: "23", m: 410, g: 180 },
  { d: "25",  m: 395, g: 175 }, { d: "27", m: 360, g: 170 }, { d: "29", m: 340, g: 160 }, { d: "31", m: 320, g: 150 },
];

const W = 540, H = 220, PAD = { t: 16, r: 16, b: 28, l: 44 };

// Helpers
const xScale = (i, n) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
const yScale = (v, max) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
const maxY = Math.max(...SPEND_DATA.map((d) => d.m + d.g)) * 1.1;

// ── Variante A : "Hairline" ─────────────────────────────────
// Grille presque invisible, axes effacés, tooltip flottant.
const ChartVariantA = ({ hover = 7 }) => {
  const data = SPEND_DATA;
  const pathM = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i, data.length)},${yScale(d.m, maxY)}`).join(" ");
  const pathG = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i, data.length)},${yScale(d.g, maxY)}`).join(" ");
  const areaM = pathM + ` L${xScale(data.length - 1, data.length)},${H - PAD.b} L${xScale(0, data.length)},${H - PAD.b} Z`;

  const yTicks = [0, maxY / 4, maxY / 2, (3 * maxY) / 4, maxY];
  const hoverPoint = data[hover];
  const hx = xScale(hover, data.length);
  const hyM = yScale(hoverPoint.m, maxY);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="areaA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y grid */}
      {yTicks.map((t, i) => (
        <line key={i} x1={PAD.l} x2={W - PAD.r} y1={yScale(t, maxY)} y2={yScale(t, maxY)} stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
      ))}
      {/* Y labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={PAD.l - 8} y={yScale(t, maxY) + 4} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-muted)" textAnchor="end">{t === 0 ? "0" : `${Math.round(t)}`}</text>
      ))}
      {/* X labels */}
      {data.map((d, i) => i % 3 === 0 && (
        <text key={i} x={xScale(i, data.length)} y={H - PAD.b + 14} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-muted)" textAnchor="middle">{d.d}</text>
      ))}

      {/* Area + line */}
      <path d={areaM} fill="url(#areaA)" />
      <path d={pathM} fill="none" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path d={pathG} fill="none" stroke="#6a9ad6" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.7" />

      {/* Hover */}
      <line x1={hx} x2={hx} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,0.08)" />
      <circle cx={hx} cy={hyM} r="4" fill="var(--color-bg-base)" stroke="var(--color-accent)" strokeWidth="1.6" />

      {/* Tooltip */}
      <g transform={`translate(${hx + 12}, ${hyM - 36})`}>
        <rect width="118" height="56" rx="6" fill="#1a1a24" stroke="rgba(255,255,255,0.08)" />
        <text x="10" y="16" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.06em">15 MARS 2026</text>
        <circle cx="14" cy="29" r="3" fill="var(--color-accent)" />
        <text x="22" y="33" fontSize="11" fill="var(--color-text-primary)" fontFamily="var(--font-mono)">Meta · 360,00 €</text>
        <circle cx="14" cy="46" r="3" fill="#6a9ad6" />
        <text x="22" y="50" fontSize="11" fill="var(--color-text-primary)" fontFamily="var(--font-mono)">Google · 160,00 €</text>
      </g>
    </svg>
  );
};

// ── Variante B : "Heavy Grid" ───────────────────────────────
// Grille horizontale visible, axe Y avec tirets, baseline 0 marqué.
const ChartVariantB = () => {
  const data = SPEND_DATA;
  const yTicks = [0, 100, 200, 300, 400];
  const localMax = 450;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* Y grid */}
      {yTicks.map((t, i) => (
        <line key={i} x1={PAD.l} x2={W - PAD.r} y1={yScale(t, localMax)} y2={yScale(t, localMax)} stroke={t === 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"} />
      ))}
      {/* Y labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={PAD.l - 8} y={yScale(t, localMax) + 4} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-muted)" textAnchor="end">{t === 0 ? "0" : t}</text>
      ))}
      {/* Y unit */}
      <text x={PAD.l - 8} y={PAD.t - 2} fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-text-muted)" textAnchor="end" letterSpacing="0.08em">€</text>

      {/* Bars stacked */}
      {data.map((d, i) => {
        const x = xScale(i, data.length) - 8;
        const yG = yScale(d.g, localMax);
        const yM = yScale(d.m + d.g, localMax);
        return (
          <g key={i}>
            <rect x={x} y={yG} width={16} height={H - PAD.b - yG} fill="#6a9ad6" opacity="0.6" />
            <rect x={x} y={yM} width={16} height={yG - yM} fill="var(--color-accent)" />
          </g>
        );
      })}

      {/* X labels */}
      {data.map((d, i) => i % 3 === 0 && (
        <text key={i} x={xScale(i, data.length)} y={H - PAD.b + 14} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-muted)" textAnchor="middle">{d.d}</text>
      ))}

      {/* Legend */}
      <g transform={`translate(${PAD.l}, ${PAD.t - 2})`}>
        <rect x="0" y="-2" width="10" height="10" fill="var(--color-accent)" />
        <text x="14" y="7" fontSize="11" fill="var(--color-text-secondary)" fontFamily="var(--font-sans)">Meta Ads</text>
        <rect x="80" y="-2" width="10" height="10" fill="#6a9ad6" opacity="0.6" />
        <text x="94" y="7" fontSize="11" fill="var(--color-text-secondary)" fontFamily="var(--font-sans)">Google Ads</text>
      </g>
    </svg>
  );
};

// ── Variante C : "Mono Editorial" ───────────────────────────
// Aucune grille, ligne épaisse, étiquettes inline en bout de ligne.
const ChartVariantC = () => {
  const data = SPEND_DATA;
  const localMax = 450;
  const pathM = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i, data.length)},${yScale(d.m, localMax)}`).join(" ");
  const pathG = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i, data.length)},${yScale(d.g, localMax)}`).join(" ");

  const lastM = data[data.length - 1];
  const lastG = lastM;
  const lastX = xScale(data.length - 1, data.length);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* No grid. Just baseline. */}
      <line x1={PAD.l} x2={W - PAD.r - 60} y1={H - PAD.b} y2={H - PAD.b} stroke="rgba(255,255,255,0.12)" />

      <path d={pathM} fill="none" stroke="var(--color-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathG} fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

      {/* End-of-line labels */}
      <g transform={`translate(${lastX + 6}, ${yScale(lastM.m, localMax)})`}>
        <text fontSize="11" fontFamily="var(--font-mono)" fill="var(--color-accent)" fontWeight="600" dy="4">320 €</text>
        <text x="38" fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-muted)" dy="4" letterSpacing="0.04em">META</text>
      </g>
      <g transform={`translate(${lastX + 6}, ${yScale(lastG.g, localMax)})`}>
        <text fontSize="11" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)" fontWeight="600" dy="4">150 €</text>
        <text x="38" fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-muted)" dy="4" letterSpacing="0.04em">GOOGLE</text>
      </g>

      {/* X-axis : start + end */}
      <text x={PAD.l} y={H - PAD.b + 14} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-muted)" textAnchor="start">1 mars</text>
      <text x={W - PAD.r - 60} y={H - PAD.b + 14} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-muted)" textAnchor="end">31 mars</text>
    </svg>
  );
};

const PlatformBreakdownPreview = () => {
  // Donut + breakdown legend
  const segments = [
    { label: "Meta Ads",      value: 5240, color: "var(--color-accent)" },
    { label: "Google Ads",    value: 2150, color: "#6a9ad6" },
    { label: "TikTok Ads",    value: 720,  color: "#d6a64a" },
    { label: "LinkedIn Ads",  value: 362,  color: "var(--color-text-tertiary)" },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cumul = 0;
  const R = 60, CX = 80, CY = 80, SW = 22;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24, alignItems: "center" }}>
      <svg viewBox="0 0 160 160" width="160" height="160">
        {segments.map((s, i) => {
          const start = (cumul / total) * 360;
          cumul += s.value;
          const end = (cumul / total) * 360;
          const largeArc = end - start > 180 ? 1 : 0;
          const startRad = (start - 90) * Math.PI / 180;
          const endRad = (end - 90) * Math.PI / 180;
          const x1 = CX + R * Math.cos(startRad), y1 = CY + R * Math.sin(startRad);
          const x2 = CX + R * Math.cos(endRad),   y2 = CY + R * Math.sin(endRad);
          return (
            <path key={i} d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none" stroke={s.color} strokeWidth={SW} />
          );
        })}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-muted)" letterSpacing="0.08em">DÉPENSE</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="16" fontFamily="var(--font-mono)" fontWeight="700" fill="var(--color-text-primary)" letterSpacing="-0.02em">8 472 €</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "10px 1fr auto auto", alignItems: "center", gap: 10, paddingBottom: 6, borderBottom: i < segments.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{s.label}</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{((s.value / total) * 100).toFixed(1).replace(".", ",")} %</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--color-text-primary)", minWidth: 70, textAlign: "right" }}>{s.value.toLocaleString("fr-FR")} €</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ComparisonChart = () => {
  // Bar groupé : ce mois vs mois dernier
  const rows = [
    { metric: "Dépense",   curr: 8472, prev: 7540, unit: "€" },
    { metric: "Leads",     curr: 683,  prev: 559,  unit: "" },
    { metric: "CPL",       curr: 12.4, prev: 13.5, unit: " €" },
    { metric: "CTR",       curr: 2.3,  prev: 1.9,  unit: " %" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.map((r) => {
        const max = Math.max(r.curr, r.prev);
        const wCurr = (r.curr / max) * 100;
        const wPrev = (r.prev / max) * 100;
        const delta = ((r.curr - r.prev) / r.prev) * 100;
        const up = delta >= 0;
        return (
          <div key={r.metric} style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{r.metric}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: `${wCurr}%`, height: 14, background: "var(--color-accent)", borderRadius: 2 }} />
                <span className="mono" style={{ fontSize: 11, color: "var(--color-text-primary)" }}>{r.curr.toLocaleString("fr-FR")}{r.unit}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: `${wPrev}%`, height: 14, background: "var(--color-text-tertiary)", opacity: 0.5, borderRadius: 2 }} />
                <span className="mono" style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{r.prev.toLocaleString("fr-FR")}{r.unit}</span>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: up ? "var(--color-success)" : "var(--color-danger)", textAlign: "right" }}>
              {up ? "+" : ""}{delta.toFixed(1).replace(".", ",")} %
            </span>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: "var(--color-accent)", borderRadius: 2 }} /> Mars 2026</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: "var(--color-text-tertiary)", opacity: 0.5, borderRadius: 2 }} /> Février 2026</span>
      </div>
    </div>
  );
};

const ChartsSection = () => (
  <section className="ds-section" id="charts">
    <SectionHead num="04"
      fr="Charts"
      en="Charts"
      lede="Trois traitements pour Recharts en dark mode. Mêmes données (dépense quotidienne mars 2026, Meta vs Google). Choisir un seul traitement par produit, ne pas mélanger." />

    <SubHead fr="Variante A · Hairline" en="Variant A · Hairline" tag="Default · line + area" />
    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: -6, marginBottom: 14, maxWidth: "70ch" }}>
      Grille pointillée à 3% d'opacité, axes invisibles, area gradient à 18% sur la série principale, série secondaire en pointillés. Tooltip flottant sombre.
    </p>
    <Demo label="chart.line.hairline" tags={["line", "area", "tooltip"]} bg="surface">
      <ChartVariantA />
    </Demo>

    <SubHead fr="Variante B · Heavy Grid" en="Variant B · Heavy grid" tag="Bar stacked · cockpit" />
    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: -6, marginBottom: 14, maxWidth: "70ch" }}>
      Grille horizontale visible, baseline 0 plus marquée, légende inline. Convient aux empilées multi-plateforme.
    </p>
    <Demo label="chart.bar.heavy-grid" tags={["bar", "stacked", "legend"]} bg="surface">
      <ChartVariantB />
    </Demo>

    <SubHead fr="Variante C · Mono Editorial" en="Variant C · Mono editorial" tag="Self-Service · récap" />
    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: -6, marginBottom: 14, maxWidth: "70ch" }}>
      Pas de grille. Lignes 2.4px arrondies. Étiquettes en bout de ligne avec valeur en mono. Préféré pour les surfaces self-service où le lecteur n'a besoin que de la tendance.
    </p>
    <Demo label="chart.line.mono-editorial" tags={["line", "no-grid", "endline labels"]} bg="surface">
      <ChartVariantC />
    </Demo>

    <SubHead fr="Mapping Recharts" en="Recharts mapping" tag="Tokens à passer aux props" />
    <Spec
      headers={["Élément", "Variante A · Hairline", "Variante B · Heavy"]}
      rows={[
        ["CartesianGrid stroke",  "rgba(255,255,255,0.03)",       "rgba(255,255,255,0.06)"],
        ["CartesianGrid dasharray", "2 4",                          "(plein)"],
        ["XAxis / YAxis tick fill", "#5a5a6e (--color-text-tertiary)", "#5a5a6e"],
        ["axisLine",              "false",                         "true (baseline 0 only)"],
        ["Stroke series",         "var(--color-accent) — 1.6px",   "fill bar var(--color-accent)"],
        ["Tooltip contentStyle",  "#1a1a24 / border 0.08",          "#1a1a24 / border 0.08"],
        ["Tooltip itemStyle font", "var(--font-mono) 12px",         "var(--font-mono) 12px"],
      ]}
    />

    <SubHead fr="Platform breakdown" en="Platform breakdown" tag="Donut + legend" />
    <Demo label="chart.platform-breakdown" tags={["donut", "legend table"]} bg="surface">
      <PlatformBreakdownPreview />
    </Demo>

    <SubHead fr="Comparison" en="Comparison" tag="Bars groupées · vs n-1" />
    <Demo label="chart.comparison" tags={["bar groups", "delta %"]} bg="surface">
      <ComparisonChart />
    </Demo>
    <Rule tone="do">Toujours afficher le delta % en couleur sémantique à droite. <span className="mono">+12,4 %</span> en success, <span className="mono">−2,1 %</span> en danger. Le sens (up/down good ou bad) dépend du KPI : CPL down = success.</Rule>
  </section>
);

window.ChartsSection = ChartsSection;
