import type { ClientSummary, Client, Campaign } from "../types";
import { apiGet } from "./client";

/** Unwrap common API response wrappers ({ data: T } or { items: T } etc.) */
function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    for (const key of ["data", "workspace", "workspaces", "items", "results", "campaign", "campaigns"]) {
      if (obj[key] !== undefined) return obj[key] as T;
    }
  }
  return raw as T;
}

/** Unwrap and ensure array */
function unwrapArray<T>(raw: unknown): T[] {
  const inner = unwrap<T[] | T>(raw);
  return Array.isArray(inner) ? inner : [inner];
}

export async function getWorkspaces(): Promise<ClientSummary[]> {
  const raw = await apiGet<unknown>("/api/workspaces/me");
  return unwrapArray<ClientSummary>(raw);
}

export async function getWorkspace(id: string): Promise<Client> {
  const raw = await apiGet<unknown>(`/api/workspaces/${id}`);
  return unwrap<Client>(raw);
}

export async function getWorkspaceCampaigns(id: string): Promise<Campaign[]> {
  const raw = await apiGet<unknown>(`/api/workspaces/${id}/campaigns`);
  return unwrapArray<Campaign>(raw);
}
