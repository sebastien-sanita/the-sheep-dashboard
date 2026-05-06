// ============================================================
// 06 — CHAT SURFACE : messages · tool calls · suggested prompts
// ============================================================

const ChatMessageUser = ({ children, time }) => (
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <div style={{ maxWidth: "72%", background: "var(--color-accent)", borderRadius: "14px 14px 4px 14px", padding: "10px 14px" }}>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-accent-contrast)" }}>{children}</p>
      {time && <p style={{ margin: "4px 0 0", textAlign: "right", fontSize: 10, color: "rgba(0,0,0,0.45)", fontFamily: "var(--font-mono)" }}>{time}</p>}
    </div>
  </div>
);

const ChatToolCall = ({ label, done }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "1px 0" }}>
    {done ? (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    ) : (
      <span style={{ width: 10, height: 10, border: "1.5px solid var(--color-text-muted)", borderTopColor: "transparent", borderRadius: "50%" }} className="animate-spin" />
    )}
    <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontStyle: "italic" }}>{label}</span>
  </div>
);

const ChatMessageAssistant = ({ children, time }) => (
  <div style={{ display: "flex", justifyContent: "flex-start" }}>
    <div style={{ maxWidth: "88%", padding: "4px 0" }}>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)" }}>{children}</div>
      {time && <p style={{ margin: "6px 0 0", fontSize: 10, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{time}</p>}
    </div>
  </div>
);

const ChatMetricInline = ({ children, color = "primary" }) => {
  const c = color === "success" ? "var(--color-success)" : color === "danger" ? "var(--color-danger)" : "var(--color-text-primary)";
  return <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: c }}>{children}</span>;
};

const ChatPanelPreview = () => (
  <div style={{ display: "flex", flexDirection: "column", height: 560, background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border-default)" }}>
    {/* Header */}
    <div style={{ flexShrink: 0, padding: "10px 16px", borderBottom: "1px solid var(--color-border-default)", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-success)" }} className="animate-pulse-dot" />
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>Boulangerie Martin</span>
      <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>· 1 – 31 mars 2026</span>
    </div>

    {/* Messages */}
    <div style={{ flex: 1, overflow: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
      <ChatMessageUser time="14:23">Quel est le CPL ce mois-ci et comment évolue-t-il ?</ChatMessageUser>

      <div>
        <ChatToolCall label="Analyse des campagnes" done />
        <ChatToolCall label="Récupération des conversions" done />
        <ChatToolCall label="Vérification des fréquences" done />
      </div>

      <ChatMessageAssistant time="14:23">
        <p style={{ margin: "0 0 8px" }}>
          Le CPL moyen sur mars 2026 est de <ChatMetricInline>12,40&nbsp;€</ChatMetricInline> sur l'ensemble des campagnes actives, en baisse de <ChatMetricInline color="success">−8,2&nbsp;%</ChatMetricInline> vs février (13,51&nbsp;€).
        </p>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", margin: "12px 0 6px" }}>Détail par campagne</h3>
        <div style={{ overflow: "hidden", borderRadius: 6, border: "1px solid var(--color-border-default)", margin: "6px 0" }}>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", textAlign: "left", borderBottom: "1px solid var(--color-border-default)" }}>Campagne</th>
                <th style={{ padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", textAlign: "right", borderBottom: "1px solid var(--color-border-default)" }}>CPL</th>
                <th style={{ padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", textAlign: "right", borderBottom: "1px solid var(--color-border-default)" }}>Δ vs n-1</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: "6px 10px", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-subtle)" }}>Galette Janvier</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-subtle)" }}>10,80&nbsp;€</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-success)", borderBottom: "1px solid var(--color-border-subtle)" }}>−12,4 %</td></tr>
              <tr><td style={{ padding: "6px 10px", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-subtle)" }}>Saint-Valentin</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-subtle)" }}>14,20&nbsp;€</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-success)", borderBottom: "1px solid var(--color-border-subtle)" }}>−4,1 %</td></tr>
              <tr><td style={{ padding: "6px 10px", color: "var(--color-text-primary)" }}>Promo printemps</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>13,90&nbsp;€</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-danger)" }}>+3,2 %</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ margin: "8px 0 0" }}>
          La baisse provient principalement de la campagne <em style={{ color: "var(--color-text-secondary)" }}>Galette Janvier</em>, dont le CTR est passé de 1,9 % à 2,7 %. À surveiller : la fréquence sur <em style={{ color: "var(--color-text-secondary)" }}>Saint-Valentin</em> approche 4,2 (saturation).
        </p>
      </ChatMessageAssistant>

      <ChatMessageUser time="14:24">Et la fréquence sur les autres campagnes ?</ChatMessageUser>
      <div>
        <ChatToolCall label="Vérification des fréquences" />
      </div>
      <ChatMessageAssistant>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          Trois campagnes dépassent le seuil de 4 actuellement <span style={{ color: "var(--color-accent)" }}>▍</span>
        </p>
      </ChatMessageAssistant>
    </div>

    {/* Suggested prompts */}
    <div style={{ flexShrink: 0, padding: "10px 14px", borderTop: "1px solid var(--color-border-default)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, padding: "0 4px" }}>Suggestions</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          "Compare avec le mois dernier",
          "Quels créatifs performent le mieux ?",
          "Audit complet des campagnes actives",
          "Quel budget pour atteindre 1000 leads ?",
        ].map((s, i) => (
          <button key={i} type="button" style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            padding: 10, fontSize: 12, color: "var(--color-text-secondary)",
            textAlign: "left", background: "transparent",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)", cursor: "pointer",
            lineHeight: 1.4, fontFamily: "var(--font-sans)",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, color: "var(--color-text-muted)", flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {s}
          </button>
        ))}
      </div>
    </div>

    {/* Composer */}
    <div style={{ flexShrink: 0, padding: 14, borderTop: "1px solid var(--color-border-default)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "8px 12px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)" }}>
        <textarea rows="1" placeholder="Pose ta question…" style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", fontSize: 13,
          resize: "none", lineHeight: 1.5, maxHeight: 120,
        }} />
        <button type="button" style={{
          width: 26, height: 26, padding: 0,
          background: "var(--color-accent)", color: "var(--color-accent-contrast)",
          border: "none", borderRadius: "var(--radius-xs)", cursor: "pointer",
          display: "grid", placeItems: "center",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>
);

const ChatSection = () => (
  <section className="ds-section" id="chat">
    <SectionHead num="06"
      fr="Chat IA"
      en="AI Chat"
      lede="Surface conversationnelle Claude. Bulle utilisateur à droite (accent fill). Réponse assistant à gauche, sans bulle, en markdown rendu. Tool calls inline en italique muted." />

    <Demo label="chat.panel" tags={["streaming", "tool calls", "suggested prompts"]}>
      <ChatPanelPreview />
    </Demo>

    <SubHead fr="Règles d'usage" en="Rules" />
    <Spec
      headers={["Élément", "Spec", "Notes"]}
      rows={[
        ["Bulle USER",         "max-width 72% · accent fill · radius 14/14/4/14", "Pas de fond pour les chiffres dedans, contrasté sur l'accent"],
        ["Bulle ASSISTANT",    "max-width 88% · pas de fond · markdown rendu",     "Headers H1 17, H2 15, H3 14"],
        ["Tool call",          "11px italic muted · icône check ou spinner",       "Fade à 35% après 1500ms"],
        ["Streaming cursor",   "▍ accent · blink 0.8s",                            "Sur le dernier caractère uniquement"],
        ["Métriques inline",   "mono 600 · couleur sémantique pour ±%",            "Auto-extraction par regex sur €, %"],
        ["Tables markdown",    "Style premium · 11/12px · même tokens",            "Postprocess HTML cf. MessageBubble.tsx"],
        ["Suggested prompts",  "2-col grid · icône à gauche · border default",     "Stagger animation 40ms"],
        ["Composer",           "1 ligne min · auto-grow max 120px · accent send",  "Submit on Enter, newline on Shift+Enter"],
      ]}
    />
    <Rule tone="warn">Le chat est partagé entre Hub (multi-clients, scope global) et Self-Service (mono-client). Les <span className="mono">SUGGESTED_PROMPTS</span> changent selon le scope.</Rule>
  </section>
);

window.ChatSection = ChatSection;
