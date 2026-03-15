"use client";

import { useMemo } from "react";
import {
  Wallet, Target, MousePointerClick, Eye, Heart, ShoppingCart, Play, MessageCircle,
  TrendingUp, TrendingDown, type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import type { Campaign, AggregatedMetrics, Metrics30d } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { type CategoryKey, getObjectiveConfig, formatKpi } from "@/lib/utils/objective-metrics";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Category detection (same logic as CampaignsByObjective)
// ---------------------------------------------------------------------------

const CATEGORY_OBJECTIVES: Record<CategoryKey, string[]> = {
  leads: ["OUTCOME_LEADS", "LEAD_GENERATION", "CONVERSIONS"],
  traffic: ["OUTCOME_TRAFFIC", "LINK_CLICKS"],
  awareness: ["OUTCOME_AWARENESS", "BRAND_AWARENESS", "REACH"],
  engagement: ["OUTCOME_ENGAGEMENT", "POST_ENGAGEMENT"],
  video: ["VIDEO_VIEWS"],
  sales: ["OUTCOME_SALES"],
  messages: ["MESSAGES"],
  other: [],
};

const NAME_PATTERNS: { pattern: RegExp; key: CategoryKey }[] = [
  { pattern: /lead|leadgen|conversion/i, key: "leads" },
  { pattern: /trafic|traffic/i, key: "traffic" },
  { pattern: /notoriet|notoriété|awareness|brand|reach|couverture/i, key: "awareness" },
  { pattern: /video|vidéo|vue/i, key: "video" },
  { pattern: /engagement/i, key: "engagement" },
  { pattern: /message/i, key: "messages" },
  { pattern: /vente|sale|purchase|catalog/i, key: "sales" },
];

function detectCategory(c: Campaign): CategoryKey {
  if (c.objective) {
    const upper = c.objective.toUpperCase();
    for (const [key, objectives] of Object.entries(CATEGORY_OBJECTIVES)) {
      if (objectives.includes(upper)) return key as CategoryKey;
    }
  }
  for (const { pattern, key } of NAME_PATTERNS) {
    if (pattern.test(c.name)) return key;
  }
  return "other";
}

// ---------------------------------------------------------------------------
// Visual config per category
// ---------------------------------------------------------------------------

interface CategoryVisual {
  icon: LucideIcon;
  label: string;
  color: string;       // hex for sparkline
  border: string;      // tailwind border-l color
  bg: string;          // tailwind bg
  text: string;        // tailwind text
  labelColor: string;  // tailwind text for labels
}

const CATEGORY_VISUALS: Record<CategoryKey, CategoryVisual> = {
  leads: { icon: Target, label: "Leads", color: "#34d399", border: "border-l-emerald-500", bg: "bg-slate-800/50", text: "text-emerald-400", labelColor: "text-emerald-500/70" },
  traffic: { icon: MousePointerClick, label: "Trafic", color: "#60a5fa", border: "border-l-blue-500", bg: "bg-slate-800/50", text: "text-blue-400", labelColor: "text-blue-500/70" },
  awareness: { icon: Eye, label: "Notoriété", color: "#a78bfa", border: "border-l-purple-500", bg: "bg-slate-800/50", text: "text-purple-400", labelColor: "text-purple-500/70" },
  engagement: { icon: Heart, label: "Engagement", color: "#fbbf24", border: "border-l-amber-500", bg: "bg-slate-800/50", text: "text-amber-400", labelColor: "text-amber-500/70" },
  video: { icon: Play, label: "Vidéo", color: "#22d3ee", border: "border-l-cyan-500", bg: "bg-slate-800/50", text: "text-cyan-400", labelColor: "text-cyan-500/70" },
  sales: { icon: ShoppingCart, label: "Ventes", color: "#fb7185", border: "border-l-rose-500", bg: "bg-slate-800/50", text: "text-rose-400", labelColor: "text-rose-500/70" },
  messages: { icon: MessageCircle, label: "Messages", color: "#22d3ee", border: "border-l-cyan-500", bg: "bg-slate-800/50", text: "text-cyan-400", labelColor: "text-cyan-500/70" },
  other: { icon: Wallet, label: "Autre", color: "#94a3b8", border: "border-l-slate-500", bg: "bg-slate-800/50", text: "text-slate-400", labelColor: "text-slate-500/70" },
};

// ---------------------------------------------------------------------------
// Aggregate helper
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
  for (const d of daily) { const m = d.metrics ?? {}; spend += Number(m.spend) || 0; impressions += Number(m.impressions) || 0; clicks += Number(m.clicks) || 0; }
  return { spend, impressions, clicks, ctr: impressions > 0 ? (clicks / impressions) * 100 : 0, cpc: clicks > 0 ? spend / clicks : 0, cpm: impressions > 0 ? (spend / impressions) * 1000 : 0 };
}

function computeTrend(current: number | undefined, previous: number | undefined): number | undefined {
  if (current == null || previous == null || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExecutiveSummaryProps {
  campaigns: Campaign[] | undefined;
  metrics: AggregatedMetrics | undefined;
  metricsLoading: boolean;
  prevMetrics: AggregatedMetrics | undefined;
  prevMetricsLoading: boolean;
  currentMetrics: Partial<Metrics30d> | undefined;
  prevM: Partial<Metrics30d> | undefined;
  chartData: Array<Record<string, string | number>>;
}

// ---------------------------------------------------------------------------
// Objective KPI Block
// ---------------------------------------------------------------------------

function ObjectiveKpiBlock({
  catKey,
  activeCampaigns,
  currentMetrics,
  prevM,
  chartData,
  index,
}: {
  catKey: CategoryKey;
  activeCampaigns: number;
  currentMetrics: Partial<Metrics30d> | undefined;
  prevM: Partial<Metrics30d> | undefined;
  chartData: Array<Record<string, string | number>>;
  index: number;
}) {
  const visual = CATEGORY_VISUALS[catKey];
  const config = getObjectiveConfig(catKey);
  const Icon = visual.icon;

  // Extract top 2 KPIs from the config
  const kpis = config.kpis.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn("rounded-xl border-l-4 p-5", visual.border, visual.bg)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={visual.text} />
          <span className={cn("text-[13px] font-semibold", visual.text)}>{visual.label}</span>
          <span className="text-[11px] text-slate-500">{activeCampaigns} campagne{activeCampaigns > 1 ? "s" : ""}</span>
        </div>
        {/* Mini sparkline */}
        {chartData.length > 3 && (
          <div className="h-8 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="spend" stroke={visual.color} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const val = currentMetrics ? kpi.extract(currentMetrics as Record<string, unknown> as import("@/lib/types").EntityMetrics) : null;
          // For standard metrics, try direct access
          const directVal = val ?? (currentMetrics as Record<string, number | undefined> | undefined)?.[kpi.key === "clicks" ? "clicks" : kpi.key === "ctr" ? "ctr" : kpi.key === "cpc" ? "cpc" : kpi.key === "cpm" ? "cpm" : kpi.key === "impressions" ? "impressions" : kpi.key === "spend" ? "spend" : ""] ?? null;
          const prevVal = prevM ? (prevM as Record<string, number | undefined>)?.[kpi.key === "clicks" ? "clicks" : kpi.key === "ctr" ? "ctr" : kpi.key === "cpc" ? "cpc" : kpi.key === "cpm" ? "cpm" : kpi.key === "impressions" ? "impressions" : kpi.key === "spend" ? "spend" : ""] ?? null : null;
          const trend = computeTrend(directVal ?? undefined, prevVal ?? undefined);
          const invertTrend = kpi.key === "cpc" || kpi.key === "cpm" || kpi.key === "spend" || kpi.key === "cpl" || kpi.key === "costPerEngagement" || kpi.key === "costPerView" || kpi.key === "costPerMessage" || kpi.key === "cpa";
          const isPositive = trend != null && Math.abs(trend) >= 1 && (invertTrend ? trend < 0 : trend > 0);
          const isNegative = trend != null && Math.abs(trend) >= 1 && (invertTrend ? trend > 0 : trend < 0);

          return (
            <div key={kpi.key}>
              <div className={cn("text-[10px] font-medium uppercase tracking-wider", visual.labelColor)}>{kpi.label}</div>
              <div className="mt-1 text-xl font-semibold text-slate-50">
                {directVal != null && isFinite(directVal) ? formatKpi(directVal, kpi.format) : "—"}
              </div>
              {trend != null && isFinite(trend) && (
                <div className={cn("mt-1 flex items-center gap-1 text-[11px] font-medium", isPositive && "text-emerald-400", isNegative && "text-rose-400", !isPositive && !isNegative && "text-slate-500")}>
                  {trend > 1 ? <TrendingUp size={11} /> : trend < -1 ? <TrendingDown size={11} /> : null}
                  <span>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExecutiveSummary({
  campaigns,
  metrics,
  metricsLoading,
  prevMetrics,
  prevMetricsLoading,
  currentMetrics,
  prevM,
  chartData,
}: ExecutiveSummaryProps) {
  // Detect active objectives
  const activeObjectives = useMemo(() => {
    if (!campaigns) return [];
    const seen = new Set<CategoryKey>();
    const result: { key: CategoryKey; count: number; spend: number }[] = [];
    const active = campaigns.filter((c) => c.status === "ACTIVE");
    for (const c of active) {
      const cat = detectCategory(c);
      if (cat === "other") continue;
      if (!seen.has(cat)) {
        seen.add(cat);
        result.push({ key: cat, count: 0, spend: 0 });
      }
      const entry = result.find((r) => r.key === cat)!;
      entry.count++;
      entry.spend += c.budget ?? 0;
    }
    return result.sort((a, b) => b.spend - a.spend);
  }, [campaigns]);

  const totalSpend = currentMetrics?.spend ?? 0;
  const prevSpend = prevM?.spend;
  const globalTrend = computeTrend(totalSpend, prevSpend);

  // Grid layout based on number of objectives
  const gridCols = activeObjectives.length === 1 ? "grid-cols-1" : activeObjectives.length === 2 ? "grid-cols-1 md:grid-cols-2" : activeObjectives.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  if (metricsLoading || !campaigns) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      </div>
    );
  }

  if (activeObjectives.length === 0) {
    // Fallback: show global metrics
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
        <div className="flex items-center gap-2 text-[13px] text-slate-400">
          <Wallet size={14} />
          <span>Aucune campagne active — métriques globales</span>
        </div>
        <div className="mt-3 text-2xl font-semibold text-slate-50">{formatCurrency(totalSpend)}</div>
        <div className="mt-1 text-[11px] text-slate-500">dépense sur la période</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global spend bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-800/30 px-5 py-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Dépense totale</div>
          <div className="text-2xl font-semibold text-slate-50">{formatCurrency(totalSpend)}</div>
        </div>

        {/* Objective distribution bar */}
        {activeObjectives.length > 1 && totalSpend > 0 && (
          <div className="flex-1 max-w-md">
            <div className="flex h-3 overflow-hidden rounded-full">
              {activeObjectives.map(({ key, spend }) => {
                const pct = (spend / totalSpend) * 100;
                if (pct < 1) return null;
                const visual = CATEGORY_VISUALS[key];
                return <div key={key} className="transition-all" style={{ width: `${pct}%`, backgroundColor: visual.color }} title={`${visual.label} : ${formatCurrency(spend)} (${pct.toFixed(0)}%)`} />;
              })}
            </div>
            <div className="mt-1 flex gap-3 text-[10px] text-slate-500">
              {activeObjectives.map(({ key }) => {
                const visual = CATEGORY_VISUALS[key];
                return <span key={key}><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: visual.color }} /> {visual.label}</span>;
              })}
            </div>
          </div>
        )}

        {/* Global trend */}
        {globalTrend != null && isFinite(globalTrend) && (
          <div className={cn("flex items-center gap-1 text-[13px] font-medium", globalTrend < 0 ? "text-emerald-400" : globalTrend > 0 ? "text-rose-400" : "text-slate-400")}>
            {globalTrend > 1 ? <TrendingUp size={14} /> : globalTrend < -1 ? <TrendingDown size={14} /> : null}
            <span>{globalTrend >= 0 ? "+" : ""}{globalTrend.toFixed(1)}%</span>
            <span className="text-[11px] text-slate-500">vs période préc.</span>
          </div>
        )}
        {prevMetricsLoading && <Skeleton className="h-5 w-24" />}
      </div>

      {/* Objective blocks */}
      <div className={cn("grid gap-4", gridCols)}>
        {activeObjectives.map(({ key, count }, i) => (
          <ObjectiveKpiBlock
            key={key}
            catKey={key}
            activeCampaigns={count}
            currentMetrics={currentMetrics}
            prevM={prevM}
            chartData={chartData}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
