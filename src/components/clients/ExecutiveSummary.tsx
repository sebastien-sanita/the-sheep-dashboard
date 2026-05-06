"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  Wallet, Target, MousePointerClick, Eye, Heart, ShoppingCart, Play, MessageCircle,
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import type { Campaign, AggregatedMetrics, Metrics30d } from "@/lib/types";
import { formatCurrency, formatCompact } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import { type CategoryKey } from "@/lib/utils/objective-metrics";
import { cleanCampaignName } from "@/lib/utils/campaign-name";
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
  { p: /lead|leadgen|conversion/i, k: "leads" }, { p: /trafic|traffic/i, k: "traffic" },
  { p: /notoriet|notoriété|awareness|brand|reach|couverture/i, k: "awareness" },
  { p: /video|vidéo|vue/i, k: "video" }, { p: /engagement/i, k: "engagement" },
  { p: /message/i, k: "messages" }, { p: /vente|sale|purchase|catalog/i, k: "sales" },
];
function detect(c: Campaign): CategoryKey {
  if (c.objective) { const k = CAT_OBJ[c.objective.toUpperCase()]; if (k) return k; }
  for (const { p, k } of NAME_PAT) { if (p.test(c.name)) return k; }
  return "other";
}

// ---------------------------------------------------------------------------
// Visuals
// ---------------------------------------------------------------------------

// Calm Precision palette : couleurs posées, désaturées, alignées sur les tokens v2.
// Recharts ne résout pas var(--token), donc hex direct ; les classes Tailwind
// border/text utilisent les paliers recalibrés (success-400, warning-400, danger-400, info, etc.).
const VIS: Record<CategoryKey, { icon: typeof Target; label: string; color: string; border: string; text: string; labelColor: string }> = {
  leads:      { icon: Target,             label: "Génération de leads", color: "#5cb88e", border: "border-l-success-400",  text: "text-success-400",  labelColor: "text-success-400/70" },
  traffic:    { icon: MousePointerClick,  label: "Trafic",              color: "#6a9ad6", border: "border-l-[#6a9ad6]",    text: "text-[#6a9ad6]",    labelColor: "text-[#6a9ad6]/70" },
  awareness:  { icon: Eye,                label: "Notoriété",           color: "#a89bd2", border: "border-l-[#a89bd2]",    text: "text-[#a89bd2]",    labelColor: "text-[#a89bd2]/70" },
  engagement: { icon: Heart,              label: "Engagement",          color: "#d6a64a", border: "border-l-warning-400",  text: "text-warning-400",  labelColor: "text-warning-400/70" },
  video:      { icon: Play,               label: "Vidéo",               color: "#3d8585", border: "border-l-[#3d8585]",    text: "text-[#3d8585]",    labelColor: "text-[#3d8585]/70" },
  sales:      { icon: ShoppingCart,       label: "Ventes",              color: "#d96a6a", border: "border-l-danger-400",   text: "text-danger-400",   labelColor: "text-danger-400/70" },
  messages:   { icon: MessageCircle,      label: "Messages",            color: "#3d8585", border: "border-l-[#3d8585]",    text: "text-[#3d8585]",    labelColor: "text-[#3d8585]/70" },
  other:      { icon: Wallet,             label: "Autre",               color: "#5a5a6e", border: "border-l-slate-500",    text: "text-[var(--color-text-secondary)]", labelColor: "text-[var(--color-text-tertiary)]/70" },
};
const DONUT_COLORS = ["#7f996d", "#5cb88e", "#d6a64a", "#6a9ad6", "#d96a6a", "#a89bd2"];

// ---------------------------------------------------------------------------
// Recharts styles
// ---------------------------------------------------------------------------

const GRID_PROPS = { strokeDasharray: "2 4", stroke: "rgba(255,255,255,0.06)" };
const AX_TICK = { fontSize: 10, fill: "#5a5a6e", fontFamily: "var(--font-mono)" };
const TT_STYLE = { backgroundColor: "#1a1a24", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 };
function Tt({ active, payload, label, fmt }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; fmt: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return <div style={TT_STYLE} className="px-2 py-1 shadow-xl"><p className="text-[10px] text-[var(--color-text-secondary)]">{label}</p><p className="text-[12px] font-semibold text-[var(--color-text-primary)]">{fmt(payload[0].value)}</p></div>;
}

// ---------------------------------------------------------------------------
// Objective data
// ---------------------------------------------------------------------------

interface ObjData {
  key: CategoryKey; count: number; spend: number; pct: number;
  campaigns: Campaign[];
  daily: { date: string; spend: number; impressions: number; clicks: number }[];
  weekly: { week: string; spend: number; impressions: number; clicks: number }[];
  topCampaigns: { name: string; fullName: string; spend: number }[];
}

function buildData(campaigns: Campaign[], totalSpend: number, daily: { date: string; spend: number; impressions: number; clicks: number }[]): ObjData[] {
  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const groups = new Map<CategoryKey, Campaign[]>();
  for (const c of active) { const cat = detect(c); if (cat === "other") continue; if (!groups.has(cat)) groups.set(cat, []); groups.get(cat)!.push(c); }

  const totalBudget = Array.from(groups.values()).flat().reduce((s, c) => s + (c.budget ?? 0), 0);
  const results: ObjData[] = [];

  for (const [key, camps] of groups) {
    const groupBudget = camps.reduce((s, c) => s + (c.budget ?? 0), 0);
    const ratio = totalBudget > 0 ? groupBudget / totalBudget : 1 / groups.size;
    const spend = totalSpend * ratio;
    const pct = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;

    const objDaily = daily.map((d) => ({ date: formatDate(d.date, "short"), spend: d.spend * ratio, impressions: d.impressions * ratio, clicks: d.clicks * ratio }));
    const weekMap = new Map<string, { spend: number; impressions: number; clicks: number }>();
    daily.forEach((d, i) => { const wk = `S${Math.floor(i / 7) + 1}`; const w = weekMap.get(wk) ?? { spend: 0, impressions: 0, clicks: 0 }; w.spend += d.spend * ratio; w.impressions += d.impressions * ratio; w.clicks += d.clicks * ratio; weekMap.set(wk, w); });
    const weekly = Array.from(weekMap.entries()).map(([week, v]) => ({ week, ...v }));

    const spendMult = totalBudget > 0 ? totalSpend / totalBudget : 1;
    const topCampaigns = [...camps].sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0)).slice(0, 5)
      .map((c) => ({ name: cleanCampaignName(c.name), fullName: c.name, spend: (c.budget ?? 0) * spendMult }));

    results.push({ key, count: camps.length, spend, pct, campaigns: camps, daily: objDaily, weekly, topCampaigns });
  }
  return results.sort((a, b) => b.spend - a.spend);
}

// ---------------------------------------------------------------------------
// useContainerWidth
// ---------------------------------------------------------------------------

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [w, setW] = useState(500);
  useEffect(() => {
    function m() { if (ref.current) setW(ref.current.offsetWidth); }
    m(); window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, [ref]);
  return w;
}

// ---------------------------------------------------------------------------
// Compact block (closed state)
// ---------------------------------------------------------------------------

function CompactBlock({ obj, totalSpend, onClick }: { obj: ObjData; totalSpend: number; onClick: () => void }) {
  const v = VIS[obj.key];
  const Icon = v.icon;
  const hasSparkline = obj.daily.length > 3;

  return (
    <button type="button" onClick={onClick} className={cn("w-full rounded-xl border-l-4 bg-gradient-to-br from-slate-800/60 to-slate-800/30 p-4 text-left transition-colors hover:from-slate-800/80", v.border)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon size={14} className={v.text} />
        <span className={cn("text-[12px] font-semibold", v.text)}>{v.label}</span>
        <span className="text-[10px] text-[var(--color-text-tertiary)]">{obj.count}</span>
        <div className="ml-auto relative w-10 h-10 shrink-0">
          <PieChart width={40} height={40}>
            <Pie data={[{ value: obj.spend }, { value: Math.max(0, totalSpend - obj.spend) }]} cx={20} cy={20} innerRadius={12} outerRadius={18} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
              <Cell fill={v.color} /><Cell fill="#1a1a24" />
            </Pie>
            <text x={20} y={20} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={9} fontWeight={600}>{Math.round(obj.pct)}%</text>
          </PieChart>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <div className={cn("text-[9px] font-medium uppercase tracking-wider", v.labelColor)}>Dépense</div>
          <div className="mt-0.5 text-[22px] font-bold text-[var(--color-text-primary)]">{formatCurrency(obj.spend)}</div>
        </div>
        <div>
          <div className={cn("text-[9px] font-medium uppercase tracking-wider", v.labelColor)}>Campagnes</div>
          <div className="mt-0.5 text-[22px] font-bold text-[var(--color-text-primary)]">{obj.count}</div>
        </div>
        <div>
          <div className={cn("text-[9px] font-medium uppercase tracking-wider", v.labelColor)}>Part budget</div>
          <div className="mt-0.5 text-[22px] font-bold text-[var(--color-text-primary)]">{obj.pct.toFixed(0)}%</div>
        </div>
      </div>

      {/* Mini sparkline */}
      {hasSparkline && (
        <div className="mt-2 overflow-hidden" style={{ height: 32 }}>
          <AreaChart width={300} height={32} data={obj.daily} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`sp_${obj.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={v.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={v.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="spend" stroke={v.color} strokeWidth={1.5} fill={`url(#sp_${obj.key})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </div>
      )}

      {/* CTA */}
      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
        <span>Voir détails</span><ChevronDown size={10} />
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Expanded block (open state)
// ---------------------------------------------------------------------------

function ExpandedBlock({ obj, totalSpend, onClose }: { obj: ObjData; totalSpend: number; onClose: () => void }) {
  const v = VIS[obj.key];
  const Icon = v.icon;
  const containerRef = useRef<HTMLDivElement>(null);
  const chartW = useContainerWidth(containerRef);
  const leftW = Math.floor(chartW * 0.58) - 8;
  const rightW = Math.floor(chartW * 0.42) - 8;
  const hasDaily = obj.daily.length > 3;
  const maxBarSpend = obj.topCampaigns.length > 0 ? Math.max(...obj.topCampaigns.map((c) => c.spend)) : 1;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("overflow-hidden rounded-xl border-l-4 bg-gradient-to-br from-slate-800/60 to-slate-800/30", v.border)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} className={v.text} />
            <span className={cn("text-[13px] font-semibold", v.text)}>{v.label}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{obj.count} campagne{obj.count > 1 ? "s" : ""} · {obj.pct.toFixed(0)}% du budget</span>
          </div>
          <button type="button" onClick={onClose} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]">
            Réduire <ChevronUp size={12} />
          </button>
        </div>

        {/* 5 KPIs */}
        <div className="mt-4 grid grid-cols-5 gap-3">
          {[
            { label: "Dépense", value: formatCurrency(obj.spend) },
            { label: "Campagnes", value: String(obj.count) },
            { label: "Part budget", value: `${obj.pct.toFixed(0)}%` },
            { label: "Impressions", value: obj.daily.length > 0 ? formatCompact(obj.daily.reduce((s, d) => s + d.impressions, 0)) : "—" },
            { label: "Clics", value: obj.daily.length > 0 ? formatCompact(obj.daily.reduce((s, d) => s + d.clicks, 0)) : "—" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg bg-[var(--color-bg-subtle)]/30 p-2.5">
              <div className={cn("text-[9px] font-medium uppercase tracking-wider", v.labelColor)}>{kpi.label}</div>
              <div className="mt-0.5 text-2xl font-bold text-[var(--color-text-primary)]">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div ref={containerRef} className="mt-4 flex gap-4">
          <div className="flex-[3] min-w-0">
            <div className="text-[10px] font-medium text-[var(--color-text-tertiary)] mb-1">Évolution par jour</div>
            {hasDaily ? (
              <AreaChart width={leftW} height={180} data={obj.daily} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                <defs>
                  <linearGradient id={`ex_${obj.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={v.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={v.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="date" tick={AX_TICK} axisLine={false} tickLine={false} interval={Math.floor(obj.daily.length / 6)} />
                <YAxis tick={AX_TICK} axisLine={false} tickLine={false} tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k€` : `${Math.round(val)}€`} />
                <Tooltip content={<Tt fmt={formatCurrency} />} />
                <Area type="monotone" dataKey="spend" stroke={v.color} strokeWidth={2} fill={`url(#ex_${obj.key})`} isAnimationActive={false} />
              </AreaChart>
            ) : (
              <div className="flex h-[180px] items-center justify-center rounded-lg bg-[var(--color-bg-subtle)]/20"><span className="text-[11px] text-[var(--color-text-muted)]">Données insuffisantes</span></div>
            )}
          </div>

          <div className="flex-[2] min-w-0">
            <div className="text-[10px] font-medium text-[var(--color-text-tertiary)] mb-1">Top campagnes</div>
            {obj.topCampaigns.length > 1 ? (
              <div className="flex items-center gap-2">
                <PieChart width={Math.min(rightW * 0.45, 100)} height={140}>
                  <Pie data={obj.topCampaigns} dataKey="spend" cx="50%" cy="50%" innerRadius="50%" outerRadius="85%" paddingAngle={2} stroke="none">
                    {obj.topCampaigns.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                </PieChart>
                <div className="flex flex-col gap-1 min-w-0">
                  {obj.topCampaigns.slice(0, 5).map((c, i) => (
                    <div key={c.fullName} className="flex items-center gap-1.5 text-[9px]">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="truncate text-[var(--color-text-secondary)]" title={c.fullName}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[140px] items-center justify-center rounded-lg bg-[var(--color-bg-subtle)]/20"><span className="text-[11px] text-[var(--color-text-muted)]">—</span></div>
            )}
          </div>
        </div>

        {/* Horizontal bars — top campaigns by spend */}
        {obj.topCampaigns.length > 1 && (
          <div className="mt-4">
            <div className="text-[10px] font-medium text-[var(--color-text-tertiary)] mb-2">Répartition des dépenses</div>
            <div className="space-y-1.5">
              {obj.topCampaigns.map((c, i) => {
                const pct = maxBarSpend > 0 ? (c.spend / maxBarSpend) * 100 : 0;
                return (
                  <div key={c.fullName} className="flex items-center gap-2">
                    <span className="w-36 truncate text-[11px] text-[var(--color-text-secondary)]" title={c.fullName}>{c.name}</span>
                    <div className="flex-1 h-4 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length], opacity: 0.7 }} />
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-[var(--color-text-secondary)] w-16 text-right">{formatCurrency(c.spend)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Props & Main
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

export function ExecutiveSummary({ campaigns, metrics, metricsLoading, prevMetricsLoading, currentMetrics, prevM }: ExecutiveSummaryProps) {
  const [expanded, setExpanded] = useState<CategoryKey | null>(null);
  // Compute totalSpend from daily metrics (date-filtered) with fallback to currentMetrics
  const dailyTotalSpend = useMemo(() => {
    if (!metrics?.daily?.length) return 0;
    return metrics.daily.reduce((s, d) => s + (Number(d.metrics?.spend) || 0), 0);
  }, [metrics]);
  const totalSpend = dailyTotalSpend > 0 ? dailyTotalSpend : (currentMetrics?.spend ?? 0);
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

  const gridCols = objectiveData.length <= 2 ? "md:grid-cols-2" : objectiveData.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  if (metricsLoading || !campaigns) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      </div>
    );
  }

  if (objectiveData.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]"><Wallet size={14} /> Aucune campagne active — métriques globales</div>
        <div className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">{formatCurrency(displayTotal)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global spend bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[var(--color-bg-surface)] px-5 py-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">Dépense totale</div>
          <div className="text-4xl font-bold text-[var(--color-text-primary)]">{formatCurrency(displayTotal)}</div>
        </div>
        {objectiveData.length > 1 && (
          <div className="flex-1 max-w-md">
            <div className="flex h-3 overflow-hidden rounded-full">
              {objectiveData.map(({ key, pct }) => pct >= 1 ? <div key={key} style={{ width: `${pct}%`, backgroundColor: VIS[key].color }} title={`${VIS[key].label} : ${pct.toFixed(0)}%`} /> : null)}
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-[var(--color-text-tertiary)]">
              {objectiveData.map(({ key, spend }) => (
                <span key={key}><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: VIS[key].color }} /> {VIS[key].label} {formatCurrency(spend)}</span>
              ))}
            </div>
          </div>
        )}
        {globalTrend != null && isFinite(globalTrend) && (
          <div className={cn("flex items-center gap-1 text-[13px] font-medium", globalTrend < 0 ? "text-emerald-400" : globalTrend > 0 ? "text-rose-400" : "text-[var(--color-text-secondary)]")}>
            {globalTrend > 1 ? <TrendingUp size={14} /> : globalTrend < -1 ? <TrendingDown size={14} /> : null}
            <span>{globalTrend >= 0 ? "+" : ""}{globalTrend.toFixed(1)}%</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">vs préc.</span>
          </div>
        )}
        {prevMetricsLoading && <Skeleton className="h-5 w-24" />}
      </div>

      {/* Grid of objective blocks */}
      <div className={cn("grid grid-cols-1 gap-4", gridCols)}>
        {objectiveData.map((obj, i) => {
          const isExpanded = expanded === obj.key;
          return (
            <motion.div
              key={obj.key}
              layout
              className={cn(isExpanded && "col-span-full")}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              {isExpanded ? (
                <AnimatePresence>
                  <ExpandedBlock obj={obj} totalSpend={displayTotal} onClose={() => setExpanded(null)} />
                </AnimatePresence>
              ) : (
                <CompactBlock obj={obj} totalSpend={displayTotal} onClick={() => setExpanded(obj.key)} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
