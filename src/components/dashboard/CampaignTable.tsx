"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { TableBlock, ColumnFormat } from "@/lib/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface CampaignTableProps {
  block: TableBlock;
}

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAUSED: "bg-amber-500/10 text-amber-400",
  DELETED: "bg-slate-500/10 text-slate-400",
  ARCHIVED: "bg-slate-500/10 text-slate-400",
};

function formatCell(value: unknown, format?: ColumnFormat): React.ReactNode {
  if (value === null || value === undefined) return "—";

  // Status badge detection
  if (typeof value === "string" && STATUS_BADGES[value]) {
    return (
      <span
        className={cn(
          "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
          STATUS_BADGES[value],
        )}
      >
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
    <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800">
      {block.title && (
        <h3 className="p-4 pb-0 text-[13px] font-medium text-slate-300">
          {block.title}
        </h3>
      )}
      <div className={manyRows ? "max-h-[400px] overflow-y-auto" : ""}>
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-sm">
            <tr>
              {block.columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400",
                    block.sortable && "cursor-pointer select-none hover:text-slate-200",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {block.sortable && sortKey === col.key && (
                      sortDir === "asc" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-slate-700/30 transition-colors hover:bg-slate-700/20"
              >
                {block.columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-200">
                    {formatCell(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
