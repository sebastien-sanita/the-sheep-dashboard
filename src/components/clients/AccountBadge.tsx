"use client";

const PLATFORM_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  // Meta / Facebook
  META: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Meta Ads" },
  META_ADS: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Meta Ads" },
  FACEBOOK: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Facebook" },
  FACEBOOK_PAGE: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Facebook" },
  FACEBOOK_ADS: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Facebook Ads" },
  // Instagram
  INSTAGRAM: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", label: "Instagram" },
  INSTAGRAM_ADS: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", label: "Instagram Ads" },
  // Google
  GOOGLE: { bg: "bg-red-500/10", text: "text-red-400", label: "Google Ads" },
  GOOGLE_ADS: { bg: "bg-red-500/10", text: "text-red-400", label: "Google Ads" },
  GOOGLE_ANALYTICS: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Analytics" },
  // LinkedIn
  LINKEDIN: { bg: "bg-sky-500/10", text: "text-sky-400", label: "LinkedIn" },
  LINKEDIN_ADS: { bg: "bg-sky-500/10", text: "text-sky-400", label: "LinkedIn Ads" },
  // TikTok
  TIKTOK: { bg: "bg-pink-500/10", text: "text-pink-400", label: "TikTok" },
  TIKTOK_ADS: { bg: "bg-pink-500/10", text: "text-pink-400", label: "TikTok Ads" },
  // Snapchat
  SNAPCHAT: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Snapchat" },
  SNAPCHAT_ADS: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Snapchat Ads" },
};

const FALLBACK_CONFIG = { bg: "bg-slate-500/10", text: "text-slate-400" };

interface AccountBadgeProps {
  platform: string;
}

export function AccountBadge({ platform }: AccountBadgeProps) {
  const config = PLATFORM_CONFIG[platform] ?? FALLBACK_CONFIG;
  const label = "label" in config ? config.label : platform;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-[2px] text-[10px] font-medium tracking-wide ${config.bg} ${config.text}`}
    >
      {label}
    </span>
  );
}
