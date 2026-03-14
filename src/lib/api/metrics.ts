import type { MetricsParams, DateRange, AggregatedMetrics } from "../types";
import { apiGet } from "./client";

/** Unwrap common API response wrapper */
function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj["data"] !== undefined) return obj["data"] as T;
  }
  return raw as T;
}

export async function getMetrics(params: MetricsParams): Promise<AggregatedMetrics> {
  const raw = await apiGet<unknown>("/api/metrics", {
    workspaceId: params.workspaceId,
    startDate: params.startDate,
    endDate: params.endDate,
    platform: params.platform,
    level: params.level,
  });
  return unwrap<AggregatedMetrics>(raw);
}

export async function getAccountMetrics(accountId: string, dateRange: DateRange): Promise<AggregatedMetrics> {
  const raw = await apiGet<unknown>("/api/metrics", {
    adAccountId: accountId,
    startDate: dateRange.from,
    endDate: dateRange.to,
  });
  return unwrap<AggregatedMetrics>(raw);
}
