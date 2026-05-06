"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import type { ComparisonBlock } from "@/lib/types";
import { formatNumber } from "@/lib/utils/format";

interface ComparisonChartProps {
  block: ComparisonBlock;
}

interface ComparisonRow {
  metric: string;
  current: number;
  previous: number;
  variation: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const current = payload.find((p) => p.name === "Actuel");
  const previous = payload.find((p) => p.name === "Precedent");
  const variation =
    current && previous && previous.value !== 0
      ? ((current.value - previous.value) / previous.value) * 100
      : 0;

  return (
    <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-[12px] shadow-xl">
      <p className="mb-1 font-medium text-[var(--color-text-secondary)]">{label}</p>
      {current && (
        <p className="text-[var(--color-text-primary)]">
          Actuel : {formatNumber(current.value)}
        </p>
      )}
      {previous && (
        <p className="text-[var(--color-text-secondary)]">
          Precedent : {formatNumber(previous.value)}
        </p>
      )}
      <p
        className={`mt-1 font-medium ${variation >= 0 ? "text-emerald-400" : "text-rose-400"}`}
      >
        {variation >= 0 ? "+" : ""}
        {variation.toFixed(1)} %
      </p>
    </div>
  );
}

export function ComparisonChart({ block }: ComparisonChartProps) {
  const data: ComparisonRow[] = useMemo(() => {
    const metrics = Object.keys(block.current.metrics);
    return metrics.map((key) => {
      const current = block.current.metrics[key] ?? 0;
      const previous = block.previous.metrics[key] ?? 0;
      const variation =
        previous !== 0 ? ((current - previous) / previous) * 100 : 0;
      return { metric: key, current, previous, variation };
    });
  }, [block]);

  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
      {block.title && (
        <h3 className="mb-4 text-[13px] font-medium text-[var(--color-text-secondary)]">
          {block.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid
            horizontal
            vertical={false}
            strokeDasharray="2 4"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey="metric"
            tick={{ fill: "#5a5a6e", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#5a5a6e", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#8b8b9e" }}
          />
          <Bar
            dataKey="previous"
            name="Precedent"
            fill="rgba(255,255,255,0.08)"
            radius={[4, 4, 0, 0]}
          />
          <Bar dataKey="current" name="Actuel" radius={[4, 4, 0, 0]}>
            {data.map((row) => (
              <Cell
                key={row.metric}
                fill={row.variation >= 0 ? "#7f996d" : "#d96a6a"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
