import { useQuery } from "@tanstack/react-query";
import type { ClientSummary, Client, Campaign } from "../types";
import { getWorkspaces, getWorkspace, getWorkspaceCampaigns } from "../api/workspaces";

export function useWorkspaces() {
  return useQuery<ClientSummary[]>({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });
}

export function useWorkspace(id: string) {
  return useQuery<Client>({
    queryKey: ["workspaces", id],
    queryFn: () => getWorkspace(id),
    enabled: id !== "",
  });
}

export function useWorkspaceCampaigns(id: string) {
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", id],
    queryFn: () => getWorkspaceCampaigns(id),
    enabled: id !== "",
  });
}
