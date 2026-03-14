import { useQuery } from "@tanstack/react-query";
import type { DateRange, AggregatedMetrics } from "../types";
import { getMetrics, getAccountMetrics } from "../api/metrics";

export function useMetrics(workspaceId: string, dateRange: DateRange) {
  return useQuery<AggregatedMetrics>({
    queryKey: ["metrics", workspaceId, dateRange.from, dateRange.to],
    queryFn: () =>
      getMetrics({
        workspaceId,
        startDate: dateRange.from,
        endDate: dateRange.to,
      }),
    enabled: workspaceId !== "",
  });
}

export function useAccountMetrics(accountId: string, dateRange: DateRange) {
  return useQuery<AggregatedMetrics>({
    queryKey: ["metrics", "account", accountId, dateRange.from, dateRange.to],
    queryFn: () => getAccountMetrics(accountId, dateRange),
    enabled: accountId !== "",
  });
}
