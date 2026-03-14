"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DonutChartBlock } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

interface PlatformBreakdownProps {
  block: DonutChartBlock;
}

const PLATFORM_COLORS: Record<string, string> = {
  Meta: "#1877F2",
  Google: "#EA4335",
  LinkedIn: "#0A66C2",
  TikTok: "#E84393",
};

const FALLBACK_COLORS = ["#818cf8", "#34d399", "#fbbf24", "#fb7185", "#38bdf8"];

function getColor(entry: { label: string; color?: string }, index: number): string {
  return entry.color || PLATFORM_COLORS[entry.label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function PlatformBreakdown({ block }: PlatformBreakdownProps) {
  const total = useMemo(
    () => block.data.reduce((sum, d) => sum + d.value, 0),
    [block.data],
  );

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
      {block.title && (
        <h3 className="mb-4 text-[13px] font-medium text-slate-300">
          {block.title}
        </h3>
      )}
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative w-[60%]">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={block.data}
                dataKey="value"
                nameKey="label"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="none"
              >
                {block.data.map((entry, i) => (
                  <Cell key={entry.label} fill={getColor(entry, i)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-50">
                {formatCurrency(total)}
              </div>
              <div className="text-[11px] text-slate-500">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex w-[40%] flex-col gap-2.5">
          {block.data.map((entry, i) => {
            const pct = total > 0 ? (entry.value / total) * 100 : 0;
            return (
              <div key={entry.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getColor(entry, i) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] text-slate-300">
                    {entry.label}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatCurrency(entry.value)} · {formatPercent(pct, 0)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
