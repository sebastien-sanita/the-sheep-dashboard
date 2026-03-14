import type { ClientSummary, Client, Campaign } from "../types";
import { apiGet } from "./client";

export async function getWorkspaces(): Promise<ClientSummary[]> {
  const data = await apiGet<ClientSummary[] | ClientSummary>("/api/workspaces/me");
  return Array.isArray(data) ? data : [data];
}

export function getWorkspace(id: string): Promise<Client> {
  return apiGet<Client>(`/api/workspaces/${id}`);
}

export function getWorkspaceCampaigns(id: string): Promise<Campaign[]> {
  return apiGet<Campaign[]>(`/api/workspaces/${id}/campaigns`);
}
