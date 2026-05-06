import type { DashboardBlock, KPIItem, TableColumn } from "../types";
import { formatCurrency, formatCompact, formatPercent } from "./format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawToolCall {
  name: string;
  input?: Record<string, unknown>;
  result?: unknown;
  output?: unknown;
}

type Obj = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getResult(tc: RawToolCall): unknown {
  return tc.result ?? tc.output ?? null;
}

function asArray(r: unknown): Obj[] | null {
  if (Array.isArray(r)) return r as Obj[];
  if (r && typeof r === "object") {
    const o = r as Obj;
    // Unwrap common wrappers
    for (const key of ["data", "ads", "creatives", "adsets", "adSets", "campaigns", "items", "results"]) {
      if (Array.isArray(o[key])) return o[key] as Obj[];
    }
  }
  return null;
}

function asObj(r: unknown): Obj | null {
  if (r && typeof r === "object" && !Array.isArray(r)) return r as Obj;
  return null;
}

function num(v: unknown): number { return Number(v) || 0; }

function fmtKpi(label: string, value: unknown, format: "currency" | "compact" | "percent" | "number" = "number"): KPIItem | null {
  if (value == null) return null;
  const n = Number(value);
  if (!isFinite(n)) return null;
  const v = format === "currency" ? formatCurrency(n) : format === "compact" ? formatCompact(n) : format === "percent" ? formatPercent(n, 2) : String(Math.round(n));
  return { label, value: v };
}

// ---------------------------------------------------------------------------
// Specific builders
// ---------------------------------------------------------------------------

function buildMetricsKpis(r: Obj, clientName?: string): DashboardBlock {
  const changes = (r.changes ?? r.trends) as Obj | undefined;
  const items: KPIItem[] = [];

  const spend = num(r.spend);
  if (spend > 0) {
    const trend = changes?.spend != null ? Number(changes.spend) : undefined;
    items.push({
      label: clientName ? `Dépense ${clientName}` : "Dépense",
      value: formatCurrency(spend),
      trend: trend != null ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%` : undefined,
      trendDirection: trend != null ? (trend > 0 ? "up" : "down") : undefined,
      color: trend != null ? (trend > 0 ? "danger" : "success") : "default",
    });
  }
  const kv: [string, unknown, "currency" | "compact" | "percent"][] = [
    ["Impressions", r.impressions, "compact"], ["Clics", r.clicks, "compact"],
    ["CTR", r.ctr, "percent"], ["CPC", r.cpc, "currency"], ["CPM", r.cpm, "currency"],
  ];
  for (const [label, val, fmt] of kv) { const k = fmtKpi(label, val, fmt); if (k) items.push(k); }
  return { type: "kpi_grid", items };
}

function buildClientsTable(data: Obj[]): DashboardBlock {
  const rows = data.filter((c) => num(c.campaigns ?? c.activeCampaignsCount) > 0 || num(c.connectedAccountCount ?? c.connectedAccounts) > 0);
  return {
    type: "table", title: "Clients", sortable: true,
    columns: [
      { key: "name", label: "Client", format: "text" },
      { key: "sector", label: "Secteur", format: "text" },
      { key: "campaigns", label: "Campagnes", format: "number" },
    ],
    rows: rows.slice(0, 20),
  };
}

function buildCreativesTable(ads: Obj[]): DashboardBlock {
  const avgCtr = ads.length > 0 ? ads.reduce((s, a) => s + num(a.ctr ?? (a.metrics as Obj)?.ctr), 0) / ads.length : 0;
  const rows = [...ads].sort((a, b) => num(b.spend ?? (b.metrics as Obj)?.spend) - num(a.spend ?? (a.metrics as Obj)?.spend)).slice(0, 20).map((ad) => {
    const m = (ad.metrics as Obj) ?? ad;
    const ctr = num(m.ctr);
    return {
      name: ad.name as string ?? "—",
      format: detectAdFormat(ad),
      ctr: `${ctr.toFixed(2)}%`,
      cpc: formatCurrency(num(m.cpc)),
      spend: formatCurrency(num(m.spend)),
      _perf: ctr > avgCtr * 1.2 ? "Top" : ctr < avgCtr * 0.5 ? "Sous-perf." : "",
    };
  });
  return {
    type: "table", title: "Créatifs", sortable: true,
    columns: [
      { key: "name", label: "Créatif", format: "text" },
      { key: "format", label: "Format", format: "text" },
      { key: "ctr", label: "CTR", format: "text" },
      { key: "cpc", label: "CPC", format: "text" },
      { key: "spend", label: "Dépense", format: "text" },
      { key: "_perf", label: "Perf.", format: "text" },
    ],
    rows,
  };
}

function detectAdFormat(ad: Obj): string {
  const name = String(ad.name ?? "").toLowerCase();
  if (name.includes("carrousel") || name.includes("carousel")) return "Carrousel";
  const creative = (ad.creative ?? ad.creativeData) as Obj | undefined;
  if (creative?.videoUrl || creative?.video_url || creative?.videoId || name.includes("vidéo") || name.includes("video")) return "Vidéo";
  return "Image";
}

function buildAudiencesTable(adsets: Obj[]): DashboardBlock {
  const rows = [...adsets].sort((a, b) => num(b.spend ?? (b.metrics as Obj)?.spend) - num(a.spend ?? (a.metrics as Obj)?.spend)).slice(0, 15).map((as) => {
    const m = (as.metrics as Obj) ?? as;
    return {
      name: as.name as string ?? "—",
      impressions: formatCompact(num(m.impressions)),
      clicks: formatCompact(num(m.clicks)),
      ctr: `${num(m.ctr).toFixed(2)}%`,
      cpc: formatCurrency(num(m.cpc)),
      spend: formatCurrency(num(m.spend)),
    };
  });
  return {
    type: "table", title: "Audiences", sortable: true,
    columns: [
      { key: "name", label: "Audience", format: "text" },
      { key: "impressions", label: "Impressions", format: "text" },
      { key: "clicks", label: "Clics", format: "text" },
      { key: "ctr", label: "CTR", format: "text" },
      { key: "cpc", label: "CPC", format: "text" },
      { key: "spend", label: "Dépense", format: "text" },
    ],
    rows,
  };
}

function buildConversionKpis(r: unknown): DashboardBlock {
  const o = asObj(r) ?? {};
  const items: KPIItem[] = [];
  const leads = num(o.leads ?? o.lead);
  const spend = num(o.spend);
  if (leads > 0) items.push({ label: "Leads", value: String(leads) });
  if (leads > 0 && spend > 0) items.push({ label: "CPL", value: formatCurrency(spend / leads) });
  if (spend > 0) items.push({ label: "Dépense", value: formatCurrency(spend) });
  const k = fmtKpi("CTR", o.ctr, "percent"); if (k) items.push(k);
  if (items.length === 0) items.push({ label: "Conversions", value: "Données disponibles" });
  return { type: "kpi_grid", items };
}

function buildFrequencyBlock(r: unknown): DashboardBlock {
  const o = asObj(r) ?? {};
  const freq = num(o.frequency ?? o.averageFrequency);
  const items: KPIItem[] = [
    { label: "Fréquence", value: freq > 0 ? freq.toFixed(1) : "—", color: freq > 3 ? "danger" : freq > 2 ? "warning" : "default" },
  ];
  const k1 = fmtKpi("Reach", o.reach, "compact"); if (k1) items.push(k1);
  const k2 = fmtKpi("Impressions", o.impressions, "compact"); if (k2) items.push(k2);
  return { type: "kpi_grid", items };
}

function buildAutoTable(name: string, data: Obj[]): DashboardBlock {
  const sample = data[0];
  const cols: TableColumn[] = Object.keys(sample).slice(0, 6).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    format: typeof sample[key] === "number" ? "number" as const : "text" as const,
  }));
  return { type: "table", title: name.replace(/_/g, " "), columns: cols, rows: data.slice(0, 20), sortable: true };
}

function buildAutoKpis(name: string, data: Obj, keys: string[]): DashboardBlock {
  const items: KPIItem[] = keys.slice(0, 6).map((key) => {
    const v = Number(data[key]);
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
    const isCurrency = key.includes("spend") || key.includes("cost") || key.includes("cpc") || key.includes("cpm") || key.includes("cpl");
    return { label, value: isCurrency ? formatCurrency(v) : v > 10000 ? formatCompact(v) : String(Math.round(v * 100) / 100) };
  });
  return { type: "kpi_grid", items };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function generateDashboardBlocks(toolCalls: RawToolCall[]): DashboardBlock[] {
  const blocks: DashboardBlock[] = [];
  const metricsEntries: { name: string; spend: number }[] = [];

  // Index clients for name resolution
  const clientMap = new Map<string, string>();
  for (const tc of toolCalls) {
    if (tc.name === "list_clients") {
      const arr = asArray(getResult(tc));
      if (arr) arr.forEach((c) => { if (c.id && c.name) clientMap.set(c.id as string, c.name as string); });
    }
  }

  let hasSpecificBlocks = false;

  for (const tc of toolCalls) {
    const raw = getResult(tc);
    if (!raw) continue;

    switch (tc.name) {
      case "list_clients":
        // Deferred — only add if no other blocks
        break;

      case "get_metrics_summary": {
        const o = asObj(raw);
        if (o && num(o.spend) > 0) {
          const wsId = (tc.input?.workspace_id ?? tc.input?.workspaceId) as string | undefined;
          const name = wsId ? clientMap.get(wsId) : undefined;
          blocks.push(buildMetricsKpis(o, name));
          if (name) metricsEntries.push({ name, spend: num(o.spend) });
          hasSpecificBlocks = true;
        }
        break;
      }

      case "get_campaign_details":
      case "get_campaign_insights": {
        const arr = asArray(raw);
        if (arr && arr.length > 0) {
          // Multiple campaigns → table
          blocks.push({
            type: "table", title: "Campagnes", sortable: true,
            columns: [
              { key: "name", label: "Campagne", format: "text" },
              { key: "status", label: "Statut", format: "text" },
              { key: "spend", label: "Dépense", format: "currency" },
              { key: "impressions", label: "Impressions", format: "number" },
              { key: "clicks", label: "Clics", format: "number" },
            ],
            rows: arr.slice(0, 15),
          });
        } else {
          const o = asObj(raw);
          if (o && (o.spend != null || o.impressions != null)) {
            blocks.push(buildMetricsKpis(o));
          }
        }
        hasSpecificBlocks = true;
        break;
      }

      case "get_ad_creatives": {
        const arr = asArray(raw);
        if (arr && arr.length > 0) { blocks.push(buildCreativesTable(arr)); hasSpecificBlocks = true; }
        break;
      }

      case "get_adset_details": {
        const arr = asArray(raw);
        if (arr && arr.length > 0) { blocks.push(buildAudiencesTable(arr)); hasSpecificBlocks = true; }
        break;
      }

      case "get_conversion_events": {
        blocks.push(buildConversionKpis(raw));
        hasSpecificBlocks = true;
        break;
      }

      case "get_frequency_data": {
        blocks.push(buildFrequencyBlock(raw));
        hasSpecificBlocks = true;
        break;
      }

      case "generate_dashboard_data": {
        const o = asObj(raw);
        if (o?.blocks && Array.isArray(o.blocks)) {
          blocks.push(...(o.blocks as DashboardBlock[]));
          hasSpecificBlocks = true;
        }
        break;
      }

      case "run_custom_query":
      default: {
        // Auto-detect format
        const arr = asArray(raw);
        if (arr && arr.length > 0) {
          blocks.push(buildAutoTable(tc.name, arr));
          hasSpecificBlocks = true;
        } else {
          const o = asObj(raw);
          if (o) {
            const numKeys = Object.keys(o).filter((k) => typeof o[k] === "number");
            if (numKeys.length >= 2) {
              blocks.push(buildAutoKpis(tc.name, o, numKeys));
              hasSpecificBlocks = true;
            }
          }
        }
        break;
      }
    }
  }

  // Add clients table only if nothing else was generated
  if (!hasSpecificBlocks) {
    const listTc = toolCalls.find((tc) => tc.name === "list_clients");
    if (listTc) {
      const arr = asArray(getResult(listTc));
      if (arr && arr.length > 0) blocks.push(buildClientsTable(arr));
    }
  }

  // Aggregate bar chart from multiple metrics summaries
  if (metricsEntries.length > 1) {
    metricsEntries.sort((a, b) => b.spend - a.spend);
    blocks.push({
      type: "bar_chart",
      title: "Comparaison des dépenses",
      xAxisKey: "name",
      series: [{ key: "spend", label: "Dépense (€)", color: "#7f996d" }],
      data: metricsEntries.map((e) => ({ name: e.name.length > 15 ? e.name.slice(0, 15) + "…" : e.name, spend: e.spend })),
    });
  }

  return blocks;
}
