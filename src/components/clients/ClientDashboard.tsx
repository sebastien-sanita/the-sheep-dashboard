"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Wallet,
  Eye,
  MousePointerClick,
  Target,
  Coins,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Client, Campaign, AggregatedMetrics, Metrics30d } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import { AccountBadge } from "./AccountBadge";
import { SyncButton } from "./SyncButton";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientDashboardProps {
  client: Client;
  campaigns: Campaign[] | undefined;
  campaignsLoading: boolean;
  metrics: AggregatedMetrics | undefined;
  metricsLoading: boolean;
  prevMetrics: AggregatedMetrics | undefined;
}

type CampaignFilter = "all" | "ACTIVE" | "PAUSED";
type SortKey = "name" | "status" | "budget" | "objective" | "startDate";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// KPI helpers
// ---------------------------------------------------------------------------

interface KPIDef {
  key: keyof Metrics30d;
  label: string;
  icon: LucideIcon;
  format: (v: number) => string;
  invertTrend: boolean; // true = lower is better (CPC, CPM)
}

const KPI_DEFS: KPIDef[] = [
  { key: "spend", label: "Dépense", icon: Wallet, format: formatCurrency, invertTrend: false },
  { key: "impressions", label: "Impressions", icon: Eye, format: formatCompact, invertTrend: false },
  { key: "clicks", label: "Clics", icon: MousePointerClick, format: formatCompact, invertTrend: false },
  { key: "ctr", label: "CTR", icon: Target, format: (v) => formatPercent(v, 2), invertTrend: false },
  { key: "cpc", label: "CPC", icon: Coins, format: formatCurrency, invertTrend: true },
  { key: "cpm", label: "CPM", icon: BarChart3, format: formatCurrency, invertTrend: true },
];

function computeTrend(current: number | undefined, previous: number | undefined) {
  if (current == null || previous == null || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

// ---------------------------------------------------------------------------
// Status badge styles
// ---------------------------------------------------------------------------

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAUSED: "bg-amber-500/10 text-amber-400",
  DELETED: "bg-slate-500/10 text-slate-400",
  ARCHIVED: "bg-slate-500/10 text-slate-400",
};

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

// ---------------------------------------------------------------------------
// Custom Recharts tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 shadow-xl">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-[14px] font-semibold text-slate-50">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientDashboard({
  client,
  campaigns,
  campaignsLoading,
  metrics,
  metricsLoading,
  prevMetrics,
}: ClientDashboardProps) {
  const m30d = client.metrics30d;
  const accounts = client.connectedAccounts ?? client.adAccounts ?? [];
  const platforms = client.platforms ?? accounts.map((a) => a.platform).filter(Boolean);

  // Campaign state
  const [filter, setFilter] = useState<CampaignFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [accountsExpanded, setAccountsExpanded] = useState(accounts.length <= 3);

  // Build previous period metrics lookup
  const prevM = useMemo(() => {
    if (!prevMetrics?.metrics) return undefined;
    const pm = prevMetrics.metrics;
    return {
      spend: pm.spend?.value,
      impressions: pm.impressions?.value,
      clicks: pm.clicks?.value,
      ctr: pm.ctr?.value,
      cpc: pm.cpc?.value,
      cpm: pm.cpm?.value,
    } as Partial<Metrics30d>;
  }, [prevMetrics]);

  // Current metrics (prefer m30d from workspace, fallback to metrics query)
  const currentMetrics = useMemo((): Partial<Metrics30d> | undefined => {
    if (m30d) return m30d;
    if (!metrics?.metrics) return undefined;
    const mm = metrics.metrics;
    return {
      spend: mm.spend?.value,
      impressions: mm.impressions?.value,
      clicks: mm.clicks?.value,
      ctr: mm.ctr?.value,
      cpc: mm.cpc?.value,
      cpm: mm.cpm?.value,
    };
  }, [m30d, metrics]);

  // Chart data
  const chartData = useMemo(() => {
    if (!metrics?.daily?.length) return [];
    return metrics.daily.map((d) => ({
      date: formatDate(d.date, "short"),
      spend: d.metrics.spend ?? 0,
    }));
  }, [metrics]);

  // Filtered + sorted campaigns
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    let list = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "budget":
          cmp = (a.budget ?? 0) - (b.budget ?? 0);
          break;
        case "objective":
          cmp = (a.objective ?? "").localeCompare(b.objective ?? "");
          break;
        case "startDate":
          cmp = (a.startDate ?? "").localeCompare(b.startDate ?? "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [campaigns, filter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const campaignCounts = useMemo(() => {
    if (!campaigns) return { total: 0, active: 0, paused: 0 };
    return {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "ACTIVE").length,
      paused: campaigns.filter((c) => c.status === "PAUSED").length,
    };
  }, [campaigns]);

  return (
    <div className="space-y-6 p-5">
      {/* ── Section 1 — Header ── */}
      <motion.div {...fadeIn} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{client.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {platforms.map((p) => (
              <AccountBadge key={p} platform={p} />
            ))}
            {client.sector && (
              <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[11px] text-slate-400">
                {client.sector}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client.id}/chat`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-primary-500"
          >
            <MessageSquare size={14} />
            Ouvrir le chat
          </Link>
          <SyncButton workspaceId={client.id} />
        </div>
      </motion.div>

      {/* ── Section 2 — KPIs ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {currentMetrics ? (
            KPI_DEFS.map(({ key, label, icon: Icon, format, invertTrend }) => {
              const value = currentMetrics[key];
              const prev = prevM?.[key];
              const trend = computeTrend(value, prev);
              const isPositive = trend != null && (invertTrend ? trend < 0 : trend > 0);
              const isNegative = trend != null && (invertTrend ? trend > 0 : trend < 0);

              return (
                <div key={key} className="rounded-xl border border-slate-700/50 bg-slate-800 p-4">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      {label}
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-50">
                    {value != null && isFinite(value) ? format(value) : "—"}
                  </div>
                  {trend != null && isFinite(trend) && (
                    <div
                      className={cn(
                        "mt-1.5 flex items-center gap-1 text-[12px] font-medium",
                        isPositive && "text-emerald-400",
                        isNegative && "text-rose-400",
                        !isPositive && !isNegative && "text-slate-400",
                      )}
                    >
                      {trend > 0 ? <TrendingUp size={13} /> : trend < 0 ? <TrendingDown size={13} /> : null}
                      <span>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : metricsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            <p className="col-span-full text-[12px] text-slate-500">
              Aucune métrique disponible
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Section 3 — Spend chart ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
          <h2 className="text-[14px] font-medium text-slate-300">Évolution des dépenses</h2>
          {metricsLoading ? (
            <Skeleton className="mt-4 h-72" />
          ) : chartData.length > 0 ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#334155" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k€`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#spendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-8 text-center text-[12px] text-slate-500">
              Données détaillées non disponibles
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Section 4 — Campaigns table ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/50 px-5 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-medium text-slate-300">Campagnes</h2>
              {campaigns && (
                <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[11px] text-slate-400">
                  {campaignCounts.total}
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {([
                { key: "all", label: "Toutes" },
                { key: "ACTIVE", label: `Actives (${campaignCounts.active})` },
                { key: "PAUSED", label: `En pause (${campaignCounts.paused})` },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "rounded-md px-3 py-1 text-[12px] font-medium transition-colors",
                    filter === key
                      ? "bg-primary-500/10 text-primary-400"
                      : "text-slate-400 hover:bg-slate-700 hover:text-slate-200",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {campaignsLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 border-t border-slate-700/30 px-5 py-3 first:border-t-0">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    {([
                      { key: "name", label: "Nom" },
                      { key: "status", label: "Statut" },
                      { key: "budget", label: "Budget" },
                      { key: "objective", label: "Objectif" },
                      { key: "startDate", label: "Début" },
                    ] as const).map(({ key, label }) => (
                      <th
                        key={key}
                        scope="col"
                        onClick={() => toggleSort(key)}
                        className="cursor-pointer select-none px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400 hover:text-slate-200"
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {sortKey === key ? (
                            sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30" />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-slate-700/30 transition-colors hover:bg-slate-700/20"
                    >
                      <td className="px-5 py-3 text-slate-200">{c.name}</td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                            STATUS_BADGES[c.status] ?? "bg-slate-500/10 text-slate-400",
                          )}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-200">
                        {c.budget != null && isFinite(c.budget) ? (
                          <div>
                            <span>{formatCurrency(c.budget)}</span>
                            {c.budgetType && (
                              <span className="ml-1 text-[10px] text-slate-500">
                                {c.budgetType === "DAILY" ? "/jour" : "total"}
                              </span>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-400">{c.objective ?? "—"}</td>
                      <td className="px-5 py-3 text-slate-400">
                        {c.startDate ? formatDate(c.startDate, "short") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-[12px] text-slate-500">
              {filter === "all" ? "Aucune campagne synchronisée" : "Aucune campagne pour ce filtre"}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Section 5 — Connected accounts (compact, collapsible) ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }}>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800">
          <button
            type="button"
            onClick={() => setAccountsExpanded((e) => !e)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-medium text-slate-300">Comptes connectés</h2>
              <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[11px] text-slate-400">
                {accounts.length}
              </span>
            </div>
            {accountsExpanded ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>

          {accountsExpanded && (
            <div className="border-t border-slate-700/50">
              {accounts.length === 0 ? (
                <p className="px-5 py-4 text-[12px] text-slate-500">Aucun compte connecté</p>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 border-t border-slate-700/30 px-5 py-3 first:border-t-0"
                  >
                    <AccountBadge platform={account.platform} />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-slate-200">
                      {"platformAccountName" in account && account.platformAccountName
                        ? account.platformAccountName
                        : ("name" in account ? account.name : account.id)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        STATUS_BADGES[account.status] ?? "bg-slate-500/10 text-slate-400",
                      )}
                    >
                      {account.status}
                    </span>
                    {account.lastSyncAt && (
                      <span className="text-[11px] text-slate-500">
                        {formatDate(account.lastSyncAt, "short")}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
