"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FluxChatDock } from "@/components/flux/FluxChatDock";

/**
 * Toile Creative — pixel-port de docs/design-system/v2-vision/toile-creative.html
 *
 * Pour cette première implémentation, la page rend une creative "exemple"
 * (Boulangerie Martin · vidéo galette) en data en dur. Quand le backend
 * exposera un endpoint creative-by-id, on remplacera la donnée hardcodée
 * par un fetch.
 *
 * Le slug du URL params est uniquement utilisé pour l'affichage du
 * breadcrumb et le scope du chat dock — pas de fetch tant que l'API
 * n'existe pas.
 */

const SAMPLE_CREATIVE = {
  client: "Boulangerie Martin",
  name: "Vidéo galette",
  format: "Story 9:16",
  platform: "META · INSTAGRAM STORY",
  status: "EN DIFFUSION",
  duration: "8s",
  weight: "3,4 Mo",
  resolution: "1080p",
  uploaded_at: "28 avril 14:30",
  author: "IA · brief Boulangerie",
  iterations: "v3 (3 révisions)",
  // Brief IA
  brief_quote:
    "L'audience cible 25-34 actifs urbains est sensible à la nostalgie sensorielle plus qu'au prix.",
  // Variations
  variations: [
    { name: "Vidéo galette — actuel", meta: "v3 · 28 avril", score: "9,2", active: true, gradient: "v0" },
    { name: "Témoin client — Madame B.", meta: "brouillon · IA", score: "8,1", gradient: "v1" },
    { name: "Packshot social — feuilletage", meta: "brouillon · IA", score: "7,4", gradient: "v2" },
    { name: "Saint-Patrick — claim hero", meta: "à générer", score: "—", gradient: "v3" },
  ],
};

export default function ToileCreativePage() {
  const params = useParams<{ id: string }>();
  const c = SAMPLE_CREATIVE;

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--color-bg-base)" }}>
      {/* Breadcrumb */}
      <div
        style={{
          maxWidth: 1040,
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
          {c.client}
        </Link>
        <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>/</span>
        <Link href="#" style={{ color: "var(--color-text-tertiary)", textDecoration: "none" }}>
          Creatives
        </Link>
        <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>/</span>
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
          #{params.id} — {c.name}
        </span>
      </div>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "0 32px 240px" }}>
        {/* ── Hero : phone mockup + format details + variations ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 240px",
            gap: 40,
            margin: "32px 0 64px",
            alignItems: "start",
          }}
        >
          <div>
            <CreativeMeta platform={c.platform} status={c.status} format={`${c.format.split(" ")[1]} · ${c.duration} · ${c.resolution}`} />
            <h1
              style={{
                fontSize: 32,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                fontWeight: 500,
                margin: "0 0 8px",
                maxWidth: "24ch",
              }}
            >
              {c.name},{" "}
              <em
                style={{
                  fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--color-text-secondary)",
                }}
              >
                top performeuse
              </em>{" "}
              de la semaine.
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--color-text-secondary)",
                maxWidth: "60ch",
                margin: "0 0 32px",
                lineHeight: 1.65,
              }}
            >
              Mise en ligne lundi 28 avril. Capte 67 % des leads de {c.client} sur les 7 derniers
              jours, à un CPL{" "}
              <em
                style={{
                  fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--color-text-primary)",
                }}
              >
                34 %
              </em>{" "}
              sous la moyenne du compte.
            </p>

            <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
              <PhoneMockup brand={c.client.charAt(0).toUpperCase()} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <PreviewSpec label="Format" value={c.format} />
                <PreviewSpec label="Durée" value={c.duration} />
                <PreviewSpec label="Poids" value={c.weight} />
                <PreviewSpec label="Mis en ligne" value={c.uploaded_at} />
                <PreviewSpec label="Auteur" value={c.author} valueSans />
                <PreviewSpec label="Itérations" value={c.iterations} valueSans />
              </div>
            </div>
          </div>

          {/* Variations stack */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Variantes IA · brief associé
            </div>
            {c.variations.map((v) => (
              <Variation key={v.name} {...v} />
            ))}
            <button
              type="button"
              style={{
                marginTop: 6,
                padding: 14,
                border: "1px dashed var(--color-border-emphasis)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                background: "transparent",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.color = "var(--color-accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border-emphasis)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Demander à l&apos;IA une variante
            </button>
          </aside>
        </section>

        {/* ── Brief IA ── */}
        <Section title="Brief de l'IA" meta="Généré · 28 avril 14:14 · Claude Opus 4.7">
          <article
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "36px 40px",
              position: "relative",
              maxWidth: 760,
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
              Pourquoi ce creative · pourquoi maintenant
            </div>
            <h3
              style={{
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 22,
                color: "var(--color-text-primary)",
                margin: "0 0 20px",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
              }}
            >
              &ldquo;{c.brief_quote}&rdquo;
            </h3>
            <BriefBody />
          </article>
        </Section>

        {/* ── Multi-format preview ── */}
        <Section title="Décliné sur 3 formats" meta="Adaptation auto par l'IA · même brief, mêmes assets">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            <FormatCard
              name="Instagram · Story 9:16"
              status="EN DIFFUSION"
              statusTone="success"
              gradient="story"
              spend="510 €"
              cpl="9,80 €"
              cplTone="success"
            />
            <FormatCard
              name="Facebook · Feed 1:1"
              status="À OPTIMISER"
              statusTone="warn"
              gradient="feed"
              spend="380 €"
              cpl="13,40 €"
              cplTone="warn"
            />
            <FormatCard
              name="TikTok · Reels 9:16"
              status="À TESTER"
              statusTone="muted"
              gradient="reels"
              spend="0 €"
              cpl="—"
              cplTone="muted"
            />
          </div>
        </Section>

        {/* ── A/B test inline ── */}
        <Section
          title="A/B test en cours"
          meta="Lancé il y a 5 jours · 50/50 · 18 640 reach unique"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 24,
              alignItems: "stretch",
              marginBottom: 16,
            }}
          >
            <ABCard
              tag="CHAMPION"
              tagTone="champion"
              traffic="52 % du trafic"
              title="Variante A — claim sensoriel"
              claim="La pâte feuilletée de votre enfance."
              claimSerif
              ctr="2,7 %"
              cpl="9,80 €"
              leads="52"
              champion
            />
            <div
              style={{
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontSize: 22,
                color: "var(--color-text-muted)",
                width: 28,
              }}
            >
              vs
            </div>
            <ABCard
              tag="CHALLENGER"
              tagTone="challenger"
              traffic="48 % du trafic"
              title="Variante B — claim promotionnel"
              claim="−10 % sur la galette pour la fève d'or."
              claimSerif={false}
              ctr="1,8 %"
              cpl="14,80 €"
              leads="31"
            />
          </div>
          <div
            style={{
              padding: "14px 18px",
              background: "var(--color-bg-elevated)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
              Verdict IA · confiance 94 %
            </strong>{" "}
            · La variante A bat la B sur les 3 axes (CTR{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-success)", fontWeight: 600 }}>
              +50 %
            </span>
            , CPL{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-success)", fontWeight: 600 }}>
              −34 %
            </span>
            , volume{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-success)", fontWeight: 600 }}>
              +68 %
            </span>
            ). À significance statistique (
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>p &lt; 0,01</span>
            ) au bout de 5 jours. L&apos;IA recommande de{" "}
            <a href="#" style={{ color: "var(--color-accent-hover)" }}>
              terminer le test et reverser 100 % du budget sur A
            </a>
            .
          </div>
        </Section>

        {/* ── Composants creative : copy + typo + palette ── */}
        <Section title="Composants du creative" meta="Assets, copy, palette, typographie">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <AssetCard title="Copy hooks">
              <CopyList
                items={[
                  { role: "Pre-claim", value: "Galette des rois", mono: true },
                  { role: "Claim", value: "La pâte feuilletée de votre enfance.", serif: true },
                  { role: "Super", value: "5,80 € · à emporter" },
                  { role: "CTA", value: "Commander en ligne →" },
                  { role: "Hashtags", value: "#galettedesrois #boulangerie #paris11", mono: true, dim: true },
                ]}
              />
            </AssetCard>

            <AssetCard title="Typographie">
              <FontRow role="Pre-claim" name="JetBrains Mono · 9 / 600" mono />
              <FontRow role="Claim" name="Newsreader · 26 / 400 italic" serif />
              <FontRow role="Super" name="JetBrains Mono · 14 / 600" mono />
              <FontRow role="CTA" name="DM Sans · 12 / 600" />
            </AssetCard>

            <AssetCard title="Palette utilisée" span={2}>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <Swatch hex="#7f996d" name="Moss" />
                <Swatch hex="#6b8459" name="Moss-active" />
                <Swatch hex="#d6a64a" name="Wheat" />
                <Swatch hex="#c98a3c" name="Caramel" />
                <Swatch hex="#ffffff" name="White" border />
                <Swatch hex="#0e0e14" name="Ink" />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Palette dérivée du brand book {c.client} (verts du tablier, ocres de la cuisson).
                Vérification conformité brand :{" "}
                <span style={{ color: "var(--color-success)", fontWeight: 600 }}>✓ alignée</span>.
                Pas d&apos;écart de teinte au-delà de la tolérance ΔE 3.
              </p>
            </AssetCard>
          </div>
        </Section>

        {/* ── Performance & audience split ── */}
        <Section title="Performance & audience" meta="Live · synchronisé Meta Ads · il y a 4 min">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <SplitCard title="Performance · 7 derniers jours">
              <Row label="Impressions" value="42 380" />
              <Row label="Reach unique" value="18 640" />
              <Row label="Fréquence moy." value="2,4" />
              <Row label="CTR" value="2,7 %" delta="+0,8 pt" />
              <Row label="Leads" value="52" />
              <Row label="CPL" value="9,80 €" delta="−34 %" />
              <Row label="Dépense" value="510 €" />
            </SplitCard>
            <SplitCard title="Audience touchée">
              <BarRow label="Femmes 25-34" value="52 %" pct={52} />
              <BarRow label="Femmes 35-44" value="23 %" pct={23} />
              <BarRow label="Hommes 25-34" value="14 %" pct={14} />
              <BarRow label="Hommes 35-44" value="8 %" pct={8} />
              <Row label="Autres" value="3 %" />
              <Row label="Top 3 villes" value="Paris · Lyon · Toulouse" valueDim />
            </SplitCard>
          </div>
        </Section>

        {/* ── Actions ── */}
        <section
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: "32px 0",
            borderTop: "1px solid var(--color-border-subtle)",
            marginTop: 56,
          }}
        >
          <ActionBtn primary>+ Générer 3 variantes</ActionBtn>
          <ActionBtn href="/chat">Modifier via le chat</ActionBtn>
          <ActionBtn>Dupliquer pour autre client</ActionBtn>
          <ActionBtn>Programmer la fin de diffusion</ActionBtn>
          <ActionBtn ghost danger style={{ marginLeft: "auto" }}>
            Pause cette campagne
          </ActionBtn>
        </section>
      </main>

      <FluxChatDock scope={`Creative #${params.id}`} />
    </div>
  );
}

/* ============================================================
   Sous-composants locaux
   ============================================================ */

function CreativeMeta({
  platform,
  status,
  format,
}: {
  platform: string;
  status: string;
  format: string;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        marginBottom: 18,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Pill tone="meta">
        <Dot /> {platform}
      </Pill>
      <Pill tone="live">
        <Dot pulse /> {status}
      </Pill>
      <span>{format}</span>
    </div>
  );
}

function PhoneMockup({ brand }: { brand: string }) {
  return (
    <div
      style={{
        width: 220,
        height: 460,
        background: "#0e0e14",
        border: "1px solid var(--color-border-emphasis)",
        borderRadius: 28,
        padding: 8,
        flexShrink: 0,
        boxShadow: "var(--shadow-lg), 0 0 0 6px rgba(255,255,255,0.02)",
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 56,
          height: 4,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 2,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 22,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(127, 153, 109, 0.6) 0%, rgba(127, 153, 109, 0.2) 50%, rgba(214, 166, 74, 0.6) 100%), radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 50%)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 18px 32px",
          fontSize: 11,
          color: "white",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 18,
            right: 18,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <span>9:41</span>
          <span>5G</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 18,
            right: 18,
            height: 1.5,
            background: "rgba(255,255,255,0.25)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div style={{ width: "60%", height: "100%", background: "rgba(255,255,255,0.85)" }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              background: "rgba(255,255,255,0.95)",
              color: "#6b8459",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            {brand}
          </span>
          <span>boulangerie_martin</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 9 }}>· Sponsorisé</span>
        </div>
        <div style={{ textAlign: "center", marginTop: "auto", marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              marginBottom: 10,
            }}
          >
            Galette des rois
          </div>
          <div
            style={{
              fontFamily: "Newsreader, serif",
              fontStyle: "italic",
              fontSize: 26,
              fontWeight: 400,
              lineHeight: 1.15,
              color: "white",
              letterSpacing: "-0.015em",
              marginBottom: 14,
            }}
          >
            La pâte feuilletée
            <br />
            de votre enfance.
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              background: "rgba(0,0,0,0.32)",
              padding: "5px 12px",
              borderRadius: 4,
              display: "inline-block",
            }}
          >
            — 5,80 € · à emporter
          </div>
        </div>
        <div
          style={{
            background: "white",
            color: "#0e0e14",
            fontSize: 12,
            fontWeight: 600,
            padding: 10,
            textAlign: "center",
            borderRadius: 999,
            letterSpacing: "-0.01em",
          }}
        >
          Commander en ligne →
        </div>
      </div>
    </div>
  );
}

function PreviewSpec({
  label,
  value,
  valueSans,
}: {
  label: string;
  value: string;
  valueSans?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontSize: 12,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: valueSans ? "var(--font-sans)" : "var(--font-mono)",
          color: "var(--color-text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Variation({
  name,
  meta,
  score,
  active,
  gradient,
}: {
  name: string;
  meta: string;
  score: string;
  active?: boolean;
  gradient: string;
}) {
  const GRADIENTS: Record<string, string> = {
    v0: "linear-gradient(180deg, #7f996d 0%, #6b8459 60%, #d6a64a 100%)",
    v1: "linear-gradient(135deg, #1a1a24 0%, #6a9ad6 80%)",
    v2: "linear-gradient(180deg, #d6a64a 0%, #c98a3c 100%)",
    v3: "linear-gradient(135deg, #b07a9a 0%, #5a5a6e 100%)",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-default)"}`,
        borderRadius: "var(--radius-md)",
        background: active ? "var(--color-accent-subtle)" : "var(--color-bg-surface)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 60,
          borderRadius: 6,
          flexShrink: 0,
          background: GRADIENTS[gradient],
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
          {name}
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
          fontSize: 11,
          fontWeight: 600,
          color: score === "—" ? "var(--color-warning)" : "var(--color-success)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {score}
      </span>
    </div>
  );
}

function Section({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 64 }}>
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
      {children}
    </section>
  );
}

function BriefBody() {
  return (
    <>
      <p style={brandBody}>
        Cette vidéo s&apos;appuie sur une hypothèse forte : pour une boulangerie de quartier, la
        galette des rois est moins un produit qu&apos;un{" "}
        <em style={brandEm}>déclencheur de mémoire affective</em>. La cible identifiée (femmes
        25-34, CSP+, vivant en zone urbaine dense, intérêt &laquo; cuisine maison &raquo; actif)
        répond historiquement <strong style={brandStrong}>3,4×</strong> mieux à un claim émotionnel
        court qu&apos;à une promotion de prix (étude interne 12 campagnes Boulangerie Martin sur
        6 mois).
      </p>
      <p style={brandBody}>
        Le format <strong style={brandStrong}>Story 9:16 verticale</strong> a été choisi sur les
        insights de saturation : l&apos;audience consomme désormais{" "}
        <span style={brandMono}>62 %</span> de son temps Instagram en Story plutôt qu&apos;en Feed,
        et la fréquence de Story est divisible (auto-skip) sans pénaliser le brand recall — le coût
        de sur-fréquence y est plus bas qu&apos;en Feed.
      </p>
      <p style={brandBody}>
        Le claim &laquo; La pâte feuilletée de votre enfance &raquo; est volontairement
        pré-rationnel : pas de prix en hero, pas de garanties produit, juste la promesse
        sensorielle. Le prix (<span style={brandMono}>5,80 €</span>) apparaît en sous-couche pour
        ne pas rompre la rêverie. L&apos;IA recommande de{" "}
        <strong style={brandStrong}>tester une variante &laquo; témoin client &raquo;</strong> qui
        pousserait la promesse sociale (déjà dans la liste de variations à droite).
      </p>
    </>
  );
}

const brandBody: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.75,
  color: "var(--color-text-secondary)",
  margin: "0 0 14px",
};
const brandEm: React.CSSProperties = {
  fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
  fontStyle: "italic",
  fontWeight: 400,
  color: "var(--color-text-primary)",
};
const brandStrong: React.CSSProperties = {
  color: "var(--color-text-primary)",
  fontWeight: 500,
};
const brandMono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.01em",
  color: "var(--color-text-primary)",
};

function FormatCard({
  name,
  status,
  statusTone,
  gradient,
  spend,
  cpl,
  cplTone,
}: {
  name: string;
  status: string;
  statusTone: "success" | "warn" | "muted";
  gradient: "story" | "feed" | "reels";
  spend: string;
  cpl: string;
  cplTone: "success" | "warn" | "muted";
}) {
  const STATUS_COLOR: Record<string, string> = {
    success: "var(--color-success)",
    warn: "var(--color-warning)",
    muted: "var(--color-text-muted)",
  };
  const GRADIENTS: Record<string, string> = {
    story:
      "linear-gradient(180deg, rgba(127, 153, 109, 0.55) 0%, rgba(127, 153, 109, 0.2) 50%, rgba(214, 166, 74, 0.55) 100%)",
    feed:
      "linear-gradient(180deg, rgba(127, 153, 109, 0.5) 0%, rgba(214, 166, 74, 0.5) 100%)",
    reels:
      "linear-gradient(135deg, rgba(176, 122, 154, 0.4) 0%, rgba(127, 153, 109, 0.5) 100%)",
  };
  const aspect: Record<string, string> = {
    story: "9 / 16",
    feed: "1 / 1",
    reels: "9 / 16",
  };
  return (
    <article
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-md)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            color: STATUS_COLOR[statusTone],
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {status}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          aspectRatio: aspect[gradient],
          maxHeight: 280,
          borderRadius: "var(--radius-md)",
          background: GRADIENTS[gradient],
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
          padding: 14,
        }}
      >
        <div
          style={{
            width: "100%",
            textAlign: "center",
            color: "white",
          }}
        >
          <div
            style={{
              fontFamily: "Newsreader, serif",
              fontStyle: "italic",
              fontSize: gradient === "feed" ? 18 : 16,
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: 8,
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            La pâte feuilletée
            <br />
            de votre enfance.
          </div>
          <div
            style={{
              background: "white",
              color: "#0e0e14",
              fontSize: 10,
              fontWeight: 600,
              padding: 6,
              borderRadius: 999,
              marginTop: 8,
            }}
          >
            Commander en ligne →
          </div>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--color-text-tertiary)",
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid var(--color-border-subtle)",
          paddingTop: 10,
        }}
      >
        <span>
          <span style={{ color: "var(--color-text-muted)" }}>Dépense</span> {spend}
        </span>
        <span style={{ color: STATUS_COLOR[cplTone] }}>
          <span style={{ color: "var(--color-text-muted)" }}>CPL</span>{" "}
          <span style={{ fontWeight: 600 }}>{cpl}</span>
        </span>
      </div>
    </article>
  );
}

function ABCard({
  tag,
  tagTone,
  traffic,
  title,
  claim,
  claimSerif,
  ctr,
  cpl,
  leads,
  champion,
}: {
  tag: string;
  tagTone: "champion" | "challenger";
  traffic: string;
  title: string;
  claim: string;
  claimSerif: boolean;
  ctr: string;
  cpl: string;
  leads: string;
  champion?: boolean;
}) {
  const tagBg = tagTone === "champion" ? "var(--color-success-muted)" : "var(--color-bg-elevated)";
  const tagColor =
    tagTone === "champion" ? "var(--color-success)" : "var(--color-text-secondary)";
  return (
    <article
      style={{
        padding: "22px 24px",
        background: champion
          ? "linear-gradient(180deg, rgba(92, 184, 142, 0.04) 0%, var(--color-bg-surface) 100%)"
          : "var(--color-bg-surface)",
        border: `1px solid ${champion ? "var(--color-success-muted)" : "var(--color-border-default)"}`,
        borderRadius: "var(--radius-lg)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 4,
            background: tagBg,
            color: tagColor,
          }}
        >
          {tag}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-text-muted)",
          }}
        >
          {traffic}
        </span>
      </div>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--color-text-primary)",
          margin: "0 0 10px",
          letterSpacing: "-0.005em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: claimSerif ? "var(--font-serif), 'Iowan Old Style', serif" : "var(--font-sans)",
          fontStyle: claimSerif ? "italic" : "normal",
          fontWeight: 400,
          fontSize: 14,
          color: "var(--color-text-secondary)",
          lineHeight: 1.5,
          margin: "0 0 18px",
          padding: "12px 14px",
          background: "var(--color-bg-base)",
          borderLeft: `2px solid ${champion ? "var(--color-success)" : "var(--color-border-emphasis)"}`,
          borderRadius: "0 var(--radius-xs) var(--radius-xs) 0",
        }}
      >
        &ldquo;{claim}&rdquo;
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <ABStat label="CTR" value={ctr} champion={champion} />
        <ABStat label="CPL" value={cpl} champion={champion} />
        <ABStat label="Leads" value={leads} champion={champion} />
      </div>
    </article>
  );
}

function ABStat({ label, value, champion }: { label: string; value: string; champion?: boolean }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.08em",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          fontWeight: 600,
          color: champion ? "var(--color-success)" : "var(--color-text-primary)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AssetCard({
  title,
  children,
  span,
}: {
  title: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div
      style={{
        padding: "22px 24px",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-md)",
        gridColumn: span === 2 ? "span 2" : undefined,
      }}
    >
      <h4
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          fontWeight: 600,
          margin: "0 0 14px",
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function CopyList({
  items,
}: {
  items: Array<{ role: string; value: string; mono?: boolean; serif?: boolean; dim?: boolean }>;
}) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            padding: "8px 0",
            borderBottom: i < items.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
            fontSize: 13,
            color: "var(--color-text-primary)",
            lineHeight: 1.5,
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              flexShrink: 0,
              width: 76,
            }}
          >
            {it.role}
          </span>
          {it.serif ? (
            <em
              style={{
                fontFamily: "var(--font-serif), 'Iowan Old Style', serif",
                fontStyle: "italic",
                fontWeight: 400,
                flex: 1,
              }}
            >
              {it.value}
            </em>
          ) : (
            <span
              style={{
                flex: 1,
                fontFamily: it.mono ? "var(--font-mono)" : undefined,
                fontSize: it.mono ? 11 : undefined,
                color: it.dim ? "var(--color-text-tertiary)" : undefined,
                letterSpacing: it.mono ? "0.08em" : undefined,
                textTransform: it.mono && it.role === "Pre-claim" ? "uppercase" : undefined,
              }}
            >
              {it.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function FontRow({
  role,
  name,
  mono,
  serif,
}: {
  role: string;
  name: string;
  mono?: boolean;
  serif?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "8px 0",
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
        {role}
      </span>
      <span
        style={{
          color: "var(--color-text-primary)",
          fontWeight: 500,
          fontFamily: serif
            ? "var(--font-serif), 'Iowan Old Style', serif"
            : mono
              ? "var(--font-mono)"
              : undefined,
          fontStyle: serif ? "italic" : undefined,
        }}
      >
        {name}
      </span>
    </div>
  );
}

function Swatch({ hex, name, border }: { hex: string; name: string; border?: boolean }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          height: 56,
          borderRadius: "var(--radius-xs)",
          border: border ? "1px solid var(--color-border-emphasis)" : "1px solid var(--color-border-default)",
          background: hex,
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--color-text-muted)",
          letterSpacing: "0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {name} · {hex.toUpperCase()}
      </span>
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

function Row({
  label,
  value,
  delta,
  valueDim,
}: {
  label: string;
  value: string;
  delta?: string;
  valueDim?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          color: valueDim ? "var(--color-text-secondary)" : "var(--color-text-primary)",
          fontSize: 12,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
        {delta && (
          <span style={{ color: "var(--color-success)", fontWeight: 600, marginLeft: 8 }}>
            {delta}
          </span>
        )}
      </span>
    </div>
  );
}

function BarRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          color: "var(--color-text-primary)",
          fontSize: 12,
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {value}
        <span
          style={{
            width: 80,
            height: 4,
            background: "var(--color-bg-elevated)",
            borderRadius: 2,
            overflow: "hidden",
            display: "block",
          }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: `${pct}%`,
              background: "var(--color-accent)",
            }}
          />
        </span>
      </span>
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "live" | "meta";
  children: React.ReactNode;
}) {
  const STYLES = {
    live: { bg: "var(--color-success-muted)", color: "var(--color-success)" },
    meta: { bg: "rgba(24, 119, 242, 0.12)", color: "#6a9ad6" },
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
        fontSize: 9,
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

function Dot({ pulse }: { pulse?: boolean }) {
  return (
    <span
      className={pulse ? "animate-pulse-dot" : ""}
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
