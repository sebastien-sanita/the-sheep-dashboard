import type { SyncResult, DiscoverResult } from "../types";
import { apiPost } from "./client";

export function syncWorkspace(id: string): Promise<SyncResult> {
  return apiPost<SyncResult>(`/api/sync/workspace/${id}`);
}

export function discoverAccounts(): Promise<DiscoverResult> {
  return apiPost<DiscoverResult>("/api/sync/discover");
}
