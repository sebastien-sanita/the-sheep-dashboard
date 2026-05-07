import { useQuery } from "@tanstack/react-query";
import type { ClientSummary } from "@/lib/types/workspace";
import type { FluxCardsResponse, FluxCardsError } from "@/lib/flux/types";

/**
 * Hook qui appelle /api/flux/cards (Next.js Route Handler) et retourne
 * les cards générées par Claude.
 *
 * staleTime : 1h — les cards restent stables une heure côté client. Pas
 * besoin de refetch sur focus / mount tant que les data 30j n'ont pas
 * eu le temps de bouger significativement.
 */

async function fetchFluxCards(
  workspaces: ClientSummary[],
): Promise<FluxCardsResponse> {
  // Le path /api/flux/cards est servi par le filesystem Next.js, pas par
  // le rewrite vers api.the-sheep.fr (Next vérifie le filesystem avant
  // les rewrites).
  const res = await fetch("/api/flux/cards", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workspaces }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as FluxCardsError | null;
    throw new Error(err?.message ?? `flux/cards a renvoyé HTTP ${res.status}`);
  }
  return (await res.json()) as FluxCardsResponse;
}

export function useFluxCards(workspaces: ClientSummary[] | undefined) {
  return useQuery<FluxCardsResponse>({
    queryKey: ["flux-cards", workspaces?.length ?? 0],
    queryFn: () => fetchFluxCards(workspaces!),
    enabled: !!workspaces && workspaces.length > 0,
    staleTime: 60 * 60 * 1000, // 1 heure — voir commentaire en tête de fichier
    gcTime: 4 * 60 * 60 * 1000, // 4h — garde la réponse en cache mémoire
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
