"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { TableBlock, ColumnFormat } from "@/lib/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface CampaignTableProps {
  block: TableBlock;
}

// Status badges aligned with Calm Precision tokens (success / warning / muted).
const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  ACTIVE:   { bg: "var(--color-success-muted)", text: "var(--color-success)" },
  PAUSED:   { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  DELETED:  { bg: "var(--color-danger-muted)",  text: "var(--color-danger)" },
  ARCHIVED: { bg: "var(--color-bg-elevated)",   text: "var(--color-text-secondary)" },
};

function formatCell(value: unknown, format?: ColumnFormat): React.ReactNode {
  if (value === null || value === undefined) return "—";

  // Status badge detection
  if (typeof value === "string" && STATUS_BADGES[value]) {
    const s = STATUS_BADGES[value];
    return (
      <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 500, background: s.bg, color: s.text }}>
        {value}
      </span>
    );
  }

  if (typeof value !== "number") return String(value);

  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value);
    case "number":
      return formatNumber(value);
    default:
      return String(value);
  }
}

// Numeric formats are right-aligned + JetBrains Mono per DS rule.
const isNumeric = (f?: ColumnFormat) => f === "currency" || f === "percent" || f === "number";

export function CampaignTable({ block }: CampaignTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return block.rows;
    return [...block.rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = av < bv ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [block.rows, sortKey, sortDir]);

  function handleSort(key: string) {
    if (!block.sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const manyRows = sortedRows.length > 10;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
      {block.title && (
        <div className="flex items-center justify-between" style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-border-default)" }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{block.title}</span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>· {sortedRows.length} résultats</span>
          </div>
        </div>
      )}
      <div className={manyRows ? "max-h-[400px] overflow-y-auto" : ""}>
        <table className="w-full" style={{ fontSize: 12, borderCollapse: "collapse" }}>
          <thead className="sticky top-0" style={{ background: "rgba(13,13,20,0.85)", backdropFilter: "blur(4px)" }}>
            <tr>
              {block.columns.map((col) => {
                const numeric = isNumeric(col.format);
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      padding: "9px 14px",
                      textAlign: numeric ? "right" : "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                      borderBottom: "1px solid var(--color-border-default)",
                      cursor: block.sortable ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    <span className="inline-flex items-center" style={{ gap: 4, justifyContent: numeric ? "flex-end" : "flex-start", width: "100%" }}>
                      {col.label}
                      {block.sortable && sortKey === col.key && (
                        sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-[var(--color-bg-elevated)]"
                style={{ borderTop: "1px solid var(--color-border-subtle)" }}
              >
                {block.columns.map((col) => {
                  const numeric = isNumeric(col.format);
                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: "10px 14px",
                        textAlign: numeric ? "right" : "left",
                        fontFamily: numeric ? "var(--font-mono)" : undefined,
                        fontVariantNumeric: numeric ? "tabular-nums" : undefined,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {formatCell(row[col.key], col.format)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
