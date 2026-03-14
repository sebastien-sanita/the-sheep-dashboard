import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SyncResult, DiscoverResult } from "../types";
import { syncWorkspace, discoverAccounts } from "../api/sync";

export function useSyncWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<SyncResult, Error, string>({
    mutationFn: (id) => syncWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}

export function useDiscoverAccounts() {
  const queryClient = useQueryClient();

  return useMutation<DiscoverResult, Error, void>({
    mutationFn: () => discoverAccounts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
