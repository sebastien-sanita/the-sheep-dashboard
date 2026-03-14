// ============================================================
// Generic API types — request params & response wrappers
// ============================================================

// --- Response wrappers ---

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// --- Request params ---

export interface ChatMessageParams {
  content: string;
  conversationId?: string;
  workspaceId?: string;
}

export interface WorkspaceListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface MetricsParams {
  workspaceId: string;
  startDate: string;
  endDate: string;
  platform?: string;
  level?: string;
}

export interface CampaignListParams {
  workspaceId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SyncParams {
  workspaceId: string;
}
