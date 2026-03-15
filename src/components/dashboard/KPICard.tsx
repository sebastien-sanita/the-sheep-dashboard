"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KPIItem } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface KPICardProps {
  item: KPIItem;
}

const COLOR_MAP: Record<string, string> = {
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-rose-400",
  default: "text-slate-500",
};

const ACCENT_MAP: Record<string, string> = {
  success: "from-emerald-500 to-emerald-400",
  warning: "from-amber-500 to-amber-400",
  danger: "from-rose-500 to-rose-400",
  default: "from-primary-500 to-primary-400",
};

function TrendIcon({ direction }: { direction?: string }) {
  switch (direction) {
    case "up": return <TrendingUp size={13} />;
    case "down": return <TrendingDown size={13} />;
    default: return <Minus size={13} />;
  }
}

export function KPICard({ item }: KPICardProps) {
  const trendColor = COLOR_MAP[item.color ?? "default"];
  const accent = ACCENT_MAP[item.color ?? "default"];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-800 p-5 transition-all duration-200 hover:border-white/[0.1] hover:-translate-y-0.5">
      {/* Top accent bar */}
      <div className={cn("absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r opacity-50", accent)} />

      <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
        {item.label}
      </div>
      <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-white tabular-nums" style={{ letterSpacing: "-0.02em" }}>
        {item.value}
      </div>
      {item.trend && (
        <div className={cn("mt-2 flex items-center gap-1.5", trendColor)}>
          <TrendIcon direction={item.trendDirection} />
          <span className="text-[12px] font-medium tabular-nums">{item.trend}</span>
        </div>
      )}
      {item.previousValue && (
        <div className="mt-1 text-[11px] text-slate-600">
          vs {item.previousValue}
        </div>
      )}
    </div>
  );
}
