import type { ClientSummary, Client, Campaign } from "../types";
import { apiGet } from "./client";

export async function getWorkspaces(): Promise<ClientSummary[]> {
  const data = await apiGet<ClientSummary[] | Record<string, unknown>>("/api/workspaces/me");

  // Backend returns array directly
  if (Array.isArray(data)) return data;

  // Backend wraps in { data: [...] } or { workspaces: [...] }
  if (data && typeof data === "object") {
    for (const key of ["data", "workspaces", "items", "results"] as const) {
      const nested = (data as Record<string, unknown>)[key];
      if (Array.isArray(nested)) return nested as ClientSummary[];
    }
  }

  // Single workspace object fallback
  return [data as unknown as ClientSummary];
}

export function getWorkspace(id: string): Promise<Client> {
  return apiGet<Client>(`/api/workspaces/${id}`);
}

export function getWorkspaceCampaigns(id: string): Promise<Campaign[]> {
  return apiGet<Campaign[]>(`/api/workspaces/${id}/campaigns`);
}
