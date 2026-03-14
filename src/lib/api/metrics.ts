import type { MetricsParams, DateRange, AggregatedMetrics } from "../types";
import { apiGet } from "./client";

export function getMetrics(params: MetricsParams): Promise<AggregatedMetrics> {
  return apiGet<AggregatedMetrics>("/api/metrics", {
    workspaceId: params.workspaceId,
    startDate: params.startDate,
    endDate: params.endDate,
    platform: params.platform,
    level: params.level,
  });
}

export function getAccountMetrics(accountId: string, dateRange: DateRange): Promise<AggregatedMetrics> {
  return apiGet<AggregatedMetrics>("/api/metrics", {
    adAccountId: accountId,
    startDate: dateRange.from,
    endDate: dateRange.to,
  });
}
