"use client";

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { LineChartBlock, BarChartBlock } from "@/lib/types";

// Calm Precision palette : posée, désaturée, alignée sur les tokens v2.
const DEFAULT_COLORS = [
  "#7f996d", // moss accent
  "#5cb88e", // success
  "#d6a64a", // warning
  "#d96a6a", // danger
  "#6a9ad6", // info
];

const AXIS_TICK = { fill: "#5a5a6e", fontSize: 11, fontFamily: "var(--font-mono)" };
const AXIS_LINE = { stroke: "rgba(255,255,255,0.06)" };
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#1a1a24",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "var(--font-mono)",
  },
  labelStyle: { color: "#8b8b9e", fontFamily: "var(--font-sans)" },
  itemStyle: { color: "#f0f0f5" },
};
const LEGEND_STYLE = { fontSize: 11, color: "#8b8b9e" };

interface SpendChartProps {
  block: LineChartBlock | BarChartBlock;
  chartType: "line" | "bar";
}

export function SpendChart({ block, chartType }: SpendChartProps) {
  const ChartContainer = chartType === "line" ? LineChart : BarChart;

  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
      {block.title && (
        <h3 className="mb-4 text-[13px] font-medium text-[var(--color-text-secondary)]">
          {block.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <ChartContainer data={block.data as Record<string, unknown>[]}>
          <CartesianGrid
            horizontal
            vertical={false}
            strokeDasharray="2 4"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey={block.xAxisKey}
            tick={AXIS_TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip {...TOOLTIP_STYLE} />
          {block.series.length > 1 && (
            <Legend wrapperStyle={LEGEND_STYLE} />
          )}
          {block.series.map((s, i) =>
            chartType === "line" ? (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                strokeWidth={2}
                type="monotone"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ) : (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ),
          )}
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
