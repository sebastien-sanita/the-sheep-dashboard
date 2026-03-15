import type { ClientSummary, Client, Campaign, Platform } from "../types";
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

/** Safe number: handles null, undefined, strings, NaN */
function safeNum(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return isNaN(n) ? undefined : n;
}

/** Normalize a raw workspace object into a ClientSummary */
function normalizeClientSummary(raw: Record<string, unknown>): ClientSummary {
  // Prisma _count pattern: { _count: { adAccounts: 3, campaigns: 5 } }
  const count = (raw._count ?? raw.count) as Record<string, number> | undefined;
  const adAccounts = raw.adAccounts as Array<Record<string, unknown>> | undefined;

  // Extract platforms from nested adAccounts if not provided at top level
  let platforms = raw.platforms as Platform[] | undefined;
  if (!platforms && adAccounts) {
    const set = new Set<Platform>();
    for (const acc of adAccounts) {
      if (acc.platform) set.add(acc.platform as Platform);
    }
    platforms = set.size > 0 ? Array.from(set) : undefined;
  }

  // Compute campaign count from nested data if not at top level
  let campaignCount = safeNum(raw.activeCampaignsCount);
  if (campaignCount === undefined) {
    campaignCount = safeNum(count?.campaigns) ?? safeNum(count?.Campaign);
  }
  if (campaignCount === undefined && adAccounts) {
    let total = 0;
    for (const acc of adAccounts) {
      const camps = acc.campaigns as unknown[] | undefined;
      if (camps) total += camps.length;
    }
    if (total > 0) campaignCount = total;
  }

  return {
    id: raw.id as string,
    name: raw.name as string,
    slug: (raw.slug as string) ?? "",
    notes: (raw.notes as string | null) ?? null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
    adAccountsCount: safeNum(raw.adAccountsCount) ?? safeNum(count?.adAccounts) ?? safeNum(count?.AdAccount) ?? adAccounts?.length,
    connectedAccountsCount: safeNum(raw.connectedAccountsCount) ?? safeNum(raw.adAccountsCount) ?? adAccounts?.length,
    activeCampaignsCount: campaignCount,
    totalSpend: safeNum(raw.totalSpend),
    totalSpend30d: safeNum(raw.totalSpend30d),
    totalImpressions30d: safeNum(raw.totalImpressions30d),
    totalClicks30d: safeNum(raw.totalClicks30d),
    platforms,
    sector: (raw.sector as string) ?? undefined,
    isActive: typeof raw.isActive === "boolean" ? raw.isActive : undefined,
  };
}

export async function getWorkspaces(): Promise<ClientSummary[]> {
  const raw = await apiGet<unknown>("/api/workspaces/me");
  const items = unwrapArray<Record<string, unknown>>(raw);
  return items.map(normalizeClientSummary);
}

export async function getWorkspace(id: string): Promise<Client> {
  const raw = await apiGet<unknown>(`/api/workspaces/${id}`);
  return unwrap<Client>(raw);
}

export async function getWorkspaceCampaigns(id: string): Promise<Campaign[]> {
  const raw = await apiGet<unknown>(`/api/workspaces/${id}/campaigns`);
  const items = unwrapArray<Record<string, unknown>>(raw);
  // Normalize budget fields
  return items.map((c) => ({
    ...c,
    budget: safeNum(c.budget) ?? safeNum(c.dailyBudget) ?? safeNum(c.lifetime_budget) ?? safeNum(c.lifetimeBudget) ?? null,
  })) as Campaign[];
}
