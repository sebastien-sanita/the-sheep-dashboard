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
  default: "text-slate-400",
};

function TrendIcon({ direction }: { direction?: string }) {
  switch (direction) {
    case "up":
      return <TrendingUp size={14} />;
    case "down":
      return <TrendingDown size={14} />;
    default:
      return <Minus size={14} />;
  }
}

export function KPICard({ item }: KPICardProps) {
  const trendColorClass = COLOR_MAP[item.color ?? "default"];

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
      <div className="text-[12px] font-medium uppercase tracking-wider text-slate-400">
        {item.label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-50">
        {item.value}
      </div>
      {item.trend && (
        <div className={cn("mt-2 flex items-center gap-1.5", trendColorClass)}>
          <TrendIcon direction={item.trendDirection} />
          <span className="text-[13px] font-medium">{item.trend}</span>
        </div>
      )}
      {item.previousValue && (
        <div className="mt-1 text-[11px] text-slate-500">
          vs {item.previousValue}
        </div>
      )}
    </div>
  );
}
