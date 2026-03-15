import type { EntityMetrics, ConversionsMap } from "../types";
import { formatCurrency, formatCompact, formatPercent } from "./format";

// ---------------------------------------------------------------------------
// Conversions helper
// ---------------------------------------------------------------------------

let _debuggedConversions = false;

export function getConversions(metrics: EntityMetrics): ConversionsMap {
  if (!_debuggedConversions && typeof window !== "undefined") {
    _debuggedConversions = true;
    console.log("[DEBUG] CONVERSIONS EXTRACT:", {
      metricsKeys: Object.keys(metrics),
      conversionsType: typeof metrics.conversions,
      conversionsValue: metrics.conversions,
      rawMetrics: JSON.stringify(metrics).slice(0, 300),
    });
  }
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
  /** Extract the primary scoring value for tier classification */
  scoringExtract: (m: EntityMetrics) => number | null;
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
  scoringExtract: (m) => {
    const conv = getConversions(m);
    const l = convSum(conv, "lead", "onsite_web_lead");
    return l > 0 && m.spend ? m.spend / l : null;
  },
  kpis: [
    { key: "leads", label: "Leads", format: "number", extract: (m) => { const c = getConversions(m); const v = convSum(c, "lead", "onsite_web_lead"); return v || null; } },
    { key: "cpl", label: "CPL", format: "currency", extract: (m) => { const c = getConversions(m); const l = convSum(c, "lead", "onsite_web_lead"); return l > 0 && m.spend ? m.spend / l : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
  ],
};

const traffic: ObjectiveMetricsConfig = {
  label: "Trafic",
  primaryKpi: "cpc",
  primaryKpiLabel: "CPC",
  scoringDirection: "asc",
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
  scoringExtract: (m) => {
    const conv = getConversions(m);
    const e = convSum(conv, "page_engagement", "post_engagement");
    return e > 0 && m.spend ? m.spend / e : null;
  },
  kpis: [
    { key: "engagements", label: "Engagements", format: "compact", extract: (m) => { const c = getConversions(m); const v = convSum(c, "page_engagement", "post_engagement"); return v || null; } },
    { key: "costPerEngagement", label: "Coût/Eng", format: "currency", extract: (m) => { const c = getConversions(m); const e = convSum(c, "page_engagement", "post_engagement"); return e > 0 && m.spend ? m.spend / e : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
  ],
};

const video: ObjectiveMetricsConfig = {
  label: "Vues vidéo",
  primaryKpi: "costPerView",
  primaryKpiLabel: "Coût/Vue",
  scoringDirection: "asc",
  scoringExtract: (m) => {
    const conv = getConversions(m);
    const v = convSum(conv, "video_view");
    return v > 0 && m.spend ? m.spend / v : null;
  },
  kpis: [
    { key: "videoViews", label: "Vues vidéo", format: "compact", extract: (m) => { const c = getConversions(m); return convSum(c, "video_view") || null; } },
    { key: "costPerView", label: "Coût/Vue", format: "currency", extract: (m) => { const c = getConversions(m); const v = convSum(c, "video_view"); return v > 0 && m.spend ? m.spend / v : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "impressions", label: "Impressions", format: "compact", extract: (m) => m.impressions ?? null },
  ],
};

const sales: ObjectiveMetricsConfig = {
  label: "Ventes",
  primaryKpi: "roas",
  primaryKpiLabel: "ROAS",
  scoringDirection: "desc",
  scoringExtract: (m) => m.roas ?? null,
  kpis: [
    { key: "purchases", label: "Achats", format: "number", extract: (m) => { const c = getConversions(m); return convSum(c, "purchase") || null; } },
    { key: "roas", label: "ROAS", format: "number", extract: (m) => m.roas ?? null },
    { key: "cpa", label: "CPA", format: "currency", extract: (m) => { const c = getConversions(m); const p = convSum(c, "purchase"); return p > 0 && m.spend ? m.spend / p : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
  ],
};

const messages: ObjectiveMetricsConfig = {
  label: "Messages",
  primaryKpi: "costPerMessage",
  primaryKpiLabel: "Coût/Msg",
  scoringDirection: "asc",
  scoringExtract: (m) => {
    const conv = getConversions(m);
    const msg = convSum(conv, "messaging_conversation_started_7d");
    return msg > 0 && m.spend ? m.spend / msg : null;
  },
  kpis: [
    { key: "messages", label: "Messages", format: "number", extract: (m) => { const c = getConversions(m); return convSum(c, "messaging_conversation_started_7d") || null; } },
    { key: "costPerMessage", label: "Coût/Msg", format: "currency", extract: (m) => { const c = getConversions(m); const msg = convSum(c, "messaging_conversation_started_7d"); return msg > 0 && m.spend ? m.spend / msg : null; } },
    { key: "spend", label: "Dépense", format: "currency", extract: (m) => m.spend ?? null },
    { key: "ctr", label: "CTR", format: "percent", extract: (m) => m.ctr ?? null },
  ],
};

const fallback: ObjectiveMetricsConfig = {
  label: "Autre",
  primaryKpi: "ctr",
  primaryKpiLabel: "CTR",
  scoringDirection: "desc",
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
  leads,
  traffic,
  awareness,
  engagement,
  video,
  sales,
  messages,
  other: fallback,
};

export function getObjectiveConfig(categoryKey: CategoryKey): ObjectiveMetricsConfig {
  return CONFIG_MAP[categoryKey] ?? fallback;
}

/** Map "engagement" category to "video" if campaign name suggests video */
export function refineCategory(categoryKey: CategoryKey, campaignName?: string): CategoryKey {
  if (categoryKey === "engagement" && campaignName) {
    if (/video|vidéo|vue/i.test(campaignName)) return "video";
  }
  return categoryKey;
}
