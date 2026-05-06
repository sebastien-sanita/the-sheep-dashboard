// ============================================================
// Shared building blocks for design system sections
// ============================================================

const SectionHead = ({ num, fr, en, lede }) => (
  <header>
    <div className="ds-section-head">
      <span className="ds-section-num">{num}</span>
      <h2 className="ds-section-title">{fr}</h2>
      <span className="ds-section-title-en">— {en}</span>
    </div>
    {lede && <p className="ds-section-lede">{lede}</p>}
  </header>
);

const SubHead = ({ fr, en, tag }) => (
  <div className="ds-subhead">
    <h3>{fr}</h3>
    <span className="ds-subhead-en">{en}</span>
    {tag && <span className="ds-subhead-tag">{tag}</span>}
  </div>
);

const Rule = ({ tone = "do", label, children }) => (
  <div className="ds-rule" data-tone={tone}>
    <span className="ds-rule-icon">{label || (tone === "dont" ? "À éviter" : tone === "warn" ? "Attention" : "Règle")}</span>
    <span>{children}</span>
  </div>
);

const Demo = ({ label, tags = [], density, bg = "subtle", children }) => (
  <div className="ds-demo">
    <div className="ds-demo-head">
      <span className="ds-demo-label">{label}</span>
      <div className="ds-demo-tags">
        {tags.map((t, i) => <span key={i} className="ds-demo-tag">{t}</span>)}
      </div>
    </div>
    <div className="ds-demo-body" data-density={density} data-bg={bg}>
      {children}
    </div>
  </div>
);

const Spec = ({ rows, headers = ["Token", "Valeur", "Usage"] }) => (
  <table className="ds-spec">
    <thead>
      <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={i}>
          {r.map((c, j) => (
            <td key={j} className={j === 0 ? "mono" : j === r.length - 1 ? "muted" : ""}>{c}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

// ── Sheep mark (logo) ─────────────────────────────────────────
// Adulte, géométrique, sans illustration cute.
const SheepMark = ({ size = 14, stroke = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {/* tête */}
    <circle cx="8" cy="9" r="2.6" />
    {/* corps : suite d'arcs façon laine, mais sobre */}
    <path d="M10.4 9 c1.4 -0.2 2.6 0.6 3.4 1.6 c0.6 -0.8 1.6 -1.2 2.6 -1 c1.4 0.3 2.2 1.6 1.9 3 c-0.2 0.9 -0.9 1.6 -1.7 1.9 c0.3 0.9 -0.1 2 -0.9 2.5 c-0.9 0.5 -2.1 0.3 -2.7 -0.5 c-0.6 0.5 -1.5 0.5 -2.1 0 c-0.6 0.7 -1.7 0.8 -2.4 0.2 c-0.7 -0.6 -0.8 -1.6 -0.4 -2.4 c-0.7 -0.4 -1.1 -1.1 -1.1 -1.9 c0 -1.4 1.1 -2.4 2.5 -2.4 z" />
    {/* œil */}
    <circle cx="7.4" cy="9" r="0.45" fill={stroke} stroke="none" />
    {/* pattes */}
    <path d="M9.5 17.5 v2" />
    <path d="M14 17.8 v2" />
  </svg>
);

window.SectionHead = SectionHead;
window.SubHead = SubHead;
window.Rule = Rule;
window.Demo = Demo;
window.Spec = Spec;
window.SheepMark = SheepMark;
