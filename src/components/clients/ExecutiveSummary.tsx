"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  Wallet, Target, MousePointerClick, Eye, Heart, ShoppingCart, Play, MessageCircle,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import type { Campaign, AggregatedMetrics, Metrics30d, InsightMetrics } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
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
  leads: { icon: Target, label: "Génération de leads", color: "#34d399", border: "border-l-emerald-500", text: "text-emerald-400", labelColor: "text-emerald-500/70" },
  traffic: { icon: MousePointerClick, label: "Trafic", color: "#60a5fa", border: "border-l-blue-500", text: "text-blue-400", labelColor: "text-blue-500/70" },
  awareness: { icon: Eye, label: "Notoriété", color: "#a78bfa", border: "border-l-purple-500", text: "text-purple-400", labelColor: "text-purple-500/70" },
  engagement: { icon: Heart, label: "Engagement", color: "#fbbf24", border: "border-l-amber-500", text: "text-amber-400", labelColor: "text-amber-500/70" },
  video: { icon: Play, label: "Vidéo", color: "#22d3ee", border: "border-l-cyan-500", text: "text-cyan-400", labelColor: "text-cyan-500/70" },
  sales: { icon: ShoppingCart, label: "Ventes", color: "#fb7185", border: "border-l-rose-500", text: "text-rose-400", labelColor: "text-rose-500/70" },
  messages: { icon: MessageCircle, label: "Messages", color: "#22d3ee", border: "border-l-cyan-500", text: "text-cyan-400", labelColor: "text-cyan-500/70" },
  other: { icon: Wallet, label: "Autre", color: "#94a3b8", border: "border-l-slate-500", text: "text-slate-400", labelColor: "text-slate-500/70" },
};

const DONUT_COLORS = ["#818cf8", "#34d399", "#fbbf24", "#60a5fa", "#fb7185", "#a78bfa"];

// ---------------------------------------------------------------------------
// Recharts shared styles
// ---------------------------------------------------------------------------

const GRID_PROPS = { strokeDasharray: "3 3", stroke: "#334155", strokeOpacity: 0.5 };
const XAXIS_TICK = { fontSize: 10, fill: "#94a3b8" };
const YAXIS_TICK = { fontSize: 10, fill: "#64748b" };
const TT_STYLE = { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 };

function MiniTooltip({ active, payload, label, fmt }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; fmt: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return <div style={TT_STYLE} className="px-2 py-1 shadow-xl"><p className="text-[10px] text-slate-400">{label}</p><p className="text-[12px] font-semibold text-slate-50">{fmt(payload[0].value)}</p></div>;
}

// ---------------------------------------------------------------------------
// Objective data
// ---------------------------------------------------------------------------

interface ObjData {
  key: CategoryKey;
  count: number;
  spend: number;
  pct: number;
  campaigns: Campaign[];
  daily: { date: string; spend: number; impressions: number; clicks: number }[];
  weekly: { week: string; spend: number; impressions: number; clicks: number }[];
  topCampaigns: { name: string; spend: number }[];
}

interface DisplayKpi { label: string; value: string; trend?: number; invertTrend?: boolean }

function buildData(
  campaigns: Campaign[],
  totalSpend: number,
  daily: { date: string; spend: number; impressions: number; clicks: number }[],
): ObjData[] {
  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const groups = new Map<CategoryKey, Campaign[]>();

  for (const c of active) {
    const cat = detect(c);
    if (cat === "other") continue;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(c);
  }

  // Budget ratio split
  const totalBudget = Array.from(groups.values()).flat().reduce((s, c) => s + (c.budget ?? 0), 0);
  const results: ObjData[] = [];

  for (const [key, camps] of groups) {
    const groupBudget = camps.reduce((s, c) => s + (c.budget ?? 0), 0);
    const ratio = totalBudget > 0 ? groupBudget / totalBudget : 1 / groups.size;
    const spend = totalSpend * ratio;
    const pct = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;

    // Proportional daily
    const objDaily = daily.map((d) => ({
      date: formatDate(d.date, "short"),
      spend: d.spend * ratio,
      impressions: d.impressions * ratio,
      clicks: d.clicks * ratio,
    }));

    // Group by ISO week
    const weekMap = new Map<string, { spend: number; impressions: number; clicks: number }>();
    daily.forEach((d, i) => {
      const weekNum = `S${Math.floor(i / 7) + 1}`;
      const w = weekMap.get(weekNum) ?? { spend: 0, impressions: 0, clicks: 0 };
      w.spend += d.spend * ratio;
      w.impressions += d.impressions * ratio;
      w.clicks += d.clicks * ratio;
      weekMap.set(weekNum, w);
    });
    const weekly = Array.from(weekMap.entries()).map(([week, v]) => ({ week, ...v }));

    // Top 5 campaigns by budget
    const topCampaigns = [...camps]
      .sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0))
      .slice(0, 5)
      .map((c) => ({ name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name, spend: (c.budget ?? 0) * (totalBudget > 0 ? totalSpend / totalBudget : 1) }));

    results.push({ key, count: camps.length, spend, pct, campaigns: camps, daily: objDaily, weekly, topCampaigns });
  }

  return results.sort((a, b) => b.spend - a.spend);
}

function getKpis(obj: ObjData): DisplayKpi[] {
  switch (obj.key) {
    case "leads": return [
      { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      { label: "Campagnes", value: String(obj.count) },
      { label: "Part budget", value: `${obj.pct.toFixed(0)}%` },
    ];
    case "traffic": return [
      { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      { label: "Campagnes", value: String(obj.count) },
      { label: "Part budget", value: `${obj.pct.toFixed(0)}%` },
    ];
    default: return [
      { label: "Dépense", value: formatCurrency(obj.spend), invertTrend: true },
      { label: "Campagnes", value: String(obj.count) },
      { label: "Part budget", value: `${obj.pct.toFixed(0)}%` },
    ];
  }
}

// ---------------------------------------------------------------------------
// useContainerWidth hook
// ---------------------------------------------------------------------------

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [w, setW] = useState(400);
  useEffect(() => {
    function measure() { if (ref.current) setW(ref.current.offsetWidth); }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ref]);
  return w;
}

// ---------------------------------------------------------------------------
// Objective block with rich charts
// ---------------------------------------------------------------------------

function ObjectiveBlock({ obj, totalSpend, index }: { obj: ObjData; totalSpend: number; index: number }) {
  const v = VIS[obj.key];
  const Icon = v.icon;
  const kpis = getKpis(obj);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartW = useContainerWidth(containerRef);
  const leftW = Math.floor(chartW * 0.6) - 8;
  const rightW = Math.floor(chartW * 0.4) - 8;
  const chartH = 150;
  const hasDaily = obj.daily.length > 3;
  const donutPct = Math.round(obj.pct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn("rounded-xl border-l-4 bg-gradient-to-br from-slate-800/60 to-slate-800/30 p-5", v.border)}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon size={16} className={v.text} />
        <span className={cn("text-[13px] font-semibold", v.text)}>{v.label}</span>
        <span className="text-[11px] text-slate-500">{obj.count} campagne{obj.count > 1 ? "s" : ""}</span>
        <div className="ml-auto relative w-12 h-12 shrink-0">
          <PieChart width={48} height={48}>
            <Pie data={[{ value: obj.spend }, { value: Math.max(0, totalSpend - obj.spend) }]} cx={24} cy={24} innerRadius={15} outerRadius={22} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
              <Cell fill={v.color} />
              <Cell fill="#1e293b" />
            </Pie>
            <text x={24} y={24} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={10} fontWeight={600}>{donutPct}%</text>
          </PieChart>
        </div>
      </div>

      {/* KPIs row */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-slate-900/30 p-2.5">
            <div className={cn("text-[9px] font-medium uppercase tracking-wider", v.labelColor)}>{kpi.label}</div>
            <div className="mt-0.5 text-lg font-semibold text-slate-50">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div ref={containerRef} className="mt-4 flex gap-4">
        {/* Left chart — varies by objective */}
        <div className="flex-[3] min-w-0">
          {hasDaily ? (
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-1">
                {obj.key === "awareness" ? "Impressions par semaine" : obj.key === "leads" ? "Évolution dépense" : "Évolution par jour"}
              </div>
              {obj.key === "awareness" && obj.weekly.length > 1 ? (
                // Awareness: grouped bar chart by week
                <BarChart width={leftW} height={chartH} data={obj.weekly} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="week" tick={XAXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={YAXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(Math.round(v))} />
                  <Tooltip content={<MiniTooltip fmt={formatCompact} />} />
                  <Bar dataKey="impressions" fill={v.color} radius={[3, 3, 0, 0]} opacity={0.8} />
                </BarChart>
              ) : (
                // Default: area chart
                <AreaChart width={leftW} height={chartH} data={obj.daily} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id={`eg_${obj.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={v.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={v.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="date" tick={XAXIS_TICK} axisLine={false} tickLine={false} interval={Math.floor(obj.daily.length / 5)} />
                  <YAxis tick={YAXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k€` : `${Math.round(val)}€`} />
                  <Tooltip content={<MiniTooltip fmt={formatCurrency} />} />
                  <Area type="monotone" dataKey="spend" stroke={v.color} strokeWidth={2} fill={`url(#eg_${obj.key})`} isAnimationActive={false} />
                </AreaChart>
              )}
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center rounded-lg bg-slate-900/20">
              <span className="text-[11px] text-slate-600">Données insuffisantes</span>
            </div>
          )}
        </div>

        {/* Right chart — donut or secondary metric */}
        <div className="flex-[2] min-w-0">
          {obj.topCampaigns.length > 1 ? (
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-1">Top campagnes</div>
              <div className="flex items-center gap-2">
                <PieChart width={Math.min(rightW, 120)} height={chartH - 20}>
                  <Pie data={obj.topCampaigns} dataKey="spend" cx="50%" cy="50%" innerRadius="50%" outerRadius="85%" paddingAngle={2} stroke="none">
                    {obj.topCampaigns.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                </PieChart>
                <div className="flex flex-col gap-1 min-w-0">
                  {obj.topCampaigns.slice(0, 4).map((c, i) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-[9px]">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="truncate text-slate-400">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : hasDaily ? (
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-1">Clics</div>
              <BarChart width={rightW} height={chartH - 20} data={obj.weekly} margin={{ top: 5, right: 0, bottom: 0, left: -10 }}>
                <XAxis dataKey="week" tick={XAXIS_TICK} axisLine={false} tickLine={false} />
                <Bar dataKey="clicks" fill={v.color} radius={[3, 3, 0, 0]} opacity={0.6} />
              </BarChart>
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center rounded-lg bg-slate-900/20">
              <span className="text-[11px] text-slate-600">—</span>
            </div>
          )}
        </div>
      </div>
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

  const dailyRaw = useMemo(() => {
    if (!metrics?.daily?.length) return [];
    return metrics.daily.filter((d) => d.date).sort((a, b) => a.date.localeCompare(b.date)).map((d) => {
      const m = d.metrics ?? {};
      return { date: d.date, spend: Number(m.spend) || 0, impressions: Number(m.impressions) || 0, clicks: Number(m.clicks) || 0 };
    });
  }, [metrics]);

  const objectiveData = useMemo(() => {
    if (!campaigns) return [];
    return buildData(campaigns, totalSpend, dailyRaw);
  }, [campaigns, totalSpend, dailyRaw]);

  const totalObjSpend = objectiveData.reduce((s, o) => s + o.spend, 0);
  const displayTotal = totalSpend > 0 ? totalSpend : totalObjSpend;

  if (metricsLoading || !campaigns) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
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
              {objectiveData.map(({ key, pct }) => pct >= 1 ? <div key={key} style={{ width: `${pct}%`, backgroundColor: VIS[key].color }} title={`${VIS[key].label} : ${pct.toFixed(0)}%`} /> : null)}
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

      {/* Objective blocks — full width, stacked */}
      <div className="space-y-4">
        {objectiveData.map((obj, i) => (
          <ObjectiveBlock key={obj.key} obj={obj} totalSpend={displayTotal} index={i} />
        ))}
      </div>
    </div>
  );
}
