// ============================================================
// Chat types — mirrors backend Prisma models + SSE protocol
// ============================================================

import type { DashboardBlock } from "./dashboard";

// --- Enums ---

export type MessageRole = "USER" | "ASSISTANT";

// --- Tool calls ---

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

// --- Core models ---

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls: ToolCall[] | null;
  createdAt: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  clientId: string | null;
  messages: Message[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  clientId: string | null;
  messageCount: number;
  lastMessageAt: string | null;
}

// --- SSE stream events ---

export interface ChatStreamTextDelta {
  type: "text_delta";
  delta: string;
}

export interface ChatStreamToolUseStart {
  type: "tool_use_start";
  toolCall: {
    id: string;
    name: string;
    input: Record<string, unknown>;
  };
}

export interface ChatStreamToolUseResult {
  type: "tool_use_result";
  toolCall: {
    id: string;
    name: string;
    output: Record<string, unknown>;
  };
}

export interface ChatStreamDashboardBlock {
  type: "dashboard_block";
  block: DashboardBlock;
}

export interface ChatStreamMessageComplete {
  type: "message_complete";
  message: Message;
}

export interface ChatStreamError {
  type: "error";
  error: {
    message: string;
    code?: string;
  };
}

export type ChatStreamEvent =
  | ChatStreamTextDelta
  | ChatStreamToolUseStart
  | ChatStreamToolUseResult
  | ChatStreamDashboardBlock
  | ChatStreamMessageComplete
  | ChatStreamError;

// --- Request payloads ---

export interface SendMessagePayload {
  content: string;
  conversationId?: string;
  workspaceId?: string;
}
