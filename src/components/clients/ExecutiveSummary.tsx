"use client";

import { useMemo } from "react";
import {
  Wallet, Target, MousePointerClick, Eye, Heart, ShoppingCart, Play, MessageCircle,
  TrendingUp, TrendingDown, type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import type { Campaign, AggregatedMetrics, Metrics30d, InsightMetrics } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { type CategoryKey, getObjectiveConfig, formatKpi } from "@/lib/utils/objective-metrics";
import { formatDate } from "@/lib/utils/dates";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Category detection
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
// Visual config
// ---------------------------------------------------------------------------

interface CategoryVisual {
  icon: LucideIcon;
  label: string;
  color: string;
  border: string;
  bg: string;
  text: string;
  labelColor: string;
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
// Aggregated objective data
// ---------------------------------------------------------------------------

interface ObjectiveAggregated {
  key: CategoryKey;
  campaignCount: number;
  campaignIds: Set<string>;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  cpc: number;
  cpm: number;
  // Conversion sums
  leads: number;
  engagements: number;
  videoViews: number;
  purchases: number;
  messages: number;
  // Derived
  cpl: number | null;
  costPerEngagement: number | null;
  costPerView: number | null;
  roas: number | null;
  costPerMessage: number | null;
  // Sparkline data
  dailySpend: { date: string; spend: number }[];
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
// Build per-objective aggregated data
// ---------------------------------------------------------------------------

function buildObjectiveData(
  campaigns: Campaign[],
  daily: Array<{ date: string; metrics: InsightMetrics; entityId?: string }> | undefined,
): ObjectiveAggregated[] {
  // Group campaigns by objective
  const groups = new Map<CategoryKey, { ids: Set<string>; count: number }>();
  const active = campaigns.filter((c) => c.status === "ACTIVE");

  for (const c of active) {
    const cat = detectCategory(c);
    if (cat === "other") continue;
    if (!groups.has(cat)) groups.set(cat, { ids: new Set(), count: 0 });
    const g = groups.get(cat)!;
    g.ids.add(c.id);
    g.count++;
  }

  const results: ObjectiveAggregated[] = [];

  for (const [key, { ids, count }] of groups) {
    let spend = 0, impressions = 0, clicks = 0, reach = 0;
    let leadSum = 0, engagementSum = 0, videoViewSum = 0, purchaseSum = 0, messageSum = 0;
    const dailySpendMap = new Map<string, number>();

    if (daily) {
      for (const d of daily) {
        // If daily has entityId, filter by campaign. Otherwise use all data (split evenly later)
        if (d.entityId && !ids.has(d.entityId)) continue;

        const m = d.metrics ?? {} as Record<string, unknown>;
        spend += Number(m.spend) || 0;
        impressions += Number(m.impressions) || 0;
        clicks += Number(m.clicks) || 0;
        reach += Number((m as Record<string, unknown>).reach) || 0;

        // Extract conversions
        const conv = (m as Record<string, unknown>).conversions;
        if (conv && typeof conv === "object") {
          const c = conv as Record<string, number>;
          leadSum += (c.lead || 0) + (c.onsite_web_lead || 0);
          engagementSum += (c.page_engagement || 0) + (c.post_engagement || 0);
          videoViewSum += c.video_view || 0;
          purchaseSum += c.purchase || 0;
          messageSum += c.messaging_conversation_started_7d || 0;
        }

        // Daily spend for sparkline
        const dateKey = d.date;
        dailySpendMap.set(dateKey, (dailySpendMap.get(dateKey) ?? 0) + (Number(m.spend) || 0));
      }
    }

    // If no daily data with entityId, use campaign budgets as spend proxy
    if (spend === 0 && !daily?.some((d) => d.entityId)) {
      for (const c of active) {
        if (ids.has(c.id)) spend += c.budget ?? 0;
      }
    }

    const dailySpend = Array.from(dailySpendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, s]) => ({ date: formatDate(date, "short"), spend: s }));

    results.push({
      key,
      campaignCount: count,
      campaignIds: ids,
      spend,
      impressions,
      clicks,
      reach,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      leads: leadSum,
      engagements: engagementSum,
      videoViews: videoViewSum,
      purchases: purchaseSum,
      messages: messageSum,
      cpl: leadSum > 0 ? spend / leadSum : null,
      costPerEngagement: engagementSum > 0 ? spend / engagementSum : null,
      costPerView: videoViewSum > 0 ? spend / videoViewSum : null,
      roas: null, // Would need conversion value data
      costPerMessage: messageSum > 0 ? spend / messageSum : null,
      dailySpend,
    });
  }

  return results.sort((a, b) => b.spend - a.spend);
}

// ---------------------------------------------------------------------------
// KPI display helpers per objective
// ---------------------------------------------------------------------------

interface DisplayKpi { label: string; value: string; trend?: number; invertTrend?: boolean }

function getDisplayKpis(obj: ObjectiveAggregated): DisplayKpi[] {
  switch (obj.key) {
    case "leads":
      return [
        { label: "Leads", value: obj.leads > 0 ? String(obj.leads) : "—" },
        { label: "CPL", value: obj.cpl != null ? formatCurrency(obj.cpl) : "—", invertTrend: true },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
    case "traffic":
      return [
        { label: "Clics", value: formatCompact(obj.clicks) },
        { label: "CPC", value: formatCurrency(obj.cpc), invertTrend: true },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
    case "awareness":
      return [
        { label: "Impressions", value: formatCompact(obj.impressions) },
        { label: "CPM", value: formatCurrency(obj.cpm), invertTrend: true },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
    case "engagement":
      return [
        { label: "Engagements", value: obj.engagements > 0 ? formatCompact(obj.engagements) : "—" },
        { label: "Coût/Eng", value: obj.costPerEngagement != null ? formatCurrency(obj.costPerEngagement) : "—", invertTrend: true },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
    case "video":
      return [
        { label: "Vues vidéo", value: obj.videoViews > 0 ? formatCompact(obj.videoViews) : "—" },
        { label: "Coût/Vue", value: obj.costPerView != null ? formatCurrency(obj.costPerView) : "—", invertTrend: true },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
    case "sales":
      return [
        { label: "Achats", value: obj.purchases > 0 ? String(obj.purchases) : "—" },
        { label: "CPA", value: obj.purchases > 0 ? formatCurrency(obj.spend / obj.purchases) : "—", invertTrend: true },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
    case "messages":
      return [
        { label: "Messages", value: obj.messages > 0 ? String(obj.messages) : "—" },
        { label: "Coût/Msg", value: obj.costPerMessage != null ? formatCurrency(obj.costPerMessage) : "—", invertTrend: true },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
    default:
      return [
        { label: "Impressions", value: formatCompact(obj.impressions) },
        { label: "CTR", value: formatPercent(obj.ctr, 2) },
        { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      ];
  }
}

// ---------------------------------------------------------------------------
// Objective KPI Block
// ---------------------------------------------------------------------------

function ObjectiveKpiBlock({ obj, index }: { obj: ObjectiveAggregated; index: number }) {
  const visual = CATEGORY_VISUALS[obj.key];
  const Icon = visual.icon;
  const kpis = getDisplayKpis(obj);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn("rounded-xl border-l-4 p-5", visual.border, visual.bg)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={visual.text} />
          <span className={cn("text-[13px] font-semibold", visual.text)}>{visual.label}</span>
          <span className="text-[11px] text-slate-500">{obj.campaignCount} campagne{obj.campaignCount > 1 ? "s" : ""}</span>
        </div>
        {obj.dailySpend.length > 3 && (
          <div className="h-8 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={obj.dailySpend}>
                <Line type="monotone" dataKey="spend" stroke={visual.color} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <div className={cn("text-[10px] font-medium uppercase tracking-wider", visual.labelColor)}>{kpi.label}</div>
            <div className="mt-1 text-xl font-semibold text-slate-50">{kpi.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function ExecutiveSummary({
  campaigns,
  metrics,
  metricsLoading,
  prevMetrics,
  prevMetricsLoading,
  currentMetrics,
  prevM,
}: ExecutiveSummaryProps) {
  // Build per-objective data from daily metrics
  const objectiveData = useMemo(() => {
    if (!campaigns) return [];
    // Extract daily with entityId if available
    const daily = metrics?.daily?.map((d) => ({
      date: d.date,
      metrics: d.metrics,
      entityId: (d as unknown as Record<string, string>).entityId,
    }));
    return buildObjectiveData(campaigns, daily);
  }, [campaigns, metrics]);

  const totalSpend = currentMetrics?.spend ?? objectiveData.reduce((s, o) => s + o.spend, 0);
  const prevSpend = prevM?.spend;
  const globalTrend = computeTrend(totalSpend, prevSpend);

  const gridCols = objectiveData.length === 1 ? "grid-cols-1" : objectiveData.length === 2 ? "grid-cols-1 md:grid-cols-2" : objectiveData.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  if (metricsLoading || !campaigns) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      </div>
    );
  }

  if (objectiveData.length === 0) {
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

  const totalObjSpend = objectiveData.reduce((s, o) => s + o.spend, 0);

  return (
    <div className="space-y-4">
      {/* Global spend bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-800/30 px-5 py-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Dépense totale</div>
          <div className="text-2xl font-semibold text-slate-50">{formatCurrency(totalSpend)}</div>
        </div>

        {objectiveData.length > 1 && totalObjSpend > 0 && (
          <div className="flex-1 max-w-md">
            <div className="flex h-3 overflow-hidden rounded-full">
              {objectiveData.map(({ key, spend }) => {
                const pct = (spend / totalObjSpend) * 100;
                if (pct < 1) return null;
                const visual = CATEGORY_VISUALS[key];
                return <div key={key} className="transition-all" style={{ width: `${pct}%`, backgroundColor: visual.color }} title={`${visual.label} : ${formatCurrency(spend)} (${pct.toFixed(0)}%)`} />;
              })}
            </div>
            <div className="mt-1 flex gap-3 text-[10px] text-slate-500">
              {objectiveData.map(({ key, spend }) => (
                <span key={key}><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_VISUALS[key].color }} /> {CATEGORY_VISUALS[key].label} {formatCurrency(spend)}</span>
              ))}
            </div>
          </div>
        )}

        {globalTrend != null && isFinite(globalTrend) && (
          <div className={cn("flex items-center gap-1 text-[13px] font-medium", globalTrend < 0 ? "text-emerald-400" : globalTrend > 0 ? "text-rose-400" : "text-slate-400")}>
            {globalTrend > 1 ? <TrendingUp size={14} /> : globalTrend < -1 ? <TrendingDown size={14} /> : null}
            <span>{globalTrend >= 0 ? "+" : ""}{globalTrend.toFixed(1)}%</span>
            <span className="text-[11px] text-slate-500">vs préc.</span>
          </div>
        )}
        {prevMetricsLoading && <Skeleton className="h-5 w-24" />}
      </div>

      {/* Objective blocks */}
      <div className={cn("grid gap-4", gridCols)}>
        {objectiveData.map((obj, i) => (
          <ObjectiveKpiBlock key={obj.key} obj={obj} index={i} />
        ))}
      </div>
    </div>
  );
}
