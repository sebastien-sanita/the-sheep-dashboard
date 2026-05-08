import { useQueries } from "@tanstack/react-query";
import type { ClientSummary, Campaign } from "@/lib/types/workspace";
import { getWorkspaceCampaigns } from "@/lib/api/workspaces";
import type { MutableCampaignInput } from "@/lib/flux/aggregator";

/**
 * useMutableCampaigns — fournit à Claude un set de campagnes réelles
 * (UUID UnifiedCampaign + budget + status) qu'il peut référencer dans une
 * mutation card.
 *
 * Stratégie : top N workspaces par dépense 30j → top M campagnes ACTIVE/PAUSED
 * par budget. On garde le payload modeste pour ne pas exploser les tokens
 * d'input et on évite les workspaces inactifs où les mutations sont peu
 * intéressantes.
 *
 * Sans ce hook, le prompt verra `mutable_campaigns: []` et Claude n'émettra
 * AUCUNE mutation card (cf. règle bloquante du system prompt). C'est ce
 * qui sécurise le pipeline contre les campaign_id hallucinés.
 */

const TOP_WORKSPACES = 3;
const TOP_CAMPAIGNS_PER_WORKSPACE = 3;

export function useMutableCampaigns(workspaces: ClientSummary[] | undefined) {
  const targetWorkspaces = (workspaces ?? [])
    .filter((w) => (w.totalSpend30d ?? 0) > 0)
    .sort((a, b) => (b.totalSpend30d ?? 0) - (a.totalSpend30d ?? 0))
    .slice(0, TOP_WORKSPACES);

  const queries = useQueries({
    queries: targetWorkspaces.map((ws) => ({
      queryKey: ["campaigns", ws.id] as const,
      queryFn: () => getWorkspaceCampaigns(ws.id),
      staleTime: 5 * 60 * 1000, // 5 min — campaigns changent rarement
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.every((q) => q.isError) && queries.length > 0;

  // Flatten — uniquement quand TOUTES les queries ont répondu (success ou error).
  // Les queries en error → workspace ignoré (pas bloquant).
  const allDone = queries.every((q) => !q.isLoading);
  const mutableCampaigns: MutableCampaignInput[] = [];

  if (allDone) {
    for (let i = 0; i < targetWorkspaces.length; i++) {
      const ws = targetWorkspaces[i];
      const result = queries[i];
      if (!result.data) continue;

      const campaigns: Campaign[] = result.data;
      const platform = ws.platforms?.[0] ?? null;

      const top = campaigns
        .filter(
          (c) => c.status === "ACTIVE" || c.status === "PAUSED",
        )
        .sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0))
        .slice(0, TOP_CAMPAIGNS_PER_WORKSPACE);

      for (const c of top) {
        mutableCampaigns.push({
          workspace_id: ws.id,
          workspace_name: ws.name,
          campaign_id: c.id,
          campaign_name: c.name,
          status: c.status,
          platform,
          daily_budget_eur: c.budget ?? null,
        });
      }
    }
  }

  return {
    data: allDone ? mutableCampaigns : undefined,
    isLoading,
    isError,
  };
}
