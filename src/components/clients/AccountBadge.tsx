"use client";

const PLATFORM_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  META: { bg: "var(--color-meta-muted)", text: "var(--color-meta)", label: "Meta Ads" },
  META_ADS: { bg: "var(--color-meta-muted)", text: "var(--color-meta)", label: "Meta Ads" },
  FACEBOOK: { bg: "var(--color-facebook-muted)", text: "var(--color-facebook)", label: "Facebook" },
  FACEBOOK_PAGE: { bg: "var(--color-facebook-muted)", text: "var(--color-facebook)", label: "Facebook" },
  FACEBOOK_ADS: { bg: "var(--color-facebook-muted)", text: "var(--color-facebook)", label: "Facebook Ads" },
  INSTAGRAM: { bg: "var(--color-instagram-muted)", text: "var(--color-instagram)", label: "Instagram" },
  INSTAGRAM_ADS: { bg: "var(--color-instagram-muted)", text: "var(--color-instagram)", label: "Instagram Ads" },
  GOOGLE: { bg: "var(--color-google-muted)", text: "var(--color-google)", label: "Google Ads" },
  GOOGLE_ADS: { bg: "var(--color-google-muted)", text: "var(--color-google)", label: "Google Ads" },
  GOOGLE_ANALYTICS: { bg: "var(--color-warning-muted)", text: "var(--color-warning)", label: "Analytics" },
  LINKEDIN: { bg: "var(--color-linkedin-muted)", text: "var(--color-linkedin)", label: "LinkedIn" },
  LINKEDIN_ADS: { bg: "var(--color-linkedin-muted)", text: "var(--color-linkedin)", label: "LinkedIn Ads" },
  TIKTOK: { bg: "var(--color-tiktok-muted)", text: "var(--color-tiktok)", label: "TikTok" },
  TIKTOK_ADS: { bg: "var(--color-tiktok-muted)", text: "var(--color-tiktok)", label: "TikTok Ads" },
  SNAPCHAT: { bg: "rgba(255,252,0,0.1)", text: "#FFFC00", label: "Snapchat" },
  SNAPCHAT_ADS: { bg: "rgba(255,252,0,0.1)", text: "#FFFC00", label: "Snapchat Ads" },
};

const FALLBACK = { bg: "var(--color-bg-elevated)", text: "var(--color-text-tertiary)" };

export function AccountBadge({ platform }: { platform: string }) {
  const config = PLATFORM_CONFIG[platform] ?? FALLBACK;
  const label = "label" in config ? config.label : platform;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      height: 20, padding: "0 7px",
      borderRadius: "var(--radius-xs)",
      fontSize: 10, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase" as const,
      background: config.bg, color: config.text,
    }}>
      {label}
    </span>
  );
}
