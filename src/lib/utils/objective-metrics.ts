import type { EntityMetrics, ConversionsMap } from "../types";
import { formatCurrency, formatCompact, formatPercent } from "./format";

// ---------------------------------------------------------------------------
// Conversions helper
// ---------------------------------------------------------------------------

export function getConversions(metrics: EntityMetrics): ConversionsMap {
  if (!metrics.conversions) return {};
  if (typeof metrics.conversions === "number") return {};
  return metrics.conversions;
}

function convSum(conv: ConversionsMap, ...keys: string[]): number {
  let total = 0;
  for (const k of keys) {
    total += Number(conv[k]) || 0;
  }
  return total;
}

/** Check if an EntityMetrics has usable conversion data */
export function hasConversionData(metrics: EntityMetrics): boolean {
  if (!metrics.conversions) return false;
  if (typeof metrics.conversions === "number") return false;
  return Object.keys(metrics.conversions).length > 0;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CategoryKey = "leads" | "traffic" | "awareness" | "engagement" | "video" | "sales" | "messages" | "other";

export type ScoringDirection = "asc" | "desc"; // asc = lower is better

export interface KpiDef {
  key: string;
  label: string;
  format: "currency" | "number" | "percent" | "compact";
  extract: (m: EntityMetrics) => number | null;
}

export interface ObjectiveMetricsConfig {
  label: string;
  primaryKpi: string;
  primaryKpiLabel: string;
  scoringDirection: ScoringDirection;
  kpis: KpiDef[];
  scoringExtract: (m: EntityMetrics) => number | null;
  /** True if this config requires conversion data to be useful */
  needsConversions: boolean;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const FMT: Record<string, (v: number) => string> = {
  currency: formatCurrency,
  number: (v) => String(Math.round(v)),
  percent: (v) => formatPercent(v, 2),
  compact: formatCompact,
};

export function formatKpi(value: number | null, format: string): string {
  if (value == null || !isFinite(value)) return "—";
  return (FMT[format] ?? FMT.number)(value);
}

// ---------------------------------------------------------------------------
// Config per objective
// ---------------------------------------------------------------------------

const leads: ObjectiveMetricsConfig = {
  label: "Génération de leads",
  primaryKpi: "cpl",
  primaryKpiLabel: "CPL",
  scoringDirection: "asc",
  needsConversions: true,
  scoringExtract: (m) => {
    const l = convSum(getConversions(m), "lead", "onsite_web_lead");
    return l > 0 && m.spend ? m.spend / l : null;
  },
  kpis: [
    { key: "leads", label: "Leads", format: "number", extract: (m) => convSum(getConversions(m), "lead", "onsite_web_lead") || null },
    { key: "cpl", label: "CPL", format: "currency", extract: (m) => { const l = convSum(getConversions(m), "lead", "onsite_web_lead"); return l > 0 && m.spend ? m.spend / l : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
  ],
};

const traffic: ObjectiveMetricsConfig = {
  label: "Trafic",
  primaryKpi: "cpc",
  primaryKpiLabel: "CPC",
  scoringDirection: "asc",
  needsConversions: false,
  scoringExtract: (m) => m.cpc ?? null,
  kpis: [
    { key: "clicks", label: "Clics", format: "compact", extract: (m) => m.clicks ?? null },
    { key: "cpc", label: "CPC", format: "currency", extract: (m) => m.cpc ?? null },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
  ],
};

const awareness: ObjectiveMetricsConfig = {
  label: "Notoriété",
  primaryKpi: "cpm",
  primaryKpiLabel: "CPM",
  scoringDirection: "asc",
  needsConversions: false,
  scoringExtract: (m) => m.cpm ?? null,
  kpis: [
    { key: "impressions", label: "Impressions", format: "compact", extract: (m) => m.impressions ?? null },
    { key: "reach", label: "Reach", format: "compact", extract: (m) => m.reach ?? null },
    { key: "cpm", label: "CPM", format: "currency", extract: (m) => m.cpm ?? null },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
  ],
};

const engagement: ObjectiveMetricsConfig = {
  label: "Engagement",
  primaryKpi: "costPerEngagement",
  primaryKpiLabel: "Coût/Eng",
  scoringDirection: "asc",
  needsConversions: true,
  scoringExtract: (m) => {
    const e = convSum(getConversions(m), "page_engagement", "post_engagement");
    return e > 0 && m.spend ? m.spend / e : null;
  },
  kpis: [
    { key: "engagements", label: "Engagements", format: "compact", extract: (m) => convSum(getConversions(m), "page_engagement", "post_engagement") || null },
    { key: "costPerEngagement", label: "Coût/Eng", format: "currency", extract: (m) => { const e = convSum(getConversions(m), "page_engagement", "post_engagement"); return e > 0 && m.spend ? m.spend / e : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
  ],
};

const video: ObjectiveMetricsConfig = {
  label: "Vues vidéo",
  primaryKpi: "costPerView",
  primaryKpiLabel: "Coût/Vue",
  scoringDirection: "asc",
  needsConversions: true,
  scoringExtract: (m) => {
    const v = convSum(getConversions(m), "video_view");
    return v > 0 && m.spend ? m.spend / v : null;
  },
  kpis: [
    { key: "videoViews", label: "Vues vidéo", format: "compact", extract: (m) => convSum(getConversions(m), "video_view") || null },
    { key: "costPerView", label: "Coût/Vue", format: "currency", extract: (m) => { const v = convSum(getConversions(m), "video_view"); return v > 0 && m.spend ? m.spend / v : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "impressions", label: "Impressions", format: "compact", extract: (m) => m.impressions ?? null },
  ],
};

const sales: ObjectiveMetricsConfig = {
  label: "Ventes",
  primaryKpi: "roas",
  primaryKpiLabel: "ROAS",
  scoringDirection: "desc",
  needsConversions: true,
  scoringExtract: (m) => m.roas ?? null,
  kpis: [
    { key: "purchases", label: "Achats", format: "number", extract: (m) => convSum(getConversions(m), "purchase") || null },
    { key: "roas", label: "ROAS", format: "number", extract: (m) => m.roas ?? null },
    { key: "cpa", label: "CPA", format: "currency", extract: (m) => { const p = convSum(getConversions(m), "purchase"); return p > 0 && m.spend ? m.spend / p : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
  ],
};

const messages: ObjectiveMetricsConfig = {
  label: "Messages",
  primaryKpi: "costPerMessage",
  primaryKpiLabel: "Coût/Msg",
  scoringDirection: "asc",
  needsConversions: true,
  scoringExtract: (m) => {
    const msg = convSum(getConversions(m), "messaging_conversation_started_7d");
    return msg > 0 && m.spend ? m.spend / msg : null;
  },
  kpis: [
    { key: "messages", label: "Messages", format: "number", extract: (m) => convSum(getConversions(m), "messaging_conversation_started_7d") || null },
    { key: "costPerMessage", label: "Coût/Msg", format: "currency", extract: (m) => { const msg = convSum(getConversions(m), "messaging_conversation_started_7d"); return msg > 0 && m.spend ? m.spend / msg : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
  ],
};

const fallback: ObjectiveMetricsConfig = {
  label: "Autre",
  primaryKpi: "ctr",
  primaryKpiLabel: "CTR",
  scoringDirection: "desc",
  needsConversions: false,
  scoringExtract: (m) => m.ctr ?? null,
  kpis: [
    { key: "impressions", label: "Impressions", format: "compact", extract: (m) => m.impressions ?? null },
    { key: "clicks", label: "Clics", format: "compact", extract: (m) => m.clicks ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
  ],
};

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

const CONFIG_MAP: Record<CategoryKey, ObjectiveMetricsConfig> = {
  leads, traffic, awareness, engagement, video, sales, messages, other: fallback,
};

/**
 * Get the objective config for a category.
 * If the config needs conversions but the sample metrics don't have them,
 * fall back to the generic CTR-based config.
 */
export function getObjectiveConfig(categoryKey: CategoryKey, sampleMetrics?: EntityMetrics): ObjectiveMetricsConfig {
  const config = CONFIG_MAP[categoryKey] ?? fallback;

  // If this objective needs conversions but they're not available, use fallback
  if (config.needsConversions && sampleMetrics && !hasConversionData(sampleMetrics)) {
    return { ...fallback, label: config.label };
  }

  return config;
}

/** Map "engagement" category to "video" if campaign name suggests video */
export function refineCategory(categoryKey: CategoryKey, campaignName?: string): CategoryKey {
  if (categoryKey === "engagement" && campaignName) {
    if (/video|vidéo|vue/i.test(campaignName)) return "video";
  }
  return categoryKey;
}
