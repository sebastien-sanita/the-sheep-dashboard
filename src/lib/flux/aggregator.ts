/**
 * Aggregator — transforme la liste brute de ClientSummary (data 30j) en
 * un input structuré que Claude peut digérer pour générer des cards
 * narratives.
 *
 * Le format est volontairement compact (pas de propriétés inutiles) pour
 * minimiser les tokens d'input. Si ClientSummary expose plus tard des
 * trends 7j vs 30j, on les ajoutera ici.
 */

import type { ClientSummary } from "../types/workspace";

/** Campagne candidate à mutation MCP (utilisée par Claude pour grounder
 *  un tool_input.campaign_id réel). UUID = UnifiedCampaign.id, pas Meta. */
export interface MutableCampaignInput {
  workspace_id: string;
  workspace_name: string;
  campaign_id: string;
  campaign_name: string;
  status: "ACTIVE" | "PAUSED" | string;
  platform: string | null;
  daily_budget_eur: number | null;
}

/** Input du prompt Claude. Compact, structuré, sans champ orphelin. */
export interface FluxPromptInput {
  date: string;
  scope: "all_clients";
  totals_30d: {
    spend: number;
    impressions: number;
    clicks: number;
    avg_ctr_pct: number;
    avg_cpl_estimated: number;
    leads_estimated: number;
    active_clients: number;
    total_clients: number;
  };
  clients: Array<{
    id: string;
    name: string;
    spend_30d: number;
    impressions_30d: number;
    clicks_30d: number;
    ctr_pct: number;
    cpl_estimated: number;
    leads_estimated: number;
    platforms: string[];
    sector: string | null;
    active_campaigns: number;
    days_since_update: number;
  }>;
  /** Campagnes que Claude peut référencer dans une mutation card. Si vide
   *  ou absent, Claude n'émet PAS de mutation card (cf. system prompt). */
  mutable_campaigns?: MutableCampaignInput[];
}

/**
 * Aggrège la liste de workspaces en input prompt.
 *
 * Notes sur les approximations :
 *   - leads = clicks * 0.06 (ratio clicks→leads observé moyen). À remplacer
 *     dès qu'on a un endpoint dédié exposant les conversions.
 *   - On limite à top 25 clients par dépense pour rester sous ~6KB d'input.
 *     Les autres restent agrégés dans totals_30d.
 */
export function aggregateForPrompt(
  workspaces: ClientSummary[],
  mutableCampaigns?: MutableCampaignInput[],
): FluxPromptInput {
  const now = Date.now();
  const totals = {
    spend: 0,
    impressions: 0,
    clicks: 0,
    activeClients: 0,
  };

  for (const ws of workspaces) {
    totals.spend += ws.totalSpend30d ?? 0;
    totals.impressions += ws.totalImpressions30d ?? 0;
    totals.clicks += ws.totalClicks30d ?? 0;
    if ((ws.totalSpend30d ?? 0) > 0) totals.activeClients += 1;
  }

  const totalLeads = Math.round(totals.clicks * 0.06);
  const avgCtr =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpl = totalLeads > 0 ? totals.spend / totalLeads : 0;

  // Top 25 clients par dépense — assez pour des insights pertinents
  // (90% de la masse), assez peu pour rester compact côté tokens.
  const topClients = [...workspaces]
    .sort((a, b) => (b.totalSpend30d ?? 0) - (a.totalSpend30d ?? 0))
    .slice(0, 25)
    .map((ws) => {
      const spend = ws.totalSpend30d ?? 0;
      const clicks = ws.totalClicks30d ?? 0;
      const impressions = ws.totalImpressions30d ?? 0;
      const leads = Math.round(clicks * 0.06);
      const daysSinceUpdate = Math.floor(
        (now - new Date(ws.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: ws.id,
        name: ws.name,
        spend_30d: round(spend),
        impressions_30d: impressions,
        clicks_30d: clicks,
        ctr_pct: impressions > 0 ? round((clicks / impressions) * 100, 2) : 0,
        cpl_estimated: leads > 0 ? round(spend / leads, 2) : 0,
        leads_estimated: leads,
        platforms: (ws.platforms ?? []) as string[],
        sector: ws.sector ?? null,
        active_campaigns: ws.activeCampaignsCount ?? 0,
        days_since_update: Math.max(0, daysSinceUpdate),
      };
    });

  return {
    date: new Date().toISOString().slice(0, 10),
    scope: "all_clients",
    totals_30d: {
      spend: round(totals.spend),
      impressions: totals.impressions,
      clicks: totals.clicks,
      avg_ctr_pct: round(avgCtr, 2),
      avg_cpl_estimated: round(avgCpl, 2),
      leads_estimated: totalLeads,
      active_clients: totals.activeClients,
      total_clients: workspaces.length,
    },
    clients: topClients,
    ...(mutableCampaigns && mutableCampaigns.length > 0
      ? { mutable_campaigns: mutableCampaigns }
      : {}),
  };
}

function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
