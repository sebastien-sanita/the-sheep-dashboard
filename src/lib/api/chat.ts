import type { SendMessagePayload, Conversation, ConversationSummary } from "../types";
import { apiGet, apiDelete, apiStream } from "./client";

export function sendMessage(params: SendMessagePayload, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  return apiStream("/api/chat/message", params, signal);
}

export function getConversations(workspaceId?: string): Promise<ConversationSummary[]> {
  return apiGet<ConversationSummary[]>("/api/chat/conversations", workspaceId ? { workspaceId } : undefined);
}

export function getConversation(id: string): Promise<Conversation> {
  return apiGet<Conversation>(`/api/chat/conversations/${id}`);
}

export function deleteConversation(id: string): Promise<void> {
  return apiDelete(`/api/chat/conversations/${id}`);
}
