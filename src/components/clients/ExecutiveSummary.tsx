"use client";

import { useMemo } from "react";
import {
  Wallet, Target, MousePointerClick, Eye, Heart, ShoppingCart, Play, MessageCircle,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import type { Campaign, AggregatedMetrics, Metrics30d } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { type CategoryKey } from "@/lib/utils/objective-metrics";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

const CAT_OBJ: Record<string, CategoryKey> = {
  OUTCOME_LEADS: "leads", LEAD_GENERATION: "leads", CONVERSIONS: "leads",
  OUTCOME_TRAFFIC: "traffic", LINK_CLICKS: "traffic",
  OUTCOME_AWARENESS: "awareness", BRAND_AWARENESS: "awareness", REACH: "awareness",
  OUTCOME_ENGAGEMENT: "engagement", POST_ENGAGEMENT: "engagement",
  VIDEO_VIEWS: "video", OUTCOME_SALES: "sales", MESSAGES: "messages",
};

const NAME_PAT: { p: RegExp; k: CategoryKey }[] = [
  { p: /lead|leadgen|conversion/i, k: "leads" },
  { p: /trafic|traffic/i, k: "traffic" },
  { p: /notoriet|notoriété|awareness|brand|reach|couverture/i, k: "awareness" },
  { p: /video|vidéo|vue/i, k: "video" },
  { p: /engagement/i, k: "engagement" },
  { p: /message/i, k: "messages" },
  { p: /vente|sale|purchase|catalog/i, k: "sales" },
];

function detect(c: Campaign): CategoryKey {
  if (c.objective) { const k = CAT_OBJ[c.objective.toUpperCase()]; if (k) return k; }
  for (const { p, k } of NAME_PAT) { if (p.test(c.name)) return k; }
  return "other";
}

// ---------------------------------------------------------------------------
// Visuals
// ---------------------------------------------------------------------------

const VIS: Record<CategoryKey, { icon: typeof Target; label: string; color: string; border: string; text: string; labelColor: string }> = {
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
// Objective data — pure budget-ratio approach (no daily filtering)
// ---------------------------------------------------------------------------

interface ObjData {
  key: CategoryKey;
  count: number;
  budget: number;
  spend: number;
  pct: number;
  kpis: { label: string; value: string; barPct: number }[];
  sparkline: { v: number }[];
}

function buildData(campaigns: Campaign[], totalSpend: number, daily: Array<{ date: string; spend: number }> | undefined): ObjData[] {
  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const groups = new Map<CategoryKey, Campaign[]>();

  for (const c of active) {
    const cat = detect(c);
    if (cat === "other") continue;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(c);
  }

  const totalBudget = active.filter((c) => detect(c) !== "other").reduce((s, c) => s + (c.budget ?? 0), 0);
  const results: ObjData[] = [];

  for (const [key, camps] of groups) {
    const groupBudget = camps.reduce((s, c) => s + (c.budget ?? 0), 0);

    // Ratio-based spend: use budget proportion of total spend
    const ratio = totalBudget > 0 ? groupBudget / totalBudget : 1 / groups.size;
    const spend = totalSpend * ratio;

    // Proportional impressions/clicks from global metrics (rough estimate)
    const pct = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;

    // Sparkline: proportional daily spend
    const sparkline = daily ? daily.map((d) => ({ v: d.spend * ratio })) : [];

    // KPIs based on category
    const kpis = getKpis(key, spend, camps, pct);

    results.push({ key, count: camps.length, budget: groupBudget, spend, pct, kpis, sparkline });
  }

  return results.sort((a, b) => b.spend - a.spend);
}

function getKpis(key: CategoryKey, spend: number, camps: Campaign[], pct: number): ObjData["kpis"] {
  const n = camps.length;
  switch (key) {
    case "leads":
      return [
        { label: "Dépense", value: formatCurrency(spend), barPct: 100 },
        { label: "Campagnes", value: String(n), barPct: Math.min(n * 25, 100) },
        { label: "Part budget", value: `${pct.toFixed(0)}%`, barPct: pct },
      ];
    case "traffic":
      return [
        { label: "Dépense", value: formatCurrency(spend), barPct: 100 },
        { label: "Campagnes", value: String(n), barPct: Math.min(n * 25, 100) },
        { label: "Part budget", value: `${pct.toFixed(0)}%`, barPct: pct },
      ];
    case "awareness":
      return [
        { label: "Dépense", value: formatCurrency(spend), barPct: 100 },
        { label: "Campagnes", value: String(n), barPct: Math.min(n * 25, 100) },
        { label: "Part budget", value: `${pct.toFixed(0)}%`, barPct: pct },
      ];
    default:
      return [
        { label: "Dépense", value: formatCurrency(spend), barPct: 100 },
        { label: "Campagnes", value: String(n), barPct: Math.min(n * 25, 100) },
        { label: "Part budget", value: `${pct.toFixed(0)}%`, barPct: pct },
      ];
  }
}

// ---------------------------------------------------------------------------
// Objective block
// ---------------------------------------------------------------------------

function ObjectiveBlock({ obj, totalSpend, index }: { obj: ObjData; totalSpend: number; index: number }) {
  const v = VIS[obj.key];
  const Icon = v.icon;
  const donutPct = Math.round(obj.pct);
  const rest = Math.max(0, totalSpend - obj.spend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn("rounded-xl border-l-4 bg-gradient-to-br from-slate-800/60 to-slate-800/30 p-5", v.border)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon size={16} className={v.text} />
            <span className={cn("text-[13px] font-semibold", v.text)}>{v.label}</span>
            <span className="text-[11px] text-slate-500">{obj.count} campagne{obj.count > 1 ? "s" : ""}</span>
          </div>

          {/* KPIs */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {obj.kpis.map((kpi) => (
              <div key={kpi.label}>
                <div className={cn("text-[10px] font-medium uppercase tracking-wider", v.labelColor)}>{kpi.label}</div>
                <div className="mt-1 text-xl font-semibold text-slate-50">{kpi.value}</div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-slate-700/50">
                  <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${kpi.barPct}%`, backgroundColor: v.color, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini donut — fixed dimensions, no ResponsiveContainer */}
        <div className="relative w-16 h-16 shrink-0">
          <PieChart width={64} height={64}>
            <Pie
              data={[{ value: obj.spend }, { value: rest }]}
              cx={32} cy={32}
              innerRadius={20} outerRadius={30}
              dataKey="value" stroke="none"
              startAngle={90} endAngle={-270}
            >
              <Cell fill={v.color} />
              <Cell fill="#1e293b" />
            </Pie>
            <text x={32} y={32} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={11} fontWeight={600}>
              {donutPct}%
            </text>
          </PieChart>
        </div>
      </div>

      {/* Mini area chart — fixed dimensions */}
      {obj.sparkline.length > 3 && (
        <div className="mt-3 w-full overflow-hidden" style={{ height: 40 }}>
          <AreaChart width={320} height={40} data={obj.sparkline} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`exec_${obj.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={v.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={v.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={v.color} strokeWidth={1.5} fill={`url(#exec_${obj.key})`} dot={false} isAnimationActive={false} />
          </AreaChart>
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

  // Build daily spend array for sparklines
  const dailySpend = useMemo(() => {
    if (!metrics?.daily?.length) return undefined;
    return metrics.daily
      .filter((d) => d.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ date: d.date, spend: Number(d.metrics?.spend) || 0 }));
  }, [metrics]);

  const objectiveData = useMemo(() => {
    if (!campaigns) return [];
    return buildData(campaigns, totalSpend, dailySpend);
  }, [campaigns, totalSpend, dailySpend]);

  const totalObjSpend = objectiveData.reduce((s, o) => s + o.spend, 0);
  const displayTotal = totalSpend > 0 ? totalSpend : totalObjSpend;
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
        <div className="mt-3 text-2xl font-semibold text-slate-50">{formatCurrency(displayTotal)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global spend bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-800/30 px-5 py-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Dépense totale</div>
          <div className="text-2xl font-semibold text-slate-50">{formatCurrency(displayTotal)}</div>
        </div>

        {objectiveData.length > 1 && (
          <div className="flex-1 max-w-md">
            <div className="flex h-3 overflow-hidden rounded-full">
              {objectiveData.map(({ key, pct }) => pct >= 1 ? <div key={key} className="transition-all" style={{ width: `${pct}%`, backgroundColor: VIS[key].color }} title={`${VIS[key].label} : ${pct.toFixed(0)}%`} /> : null)}
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
          <ObjectiveBlock key={obj.key} obj={obj} totalSpend={displayTotal} index={i} />
        ))}
      </div>
    </div>
  );
}
