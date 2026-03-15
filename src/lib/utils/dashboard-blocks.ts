import type { DashboardBlock, KPIItem } from "../types";
import { formatCurrency, formatCompact } from "./format";

interface RawToolCall {
  name: string;
  input?: Record<string, unknown>;
  result?: unknown;
  output?: unknown;
}

function getResult(tc: RawToolCall): Record<string, unknown> | unknown[] | null {
  const r = tc.result ?? tc.output;
  if (!r) return null;
  if (typeof r === "object") return r as Record<string, unknown>;
  return null;
}

/**
 * Auto-generate dashboard blocks from chat tool call results.
 * Handles: list_clients, get_metrics_summary, get_campaign_insights, etc.
 */
export function generateDashboardBlocks(toolCalls: RawToolCall[]): DashboardBlock[] {
  const blocks: DashboardBlock[] = [];

  // Collect all metrics summaries for potential bar chart
  const metricsEntries: { name: string; spend: number; impressions: number; clicks: number; ctr: number }[] = [];

  // Find client list for name resolution
  const clientList = toolCalls.find((tc) => tc.name === "list_clients");
  const clientMap = new Map<string, string>();
  if (clientList) {
    const result = getResult(clientList);
    if (Array.isArray(result)) {
      for (const c of result) {
        const client = c as Record<string, unknown>;
        if (client.id && client.name) clientMap.set(client.id as string, client.name as string);
      }
    }
  }

  for (const tc of toolCalls) {
    const result = getResult(tc);
    if (!result) continue;

    // --- list_clients → table ---
    if (tc.name === "list_clients" && Array.isArray(result)) {
      const rows = (result as Record<string, unknown>[]).filter((c) => {
        const campaigns = Number(c.campaigns ?? c.activeCampaignsCount ?? 0);
        return campaigns > 0 || Number(c.connectedAccountCount ?? c.connectedAccounts ?? 0) > 0;
      });
      if (rows.length > 0) {
        blocks.push({
          type: "table",
          title: "Clients",
          columns: [
            { key: "name", label: "Client", format: "text" },
            { key: "sector", label: "Secteur", format: "text" },
            { key: "campaigns", label: "Campagnes", format: "number" },
          ],
          rows: rows.slice(0, 15),
          sortable: true,
        });
      }
    }

    // --- get_metrics_summary → KPI grid ---
    if (tc.name === "get_metrics_summary" && !Array.isArray(result)) {
      const r = result as Record<string, unknown>;
      const spend = Number(r.spend) || 0;
      if (spend > 0) {
        const changes = (r.changes ?? r.trends) as Record<string, number> | undefined;
        const items: KPIItem[] = [];

        if (r.spend != null) {
          const trend = changes?.spend;
          items.push({
            label: "Dépense",
            value: formatCurrency(spend),
            trend: trend != null ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%` : undefined,
            trendDirection: trend != null ? (trend > 0 ? "up" : "down") : undefined,
            color: trend != null ? (trend > 0 ? "danger" : "success") : "default",
          });
        }
        if (r.impressions != null) items.push({ label: "Impressions", value: formatCompact(Number(r.impressions)) });
        if (r.clicks != null) items.push({ label: "Clics", value: formatCompact(Number(r.clicks)) });
        if (r.ctr != null) items.push({ label: "CTR", value: `${Number(r.ctr).toFixed(2)}%` });
        if (r.cpc != null) items.push({ label: "CPC", value: formatCurrency(Number(r.cpc)) });
        if (r.cpm != null) items.push({ label: "CPM", value: formatCurrency(Number(r.cpm)) });

        if (items.length > 0) {
          blocks.push({ type: "kpi_grid", items });
        }

        // Collect for bar chart
        const wsId = (tc.input?.workspace_id ?? tc.input?.workspaceId) as string | undefined;
        const clientName = wsId ? clientMap.get(wsId) : undefined;
        if (clientName) {
          metricsEntries.push({
            name: clientName,
            spend,
            impressions: Number(r.impressions) || 0,
            clicks: Number(r.clicks) || 0,
            ctr: Number(r.ctr) || 0,
          });
        }
      }
    }

    // --- get_campaign_insights / get_campaign_details → KPI grid ---
    if ((tc.name === "get_campaign_insights" || tc.name === "get_campaign_details") && !Array.isArray(result)) {
      const r = result as Record<string, unknown>;
      if (r.spend != null) {
        const items: KPIItem[] = [
          { label: "Dépense", value: formatCurrency(Number(r.spend)) },
        ];
        if (r.impressions != null) items.push({ label: "Impressions", value: formatCompact(Number(r.impressions)) });
        if (r.clicks != null) items.push({ label: "Clics", value: formatCompact(Number(r.clicks)) });
        if (r.ctr != null) items.push({ label: "CTR", value: `${Number(r.ctr).toFixed(2)}%` });
        blocks.push({ type: "kpi_grid", items });
      }
    }
  }

  // --- Bar chart from multiple metrics summaries ---
  if (metricsEntries.length > 1) {
    metricsEntries.sort((a, b) => b.spend - a.spend);
    blocks.push({
      type: "bar_chart",
      title: "Dépenses par client",
      xAxisKey: "name",
      series: [{ key: "spend", label: "Dépense", color: "#818cf8" }],
      data: metricsEntries.map((e) => ({
        name: e.name.length > 15 ? e.name.slice(0, 15) + "…" : e.name,
        spend: e.spend,
      })),
    });
  }

  return blocks;
}
