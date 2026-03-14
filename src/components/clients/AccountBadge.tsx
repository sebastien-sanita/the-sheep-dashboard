"use client";

import type { Platform } from "@/lib/types";

const PLATFORM_CONFIG: Record<Platform, { bg: string; text: string; label: string }> = {
  META: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Meta" },
  GOOGLE: { bg: "bg-red-500/10", text: "text-red-400", label: "Google" },
  LINKEDIN: { bg: "bg-sky-500/10", text: "text-sky-400", label: "LinkedIn" },
  TIKTOK: { bg: "bg-pink-500/10", text: "text-pink-400", label: "TikTok" },
};

interface AccountBadgeProps {
  platform: Platform;
}

export function AccountBadge({ platform }: AccountBadgeProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
