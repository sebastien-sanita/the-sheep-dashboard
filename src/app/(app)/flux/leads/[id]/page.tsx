"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FluxChatDock } from "@/components/flux/FluxChatDock";

/**
 * Toile Lead — pixel-port de docs/design-system/v2-vision/toile-lead.html
 *
 * Première implémentation : data en dur (Marie K. · Boulangerie Martin).
 * Quand le backend exposera un endpoint lead-by-id, on remplacera par
 * un fetch.
 */

const SAMPLE_LEAD = {
  initial: "M",
  name: "Marie K.",
  email: "marie.k@example.fr",
  phone: "+33 6 84 32 ** **",
  city: "Paris 11ᵉ",
  status: "QUALIFIÉ",
  client: "Boulangerie Martin",
  number: "187",
  score: "8,4",
  scorePct: 84,
};

export default function ToileLeadPage() {
  const params = useParams<{ id: string }>();
  const l = SAMPLE_LEAD;

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--color-bg-base)" }}>
      {/* Breadcrumb */}
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "32px 32px 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--color-text-tertiary)",
        }}
      >
        <Link
          href="/flux"
          style={{
            color: "var(--color-text-tertiary)",
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            marginRight: 8,
          }}
        >
          ← Le flux
        </Link>
        <Link href="#" style={{ color: "var(--color-text-tertiary)", textDecoration: "none" }}>
          {l.client}
        </Link>
        <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>/</span>
        <Link href="#" style={{ color: "var(--color-text-tertiary)", textDecoration: "none" }}>
          Leads
        </Link>
        <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>/</span>
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{l.name}</span>
      </div>

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "0 32px 240px" }}>
        {/* ── Hero : avatar + identité + score ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 24,
            alignItems: "center",
            margin: "32px 0 48px",
            paddingBottom: 32,
            borderBottom: "1px solid var(--color-border-default)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7f996d 0%, #6b8459 100%)",
              display: "grid",
              placeItems: "center",
              color: "var(--color-accent-contrast)",
              fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 28,
              letterSpacing: "-0.02em",
              border: "1px solid var(--color-border-emphasis)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {l.initial}
          </div>

          {/* Identity */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Pill tone="meta">
                <Dot /> META · INSTAGRAM
              </Pill>
              <Pill tone="success">
                <Dot /> {l.status}
              </Pill>
              <span>
                Lead n° {l.number} · {l.client}
              </span>
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                color: "var(--color-text-primary)",
                margin: "0 0 4px",
              }}
            >
              {l.name}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 13,
                color: "var(--color-text-secondary)",
                flexWrap: "wrap",
              }}
            >
              <a
                href={`mailto:${l.email}`}
                style={{
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  borderBottom: "1px dotted var(--color-border-emphasis)",
                }}
              >
                {l.email}
              </a>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "-0.01em",
                }}
              >
                {l.phone}
              </span>
              <span>{l.city}</span>
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Score IA
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 32,
                fontWeight: 600,
                color: "var(--color-success)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.025em",
                lineHeight: 1,
              }}
            >
              {l.score}
              <span style={{ color: "var(--color-text-muted)", fontSize: 16, fontWeight: 400 }}>
                /10
              </span>
            </div>
            <div
              style={{
                marginTop: 8,
                width: 100,
                height: 3,
                background: "var(--color-bg-elevated)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--color-success)",
                  borderRadius: 2,
                  width: `${l.scorePct}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Story (narration prose) ── */}
        <section style={{ marginBottom: 56 }}>
          <article
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "36px 40px",
              position: "relative",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 36,
                width: 2,
                height: 40,
                background: "var(--color-accent)",
                borderRadius: 1,
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              L&apos;histoire de {l.name.split(" ")[0]} · narrée par l&apos;IA
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 22,
                color: "var(--color-text-primary)",
                margin: "0 0 20px",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                maxWidth: "50ch",
              }}
            >
              &ldquo;{l.name.split(" ")[0]} a vu trois ads avant de cliquer, puis a rempli le
              formulaire 4 jours plus tard.&rdquo;
            </h2>
            <StoryBody firstName={l.name.split(" ")[0]} client={l.client} />
          </article>
        </section>

        {/* ── Visual timeline ── */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ position: "relative", padding: "32px 0" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 1,
                background: "var(--color-border-default)",
                borderRadius: 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "88%",
                  background: "linear-gradient(90deg, var(--color-accent) 0%, var(--color-success) 100%)",
                  borderRadius: 1,
                }}
              />
            </div>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <TP
                tone="touch"
                date="12 mars"
                time="14:32"
                event="Vue Story #3"
              />
              <TP tone="touch" date="15 mars" time="18:04" />
              <TP tone="click" date="18 mars" time="21:17" event="Clic Carrousel #2" />
              <TP tone="touch" date="19 mars" time="10:08" />
              <TP tone="form" date="20 mars" time="20:42" />
              <TP
                tone="convert"
                date="21 mars"
                time="09:00"
                event="Lead converti · qualifié"
              />
            </div>
          </div>
        </section>

        {/* ── Attribution + Pipeline ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 56,
          }}
        >
          <SplitCard title="Attribution multi-touch">
            <AttRow gradient="c1" title="#3 — Vidéo galette" meta="3 vues · 1 skip · awareness" weight="52 %" />
            <AttRow
              gradient="c2"
              title="#2 — Carrousel produit"
              meta="1 clic · landing · consideration"
              weight="31 %"
            />
            <AttRow
              gradient="c4"
              title="#4 — Reels recette (retargeting)"
              meta="1 vue · conversion driver"
              weight="17 %"
            />
          </SplitCard>

          <SplitCard title="Stage actuel">
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
              <Stage label="Touch" done />
              <Stage label="Click" done />
              <Stage label="Form" done />
              <Stage label="Qualifié" current />
              <Stage label="Acheté" />
              <Stage label="Récurrent" />
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Stage actuel depuis{" "}
              <strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>3 jours</strong>.
              La probabilité de conversion en{" "}
              <strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
                première vente
              </strong>{" "}
              dans les 7 prochains jours est estimée à{" "}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-success)",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                73 %
              </span>{" "}
              si le contact est pris dans les 48h, sinon retombe à{" "}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-primary)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                42 %
              </span>{" "}
              sous 7j.
            </p>
          </SplitCard>
        </section>

        {/* ── Captured form data ── */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeader title="Données du formulaire" meta="Soumis le 20 mars · 20:42" />
          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <CapturedRow label="Nom complet" value={l.name} />
            <CapturedRow label="E-mail" value={l.email} />
            <CapturedRow label="Téléphone" value={l.phone} mono />
            <CapturedRow
              label="Demande"
              valueSerif='"Réservation 2 galettes 6 personnes pour le 25 mars."'
            />
            <CapturedRow label="Acceptation RGPD" value="✓ Marketing autorisé" valueColor="var(--color-success)" />
          </div>
        </section>

        {/* ── Actions ── */}
        <section
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: "32px 0",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <ActionBtn primary>✓ Marquer comme contacté</ActionBtn>
          <ActionBtn href="/chat">Demander un suivi à l&apos;IA</ActionBtn>
          <ActionBtn>Exporter en CSV</ActionBtn>
          <ActionBtn>Ajouter à une audience custom</ActionBtn>
          <ActionBtn ghost danger style={{ marginLeft: "auto" }}>
            Refuser ce lead
          </ActionBtn>
        </section>
      </main>

      <FluxChatDock scope={`${l.name}`} />
    </div>
  );
}

/* ============================================================
   Sous-composants
   ============================================================ */

function StoryBody({ firstName, client }: { firstName: string; client: string }) {
  const body: React.CSSProperties = {
    fontSize: 15,
    lineHeight: 1.75,
    color: "var(--color-text-secondary)",
    margin: "0 0 14px",
    maxWidth: "60ch",
  };
  const em: React.CSSProperties = {
    fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
    fontStyle: "italic",
    fontWeight: 400,
    color: "var(--color-text-primary)",
  };
  const strong: React.CSSProperties = { color: "var(--color-text-primary)", fontWeight: 500 };
  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.01em",
    color: "var(--color-text-primary)",
  };
  const link: React.CSSProperties = {
    color: "var(--color-accent-hover)",
    textDecoration: "underline",
    textDecorationColor: "var(--color-accent-muted)",
    textUnderlineOffset: 3,
  };

  return (
    <>
      <p style={body}>
        {firstName} a découvert <strong style={strong}>{client}</strong> le{" "}
        <span style={mono}>12 mars</span> via une story Instagram sponsorisée — la{" "}
        <Link href="/flux/creatives/3" style={link}>
          vidéo galette
        </Link>
        , vue 8 secondes mais skippée. Trois jours après, la même story lui est représentée
        (frequency&nbsp;<span style={mono}>2</span>) ; elle s&apos;arrête plus longtemps cette fois (
        <span style={mono}>14 s</span>) sans cliquer.
      </p>
      <p style={body}>
        Le <span style={mono}>18 mars</span>, un creative connexe (carrousel produit, #2) la touche
        en feed. Elle clique cette fois, atterrit sur{" "}
        <em style={em}>la page galette</em>, scroll 75 % puis ferme l&apos;onglet sans convertir.
        Un retargeting J+3 la ramène le <span style={mono}>20 mars</span> ; cette fois elle remplit
        le formulaire (e-mail + téléphone + ville), demande de réservation pour{" "}
        <em style={em}>2 galettes 6 personnes</em>.
      </p>
      <p style={body}>
        Profil prédictif : <strong style={strong}>femme 28-32 ans</strong>, urbaine, intérêt fort
        pour la cuisine maison et le slow living, déjà cliente potentielle de{" "}
        <em style={em}>Maison Plisson</em> et <em style={em}>Du Pain et des Idées</em> (signaux
        Meta). <strong style={strong}>Score 8,4/10</strong> : très probable conversion en cliente
        régulière si la première expérience est bonne.{" "}
        <a href="#" style={link}>
          Voir comment qualifier
        </a>
        .
      </p>
    </>
  );
}

function TP({
  tone,
  date,
  time,
  event,
}: {
  tone: "touch" | "click" | "form" | "convert";
  date: string;
  time: string;
  event?: string;
}) {
  const STYLES = {
    touch: { border: "var(--color-info)", bg: "var(--color-info-muted)" },
    click: { border: "var(--color-accent)", bg: "var(--color-accent-muted)" },
    form: { border: "var(--color-success)", bg: "var(--color-success-muted)" },
    convert: { border: "var(--color-success)", bg: "var(--color-success)" },
  } as const;
  const s = STYLES[tone];

  return (
    <div
      style={{
        position: "relative",
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: s.bg,
        border: `2px solid ${s.border}`,
        zIndex: 2,
        cursor: "pointer",
        boxShadow: tone === "convert" ? `0 0 0 4px var(--color-success-muted)` : undefined,
      }}
    >
      {event && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -56,
            transform: "translateX(-50%)",
            padding: "4px 8px",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-xs)",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--color-text-primary)",
            whiteSpace: "nowrap",
          }}
        >
          {event}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -52,
          transform: "translateX(-50%)",
          textAlign: "center",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--color-text-muted)",
          letterSpacing: "0.04em",
        }}
      >
        <span style={{ display: "block", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 2 }}>
          {date}
        </span>
        {time}
      </div>
    </div>
  );
}

function SplitCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "24px 28px",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          margin: "0 0 16px",
          letterSpacing: "-0.005em",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function AttRow({
  gradient,
  title,
  meta,
  weight,
}: {
  gradient: "c1" | "c2" | "c4";
  title: string;
  meta: string;
  weight: string;
}) {
  const GRADIENTS: Record<string, string> = {
    c1: "linear-gradient(180deg, #7f996d 0%, #d6a64a 100%)",
    c2: "linear-gradient(135deg, #1a1a24 0%, #6a9ad6 80%)",
    c4: "linear-gradient(135deg, #b07a9a 0%, #5a5a6e 100%)",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontSize: 13,
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0, background: GRADIENTS[gradient] }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
          {title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          {meta}
        </div>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--color-success)",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {weight}
      </span>
    </div>
  );
}

function Stage({ label, done, current }: { label: string; done?: boolean; current?: boolean }) {
  let bg = "var(--color-bg-base)";
  let color = "var(--color-text-muted)";
  let border = "var(--color-border-default)";
  let fontWeight: number | undefined = undefined;

  if (done) {
    bg = "var(--color-success-muted)";
    color = "var(--color-success)";
    border = "var(--color-success-muted)";
  } else if (current) {
    bg = "var(--color-accent-subtle)";
    color = "var(--color-accent-hover)";
    border = "var(--color-accent)";
    fontWeight = 600;
  }

  return (
    <span
      style={{
        flex: 1,
        height: 32,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-xs)",
        fontWeight,
      }}
    >
      {label}
    </span>
  );
}

function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <header style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.005em",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {meta && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            letterSpacing: "0.06em",
          }}
        >
          {meta}
        </span>
      )}
    </header>
  );
}

function CapturedRow({
  label,
  value,
  valueSerif,
  mono,
  valueColor,
}: {
  label: string;
  value?: string;
  valueSerif?: string;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        padding: "10px 18px",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontSize: 13,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      {valueSerif ? (
        <em
          style={{
            fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
            fontStyle: "italic",
            color: "var(--color-text-secondary)",
          }}
        >
          {valueSerif}
        </em>
      ) : (
        <span
          style={{
            color: valueColor ?? "var(--color-text-primary)",
            fontFamily: mono ? "var(--font-mono)" : undefined,
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "meta" | "success";
  children: React.ReactNode;
}) {
  const STYLES = {
    meta: { bg: "rgba(24, 119, 242, 0.12)", color: "#6a9ad6" },
    success: { bg: "var(--color-success-muted)", color: "var(--color-success)" },
  } as const;
  const s = STYLES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.02em",
        background: s.bg,
        color: s.color,
      }}
    >
      {children}
    </span>
  );
}

function Dot() {
  return (
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "currentColor",
      }}
    />
  );
}

function ActionBtn({
  children,
  primary,
  ghost,
  danger,
  href,
  style,
}: {
  children: React.ReactNode;
  primary?: boolean;
  ghost?: boolean;
  danger?: boolean;
  href?: string;
  style?: React.CSSProperties;
}) {
  const baseStyle: React.CSSProperties = {
    height: 36,
    padding: "0 18px",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid transparent",
    textDecoration: "none",
    transition: "all var(--transition-fast)",
    ...style,
  };
  if (primary) {
    baseStyle.background = "var(--color-accent)";
    baseStyle.color = "var(--color-accent-contrast)";
  } else if (ghost) {
    baseStyle.background = "transparent";
    baseStyle.color = danger ? "var(--color-danger)" : "var(--color-text-tertiary)";
  } else {
    baseStyle.background = "transparent";
    baseStyle.color = "var(--color-text-secondary)";
    baseStyle.borderColor = "var(--color-border-emphasis)";
  }
  if (href) {
    return (
      <Link href={href} style={baseStyle}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" style={baseStyle}>
      {children}
    </button>
  );
}
