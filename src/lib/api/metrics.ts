import type { MetricsParams, DateRange, AggregatedMetrics, InsightMetrics } from "../types";
import { apiGet } from "./client";

/** Unwrap common API response wrapper */
function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj["data"] !== undefined) return obj["data"] as T;
  }
  return raw as T;
}

/**
 * Normalize the metrics response into AggregatedMetrics shape.
 * The backend might return:
 * 1. AggregatedMetrics directly (with .metrics and .daily)
 * 2. An array of insights [{ date, metrics: {...} }]
 * 3. { insights: [...] } wrapper
 * 4. { metrics: {...}, insights: [...] } hybrid
 */
function normalizeMetrics(raw: unknown, params: MetricsParams): AggregatedMetrics {
  const unwrapped = unwrap<unknown>(raw);

  // Case 1: Already correct AggregatedMetrics shape
  if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)) {
    const obj = unwrapped as Record<string, unknown>;

    // Build daily from insights array if present
    let daily = obj.daily as Array<{ date: string; metrics: InsightMetrics }> | undefined;
    if (!daily) {
      const insights = (obj.insights ?? obj.data) as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(insights) && insights.length > 0 && insights[0].date) {
        daily = insights.map((ins) => ({
          date: ins.date as string,
          metrics: (ins.metrics ?? ins) as InsightMetrics,
        }));
      }
    }

    return {
      dateRange: (obj.dateRange as AggregatedMetrics["dateRange"]) ?? { from: params.startDate, to: params.endDate },
      previousDateRange: (obj.previousDateRange as AggregatedMetrics["previousDateRange"]) ?? null,
      workspaceId: (obj.workspaceId as string) ?? params.workspaceId ?? "",
      metrics: (obj.metrics as AggregatedMetrics["metrics"]) ?? {} as AggregatedMetrics["metrics"],
      daily: daily ?? [],
    };
  }

  // Case 2: Raw array of insights
  if (Array.isArray(unwrapped)) {
    const insights = unwrapped as Array<Record<string, unknown>>;
    const daily = insights
      .filter((ins) => ins.date)
      .map((ins) => ({
        date: ins.date as string,
        metrics: (ins.metrics ?? ins) as InsightMetrics,
      }));

    return {
      dateRange: { from: params.startDate, to: params.endDate },
      previousDateRange: null,
      workspaceId: params.workspaceId ?? "",
      metrics: {} as AggregatedMetrics["metrics"],
      daily,
    };
  }

  // Fallback: empty
  return {
    dateRange: { from: params.startDate, to: params.endDate },
    previousDateRange: null,
    workspaceId: params.workspaceId ?? "",
    metrics: {} as AggregatedMetrics["metrics"],
    daily: [],
  };
}

export async function getMetrics(params: MetricsParams): Promise<AggregatedMetrics> {
  const raw = await apiGet<unknown>("/api/metrics", {
    workspaceId: params.workspaceId,
    startDate: params.startDate,
    endDate: params.endDate,
    platform: params.platform,
    level: params.level,
  });
  return normalizeMetrics(raw, params);
}

export async function getAccountMetrics(accountId: string, dateRange: DateRange): Promise<AggregatedMetrics> {
  const raw = await apiGet<unknown>("/api/metrics", {
    adAccountId: accountId,
    startDate: dateRange.from,
    endDate: dateRange.to,
  });
  return normalizeMetrics(raw, { workspaceId: "", startDate: dateRange.from, endDate: dateRange.to });
}
