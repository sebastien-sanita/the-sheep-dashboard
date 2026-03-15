"use client";

import { useMemo } from "react";
import {
  Wallet, Target, MousePointerClick, Eye, Heart, ShoppingCart, Play, MessageCircle,
  TrendingUp, TrendingDown, Minus, type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import type { Campaign, AggregatedMetrics, Metrics30d, InsightMetrics } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { type CategoryKey } from "@/lib/utils/objective-metrics";
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
// Visuals
// ---------------------------------------------------------------------------

interface CategoryVisual { icon: LucideIcon; label: string; color: string; border: string; text: string; labelColor: string }

const VIS: Record<CategoryKey, CategoryVisual> = {
  leads: { icon: Target, label: "Leads", color: "#34d399", border: "border-l-emerald-500", text: "text-emerald-400", labelColor: "text-emerald-500/70" },
  traffic: { icon: MousePointerClick, label: "Trafic", color: "#60a5fa", border: "border-l-blue-500", text: "text-blue-400", labelColor: "text-blue-500/70" },
  awareness: { icon: Eye, label: "Notoriété", color: "#a78bfa", border: "border-l-purple-500", text: "text-purple-400", labelColor: "text-purple-500/70" },
  engagement: { icon: Heart, label: "Engagement", color: "#fbbf24", border: "border-l-amber-500", text: "text-amber-400", labelColor: "text-amber-500/70" },
  video: { icon: Play, label: "Vidéo", color: "#22d3ee", border: "border-l-cyan-500", text: "text-cyan-400", labelColor: "text-cyan-500/70" },
  sales: { icon: ShoppingCart, label: "Ventes", color: "#fb7185", border: "border-l-rose-500", text: "text-rose-400", labelColor: "text-rose-500/70" },
  messages: { icon: MessageCircle, label: "Messages", color: "#22d3ee", border: "border-l-cyan-500", text: "text-cyan-400", labelColor: "text-cyan-500/70" },
  other: { icon: Wallet, label: "Autre", color: "#94a3b8", border: "border-l-slate-500", text: "text-slate-400", labelColor: "text-slate-500/70" },
};

// ---------------------------------------------------------------------------
// Aggregated objective data
// ---------------------------------------------------------------------------

interface ObjData {
  key: CategoryKey;
  count: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  engagements: number;
  videoViews: number;
  purchases: number;
  messages: number;
  cpl: number | null;
  costPerEngagement: number | null;
  costPerView: number | null;
  costPerMessage: number | null;
  dailySpend: { date: string; value: number }[];
  pctOfTotal: number;
}

interface DisplayKpi { label: string; value: string; barPct: number }

function getDisplayKpis(obj: ObjData, maxes: Record<string, number>): DisplayKpi[] {
  const bar = (v: number, maxKey: string) => maxes[maxKey] > 0 ? Math.min((v / maxes[maxKey]) * 100, 100) : 0;
  const invBar = (v: number | null, maxKey: string) => v != null && maxes[maxKey] > 0 ? Math.max(0, 100 - (v / maxes[maxKey]) * 100) : 0;

  switch (obj.key) {
    case "leads": return [
      { label: "Leads", value: obj.leads > 0 ? String(obj.leads) : "—", barPct: bar(obj.leads, "leads") },
      { label: "CPL", value: obj.cpl != null ? formatCurrency(obj.cpl) : "—", barPct: invBar(obj.cpl, "cpl") },
      { label: "Dépense", value: formatCurrency(obj.spend), barPct: bar(obj.spend, "spend") },
    ];
    case "traffic": return [
      { label: "Clics", value: formatCompact(obj.clicks), barPct: bar(obj.clicks, "clicks") },
      { label: "CPC", value: formatCurrency(obj.cpc), barPct: invBar(obj.cpc, "cpc") },
      { label: "Dépense", value: formatCurrency(obj.spend), barPct: bar(obj.spend, "spend") },
    ];
    case "awareness": return [
      { label: "Impressions", value: formatCompact(obj.impressions), barPct: bar(obj.impressions, "impressions") },
      { label: "CPM", value: formatCurrency(obj.cpm), barPct: invBar(obj.cpm, "cpm") },
      { label: "Dépense", value: formatCurrency(obj.spend), barPct: bar(obj.spend, "spend") },
    ];
    case "engagement": return [
      { label: "Engagements", value: obj.engagements > 0 ? formatCompact(obj.engagements) : "—", barPct: bar(obj.engagements, "engagements") },
      { label: "Coût/Eng", value: obj.costPerEngagement != null ? formatCurrency(obj.costPerEngagement) : "—", barPct: invBar(obj.costPerEngagement, "costPerEng") },
      { label: "Dépense", value: formatCurrency(obj.spend), barPct: bar(obj.spend, "spend") },
    ];
    case "video": return [
      { label: "Vues vidéo", value: obj.videoViews > 0 ? formatCompact(obj.videoViews) : "—", barPct: bar(obj.videoViews, "videoViews") },
      { label: "Coût/Vue", value: obj.costPerView != null ? formatCurrency(obj.costPerView) : "—", barPct: invBar(obj.costPerView, "costPerView") },
      { label: "Dépense", value: formatCurrency(obj.spend), barPct: bar(obj.spend, "spend") },
    ];
    default: return [
      { label: "Clics", value: formatCompact(obj.clicks), barPct: bar(obj.clicks, "clicks") },
      { label: "CTR", value: formatPercent(obj.ctr, 2), barPct: bar(obj.ctr, "ctr") },
      { label: "Dépense", value: formatCurrency(obj.spend), barPct: bar(obj.spend, "spend") },
    ];
  }
}

// ---------------------------------------------------------------------------
// Build per-objective data — uses budget proportional split when no entityId
// ---------------------------------------------------------------------------

function buildObjectiveData(
  campaigns: Campaign[],
  totalSpendGlobal: number,
  daily: Array<{ date: string; metrics: InsightMetrics; entityId?: string }> | undefined,
): ObjData[] {
  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const groups = new Map<CategoryKey, Campaign[]>();

  for (const c of active) {
    const cat = detectCategory(c);
    if (cat === "other") continue;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(c);
  }

  // Check if daily data has entityId for filtering
  const hasEntityId = daily?.some((d) => d.entityId) ?? false;

  // Total budget for proportional split
  const totalBudget = active.reduce((s, c) => s + (c.budget ?? 0), 0);

  // Aggregate global daily totals (for proportional split)
  let globalSpend = 0, globalImpressions = 0, globalClicks = 0;
  if (daily && !hasEntityId) {
    for (const d of daily) {
      const m = d.metrics ?? {};
      globalSpend += Number(m.spend) || 0;
      globalImpressions += Number(m.impressions) || 0;
      globalClicks += Number(m.clicks) || 0;
    }
  }

  const results: ObjData[] = [];

  for (const [key, campList] of groups) {
    const ids = new Set(campList.map((c) => c.id));
    // Also match by platformId
    const platformIds = new Set(campList.map((c) => c.platformId).filter(Boolean));
    const groupBudget = campList.reduce((s, c) => s + (c.budget ?? 0), 0);

    let spend = 0, impressions = 0, clicks = 0;
    let leadSum = 0, engagementSum = 0, videoViewSum = 0, purchaseSum = 0, messageSum = 0;
    const dailyMap = new Map<string, number>();

    if (daily && hasEntityId) {
      // Filter daily metrics by campaign ID or platformId
      for (const d of daily) {
        if (!d.entityId) continue;
        if (!ids.has(d.entityId) && !platformIds.has(d.entityId)) continue;

        const m = d.metrics ?? {};
        const s = Number(m.spend) || 0;
        spend += s;
        impressions += Number(m.impressions) || 0;
        clicks += Number(m.clicks) || 0;

        const conv = (m as Record<string, unknown>).conversions;
        if (conv && typeof conv === "object") {
          const cv = conv as Record<string, number>;
          leadSum += (cv.lead || 0) + (cv.onsite_web_lead || 0);
          engagementSum += (cv.page_engagement || 0) + (cv.post_engagement || 0);
          videoViewSum += cv.video_view || 0;
          purchaseSum += cv.purchase || 0;
          messageSum += cv.messaging_conversation_started_7d || 0;
        }

        dailyMap.set(d.date, (dailyMap.get(d.date) ?? 0) + s);
      }
    } else {
      // Proportional split based on budget ratio
      const ratio = totalBudget > 0 ? groupBudget / totalBudget : 0;
      spend = globalSpend > 0 ? globalSpend * ratio : (totalSpendGlobal > 0 ? totalSpendGlobal * ratio : groupBudget);
      impressions = globalImpressions * ratio;
      clicks = globalClicks * ratio;

      // Build proportional daily sparkline
      if (daily) {
        for (const d of daily) {
          const s = (Number(d.metrics?.spend) || 0) * ratio;
          dailyMap.set(d.date, (dailyMap.get(d.date) ?? 0) + s);
        }
      }
    }

    const dailySpend = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date: formatDate(date, "short"), value }));

    const totalForPct = totalSpendGlobal > 0 ? totalSpendGlobal : (globalSpend > 0 ? globalSpend : totalBudget);

    results.push({
      key,
      count: campList.length,
      spend, impressions, clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      leads: leadSum, engagements: engagementSum, videoViews: videoViewSum,
      purchases: purchaseSum, messages: messageSum,
      cpl: leadSum > 0 ? spend / leadSum : null,
      costPerEngagement: engagementSum > 0 ? spend / engagementSum : null,
      costPerView: videoViewSum > 0 ? spend / videoViewSum : null,
      costPerMessage: messageSum > 0 ? spend / messageSum : null,
      dailySpend,
      pctOfTotal: totalForPct > 0 ? (spend / totalForPct) * 100 : 0,
    });
  }

  return results.sort((a, b) => b.spend - a.spend);
}

// ---------------------------------------------------------------------------
// Objective KPI Block (rich graphical version)
// ---------------------------------------------------------------------------

function ObjectiveBlock({ obj, totalSpend, maxes, index }: { obj: ObjData; totalSpend: number; maxes: Record<string, number>; index: number }) {
  const v = VIS[obj.key];
  const Icon = v.icon;
  const kpis = getDisplayKpis(obj, maxes);
  const donutData = [
    { name: v.label, value: obj.spend },
    { name: "Autres", value: Math.max(0, totalSpend - obj.spend) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn("rounded-xl border-l-4 bg-gradient-to-br from-slate-800/60 to-slate-800/30 p-5", v.border)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={v.text} />
          <span className={cn("text-[13px] font-semibold", v.text)}>{v.label}</span>
          <span className="text-[11px] text-slate-500">{obj.count} campagne{obj.count > 1 ? "s" : ""}</span>
        </div>
        {/* Mini donut */}
        <div className="relative h-16 w-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} dataKey="value" innerRadius="65%" outerRadius="100%" paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
                <Cell fill={v.color} />
                <Cell fill="#1e293b" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className={cn("text-[11px] font-bold", v.text)}>{Math.round(obj.pctOfTotal)}%</span>
          </div>
        </div>
      </div>

      {/* KPIs with progress bars */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <div className={cn("text-[10px] font-medium uppercase tracking-wider", v.labelColor)}>{kpi.label}</div>
            <div className="mt-1 text-xl font-semibold text-slate-50">{kpi.value}</div>
            <div className="mt-1.5 h-1 w-full rounded-full bg-slate-700/50">
              <div className="h-1 rounded-full transition-all" style={{ width: `${kpi.barPct}%`, backgroundColor: v.color, opacity: 0.7 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Mini area chart */}
      {obj.dailySpend.length > 3 && (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={obj.dailySpend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`exec_${obj.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={v.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={v.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={v.color} strokeWidth={1.5} fill={`url(#exec_${obj.key})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Props
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
// Main
// ---------------------------------------------------------------------------

export function ExecutiveSummary({ campaigns, metrics, metricsLoading, prevMetricsLoading, currentMetrics, prevM }: ExecutiveSummaryProps) {
  const totalSpend = currentMetrics?.spend ?? 0;
  const prevSpend = prevM?.spend;
  const globalTrend = prevSpend && prevSpend > 0 ? ((totalSpend - prevSpend) / prevSpend) * 100 : undefined;

  const objectiveData = useMemo(() => {
    if (!campaigns) return [];
    const daily = metrics?.daily?.map((d) => ({
      date: d.date,
      metrics: d.metrics,
      entityId: (d as unknown as Record<string, string>).entityId,
    }));
    return buildObjectiveData(campaigns, totalSpend, daily);
  }, [campaigns, metrics, totalSpend]);

  // Compute max values across all objectives for progress bars
  const maxes = useMemo(() => {
    const m: Record<string, number> = { spend: 0, clicks: 0, impressions: 0, leads: 0, engagements: 0, videoViews: 0, ctr: 0, cpl: 0, cpc: 0, cpm: 0, costPerEng: 0, costPerView: 0 };
    for (const o of objectiveData) {
      m.spend = Math.max(m.spend, o.spend);
      m.clicks = Math.max(m.clicks, o.clicks);
      m.impressions = Math.max(m.impressions, o.impressions);
      m.leads = Math.max(m.leads, o.leads);
      m.engagements = Math.max(m.engagements, o.engagements);
      m.videoViews = Math.max(m.videoViews, o.videoViews);
      m.ctr = Math.max(m.ctr, o.ctr);
      m.cpl = Math.max(m.cpl, o.cpl ?? 0);
      m.cpc = Math.max(m.cpc, o.cpc);
      m.cpm = Math.max(m.cpm, o.cpm);
      m.costPerEng = Math.max(m.costPerEng, o.costPerEngagement ?? 0);
      m.costPerView = Math.max(m.costPerView, o.costPerView ?? 0);
    }
    return m;
  }, [objectiveData]);

  const totalObjSpend = objectiveData.reduce((s, o) => s + o.spend, 0);
  const gridCols = objectiveData.length === 1 ? "grid-cols-1" : objectiveData.length === 2 ? "grid-cols-1 md:grid-cols-2" : objectiveData.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  if (metricsLoading || !campaigns) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      </div>
    );
  }

  if (objectiveData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
        <div className="flex items-center gap-2 text-[13px] text-slate-400"><Wallet size={14} /> Aucune campagne active — métriques globales</div>
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
          <div className="text-2xl font-semibold text-slate-50">{formatCurrency(totalSpend > 0 ? totalSpend : totalObjSpend)}</div>
        </div>

        {objectiveData.length > 1 && totalObjSpend > 0 && (
          <div className="flex-1 max-w-md">
            <div className="flex h-3 overflow-hidden rounded-full">
              {objectiveData.map(({ key, spend }) => {
                const pct = (spend / totalObjSpend) * 100;
                if (pct < 1) return null;
                return <div key={key} className="transition-all" style={{ width: `${pct}%`, backgroundColor: VIS[key].color }} title={`${VIS[key].label} : ${formatCurrency(spend)} (${pct.toFixed(0)}%)`} />;
              })}
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-500">
              {objectiveData.map(({ key, spend }) => (
                <span key={key}><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: VIS[key].color }} /> {VIS[key].label} {formatCurrency(spend)}</span>
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
          <ObjectiveBlock key={obj.key} obj={obj} totalSpend={totalSpend > 0 ? totalSpend : totalObjSpend} maxes={maxes} index={i} />
        ))}
      </div>
    </div>
  );
}
