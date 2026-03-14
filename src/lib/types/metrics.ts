// ============================================================
// Metrics & Insights types — mirrors backend Prisma models
// ============================================================

import type { Platform } from "./workspace";

// --- Enums ---

export type InsightLevel = "ACCOUNT" | "CAMPAIGN" | "ADSET" | "AD";

export type TrendDirection = "up" | "down" | "flat";

// --- Metric values ---

export interface MetricValue {
  value: number;
  previousValue?: number;
  trend?: number;
  trendDirection?: TrendDirection;
}

/** Raw metrics JSON stored in Insight.metrics — all fields optional depending on breakdown. */
export interface InsightMetrics {
  impressions?: number;
  clicks?: number;
  spend?: number;
  cpm?: number;
  cpc?: number;
  ctr?: number;
  conversions?: number;
  costPerConversion?: number;
  roas?: number;
  frequency?: number;
}

// --- Date range ---

export interface DateRange {
  from: string;
  to: string;
}

// --- Insight model ---

export interface Insight {
  id: string;
  date: string;
  level: InsightLevel;
  metrics: InsightMetrics;
  adAccountId: string | null;
  campaignId: string | null;
  adSetId: string | null;
  adId: string | null;
}

// --- Aggregated metrics returned by GET /api/metrics ---

export interface AggregatedMetrics {
  dateRange: DateRange;
  previousDateRange: DateRange | null;
  workspaceId: string;
  platform?: Platform;
  metrics: {
    impressions: MetricValue;
    clicks: MetricValue;
    spend: MetricValue;
    cpm: MetricValue;
    cpc: MetricValue;
    ctr: MetricValue;
    conversions: MetricValue;
    costPerConversion: MetricValue;
    roas: MetricValue;
    frequency: MetricValue;
  };
  daily: {
    date: string;
    metrics: InsightMetrics;
  }[];
}
