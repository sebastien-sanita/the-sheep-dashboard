import type { AdSetWithMetrics, AdWithMetrics } from "../types";
import { apiGet } from "./client";

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj["data"] !== undefined) return obj["data"] as T;
  }
  return raw as T;
}

function unwrapArray<T>(raw: unknown): T[] {
  const inner = unwrap<T[] | T>(raw);
  return Array.isArray(inner) ? inner : [inner];
}

export async function getCampaignAdsets(
  workspaceId: string,
  campaignId: string,
  startDate?: string,
  endDate?: string,
): Promise<AdSetWithMetrics[]> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const raw = await apiGet<unknown>(
    `/api/workspaces/${workspaceId}/campaigns/${campaignId}/adsets`,
    params,
  );
  return unwrapArray<AdSetWithMetrics>(raw);
}

export async function getCampaignAds(
  workspaceId: string,
  campaignId: string,
  startDate?: string,
  endDate?: string,
): Promise<AdWithMetrics[]> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const raw = await apiGet<unknown>(
    `/api/workspaces/${workspaceId}/campaigns/${campaignId}/ads`,
    params,
  );
  return unwrapArray<AdWithMetrics>(raw);
}
