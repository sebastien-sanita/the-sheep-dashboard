import type { SendMessagePayload, Conversation, ConversationSummary } from "../types";
import { apiGet, apiDelete, apiStream } from "./client";

/** Unwrap common API response wrappers */
function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj["data"] !== undefined) return obj["data"] as T;
  }
  return raw as T;
}

function unwrapArray<T>(raw: unknown): T[] {
  const inner = unwrap<T[] | T>(raw);
  return Array.isArray(inner) ? inner : [inner];
}

export function sendMessage(params: SendMessagePayload, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  return apiStream("/api/chat/message", params, signal);
}

export async function getConversations(workspaceId?: string): Promise<ConversationSummary[]> {
  const raw = await apiGet<unknown>("/api/chat/conversations", workspaceId ? { workspaceId } : undefined);
  return unwrapArray<ConversationSummary>(raw);
}

export async function getConversation(id: string): Promise<Conversation> {
  const raw = await apiGet<unknown>(`/api/chat/conversations/${id}`);
  return unwrap<Conversation>(raw);
}

export function deleteConversation(id: string): Promise<void> {
  return apiDelete(`/api/chat/conversations/${id}`);
}
