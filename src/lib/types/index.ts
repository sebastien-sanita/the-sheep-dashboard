// API
export type { ApiResponse, ApiError } from "./api";
export type {
  ChatMessageParams,
  WorkspaceListParams,
  MetricsParams,
  CampaignListParams,
  SyncParams,
} from "./api";

// Workspace
export type {
  Platform,
  AccountStatus,
  CampaignStatus,
  BudgetType,
  Ad,
  AdSet,
  Campaign,
  AdAccount,
  Page,
  Pixel,
  ConnectedAccount,
  Metrics30d,
  Client,
  ClientSummary,
  SyncStatus,
  SyncResult,
  DiscoverResult,
} from "./workspace";

// Metrics
export type {
  InsightLevel,
  TrendDirection,
  MetricValue,
  InsightMetrics,
  DateRange,
  Insight,
  AggregatedMetrics,
} from "./metrics";

// Chat
export type {
  MessageRole,
  ToolCall,
  Message,
  Conversation,
  ConversationSummary,
  ChatStreamTextDelta,
  ChatStreamToolUseStart,
  ChatStreamToolUseResult,
  ChatStreamDashboardBlock,
  ChatStreamMessageComplete,
  ChatStreamError,
  ChatStreamEvent,
  SendMessagePayload,
} from "./chat";

// Auth
export type {
  LoginPayload,
  AuthUser,
  AuthResponse,
} from "./auth";

// Dashboard
export type {
  DashboardBlockType,
  KPIItem,
  KPIGridBlock,
  ChartSeries,
  LineChartBlock,
  BarChartBlock,
  DonutChartBlock,
  ColumnFormat,
  TableColumn,
  TableBlock,
  ComparisonPeriod,
  ComparisonBlock,
  AlertSeverity,
  RelatedEntity,
  AlertBlock,
  TextSummaryBlock,
  DashboardBlock,
  DashboardData,
} from "./dashboard";
