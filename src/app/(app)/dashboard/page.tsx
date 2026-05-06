"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Wallet, Users, Megaphone, Link as LinkIcon, Target,
  AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, ArrowUpDown,
  Search, Clock, X,
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
  { key: "spend", label: "Dépenses", title: "Dépenses globales", color: "#7f996d", format: formatCurrency, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k€` : `${Math.round(v)}€`, aggregate: "sum", totalLabel: "Total" },
  { key: "impressions", label: "Impressions", title: "Impressions globales", color: "#6a9ad6", format: formatCompact, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(Math.round(v)), aggregate: "sum", totalLabel: "Total" },
  { key: "clicks", label: "Clics", title: "Clics globaux", color: "#5cb88e", format: formatCompact, yFormat: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)), aggregate: "sum", totalLabel: "Total" },
  { key: "ctr", label: "CTR", title: "CTR global", color: "#d6a64a", format: (v) => formatPercent(v, 2), yFormat: (v) => `${v.toFixed(1)}%`, aggregate: "ratio", totalLabel: "Moyenne" },
  { key: "cpc", label: "CPC", title: "CPC global", color: "#d96a6a", format: formatCurrency, yFormat: (v) => `${v.toFixed(2)}€`, aggregate: "ratio", totalLabel: "Moyenne" },
  { key: "cpm", label: "CPM", title: "CPM global", color: "#a89bd2", format: formatCurrency, yFormat: (v) => `${v.toFixed(1)}€`, aggregate: "ratio", totalLabel: "Moyenne" },
];

// Active tab pill colors — match each metric's chart series color (Calm Precision palette).
const PILL_ACTIVE: Record<ChartMetricKey, string> = {
  spend:       "bg-[#7f996d] text-white",
  impressions: "bg-[#6a9ad6] text-white",
  clicks:      "bg-[#5cb88e] text-white",
  ctr:         "bg-[#d6a64a] text-white",
  cpc:         "bg-[#d96a6a] text-white",
  cpm:         "bg-[#a89bd2] text-white",
};

// ---------------------------------------------------------------------------
// Donut colors
// ---------------------------------------------------------------------------

const DONUT_COLORS = ["#7f996d", "#5cb88e", "#d6a64a", "#6a9ad6", "#d96a6a", "#a89bd2", "#3d8585", "#c98a3c", "#94ad84", "#b07a9a"];

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

  const [chartMetric, setChartMetric] = useState<ChartMetricKey>("spend");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter clients when one is selected
  const filteredClients = useMemo(() => {
    if (!clients) return undefined;
    if (!selectedClientId) return clients;
    return clients.filter((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  // Fetch metrics for selected or top client (for chart data)
  const topClientMetrics = useMetrics(selectedClientId ?? top10Ids[0] ?? "", dateRange);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = filterRef.current?.querySelector("input");
        input?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Autocomplete suggestions
  const filterSuggestions = useMemo(() => {
    if (!clients || !filterQuery) return [];
    const q = filterQuery.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [clients, filterQuery]);

  // Fetch metrics for selected client or top client
  const metricsClientId = selectedClientId ?? top10Ids[0] ?? "";

  // ── KPIs (filter-aware) ──
  const kpis = useMemo(() => {
    const src = filteredClients;
    if (!src) return [];
    const totalSpend = src.reduce((s, c) => s + (c.totalSpend30d ?? 0), 0);
    const totalImpressions = src.reduce((s, c) => s + (c.totalImpressions30d ?? 0), 0);
    const totalClicks = src.reduce((s, c) => s + (c.totalClicks30d ?? 0), 0);
    const activeClients = src.filter((c) => (c.connectedAccountCount ?? 0) > 0 || (c.platforms?.length ?? 0) > 0).length;
    const totalCampaigns = src.reduce((s, c) => s + (c.activeCampaignsCount ?? 0), 0);
    const totalAccounts = src.reduce((s, c) => s + (c.connectedAccountCount ?? 0), 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return [
      { label: "Dépense totale", value: formatCurrency(totalSpend), icon: Wallet },
      { label: "Clients actifs", value: formatNumber(activeClients), icon: Users },
      { label: "Campagnes actives", value: formatNumber(totalCampaigns), icon: Megaphone },
      { label: "Comptes connectés", value: formatNumber(totalAccounts), icon: LinkIcon },
      { label: "CTR moyen", value: formatPercent(avgCtr, 2), icon: Target },
    ];
  }, [filteredClients]);

  // ── Donuts ──
  const spendDonut = useMemo(() => {
    if (!filteredClients) return [];
    return [...filteredClients].sort((a, b) => (b.totalSpend30d ?? 0) - (a.totalSpend30d ?? 0)).slice(0, 10).map((c) => ({ name: c.name, id: c.id, value: c.totalSpend30d ?? 0 }));
  }, [filteredClients]);

  const platformDonut = useMemo(() => {
    if (!filteredClients) return [];
    const counts = new Map<string, number>();
    for (const c of filteredClients) {
      for (const p of c.platforms ?? []) {
        counts.set(p, (counts.get(p) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredClients]);

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
    if (!filteredClients) return [];
    let list = searchQuery ? filteredClients.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : [...filteredClients];
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
  }, [filteredClients, searchQuery, sortKey, sortDir, showAll]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  // ── Alerts ──
  const alerts = useMemo(() => filteredClients ? buildSmartAlerts(filteredClients) : [], [filteredClients]);

  // ── Recent syncs ──
  const recentClients = useMemo(() => {
    if (!filteredClients) return [];
    return [...filteredClients].filter((c) => (c.connectedAccountCount ?? 0) > 0).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  }, [filteredClients]);

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
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Vue d&apos;ensemble</h1>
          <div className="flex items-center gap-3">
            {/* Client filter */}
            <div className="relative" ref={filterRef}>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" aria-hidden="true" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => { setFilterQuery(e.target.value); setFilterOpen(true); }}
                onFocus={() => filterQuery && setFilterOpen(true)}
                placeholder="Filtrer par client..."
                className="w-56 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-1.5 pl-9 pr-3 text-[12px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-primary-500"
              />
              {filterOpen && filterSuggestions.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-72 overflow-y-auto rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-1 shadow-xl">
                  {filterSuggestions.map((c) => (
                    <button key={c.id} type="button" onClick={() => { setSelectedClientId(c.id); setFilterQuery(""); setFilterOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors hover:bg-[var(--color-bg-elevated)]">
                      <span className="text-[var(--color-text-primary)]">{c.name}</span>
                      {c.sector && <span className="text-[10px] text-[var(--color-text-tertiary)]">{c.sector}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedClient && (
              <button type="button" onClick={() => setSelectedClientId(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/20 px-3 py-1 text-[12px] font-medium text-primary-400 transition-colors hover:bg-primary-500/30">
                {selectedClient.name} <X size={12} />
              </button>
            )}
            <span className="text-[13px] text-[var(--color-text-secondary)]">{formatDateRange(dateRange)}</span>
          </div>
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
            <p className="text-[13px] text-[var(--color-text-secondary)]">Impossible de charger le dashboard</p>
            <button type="button" onClick={() => refetch()} className="mt-3 rounded-lg bg-primary-600 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-primary-500">Réessayer</button>
          </div>
        )}

        {clients && (
          <div className="mt-4 space-y-8">
            {/* ── S1 — KPIs ── */}
            <motion.div {...fadeIn(0)}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {kpis.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex min-h-[100px] flex-col rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[var(--color-text-secondary)]" />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">{label}</span>
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── S2 — Global chart ── */}
            <motion.div {...fadeIn(0.05)}>
              <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Évolution · {activeChartDef.label}</div>
                    <h2 className="mt-1 text-[14px] font-medium text-[var(--color-text-primary)]">{activeChartDef.title}</h2>
                  </div>
                  <div className="flex" style={{ gap: 4 }}>
                    {CHART_METRICS.map((m) => (
                      <button key={m.key} type="button" onClick={() => setChartMetric(m.key)}
                        className={cn("font-medium transition-colors", chartMetric === m.key ? PILL_ACTIVE[m.key] : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]")}
                        style={{ height: 24, padding: "0 8px", fontSize: 11, borderRadius: "var(--radius-xs)", border: "none", background: chartMetric === m.key ? undefined : "transparent" }}
                      >{m.label}</button>
                    ))}
                  </div>
                </div>
                {topClientMetrics.isLoading ? <Skeleton className="mt-4 h-60" /> : chartData.length > 0 ? (
                  <div className="mt-4 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                        <defs><linearGradient id={`dash_${activeChartDef.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={activeChartDef.color} stopOpacity={0.2} /><stop offset="95%" stopColor={activeChartDef.color} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5a5a6e", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, "auto"]} tick={{ fontSize: 11, fill: "#5a5a6e", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={activeChartDef.yFormat} />
                        <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 shadow-xl"><p className="text-[11px] text-[var(--color-text-secondary)]">{label}</p><p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{activeChartDef.format(payload[0].value as number)}</p></div> : null} />
                        <Area type="monotone" dataKey={chartMetric} stroke={activeChartDef.color} strokeWidth={2} fill={`url(#dash_${activeChartDef.key})`} animationDuration={500} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="mt-8 text-center text-[12px] text-[var(--color-text-tertiary)]">Données non disponibles</p>}
                {chartData.length > 0 && !selectedClientId && <p className="mt-2 text-[10px] italic text-[var(--color-text-tertiary)]">Basé sur le client principal</p>}
              </div>
            </motion.div>

            {/* ── S3 — Donuts ── */}
            <motion.div {...fadeIn(0.1)}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Spend donut */}
                <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
                  <h2 className="text-[14px] font-medium text-[var(--color-text-secondary)]">Top 10 — Répartition budget</h2>
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
                        <div className="text-center"><div className="text-lg font-semibold text-[var(--color-text-primary)]">{formatCurrency(totalSpendAll)}</div><div className="text-[10px] text-[var(--color-text-tertiary)]">Total</div></div>
                      </div>
                    </div>
                    <div className="flex w-[45%] flex-col gap-1.5">
                      {spendDonut.slice(0, 7).map((d, i) => (
                        <Link key={d.id} href={`/clients/${d.id}`} className="flex items-center gap-2 text-[11px] hover:text-primary-400">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                          <span className="min-w-0 flex-1 truncate text-[var(--color-text-secondary)]">{d.name}</span>
                          <span className="shrink-0 text-[var(--color-text-tertiary)]">{formatCurrency(d.value)}</span>
                        </Link>
                      ))}
                      {spendDonut.length > 7 && <span className="text-[10px] text-[var(--color-text-tertiary)]">+{spendDonut.length - 7} autres</span>}
                    </div>
                  </div>
                </div>

                {/* Platform donut */}
                <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
                  <h2 className="text-[14px] font-medium text-[var(--color-text-secondary)]">Répartition par plateforme</h2>
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
                        <div className="text-center"><div className="text-lg font-semibold text-[var(--color-text-primary)]">{totalPlatforms}</div><div className="text-[10px] text-[var(--color-text-tertiary)]">comptes</div></div>
                      </div>
                    </div>
                    <div className="flex w-[45%] flex-col gap-1.5">
                      {platformDonut.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2 text-[11px]">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[d.name] ?? DONUT_COLORS[i % DONUT_COLORS.length] }} />
                          <AccountBadge platform={d.name} />
                          <span className="shrink-0 text-[var(--color-text-tertiary)]">{d.value}</span>
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
                <h2 className="text-[14px] font-medium text-[var(--color-text-secondary)]">Tous les clients</h2>
                <div className="relative w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" aria-hidden="true" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-1.5 pl-9 pr-3 text-[12px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-primary-500" />
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[var(--color-bg-subtle)]">
                      <tr>
                        <th scope="col" className="w-10 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">#</th>
                        {([
                          { key: "name" as SortKey, label: "Client" },
                          { key: "spend" as SortKey, label: "Dépense 30j" },
                          { key: "impressions" as SortKey, label: "Impressions" },
                          { key: "clicks" as SortKey, label: "Clics" },
                          { key: "ctr" as SortKey, label: "CTR" },
                          { key: "campaigns" as SortKey, label: "Campagnes" },
                        ]).map(({ key, label }) => (
                          <th key={key} scope="col" onClick={() => toggleSort(key)} className="cursor-pointer select-none px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                            <span className="inline-flex items-center gap-1">{label}{sortKey === key ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}</span>
                          </th>
                        ))}
                        <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Plateformes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedClients.map((c, i) => {
                        const imp = c.totalImpressions30d ?? 0;
                        const clk = c.totalClicks30d ?? 0;
                        const ctr = imp > 0 ? (clk / imp) * 100 : 0;
                        return (
                          <tr key={c.id} className="border-t border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-bg-elevated)]">
                            <td className="px-4 py-3 text-[12px] text-[var(--color-text-tertiary)]">{i + 1}</td>
                            <td className="px-4 py-3"><Link href={`/clients/${c.id}`} className="text-[var(--color-text-primary)] hover:text-primary-400">{c.name}</Link></td>
                            <td className="px-4 py-3 font-mono text-[var(--color-text-primary)]">{formatCurrency(c.totalSpend30d ?? 0)}</td>
                            <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatCompact(imp)}</td>
                            <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatCompact(clk)}</td>
                            <td className="px-4 py-3 text-[var(--color-text-secondary)]">{imp > 0 ? formatPercent(ctr, 2) : "—"}</td>
                            <td className="px-4 py-3 text-[var(--color-text-secondary)]">{c.activeCampaignsCount ?? 0}</td>
                            <td className="px-4 py-3"><div className="flex gap-1">{(c.platforms ?? []).map((p) => <AccountBadge key={p} platform={p} />)}</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {clients.length > 10 && !showAll && (
                  <button type="button" onClick={() => setShowAll(true)} className="w-full border-t border-[var(--color-border-subtle)] py-3 text-center text-[12px] text-primary-400 transition-colors hover:bg-[var(--color-bg-elevated)]">
                    Voir les {clients.length} clients
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── S5 — Alerts ── */}
            <motion.div {...fadeIn(0.2)}>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-medium text-[var(--color-text-secondary)]">Alertes</h2>
                {alerts.length > 0 && <span className="rounded-full bg-danger-500/10 px-2 py-0.5 text-[11px] font-medium text-danger-400">{alerts.length}</span>}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {alerts.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-6">
                    <span className="text-[13px] text-[var(--color-text-secondary)]">Aucune alerte — tout est opérationnel</span>
                  </div>
                ) : (
                  <>
                    {alerts.slice(0, 10).map((a, i) => {
                      const style = ALERT_STYLES[a.severity];
                      const Icon = a.icon;
                      return (
                        <Link key={i} href={`/clients/${a.clientId}`} role="alert" className={cn("flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 transition-colors hover:brightness-110", style.border, style.bg)}>
                          <Icon size={16} className={style.icon} />
                          <span className="text-[12px] text-[var(--color-text-secondary)]">{a.message}</span>
                        </Link>
                      );
                    })}
                    {alerts.length > 10 && <p className="text-center text-[11px] text-[var(--color-text-tertiary)]">+{alerts.length - 10} autres alertes</p>}
                  </>
                )}
              </div>
            </motion.div>

            {/* ── S6 — Recent syncs ── */}
            <motion.div {...fadeIn(0.25)}>
              <h2 className="text-[14px] font-medium text-[var(--color-text-secondary)]">Dernières synchronisations</h2>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {recentClients.map((c) => (
                  <Link key={c.id} href={`/clients/${c.id}`} className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 transition-colors hover:border-primary-500/40">
                    {(c.platforms ?? []).slice(0, 1).map((p) => <AccountBadge key={p} platform={p} />)}
                    <span className="text-[12px] text-[var(--color-text-primary)]">{c.name}</span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">{timeAgo(c.updatedAt)}</span>
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
