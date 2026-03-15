"use client";

const PLATFORM_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  META: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Meta" },
  META_ADS: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Meta Ads" },
  GOOGLE: { bg: "bg-red-500/10", text: "text-red-400", label: "Google" },
  GOOGLE_ADS: { bg: "bg-red-500/10", text: "text-red-400", label: "Google Ads" },
  LINKEDIN: { bg: "bg-sky-500/10", text: "text-sky-400", label: "LinkedIn" },
  LINKEDIN_ADS: { bg: "bg-sky-500/10", text: "text-sky-400", label: "LinkedIn Ads" },
  TIKTOK: { bg: "bg-pink-500/10", text: "text-pink-400", label: "TikTok" },
  TIKTOK_ADS: { bg: "bg-pink-500/10", text: "text-pink-400", label: "TikTok Ads" },
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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.bg} ${config.text}`}
    >
      {label}
    </span>
  );
}
