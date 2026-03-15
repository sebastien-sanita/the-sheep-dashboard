"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KPIItem } from "@/lib/types";

const ACCENT_GRADIENT: Record<string, string> = {
  success: "linear-gradient(90deg, var(--color-success) 0%, transparent 80%)",
  warning: "linear-gradient(90deg, var(--color-warning) 0%, transparent 80%)",
  danger: "linear-gradient(90deg, var(--color-danger) 0%, transparent 80%)",
  default: "linear-gradient(90deg, var(--color-accent) 0%, transparent 80%)",
};

const TREND_COLORS: Record<string, { bg: string; text: string }> = {
  success: { bg: "var(--color-success-muted)", text: "var(--color-success)" },
  warning: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  danger: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  default: { bg: "var(--color-bg-elevated)", text: "var(--color-text-secondary)" },
};

function TrendIcon({ direction }: { direction?: string }) {
  if (direction === "up") return <TrendingUp size={13} />;
  if (direction === "down") return <TrendingDown size={13} />;
  return <Minus size={13} />;
}

export function KPICard({ item }: { item: KPIItem }) {
  const color = item.color ?? "default";
  const trend = TREND_COLORS[color];

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 20px 16px",
        transition: "transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--color-border-emphasis)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--color-border-default)"; }}
    >
      {/* Accent bar */}
      <div className="absolute left-0 right-0 top-0 transition-opacity group-hover:opacity-100" style={{ height: 2, background: ACCENT_GRADIENT[color], opacity: 0.6, transition: "opacity var(--transition-base)" }} />

      <div className="text-caption" style={{ color: "var(--color-text-muted)", marginBottom: 10 }}>{item.label}</div>
      <div className="text-metric-lg" style={{ color: "var(--color-text-primary)" }}>{item.value}</div>

      {item.trend && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1" style={{ padding: "2px 7px", borderRadius: "var(--radius-xs)", background: trend.bg, color: trend.text, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>
            <TrendIcon direction={item.trendDirection} />
            {item.trend}
          </span>
          {item.previousValue && <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>vs {item.previousValue}</span>}
        </div>
      )}
    </div>
  );
}
