"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Wallet, Users, Megaphone, Link as LinkIcon, Target,
  AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, ArrowUpDown,
  Search, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { TopBar } from "@/components/layout/TopBar";
import { AccountBadge } from "@/components/clients/AccountBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { useAppStore } from "@/lib/stores/app-store";
import { formatCurrency, formatNumber, formatCompact, formatPercent } from "@/lib/utils/format";
import { formatDateRange, formatDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { ClientSummary } from "@/lib/types";

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

// ---------------------------------------------------------------------------
// Chart metric selector (reused pattern from client dashboard)
// ---------------------------------------------------------------------------

type ChartMetricKey = "spend" | "impressions" | "clicks" | "ctr" | "cpc" | "cpm";

interface ChartMetricDef {
  key: ChartMetricKey;
  label: string;
  title: string;
  color: string;
  format: (v: number) => string;
  yFormat: (v: number) => string;
  aggregate: "sum" | "ratio";
  totalLabel: string;
}

const CHART_METRICS: ChartMetricDef[] = [
  { key: "spend", label: "Dépenses", title: "Dépenses globales", color: "#818cf8", format: formatCurrency, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k€` : `${Math.round(v)}€`, aggregate: "sum", totalLabel: "Total" },
  { key: "impressions", label: "Impressions", title: "Impressions globales", color: "#60a5fa", format: formatCompact, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(Math.round(v)), aggregate: "sum", totalLabel: "Total" },
  { key: "clicks", label: "Clics", title: "Clics globaux", color: "#34d399", format: formatCompact, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)), aggregate: "sum", totalLabel: "Total" },
  { key: "ctr", label: "CTR", title: "CTR global", color: "#fbbf24", format: (v) => formatPercent(v, 2), yFormat: (v) => `${v.toFixed(1)}%`, aggregate: "ratio", totalLabel: "Moyenne" },
  { key: "cpc", label: "CPC", title: "CPC global", color: "#fb7185", format: formatCurrency, yFormat: (v) => `${v.toFixed(2)}€`, aggregate: "ratio", totalLabel: "Moyenne" },
  { key: "cpm", label: "CPM", title: "CPM global", color: "#a78bfa", format: formatCurrency, yFormat: (v) => `${v.toFixed(1)}€`, aggregate: "ratio", totalLabel: "Moyenne" },
];

const PILL_ACTIVE: Record<ChartMetricKey, string> = {
  spend: "bg-indigo-500 text-white", impressions: "bg-blue-500 text-white", clicks: "bg-emerald-500 text-white",
  ctr: "bg-amber-500 text-white", cpc: "bg-rose-500 text-white", cpm: "bg-purple-500 text-white",
};

// ---------------------------------------------------------------------------
// Donut colors
// ---------------------------------------------------------------------------

const DONUT_COLORS = ["#818cf8", "#34d399", "#fbbf24", "#60a5fa", "#fb7185", "#a78bfa", "#2dd4bf", "#22d3ee", "#f97316", "#f472b6"];

const PLATFORM_COLORS: Record<string, string> = {
  META: "#1877F2", META_ADS: "#1877F2", FACEBOOK: "#1877F2", FACEBOOK_PAGE: "#1877F2",
  INSTAGRAM: "#E84393", INSTAGRAM_ADS: "#E84393",
  GOOGLE: "#EA4335", GOOGLE_ADS: "#EA4335",
  LINKEDIN: "#0A66C2", LINKEDIN_ADS: "#0A66C2",
  TIKTOK: "#E84393", TIKTOK_ADS: "#E84393",
  SNAPCHAT: "#FFFC00",
};

// ---------------------------------------------------------------------------
// Alert builder
// ---------------------------------------------------------------------------

interface SmartAlert {
  severity: "danger" | "warning" | "info";
  icon: typeof AlertTriangle;
  message: string;
  clientId: string;
  clientName: string;
}

function buildSmartAlerts(clients: ClientSummary[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = Date.now();

  for (const c of clients) {
    const spend = c.totalSpend30d ?? 0;
    const campaigns = c.activeCampaignsCount ?? 0;
    const accounts = c.connectedAccountCount ?? 0;
    const impressions = c.totalImpressions30d ?? 0;
    const clicks = c.totalClicks30d ?? 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const hoursAgo = (now - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60);

    // Critical: campaigns but no spend
    if (campaigns > 0 && spend === 0) {
      alerts.push({ severity: "danger", icon: AlertTriangle, message: `${c.name} — ${campaigns} campagne(s) active(s) mais 0 € de dépense`, clientId: c.id, clientName: c.name });
    }

    // Warning: very low CTR
    if (spend > 50 && ctr > 0 && ctr < 0.5) {
      alerts.push({ severity: "warning", icon: AlertCircle, message: `${c.name} — CTR très bas (${formatPercent(ctr, 2)})`, clientId: c.id, clientName: c.name });
    }

    // Warning: no sync > 24h
    if (hoursAgo > 24 && accounts > 0) {
      alerts.push({ severity: "warning", icon: Clock, message: `${c.name} — dernière sync il y a ${Math.floor(hoursAgo)}h`, clientId: c.id, clientName: c.name });
    }

    // Info: good results
    if (ctr > 3 && spend > 100) {
      alerts.push({ severity: "info", icon: Info, message: `${c.name} — excellentes performances (CTR ${formatPercent(ctr, 2)})`, clientId: c.id, clientName: c.name });
    }
  }

  // Sort by severity
  const order = { danger: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

const ALERT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  danger: { border: "border-l-rose-500", bg: "bg-rose-950/20", icon: "text-rose-400" },
  warning: { border: "border-l-amber-500", bg: "bg-amber-950/20", icon: "text-amber-400" },
  info: { border: "border-l-emerald-500", bg: "bg-emerald-950/20", icon: "text-emerald-400" },
};

// ---------------------------------------------------------------------------
// Table sort
// ---------------------------------------------------------------------------

type SortKey = "name" | "spend" | "impressions" | "clicks" | "ctr" | "campaigns";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const dateRange = useAppStore((s) => s.dateRange);
  const { data: clients, isLoading, isError, refetch } = useWorkspaces();

  // Global metrics from top 10 clients
  const top10Ids = useMemo(() => {
    if (!clients) return [];
    return [...clients].sort((a, b) => (b.totalSpend30d ?? 0) - (a.totalSpend30d ?? 0)).slice(0, 10).map((c) => c.id);
  }, [clients]);

  // Fetch metrics for top client (for chart data)
  const topClientMetrics = useMetrics(top10Ids[0] ?? "", dateRange);

  const [chartMetric, setChartMetric] = useState<ChartMetricKey>("spend");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // ── KPIs ──
  const kpis = useMemo(() => {
    if (!clients) return [];
    const totalSpend = clients.reduce((s, c) => s + (c.totalSpend30d ?? 0), 0);
    const totalImpressions = clients.reduce((s, c) => s + (c.totalImpressions30d ?? 0), 0);
    const totalClicks = clients.reduce((s, c) => s + (c.totalClicks30d ?? 0), 0);
    const activeClients = clients.filter((c) => (c.connectedAccountCount ?? 0) > 0 || (c.platforms?.length ?? 0) > 0).length;
    const totalCampaigns = clients.reduce((s, c) => s + (c.activeCampaignsCount ?? 0), 0);
    const totalAccounts = clients.reduce((s, c) => s + (c.connectedAccountCount ?? 0), 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return [
      { label: "Dépense totale", value: formatCurrency(totalSpend), icon: Wallet },
      { label: "Clients actifs", value: formatNumber(activeClients), icon: Users },
      { label: "Campagnes actives", value: formatNumber(totalCampaigns), icon: Megaphone },
      { label: "Comptes connectés", value: formatNumber(totalAccounts), icon: LinkIcon },
      { label: "CTR moyen", value: formatPercent(avgCtr, 2), icon: Target },
    ];
  }, [clients]);

  // ── Donuts ──
  const spendDonut = useMemo(() => {
    if (!clients) return [];
    return [...clients].sort((a, b) => (b.totalSpend30d ?? 0) - (a.totalSpend30d ?? 0)).slice(0, 10).map((c) => ({ name: c.name, id: c.id, value: c.totalSpend30d ?? 0 }));
  }, [clients]);

  const platformDonut = useMemo(() => {
    if (!clients) return [];
    const counts = new Map<string, number>();
    for (const c of clients) {
      for (const p of c.platforms ?? []) {
        counts.set(p, (counts.get(p) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [clients]);

  const totalSpendAll = spendDonut.reduce((s, d) => s + d.value, 0);
  const totalPlatforms = platformDonut.reduce((s, d) => s + d.value, 0);

  // ── Chart ──
  const chartData = useMemo(() => {
    if (!topClientMetrics.data?.daily?.length) return [];
    return topClientMetrics.data.daily.filter((d) => d.date).sort((a, b) => a.date.localeCompare(b.date)).map((d) => {
      const m = d.metrics ?? {};
      const spend = Number(m.spend) || 0;
      const impressions = Number(m.impressions) || 0;
      const clicks = Number(m.clicks) || 0;
      return { date: formatDate(d.date, "short"), spend, impressions, clicks, ctr: impressions > 0 ? (clicks / impressions) * 100 : 0, cpc: clicks > 0 ? spend / clicks : 0, cpm: impressions > 0 ? (spend / impressions) * 1000 : 0 };
    });
  }, [topClientMetrics.data]);

  const activeChartDef = CHART_METRICS.find((m) => m.key === chartMetric) ?? CHART_METRICS[0];

  // ── Sorted table ──
  const sortedClients = useMemo(() => {
    if (!clients) return [];
    let list = searchQuery ? clients.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : [...clients];
    list.sort((a, b) => {
      let cmp = 0;
      const aSpend = a.totalSpend30d ?? 0, bSpend = b.totalSpend30d ?? 0;
      const aImp = a.totalImpressions30d ?? 0, bImp = b.totalImpressions30d ?? 0;
      const aClk = a.totalClicks30d ?? 0, bClk = b.totalClicks30d ?? 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "spend": cmp = aSpend - bSpend; break;
        case "impressions": cmp = aImp - bImp; break;
        case "clicks": cmp = aClk - bClk; break;
        case "ctr": cmp = (aImp > 0 ? aClk / aImp : 0) - (bImp > 0 ? bClk / bImp : 0); break;
        case "campaigns": cmp = (a.activeCampaignsCount ?? 0) - (b.activeCampaignsCount ?? 0); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return showAll ? list : list.slice(0, 10);
  }, [clients, searchQuery, sortKey, sortDir, showAll]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  // ── Alerts ──
  const alerts = useMemo(() => clients ? buildSmartAlerts(clients) : [], [clients]);

  // ── Recent syncs ──
  const recentClients = useMemo(() => {
    if (!clients) return [];
    return [...clients].filter((c) => (c.connectedAccountCount ?? 0) > 0).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  }, [clients]);

  function timeAgo(dateStr: string): string {
    const h = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (h < 1) return `il y a ${Math.max(1, Math.floor(h * 60))} min`;
    if (h < 24) return `il y a ${Math.floor(h)}h`;
    return `il y a ${Math.floor(h / 24)}j`;
  }

  // ── Render ──
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold text-slate-100">Vue d&apos;ensemble</h1>
          <span className="text-[13px] text-slate-400">{formatDateRange(dateRange)}</span>
        </div>

        {isLoading && (
          <div className="mt-4 space-y-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
            <Skeleton className="h-64" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
            <Skeleton className="h-64" />
          </div>
        )}

        {isError && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-[13px] text-slate-400">Impossible de charger le dashboard</p>
            <button type="button" onClick={() => refetch()} className="mt-3 rounded-lg bg-primary-600 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-primary-500">Réessayer</button>
          </div>
        )}

        {clients && (
          <div className="mt-4 space-y-8">
            {/* ── S1 — KPIs ── */}
            <motion.div {...fadeIn(0)}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {kpis.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex min-h-[100px] flex-col rounded-xl border border-slate-700/50 bg-slate-800 p-4">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-slate-400" />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</span>
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-50">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── S2 — Global chart ── */}
            <motion.div {...fadeIn(0.05)}>
              <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[14px] font-medium text-slate-300">{activeChartDef.title}</h2>
                  <div className="flex gap-1.5">
                    {CHART_METRICS.map((m) => (
                      <button key={m.key} type="button" onClick={() => setChartMetric(m.key)} className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors", chartMetric === m.key ? PILL_ACTIVE[m.key] : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>{m.label}</button>
                    ))}
                  </div>
                </div>
                {topClientMetrics.isLoading ? <Skeleton className="mt-4 h-60" /> : chartData.length > 0 ? (
                  <div className="mt-4 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                        <defs><linearGradient id={`dash_${activeChartDef.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={activeChartDef.color} stopOpacity={0.2} /><stop offset="95%" stopColor={activeChartDef.color} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                        <YAxis domain={[0, "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={activeChartDef.yFormat} />
                        <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 shadow-xl"><p className="text-[11px] text-slate-400">{label}</p><p className="text-[14px] font-semibold text-slate-50">{activeChartDef.format(payload[0].value as number)}</p></div> : null} />
                        <Area type="monotone" dataKey={chartMetric} stroke={activeChartDef.color} strokeWidth={2} fill={`url(#dash_${activeChartDef.key})`} animationDuration={500} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="mt-8 text-center text-[12px] text-slate-500">Données non disponibles</p>}
                {chartData.length > 0 && <p className="mt-2 text-[10px] italic text-slate-500">Basé sur le client principal</p>}
              </div>
            </motion.div>

            {/* ── S3 — Donuts ── */}
            <motion.div {...fadeIn(0.1)}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Spend donut */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
                  <h2 className="text-[14px] font-medium text-slate-300">Top 10 — Répartition budget</h2>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative w-[55%]">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={spendDonut} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none">
                            {spendDonut.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} cursor="pointer" onClick={() => router.push(`/clients/${spendDonut[i].id}`)} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="text-center"><div className="text-lg font-semibold text-slate-50">{formatCurrency(totalSpendAll)}</div><div className="text-[10px] text-slate-500">Total</div></div>
                      </div>
                    </div>
                    <div className="flex w-[45%] flex-col gap-1.5">
                      {spendDonut.slice(0, 7).map((d, i) => (
                        <Link key={d.id} href={`/clients/${d.id}`} className="flex items-center gap-2 text-[11px] hover:text-primary-400">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                          <span className="min-w-0 flex-1 truncate text-slate-300">{d.name}</span>
                          <span className="shrink-0 text-slate-500">{formatCurrency(d.value)}</span>
                        </Link>
                      ))}
                      {spendDonut.length > 7 && <span className="text-[10px] text-slate-500">+{spendDonut.length - 7} autres</span>}
                    </div>
                  </div>
                </div>

                {/* Platform donut */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-5">
                  <h2 className="text-[14px] font-medium text-slate-300">Répartition par plateforme</h2>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative w-[55%]">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={platformDonut} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none">
                            {platformDonut.map((d, i) => <Cell key={d.name} fill={PLATFORM_COLORS[d.name] ?? DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="text-center"><div className="text-lg font-semibold text-slate-50">{totalPlatforms}</div><div className="text-[10px] text-slate-500">comptes</div></div>
                      </div>
                    </div>
                    <div className="flex w-[45%] flex-col gap-1.5">
                      {platformDonut.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2 text-[11px]">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[d.name] ?? DONUT_COLORS[i % DONUT_COLORS.length] }} />
                          <AccountBadge platform={d.name} />
                          <span className="shrink-0 text-slate-500">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── S4 — Client table ── */}
            <motion.div {...fadeIn(0.15)}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[14px] font-medium text-slate-300">Tous les clients</h2>
                <div className="relative w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-9 pr-3 text-[12px] text-slate-50 outline-none placeholder:text-slate-500 focus:border-primary-500" />
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th scope="col" className="w-10 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">#</th>
                        {([
                          { key: "name" as SortKey, label: "Client" },
                          { key: "spend" as SortKey, label: "Dépense 30j" },
                          { key: "impressions" as SortKey, label: "Impressions" },
                          { key: "clicks" as SortKey, label: "Clics" },
                          { key: "ctr" as SortKey, label: "CTR" },
                          { key: "campaigns" as SortKey, label: "Campagnes" },
                        ]).map(({ key, label }) => (
                          <th key={key} scope="col" onClick={() => toggleSort(key)} className="cursor-pointer select-none px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400 hover:text-slate-200">
                            <span className="inline-flex items-center gap-1">{label}{sortKey === key ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}</span>
                          </th>
                        ))}
                        <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">Plateformes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedClients.map((c, i) => {
                        const imp = c.totalImpressions30d ?? 0;
                        const clk = c.totalClicks30d ?? 0;
                        const ctr = imp > 0 ? (clk / imp) * 100 : 0;
                        return (
                          <tr key={c.id} className="border-t border-slate-700/30 transition-colors hover:bg-slate-700/20">
                            <td className="px-4 py-3 text-[12px] text-slate-500">{i + 1}</td>
                            <td className="px-4 py-3"><Link href={`/clients/${c.id}`} className="text-slate-200 hover:text-primary-400">{c.name}</Link></td>
                            <td className="px-4 py-3 font-mono text-slate-200">{formatCurrency(c.totalSpend30d ?? 0)}</td>
                            <td className="px-4 py-3 text-slate-300">{formatCompact(imp)}</td>
                            <td className="px-4 py-3 text-slate-300">{formatCompact(clk)}</td>
                            <td className="px-4 py-3 text-slate-300">{imp > 0 ? formatPercent(ctr, 2) : "—"}</td>
                            <td className="px-4 py-3 text-slate-300">{c.activeCampaignsCount ?? 0}</td>
                            <td className="px-4 py-3"><div className="flex gap-1">{(c.platforms ?? []).map((p) => <AccountBadge key={p} platform={p} />)}</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {clients.length > 10 && !showAll && (
                  <button type="button" onClick={() => setShowAll(true)} className="w-full border-t border-slate-700/30 py-3 text-center text-[12px] text-primary-400 transition-colors hover:bg-slate-700/20">
                    Voir les {clients.length} clients
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── S5 — Alerts ── */}
            <motion.div {...fadeIn(0.2)}>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-medium text-slate-300">Alertes</h2>
                {alerts.length > 0 && <span className="rounded-full bg-danger-500/10 px-2 py-0.5 text-[11px] font-medium text-danger-400">{alerts.length}</span>}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {alerts.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800 px-4 py-6">
                    <span className="text-[13px] text-slate-400">Aucune alerte — tout est opérationnel</span>
                  </div>
                ) : (
                  <>
                    {alerts.slice(0, 10).map((a, i) => {
                      const style = ALERT_STYLES[a.severity];
                      const Icon = a.icon;
                      return (
                        <Link key={i} href={`/clients/${a.clientId}`} role="alert" className={cn("flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 transition-colors hover:brightness-110", style.border, style.bg)}>
                          <Icon size={16} className={style.icon} />
                          <span className="text-[12px] text-slate-300">{a.message}</span>
                        </Link>
                      );
                    })}
                    {alerts.length > 10 && <p className="text-center text-[11px] text-slate-500">+{alerts.length - 10} autres alertes</p>}
                  </>
                )}
              </div>
            </motion.div>

            {/* ── S6 — Recent syncs ── */}
            <motion.div {...fadeIn(0.25)}>
              <h2 className="text-[14px] font-medium text-slate-300">Dernières synchronisations</h2>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {recentClients.map((c) => (
                  <Link key={c.id} href={`/clients/${c.id}`} className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 transition-colors hover:border-primary-500/40">
                    {(c.platforms ?? []).slice(0, 1).map((p) => <AccountBadge key={p} platform={p} />)}
                    <span className="text-[12px] text-slate-200">{c.name}</span>
                    <span className="text-[10px] text-slate-500">{timeAgo(c.updatedAt)}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating chat button */}
      <motion.button
        type="button"
        onClick={() => router.push("/chat")}
        aria-label="Ouvrir le chat IA"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
}
