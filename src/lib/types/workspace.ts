// ============================================================
// Workspace (Client) types — mirrors backend Prisma models
// ============================================================

// --- Enums ---

export type Platform = "META" | "GOOGLE" | "LINKEDIN" | "TIKTOK";

export type AccountStatus = "ACTIVE" | "EXPIRED" | "ERROR" | "DISCONNECTED";

export type CampaignStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

export type BudgetType = "DAILY" | "LIFETIME";

// --- Core models ---

export interface Ad {
  id: string;
  platformId: string;
  name: string;
  status: string;
  creativeData: Record<string, unknown> | null;
  adSetId: string;
}

export interface AdSet {
  id: string;
  platformId: string;
  name: string;
  status: string;
  targeting: Record<string, unknown> | null;
  budget: number | null;
  bidStrategy: string | null;
  campaignId: string;
  ads?: Ad[];
}

export interface Campaign {
  id: string;
  platformId: string;
  name: string;
  status: CampaignStatus;
  objective: string | null;
  budget: number | null;
  budgetType: BudgetType | null;
  startDate: string | null;
  endDate: string | null;
  lastSyncAt: string | null;
  adAccountId: string;
  adSets?: AdSet[];
}

export interface AdAccount {
  id: string;
  platform: Platform;
  platformId: string;
  name: string;
  status: AccountStatus;
  lastSyncAt: string | null;
  clientId: string;
  campaigns?: Campaign[];
}

export interface Page {
  id: string;
  name: string;
  platformId: string;
  platform: Platform;
}

export interface Pixel {
  id: string;
  name: string;
  platformId: string;
  platform: Platform;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  adAccounts?: AdAccount[];
  pages?: Page[];
  pixels?: Pixel[];
}

// --- API-specific response shapes ---

/** Lightweight client returned by GET /api/workspaces/me (list view). */
export interface ClientSummary {
  id: string;
  name: string;
  slug: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  adAccountsCount?: number;
  connectedAccountsCount?: number;
  activeCampaignsCount?: number;
  totalSpend?: number;
  totalSpend30d?: number;
  totalImpressions30d?: number;
  totalClicks30d?: number;
  platforms?: Platform[];
  sector?: string;
  isActive?: boolean;
}

// --- Sync ---

export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncResult {
  workspaceId: string;
  status: SyncStatus;
  syncedAt: string | null;
  error: string | null;
  accountsSynced: number;
}

export interface DiscoverResult {
  discovered: {
    platform: Platform;
    platformId: string;
    name: string;
  }[];
}
