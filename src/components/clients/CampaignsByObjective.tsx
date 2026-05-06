"use client";

import { useState, useMemo } from "react";
import {
  Target,
  MousePointerClick,
  Megaphone,
  Heart,
  ShoppingCart,
  Layers,
  Film,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
} from "recharts";
import type { Campaign } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { cleanCampaignName } from "@/lib/utils/campaign-name";
import { type CategoryKey, getObjectiveConfig, formatKpi, refineCategory } from "@/lib/utils/objective-metrics";
import { CampaignDrilldown } from "./CampaignDrilldown";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Objective categories
// ---------------------------------------------------------------------------

interface CategoryDef {
  key: CategoryKey;
  label: string;
  emoji: string;
  icon: typeof Target;
  border: string;
  bg: string;
  text: string;
  objectives: string[];
}

const CATEGORIES: CategoryDef[] = [
  { key: "leads", label: "Génération de leads", emoji: "🎯", icon: Target, border: "border-l-emerald-500", bg: "bg-emerald-500/5", text: "text-emerald-400", objectives: ["OUTCOME_LEADS", "LEAD_GENERATION", "CONVERSIONS"] },
  { key: "traffic", label: "Trafic", emoji: "🔗", icon: MousePointerClick, border: "border-l-blue-500", bg: "bg-blue-500/5", text: "text-blue-400", objectives: ["OUTCOME_TRAFFIC", "LINK_CLICKS"] },
  { key: "awareness", label: "Notoriété", emoji: "📢", icon: Megaphone, border: "border-l-purple-500", bg: "bg-purple-500/5", text: "text-purple-400", objectives: ["OUTCOME_AWARENESS", "BRAND_AWARENESS", "REACH"] },
  { key: "engagement", label: "Engagement", emoji: "💬", icon: Heart, border: "border-l-amber-500", bg: "bg-amber-500/5", text: "text-amber-400", objectives: ["OUTCOME_ENGAGEMENT", "POST_ENGAGEMENT"] },
  { key: "video", label: "Vues vidéo", emoji: "🎬", icon: Film, border: "border-l-violet-500", bg: "bg-violet-500/5", text: "text-violet-400", objectives: ["VIDEO_VIEWS"] },
  { key: "sales", label: "Ventes", emoji: "🛒", icon: ShoppingCart, border: "border-l-rose-500", bg: "bg-rose-500/5", text: "text-rose-400", objectives: ["OUTCOME_SALES"] },
  { key: "messages", label: "Messages", emoji: "💬", icon: MessageCircle, border: "border-l-cyan-500", bg: "bg-cyan-500/5", text: "text-cyan-400", objectives: ["MESSAGES"] },
  { key: "other", label: "Autre", emoji: "📊", icon: Layers, border: "border-l-slate-500", bg: "bg-slate-500/5", text: "text-[var(--color-text-secondary)]", objectives: [] },
];

const NAME_PATTERNS: { pattern: RegExp; key: CategoryKey }[] = [
  { pattern: /lead|leadgen|conversion/i, key: "leads" },
  { pattern: /trafic|traffic/i, key: "traffic" },
  { pattern: /notoriet|notoriété|awareness|brand|reach|couverture/i, key: "awareness" },
  { pattern: /video|vidéo|vue/i, key: "video" },
  { pattern: /engagement/i, key: "engagement" },
  { pattern: /message/i, key: "messages" },
  { pattern: /vente|sale|purchase|catalog/i, key: "sales" },
];

function getCategory(objective: string | null, name?: string): CategoryDef {
  const other = CATEGORIES[CATEGORIES.length - 1];
  if (objective) {
    const match = CATEGORIES.find((c) => c.objectives.includes(objective.toUpperCase()));
    if (match) return match;
  }
  if (name) {
    for (const { pattern, key } of NAME_PATTERNS) {
      if (pattern.test(name)) return CATEGORIES.find((c) => c.key === key) ?? other;
    }
  }
  return other;
}

// ---------------------------------------------------------------------------
// Status badges
// ---------------------------------------------------------------------------

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAUSED: "bg-amber-500/10 text-amber-400",
  DELETED: "bg-slate-500/10 text-[var(--color-text-secondary)]",
  ARCHIVED: "bg-slate-500/10 text-[var(--color-text-secondary)]",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CampaignFilter = "all" | "ACTIVE" | "PAUSED";

interface CampaignsByObjectiveProps {
  campaigns: Campaign[] | undefined;
  loading: boolean;
  workspaceId: string;
  startDate?: string;
  endDate?: string;
}

// ---------------------------------------------------------------------------
// ObjectiveBlock
// ---------------------------------------------------------------------------

function ObjectiveBlock({
  category,
  campaigns,
  index,
  showArchived,
  workspaceId,
  startDate,
  endDate,
  openDrilldownId,
  onToggleDrilldown,
  isExpanded,
  onToggleExpand,
  maxCampaignsCompact,
}: {
  category: CategoryDef;
  campaigns: Campaign[];
  index: number;
  showArchived: boolean;
  workspaceId: string;
  startDate?: string;
  endDate?: string;
  openDrilldownId: string | null;
  onToggleDrilldown: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  maxCampaignsCompact: number;
}) {
  const [showComparison, setShowComparison] = useState(false);
  const config = getObjectiveConfig(category.key);

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const pausedCount = campaigns.filter((c) => c.status === "PAUSED").length;
  const totalSpend = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0);

  // Spend distribution data for stacked bar
  const spendBarData = useMemo(() => {
    return campaigns
      .filter((c) => (c.budget ?? 0) > 0)
      .sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0))
      .slice(0, 12);
  }, [campaigns]);

  // Comparison chart data
  const comparisonData = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "ACTIVE" && (c.budget ?? 0) > 0);
    return active.sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0)).slice(0, 8).map((c) => ({
      name: c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name,
      fullName: c.name,
      budget: c.budget ?? 0,
    }));
  }, [campaigns]);

  const visibleCampaigns = useMemo(() => {
    const filtered = showArchived
      ? campaigns
      : campaigns.filter((c) => c.status !== "DELETED" && c.status !== "ARCHIVED");
    return [...filtered].sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
  }, [campaigns, showArchived]);

  // Mini KPIs: use objective config for labels but campaign-level data
  const miniKpis = [
    { label: "Campagnes", value: String(campaigns.length) },
    { label: "Actives", value: String(activeCount) },
    { label: "Budget total", value: formatCurrency(totalSpend) },
    { label: config.primaryKpiLabel, value: "—" }, // Will show real values when we have aggregated metrics
  ];

  const compactCampaigns = visibleCampaigns.slice(0, maxCampaignsCompact);
  const hiddenCount = visibleCampaigns.length - compactCampaigns.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn("overflow-hidden rounded-xl border-l-[3px] bg-[var(--color-bg-surface)]", category.border)}
    >
      {/* Header — always visible, clickable */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-bg-elevated)]/10"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{category.emoji}</span>
          <div>
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{category.label}</span>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-text-primary)]0">
              {activeCount > 0 && <span className="text-emerald-400">{activeCount} active{activeCount > 1 ? "s" : ""}</span>}
              {activeCount > 0 && pausedCount > 0 && <span>·</span>}
              {pausedCount > 0 && <span className="text-amber-400">{pausedCount} en pause</span>}
              {activeCount === 0 && pausedCount === 0 && <span>Aucune active</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--color-text-secondary)]">{formatCurrency(totalSpend)}</span>
          {isExpanded ? <ChevronUp size={14} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--color-text-secondary)]" />}
        </div>
      </button>

      {/* Compact: mini KPIs + top campaigns */}
      {!isExpanded && (
        <div className="border-t border-[var(--color-border-subtle)] px-5 pb-4 pt-3">
          <div className="grid grid-cols-3 gap-2">
            {miniKpis.slice(0, 3).map((kpi) => (
              <div key={kpi.label} className={cn("rounded-lg p-2", category.bg)}>
                <div className="text-[9px] font-medium uppercase tracking-wider text-[var(--color-text-primary)]0">{kpi.label}</div>
                <div className={cn("mt-0.5 text-[14px] font-semibold", category.text)}>{kpi.value}</div>
              </div>
            ))}
          </div>
          {compactCampaigns.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {compactCampaigns.map((c) => (
                <div key={c.id} className={cn("flex items-center gap-2 rounded px-2 py-1 text-[11px]", c.status === "PAUSED" && "opacity-50")}>
                  <span className="min-w-0 flex-1 truncate text-[var(--color-text-secondary)]" title={c.name}>{cleanCampaignName(c.name)}</span>
                  <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium", STATUS_BADGES[c.status] ?? "bg-slate-500/10 text-[var(--color-text-secondary)]")}>{c.status}</span>
                </div>
              ))}
              {hiddenCount > 0 && (
                <button type="button" onClick={onToggleExpand} className="w-full pt-1 text-center text-[10px] text-primary-400 hover:underline">
                  +{hiddenCount} autres campagnes
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expanded: full content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-[var(--color-border-subtle)]">
          <div className="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-4">
            {miniKpis.map((kpi) => (
              <div key={kpi.label} className={cn("rounded-lg p-3", category.bg)}>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-primary)]0">{kpi.label}</div>
                <div className={cn("mt-1 text-[16px] font-semibold", category.text)}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Spend distribution bar */}
          {spendBarData.length > 1 && totalSpend > 0 && (
            <div className="px-6 pb-3">
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-primary)]0 mb-1.5">
                <span>Répartition budget</span>
                {activeCount > 1 && (
                  <button type="button" onClick={() => setShowComparison((s) => !s)} className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors", showComparison ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]" : "text-[var(--color-text-primary)]0 hover:text-[var(--color-text-secondary)]")} disabled={comparisonData.length < 2}>
                    <BarChart3 size={10} /> Comparer
                  </button>
                )}
              </div>
              <div className="flex h-5 overflow-hidden rounded-full" title={`Budget total : ${formatCurrency(totalSpend)}`}>
                {spendBarData.map((c, i) => {
                  const pct = ((c.budget ?? 0) / totalSpend) * 100;
                  if (pct < 1) return null;
                  return (
                    <div key={c.id} className="relative transition-all hover:brightness-125" style={{ width: `${pct}%`, backgroundColor: `hsl(${category.key === "leads" ? 152 : category.key === "traffic" ? 217 : category.key === "awareness" ? 270 : category.key === "engagement" ? 43 : category.key === "sales" ? 350 : 215}, ${60 - i * 4}%, ${45 + i * 3}%)` }} title={`${c.name}: ${formatCurrency(c.budget ?? 0)}`} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison chart */}
          {showComparison && comparisonData.length >= 2 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-[var(--color-border-subtle)] px-6 py-4">
              <div className="h-48 overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5a5a6e", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a5a6e", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${Math.round(v)}€`} />
                    <RechartsTooltip content={({ active, payload }) => active && payload?.length ? <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 shadow-xl text-[11px]"><p className="text-[var(--color-text-primary)]">{(payload[0].payload as { fullName: string }).fullName}</p><p className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(payload[0].value as number)}</p></div> : null} />
                    <Bar dataKey="budget" radius={[4, 4, 0, 0]} fill={category.key === "leads" ? "#5cb88e" : category.key === "traffic" ? "#6a9ad6" : category.key === "awareness" ? "#a89bd2" : category.key === "engagement" ? "#d6a64a" : category.key === "sales" ? "#d96a6a" : "#5a5a6e"} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          <div className="px-6 pb-4">
            {visibleCampaigns.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-[var(--color-text-primary)]0">Aucune campagne visible</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
                {visibleCampaigns.map((c, i) => {
                  const isOpen = openDrilldownId === c.id;
                  return (
                    <div key={c.id}>
                      <button
                        type="button"
                        onClick={() => onToggleDrilldown(c.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[var(--color-bg-elevated)]",
                          i > 0 && "border-t border-[var(--color-border-default)]/20",
                          c.status === "PAUSED" && "opacity-60",
                          (c.status === "DELETED" || c.status === "ARCHIVED") && "opacity-40",
                          isOpen && "bg-[var(--color-bg-elevated)]",
                        )}
                      >
                        <ChevronRight size={14} className={cn("shrink-0 text-[var(--color-text-primary)]0 transition-transform duration-200", isOpen && "rotate-90")} />
                        <span className="min-w-0 flex-1 truncate text-[var(--color-text-primary)]" title={c.name}>{cleanCampaignName(c.name)}</span>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_BADGES[c.status] ?? "bg-slate-500/10 text-[var(--color-text-secondary)]")}>
                          {c.status}
                        </span>
                        {c.budget != null && isFinite(c.budget) && (
                          <span className="shrink-0 text-[12px] text-[var(--color-text-secondary)]">
                            {formatCurrency(c.budget)}
                            {c.budgetType === "DAILY" && <span className="ml-0.5 text-[10px] text-[var(--color-text-muted)]">/j</span>}
                          </span>
                        )}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <CampaignDrilldown
                            workspaceId={workspaceId}
                            campaignId={c.id}
                            categoryKey={refineCategory(category.key, c.name)}
                            categoryBorder={category.border}
                            startDate={startDate}
                            endDate={endDate}
                            onClose={() => onToggleDrilldown(c.id)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function CampaignsByObjective({ campaigns, loading, workspaceId, startDate, endDate }: CampaignsByObjectiveProps) {
  const [filter, setFilter] = useState<CampaignFilter>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [openDrilldownId, setOpenDrilldownId] = useState<string | null>(null);
  const [expandedBlock, setExpandedBlock] = useState<CategoryKey | null>(null);

  function handleToggleDrilldown(id: string) {
    setOpenDrilldownId((prev) => (prev === id ? null : id));
  }

  const grouped = useMemo(() => {
    if (!campaigns) return [];
    const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);
    const groups = new Map<CategoryKey, { category: CategoryDef; campaigns: Campaign[] }>();
    for (const c of filtered) {
      const cat = getCategory(c.objective, c.name);
      const existing = groups.get(cat.key);
      if (existing) { existing.campaigns.push(c); }
      else { groups.set(cat.key, { category: cat, campaigns: [c] }); }
    }
    return Array.from(groups.values()).sort((a, b) => {
      const aActive = a.campaigns.some((c) => c.status === "ACTIVE") ? 1 : 0;
      const bActive = b.campaigns.some((c) => c.status === "ACTIVE") ? 1 : 0;
      if (bActive !== aActive) return bActive - aActive;
      return b.campaigns.length - a.campaigns.length;
    });
  }, [campaigns, filter]);

  const counts = useMemo(() => {
    if (!campaigns) return { total: 0, active: 0, paused: 0 };
    return { total: campaigns.length, active: campaigns.filter((c) => c.status === "ACTIVE").length, paused: campaigns.filter((c) => c.status === "PAUSED").length };
  }, [campaigns]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-medium text-[var(--color-text-secondary)]">Campagnes par objectif</h2>
          {campaigns && <span className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--color-text-secondary)]">{counts.total}</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {([{ key: "all" as const, label: "Toutes" }, { key: "ACTIVE" as const, label: `Actives (${counts.active})` }, { key: "PAUSED" as const, label: `En pause (${counts.paused})` }]).map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setFilter(key)} className={cn("rounded-md px-3 py-1 text-[12px] font-medium transition-colors", filter === key ? "bg-primary-500/10 text-primary-400" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]")}>{label}</button>
            ))}
          </div>
          <button type="button" onClick={() => setShowArchived((s) => !s)} className={cn("rounded-md px-2 py-1 text-[11px] transition-colors", showArchived ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]" : "text-[var(--color-text-primary)]0 hover:text-[var(--color-text-secondary)]")}>{showArchived ? "Masquer archivées" : "Afficher archivées"}</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : grouped.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {grouped.map(({ category, campaigns: cats }, i) => (
            <motion.div key={category.key} layout className={cn(expandedBlock === category.key && "col-span-full")}>
              <ObjectiveBlock category={category} campaigns={cats} index={i} showArchived={showArchived} workspaceId={workspaceId} startDate={startDate} endDate={endDate} openDrilldownId={openDrilldownId} onToggleDrilldown={handleToggleDrilldown} isExpanded={expandedBlock === category.key} onToggleExpand={() => setExpandedBlock(expandedBlock === category.key ? null : category.key)} maxCampaignsCompact={5} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 py-12 text-center">
          <p className="text-[13px] text-[var(--color-text-primary)]0">{filter === "all" ? "Aucune campagne synchronisée" : "Aucune campagne pour ce filtre"}</p>
        </div>
      )}
    </div>
  );
}
