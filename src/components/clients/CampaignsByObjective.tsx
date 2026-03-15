"use client";

import { useState, useMemo } from "react";
import {
  Target,
  MousePointerClick,
  Megaphone,
  Heart,
  ShoppingCart,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Campaign } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Objective categories
// ---------------------------------------------------------------------------

type CategoryKey = "leads" | "traffic" | "awareness" | "engagement" | "sales" | "other";

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
  {
    key: "leads",
    label: "Génération de leads",
    emoji: "🎯",
    icon: Target,
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    objectives: ["OUTCOME_LEADS", "LEAD_GENERATION", "CONVERSIONS"],
  },
  {
    key: "traffic",
    label: "Trafic",
    emoji: "🔗",
    icon: MousePointerClick,
    border: "border-l-blue-500",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    objectives: ["OUTCOME_TRAFFIC", "LINK_CLICKS"],
  },
  {
    key: "awareness",
    label: "Notoriété",
    emoji: "📢",
    icon: Megaphone,
    border: "border-l-purple-500",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
    objectives: ["OUTCOME_AWARENESS", "BRAND_AWARENESS", "REACH"],
  },
  {
    key: "engagement",
    label: "Engagement",
    emoji: "💬",
    icon: Heart,
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    objectives: ["OUTCOME_ENGAGEMENT", "POST_ENGAGEMENT", "VIDEO_VIEWS", "MESSAGES"],
  },
  {
    key: "sales",
    label: "Ventes",
    emoji: "🛒",
    icon: ShoppingCart,
    border: "border-l-rose-500",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    objectives: ["OUTCOME_SALES"],
  },
  {
    key: "other",
    label: "Autre",
    emoji: "📊",
    icon: Layers,
    border: "border-l-slate-500",
    bg: "bg-slate-500/5",
    text: "text-slate-400",
    objectives: [],
  },
];

function getCategory(objective: string | null): CategoryDef {
  if (!objective) return CATEGORIES[CATEGORIES.length - 1]; // "other"
  const upper = objective.toUpperCase();
  return CATEGORIES.find((c) => c.objectives.includes(upper)) ?? CATEGORIES[CATEGORIES.length - 1];
}

// ---------------------------------------------------------------------------
// KPI definitions per category
// ---------------------------------------------------------------------------

interface MiniKPI {
  label: string;
  value: string;
}

function getCategoryKPIs(cat: CategoryKey, campaigns: Campaign[]): MiniKPI[] {
  const totalSpend = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0);
  const count = campaigns.length;

  switch (cat) {
    case "leads":
      return [
        { label: "Campagnes", value: String(count) },
        { label: "Budget total", value: formatCurrency(totalSpend) },
        { label: "Objectif", value: "Leads" },
        { label: "Actives", value: String(campaigns.filter((c) => c.status === "ACTIVE").length) },
      ];
    case "traffic":
      return [
        { label: "Campagnes", value: String(count) },
        { label: "Budget total", value: formatCurrency(totalSpend) },
        { label: "Objectif", value: "Clics lien" },
        { label: "Actives", value: String(campaigns.filter((c) => c.status === "ACTIVE").length) },
      ];
    case "awareness":
      return [
        { label: "Campagnes", value: String(count) },
        { label: "Budget total", value: formatCurrency(totalSpend) },
        { label: "Objectif", value: "Impressions" },
        { label: "Actives", value: String(campaigns.filter((c) => c.status === "ACTIVE").length) },
      ];
    case "engagement":
      return [
        { label: "Campagnes", value: String(count) },
        { label: "Budget total", value: formatCurrency(totalSpend) },
        { label: "Objectif", value: "Engagement" },
        { label: "Actives", value: String(campaigns.filter((c) => c.status === "ACTIVE").length) },
      ];
    case "sales":
      return [
        { label: "Campagnes", value: String(count) },
        { label: "Budget total", value: formatCurrency(totalSpend) },
        { label: "Objectif", value: "Achats" },
        { label: "Actives", value: String(campaigns.filter((c) => c.status === "ACTIVE").length) },
      ];
    default:
      return [
        { label: "Campagnes", value: String(count) },
        { label: "Budget total", value: formatCurrency(totalSpend) },
        { label: "Actives", value: String(campaigns.filter((c) => c.status === "ACTIVE").length) },
      ];
  }
}

// ---------------------------------------------------------------------------
// Status badges
// ---------------------------------------------------------------------------

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAUSED: "bg-amber-500/10 text-amber-400",
  DELETED: "bg-slate-500/10 text-slate-400",
  ARCHIVED: "bg-slate-500/10 text-slate-400",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CampaignFilter = "all" | "ACTIVE" | "PAUSED";

interface CampaignsByObjectiveProps {
  campaigns: Campaign[] | undefined;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// ObjectiveBlock
// ---------------------------------------------------------------------------

function ObjectiveBlock({
  category,
  campaigns,
  index,
  showArchived,
}: {
  category: CategoryDef;
  campaigns: Campaign[];
  index: number;
  showArchived: boolean;
}) {
  const hasActive = campaigns.some((c) => c.status === "ACTIVE");
  const [expanded, setExpanded] = useState(hasActive);

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const pausedCount = campaigns.filter((c) => c.status === "PAUSED").length;

  const visibleCampaigns = useMemo(() => {
    const filtered = showArchived
      ? campaigns
      : campaigns.filter((c) => c.status !== "DELETED" && c.status !== "ARCHIVED");
    return [...filtered].sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
  }, [campaigns, showArchived]);

  const kpis = getCategoryKPIs(category.key, campaigns);
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn(
        "overflow-hidden rounded-xl border-l-[3px] bg-slate-800/50",
        category.border,
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{category.emoji}</span>
          <div>
            <span className="text-[14px] font-medium text-slate-200">{category.label}</span>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
              {activeCount > 0 && <span className="text-emerald-400">{activeCount} active{activeCount > 1 ? "s" : ""}</span>}
              {activeCount > 0 && pausedCount > 0 && <span>·</span>}
              {pausedCount > 0 && <span className="text-amber-400">{pausedCount} en pause</span>}
              {activeCount === 0 && pausedCount === 0 && <span>Aucune active</span>}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-700/30">
          {/* Mini KPIs */}
          <div className="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className={cn("rounded-lg p-3", category.bg)}>
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {kpi.label}
                </div>
                <div className={cn("mt-1 text-[16px] font-semibold", category.text)}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>

          {/* Campaign list */}
          <div className="px-6 pb-4">
            {visibleCampaigns.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-slate-500">Aucune campagne visible</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-700/30">
                {visibleCampaigns.map((c, i) => (
                  <div
                    key={c.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors hover:bg-slate-700/20",
                      i > 0 && "border-t border-slate-700/20",
                      c.status === "PAUSED" && "opacity-60",
                      (c.status === "DELETED" || c.status === "ARCHIVED") && "opacity-40",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-slate-200">{c.name}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        STATUS_BADGES[c.status] ?? "bg-slate-500/10 text-slate-400",
                      )}
                    >
                      {c.status}
                    </span>
                    {c.budget != null && isFinite(c.budget) && (
                      <span className="shrink-0 text-[12px] text-slate-400">
                        {formatCurrency(c.budget)}
                        {c.budgetType && (
                          <span className="ml-0.5 text-[10px] text-slate-600">
                            {c.budgetType === "DAILY" ? "/j" : ""}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Future: audiences & creatives button */}
          <div className="border-t border-slate-700/30 px-6 py-3">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 cursor-not-allowed"
              title="Bientôt disponible"
            >
              Audiences et créatifs
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CampaignsByObjective({ campaigns, loading }: CampaignsByObjectiveProps) {
  const [filter, setFilter] = useState<CampaignFilter>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Group campaigns by objective category
  const grouped = useMemo(() => {
    if (!campaigns) return [];

    const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

    const groups = new Map<CategoryKey, { category: CategoryDef; campaigns: Campaign[] }>();

    for (const c of filtered) {
      const cat = getCategory(c.objective);
      const existing = groups.get(cat.key);
      if (existing) {
        existing.campaigns.push(c);
      } else {
        groups.set(cat.key, { category: cat, campaigns: [c] });
      }
    }

    // Sort: categories with active campaigns first, then by campaign count
    return Array.from(groups.values()).sort((a, b) => {
      const aActive = a.campaigns.some((c) => c.status === "ACTIVE") ? 1 : 0;
      const bActive = b.campaigns.some((c) => c.status === "ACTIVE") ? 1 : 0;
      if (bActive !== aActive) return bActive - aActive;
      return b.campaigns.length - a.campaigns.length;
    });
  }, [campaigns, filter]);

  const counts = useMemo(() => {
    if (!campaigns) return { total: 0, active: 0, paused: 0 };
    return {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "ACTIVE").length,
      paused: campaigns.filter((c) => c.status === "PAUSED").length,
    };
  }, [campaigns]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-medium text-slate-300">Campagnes par objectif</h2>
          {campaigns && (
            <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[11px] text-slate-400">
              {counts.total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {([
              { key: "all" as const, label: "Toutes" },
              { key: "ACTIVE" as const, label: `Actives (${counts.active})` },
              { key: "PAUSED" as const, label: `En pause (${counts.paused})` },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-md px-3 py-1 text-[12px] font-medium transition-colors",
                  filter === key
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-slate-400 hover:bg-slate-700 hover:text-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowArchived((s) => !s)}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] transition-colors",
              showArchived
                ? "bg-slate-700 text-slate-300"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {showArchived ? "Masquer archivées" : "Afficher archivées"}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : grouped.length > 0 ? (
        <div className="space-y-4">
          {grouped.map(({ category, campaigns: cats }, i) => (
            <ObjectiveBlock
              key={category.key}
              category={category}
              campaigns={cats}
              index={i}
              showArchived={showArchived}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800 px-5 py-12 text-center">
          <p className="text-[13px] text-slate-500">
            {filter === "all" ? "Aucune campagne synchronisée" : "Aucune campagne pour ce filtre"}
          </p>
        </div>
      )}
    </div>
  );
}
