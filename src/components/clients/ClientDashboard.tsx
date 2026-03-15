"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import type { Client, Campaign, AggregatedMetrics, Metrics30d } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import { AccountBadge } from "./AccountBadge";
import { SyncButton } from "./SyncButton";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { CampaignsByObjective } from "./CampaignsByObjective";
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
  prevMetricsLoading: boolean;
}

// ---------------------------------------------------------------------------
// Metrics aggregation
// ---------------------------------------------------------------------------

function aggregateFromResponse(data: AggregatedMetrics | undefined): Partial<Metrics30d> | undefined {
  if (!data) return undefined;
  const mm = data.metrics;
  if (mm && (mm.spend?.value != null || mm.impressions?.value != null)) {
    return { spend: mm.spend?.value, impressions: mm.impressions?.value, clicks: mm.clicks?.value, ctr: mm.ctr?.value, cpc: mm.cpc?.value, cpm: mm.cpm?.value };
  }
  const daily = data.daily;
  if (!daily?.length) return undefined;
  let spend = 0, impressions = 0, clicks = 0;
  for (const d of daily) {
    const m = d.metrics ?? (d as unknown as Record<string, unknown>);
    spend += Number(m.spend) || 0; impressions += Number(m.impressions) || 0; clicks += Number(m.clicks) || 0;
  }
  return { spend, impressions, clicks, ctr: impressions > 0 ? (clicks / impressions) * 100 : 0, cpc: clicks > 0 ? spend / clicks : 0, cpm: impressions > 0 ? (spend / impressions) * 1000 : 0 };
}

// ---------------------------------------------------------------------------
// Chart metric selector
// ---------------------------------------------------------------------------

type ChartMetricKey = "spend" | "impressions" | "clicks" | "ctr" | "cpc" | "cpm";

const CHART_METRICS: { key: ChartMetricKey; label: string; title: string; color: string; gradientId: string; format: (v: number) => string; yFormat: (v: number) => string; aggregate: "sum" | "ratio"; totalLabel: string }[] = [
  { key: "spend", label: "Dépenses", title: "Évolution des dépenses", color: "#818cf8", gradientId: "grad_spend", format: formatCurrency, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k€` : `${Math.round(v)}€`, aggregate: "sum", totalLabel: "Total" },
  { key: "impressions", label: "Impressions", title: "Évolution des impressions", color: "#60a5fa", gradientId: "grad_imp", format: formatCompact, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(Math.round(v)), aggregate: "sum", totalLabel: "Total" },
  { key: "clicks", label: "Clics", title: "Évolution des clics", color: "#34d399", gradientId: "grad_clicks", format: formatCompact, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)), aggregate: "sum", totalLabel: "Total" },
  { key: "ctr", label: "CTR", title: "Évolution du CTR", color: "#fbbf24", gradientId: "grad_ctr", format: (v) => formatPercent(v, 2), yFormat: (v) => `${v.toFixed(1)}%`, aggregate: "ratio", totalLabel: "Moyenne" },
  { key: "cpc", label: "CPC", title: "Évolution du CPC", color: "#fb7185", gradientId: "grad_cpc", format: formatCurrency, yFormat: (v) => `${v.toFixed(2)}€`, aggregate: "ratio", totalLabel: "Moyenne" },
  { key: "cpm", label: "CPM", title: "Évolution du CPM", color: "#a78bfa", gradientId: "grad_cpm", format: formatCurrency, yFormat: (v) => `${v.toFixed(1)}€`, aggregate: "ratio", totalLabel: "Moyenne" },
];

const PILL_ACTIVE: Record<ChartMetricKey, string> = {
  spend: "bg-indigo-500 text-white", impressions: "bg-blue-500 text-white", clicks: "bg-emerald-500 text-white",
  ctr: "bg-amber-500 text-white", cpc: "bg-rose-500 text-white", cpm: "bg-purple-500 text-white",
};

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

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientDashboard({ client, campaigns, campaignsLoading, metrics, metricsLoading, prevMetrics, prevMetricsLoading }: ClientDashboardProps) {
  const m30d = client.metrics30d;
  const accounts = client.connectedAccounts ?? client.adAccounts ?? [];
  const platforms = client.platforms ?? accounts.map((a) => a.platform).filter(Boolean);

  const [accountsExpanded, setAccountsExpanded] = useState(accounts.length <= 3);
  const [chartMetric, setChartMetric] = useState<ChartMetricKey>("spend");

  const currentMetrics = useMemo((): Partial<Metrics30d> | undefined => {
    if (m30d) return m30d;
    return aggregateFromResponse(metrics);
  }, [m30d, metrics]);

  const prevM = useMemo(() => aggregateFromResponse(prevMetrics), [prevMetrics]);

  const chartData = useMemo(() => {
    if (!metrics?.daily?.length) return [];
    return metrics.daily.filter((d) => d.date).sort((a, b) => a.date.localeCompare(b.date)).map((d) => {
      const m = d.metrics ?? (d as unknown as Record<string, unknown>);
      const spend = Number(m.spend) || 0, impressions = Number(m.impressions) || 0, clicks = Number(m.clicks) || 0;
      return { date: formatDate(d.date, "short"), rawDate: d.date, spend, impressions, clicks, ctr: impressions > 0 ? (clicks / impressions) * 100 : 0, cpc: clicks > 0 ? spend / clicks : 0, cpm: impressions > 0 ? (spend / impressions) * 1000 : 0 };
    });
  }, [metrics]);

  const activeChart = CHART_METRICS.find((m) => m.key === chartMetric) ?? CHART_METRICS[0];

  const chartStats = useMemo(() => {
    if (!chartData.length) return null;
    const days = chartData.length;
    const values = chartData.map((d) => d[chartMetric] as number);
    const sum = values.reduce((s, v) => s + v, 0);
    const avg = sum / days;
    const isRatio = activeChart.aggregate === "ratio";
    return { days, total: isRatio ? avg : sum, dailyAvg: isRatio ? avg : sum / days, totalLabel: activeChart.totalLabel };
  }, [chartData, chartMetric, activeChart]);

  return (
    <div className="space-y-6 p-5">
      {/* ── Section 1 — Header ── */}
      <motion.div {...fadeIn} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{client.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {platforms.map((p) => <AccountBadge key={p} platform={p} />)}
            {client.sector && <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[11px] text-slate-400">{client.sector}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/clients/${client.id}/chat`} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-primary-500">
            <MessageSquare size={14} /> Ouvrir le chat
          </Link>
          <SyncButton workspaceId={client.id} />
        </div>
      </motion.div>

      {/* ── Section 2 — Executive Summary ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
        <ExecutiveSummary campaigns={campaigns} metrics={metrics} metricsLoading={metricsLoading} prevMetrics={prevMetrics} prevMetricsLoading={prevMetricsLoading} currentMetrics={currentMetrics} prevM={prevM} chartData={chartData} />
      </motion.div>

      {/* ── Section 3 — Chart with metric selector ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium text-slate-300">{activeChart.title}</h2>
            <div className="flex gap-1.5">
              {CHART_METRICS.map((m) => (
                <button key={m.key} type="button" onClick={() => setChartMetric(m.key)} className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors", chartMetric === m.key ? PILL_ACTIVE[m.key] : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>{m.label}</button>
              ))}
            </div>
          </div>
          {metricsLoading ? <Skeleton className="mt-4 h-72" /> : chartData.length > 0 ? (
            <>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                    <defs><linearGradient id={activeChart.gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={activeChart.color} stopOpacity={0.2} /><stop offset="95%" stopColor={activeChart.color} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                    <YAxis domain={[0, "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={activeChart.yFormat} />
                    <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 shadow-xl"><p className="text-[11px] text-slate-400">{label}</p><p className="text-[14px] font-semibold text-slate-50">{activeChart.format(payload[0].value as number)}</p></div> : null} />
                    <Area type="monotone" dataKey={chartMetric} stroke={activeChart.color} strokeWidth={2} fill={`url(#${activeChart.gradientId})`} animationDuration={500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {chartStats && (
                <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
                  <span>{chartStats.days} jours</span>
                  <span>{chartStats.totalLabel} : <span className="font-medium text-slate-300">{activeChart.format(chartStats.total)}</span></span>
                  <span>Moy. quotidienne : <span className="font-medium text-slate-300">{activeChart.format(chartStats.dailyAvg)}</span></span>
                </div>
              )}
            </>
          ) : <p className="mt-8 text-center text-[12px] text-slate-500">Données détaillées non disponibles</p>}
        </div>
      </motion.div>

      {/* ── Section 4 — Campaigns by objective ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
        <CampaignsByObjective campaigns={campaigns} loading={campaignsLoading} workspaceId={client.id} startDate={metrics?.dateRange?.from} endDate={metrics?.dateRange?.to} />
      </motion.div>

      {/* ── Section 5 — Connected accounts ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }}>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800">
          <button type="button" onClick={() => setAccountsExpanded((e) => !e)} className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-medium text-slate-300">Comptes connectés</h2>
              <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[11px] text-slate-400">{accounts.length}</span>
            </div>
            {accountsExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {accountsExpanded && (
            <div className="border-t border-slate-700/50">
              {accounts.length === 0 ? <p className="px-5 py-4 text-[12px] text-slate-500">Aucun compte connecté</p> : accounts.map((account) => (
                <div key={account.id} className="flex items-center gap-3 border-t border-slate-700/30 px-5 py-3 first:border-t-0">
                  <AccountBadge platform={account.platform} />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-slate-200">
                    {"platformAccountName" in account && account.platformAccountName ? account.platformAccountName : ("name" in account ? account.name : account.id)}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_BADGES[account.status] ?? "bg-slate-500/10 text-slate-400")}>{account.status}</span>
                  {account.lastSyncAt && <span className="text-[11px] text-slate-500">{formatDate(account.lastSyncAt, "short")}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
