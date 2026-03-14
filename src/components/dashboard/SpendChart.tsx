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

const DEFAULT_COLORS = [
  "#818cf8", // indigo-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#fb7185", // rose-400
  "#38bdf8", // sky-400
];

const AXIS_TICK = { fill: "#94a3b8", fontSize: 12 };
const AXIS_LINE = { stroke: "#334155" };
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    fontSize: 13,
  },
  labelStyle: { color: "#cbd5e1" },
  itemStyle: { color: "#f8fafc" },
};
const LEGEND_STYLE = { fontSize: 12, color: "#94a3b8" };

interface SpendChartProps {
  block: LineChartBlock | BarChartBlock;
  chartType: "line" | "bar";
}

export function SpendChart({ block, chartType }: SpendChartProps) {
  const ChartContainer = chartType === "line" ? LineChart : BarChart;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
      {block.title && (
        <h3 className="mb-4 text-[13px] font-medium text-slate-300">
          {block.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <ChartContainer data={block.data as Record<string, unknown>[]}>
          <CartesianGrid
            horizontal
            vertical={false}
            strokeDasharray="3 3"
            stroke="#334155"
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
