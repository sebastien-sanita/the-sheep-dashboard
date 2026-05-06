// Chart series palette aligned with Calm Precision v2 tokens.
// Recharts cannot resolve var(--token) in props, so we hardcode hex
// matching the CSS vars. Order: accent, success, warning, info, danger,
// teal, amber-strong, soft-violet, moss-hover, soft-pink.
export const chartColors = {
  series: ["#7f996d", "#5cb88e", "#d6a64a", "#6a9ad6", "#d96a6a", "#3d8585", "#c98a3c", "#a89bd2", "#94ad84", "#b07a9a"],
  platforms: {
    meta: "#1877F2",
    google: "#EA4335",
    linkedin: "#0A66C2",
    tiktok: "#ff0050",
    instagram: "#E4405F",
    facebook: "#1877F2",
  },
} as const;

export const chartGrid = {
  stroke: "rgba(255, 255, 255, 0.03)",
  strokeDasharray: "2 4",
  horizontal: true,
  vertical: false,
};

export const chartAxis = {
  axisLine: false,
  tickLine: false,
  tick: {
    fill: "#5a5a6e",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
  },
};

export const chartTooltipStyle = {
  contentStyle: {
    background: "#1a1a24",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
    padding: "10px 14px",
  },
  labelStyle: {
    color: "#8b8b9e",
    fontSize: "11px",
    fontWeight: 600,
    marginBottom: "6px",
    fontFamily: "var(--font-sans)",
  },
  itemStyle: {
    color: "#f0f0f5",
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    padding: "2px 0",
  },
  cursor: { stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 },
};
