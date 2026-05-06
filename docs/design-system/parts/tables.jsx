// ============================================================
// 05 — TABLES : campaign table dense
// ============================================================

const CAMPAIGNS = [
  { name: "Boulangerie Martin – Galette Janvier", status: "ACTIVE",  platform: "META", spend: 1234.56, cpl: 12.40, leads: 99,  ctr: 2.3, freq: 2.4 },
  { name: "Pizzeria Roma – Promo Été",            status: "ACTIVE",  platform: "META", spend: 2458.00, cpl: 18.72, leads: 131, ctr: 1.9, freq: 3.8 },
  { name: "Garage Dupont – Reprise Auto",         status: "PAUSED",  platform: "GOOGLE", spend: 487.20, cpl: 24.36, leads: 20, ctr: 1.2, freq: 1.1 },
  { name: "Boucherie Lefèvre – Pâques",           status: "ACTIVE",  platform: "META", spend: 943.10, cpl: 15.21, leads: 62, ctr: 2.7, freq: 2.9 },
  { name: "Boulangerie Martin – Saint-Valentin",  status: "ARCHIVED", platform: "META", spend: 612.00, cpl: 14.21, leads: 43, ctr: 2.1, freq: 4.2 },
  { name: "Concept Store Élise – Black Friday",   status: "ACTIVE",  platform: "GOOGLE", spend: 1822.40, cpl: 9.71, leads: 188, ctr: 3.4, freq: 1.8 },
  { name: "Pizzeria Roma – Lancement Couscous",   status: "PAUSED",  platform: "TIKTOK", spend: 320.50, cpl: 22.01, leads: 15, ctr: 1.4, freq: 4.6 },
];

const STATUS_STYLE = {
  ACTIVE:   { bg: "var(--color-success-muted)", fg: "var(--color-success)" },
  PAUSED:   { bg: "var(--color-warning-muted)", fg: "var(--color-warning)" },
  DELETED:  { bg: "var(--color-danger-muted)",  fg: "var(--color-danger)" },
  ARCHIVED: { bg: "var(--color-bg-elevated)",   fg: "var(--color-text-secondary)" },
};

const PLATFORM_DOT = {
  META: "#1877F2", GOOGLE: "#EA4335", LINKEDIN: "#0A66C2", TIKTOK: "#ff0050", INSTAGRAM: "#E4405F",
};

const fmtEur = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "\u00A0€";
const fmtPct = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0%";

const CampaignTablePreview = () => (
  <div style={{ overflow: "hidden", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-default)", background: "var(--color-bg-surface)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--color-border-default)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>Campagnes actives</span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>· {CAMPAIGNS.length} résultats</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <span style={{ padding: "2px 7px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", background: "var(--color-bg-elevated)", borderRadius: 4, letterSpacing: "0.06em" }}>1–31 MARS 2026</span>
      </div>
    </div>
    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Campagne", "Statut", "Plateforme", "Dépense", "Leads", "CPL", "CTR", "Fréq."].map((h, i) => (
            <th key={i} style={{
              padding: "9px 14px",
              textAlign: i >= 3 ? "right" : "left",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              background: "rgba(13,13,20,0.85)",
              borderBottom: "1px solid var(--color-border-default)",
              position: "sticky",
              top: 0,
              userSelect: "none",
              cursor: i === 3 ? "pointer" : "default",
            }}>
              {h}
              {i === 3 && <span style={{ marginLeft: 4, color: "var(--color-text-secondary)" }}>↓</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {CAMPAIGNS.map((c, i) => {
          const s = STATUS_STYLE[c.status];
          const freqWarn = c.freq > 4;
          return (
            <tr key={i} style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
              <td style={{ padding: "10px 14px", color: "var(--color-text-primary)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</td>
              <td style={{ padding: "10px 14px" }}>
                <span style={{ padding: "2px 7px", fontSize: 10, fontWeight: 500, color: s.fg, background: s.bg, borderRadius: 999 }}>{c.status}</span>
              </td>
              <td style={{ padding: "10px 14px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-secondary)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: PLATFORM_DOT[c.platform] }} />
                  {c.platform.charAt(0) + c.platform.slice(1).toLowerCase()}
                </span>
              </td>
              <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", textAlign: "right" }}>{fmtEur(c.spend)}</td>
              <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", textAlign: "right" }}>{c.leads}</td>
              <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", textAlign: "right" }}>{fmtEur(c.cpl)}</td>
              <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", textAlign: "right" }}>{fmtPct(c.ctr)}</td>
              <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: freqWarn ? "var(--color-warning)" : "var(--color-text-secondary)", textAlign: "right", fontWeight: freqWarn ? 600 : 400 }}>
                {c.freq.toString().replace(".", ",")}
                {freqWarn && <span style={{ marginLeft: 4, fontSize: 10 }}>⚠</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const TableSection = () => (
  <section className="ds-section" id="tables">
    <SectionHead num="05"
      fr="Tables"
      en="Tables"
      lede="Tableaux de campagnes denses, alignement à droite pour tous les chiffres, sticky header au scroll. Format français systématique." />
    <Demo label="table.campaigns" tags={["sortable", "sticky head", "freq alert"]} bg="base">
      <CampaignTablePreview />
    </Demo>
    <Spec
      headers={["Élément", "Spec", "Notes"]}
      rows={[
        ["Header row",         "10px mono · uppercase · 0.08em · muted",     "Sticky en scroll, fond bg-subtle/85 + backdrop-blur"],
        ["Cell text",          "12px sans · primary",                        "Texte aligné à gauche par défaut"],
        ["Cell numeric",       "12px mono · tabular-nums · aligné droite",   "Toujours en mono, jamais en sans"],
        ["Row hover",          "bg-elevated · 120ms",                        "Pas de border, juste un fond"],
        ["Status badge",       "11px medium · pill rounded-full",            "5 statuts : ACTIVE/PAUSED/DELETED/ARCHIVED + custom"],
        ["Platform cell",      "dot 6px + label capitalized",                "Dot couleur de marque, texte en secondary"],
        ["Frequency alert",    "Si > 4 → warning + icône ⚠",                 "Seuil de saturation publicitaire"],
        ["Many rows (>10)",    "max-height 400 · scroll vertical",           "Header reste visible"],
      ]}
    />
    <Rule tone="do">Toutes les colonnes numériques sont en <span className="mono">font-mono</span> + <span className="mono">tabular-nums</span> + alignées à droite. Pas d'exception.</Rule>
  </section>
);

window.TableSection = TableSection;
