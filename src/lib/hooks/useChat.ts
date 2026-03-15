"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatStreamEvent, Message, ToolCall } from "../types";
import { sendMessage as apiSendMessage, getConversation } from "../api/chat";
import { useChatStore } from "../stores/chat-store";
import { useDashboardStore } from "../stores/dashboard-store";
import { useAppStore } from "../stores/app-store";

// ---------------------------------------------------------------------------
// SSE parser — async generator that yields typed ChatStreamEvents
// ---------------------------------------------------------------------------

function parseSseEventBlock(block: string): ChatStreamEvent | null {
  let eventType = "";
  let data = "";

  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) {
      eventType = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      data = line.slice(6);
    } else if (line.startsWith("data:")) {
      // "data:" without space — still valid SSE
      data = line.slice(5);
    }
  }

  if (!eventType || !data) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  switch (eventType) {
    case "text_delta":
      return { type: "text_delta", delta: (parsed as { delta: string }).delta };

    case "tool_use_start":
      return {
        type: "tool_use_start",
        toolCall: parsed as { id: string; name: string; input: Record<string, unknown> },
      };

    case "tool_use_result":
      return {
        type: "tool_use_result",
        toolCall: parsed as { id: string; name: string; output: Record<string, unknown> },
      };

    case "dashboard_block":
      return { type: "dashboard_block", block: parsed as ChatStreamEvent extends { type: "dashboard_block"; block: infer B } ? B : never } as ChatStreamEvent;

    case "message_complete":
      return {
        type: "message_complete",
        message: (parsed as { messageId: string; conversationId: string }),
      } as unknown as ChatStreamEvent;

    case "error":
      return { type: "error", error: parsed as { message: string; code?: string } };

    default:
      return null;
  }
}

async function* parseSseStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatStreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let chunkCount = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Debug: log first 3 chunks
        if (chunkCount < 3) {
          console.log(`[SSE] Chunk #${chunkCount}:`, JSON.stringify(chunk.slice(0, 200)));
          chunkCount++;
        }
      }

      // Split on double newline — SSE event boundary
      const parts = buffer.split("\n\n");
      // Last part is either empty (if buffer ended with \n\n) or an incomplete chunk
      buffer = parts.pop()!;

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const event = parseSseEventBlock(trimmed);
        if (event) {
          yield event;
        } else if (chunkCount <= 3) {
          console.log("[SSE] Unparsed block:", JSON.stringify(trimmed.slice(0, 200)));
        }
      }

      if (done) {
        // Process any remaining data in buffer
        if (buffer.trim()) {
          const remaining = buffer.trim();
          const event = parseSseEventBlock(remaining);
          if (event) {
            yield event;
          } else {
            // Fallback: try parsing entire buffer as JSON (non-SSE response)
            try {
              const json = JSON.parse(remaining) as Record<string, unknown>;
              console.log("[SSE] Fallback JSON response detected:", Object.keys(json));
              if (json.content && typeof json.content === "string") {
                yield { type: "text_delta", delta: json.content as string };
                yield { type: "message_complete", message: { id: (json.id as string) ?? `json_${Date.now()}`, role: "ASSISTANT", content: json.content as string, toolCalls: null, createdAt: new Date().toISOString(), conversationId: (json.conversationId as string) ?? "" } } as unknown as ChatStreamEvent;
              } else if (json.message && typeof json.message === "string") {
                yield { type: "text_delta", delta: json.message as string };
              } else if (json.data && typeof json.data === "object") {
                const data = json.data as Record<string, unknown>;
                if (data.content && typeof data.content === "string") {
                  yield { type: "text_delta", delta: data.content as string };
                }
              }
            } catch {
              console.log("[SSE] Final buffer not JSON:", remaining.slice(0, 200));
            }
          }
        }
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// useChat hook
// ---------------------------------------------------------------------------

export function useChat(clientId?: string) {
  const {
    messages,
    isStreaming,
    streamingContent,
    activeToolCalls,
    activeConversationId,
    setActiveConversation,
    setActiveConversationTitle,
    setMessages,
    addMessage,
    setIsStreaming,
    setStreamingContent,
    appendStreamingContent,
    addToolCall,
    updateToolCallResult,
    clearToolCalls,
    startNewConversation,
  } = useChatStore();

  const addBlock = useDashboardStore((s) => s.addBlock);
  const blocksRef = useRef(useDashboardStore.getState().blocks);
  const setActivePanelMode = useAppStore((s) => s.setActivePanelMode);

  // Keep blocksRef in sync without re-renders
  useEffect(() => {
    return useDashboardStore.subscribe((s) => {
      blocksRef.current = s.blocks;
    });
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort on unmount if still streaming
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      // --- Race condition guard: abort any in-flight stream ---
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Timeout: abort after 2 minutes if no response
      const timeoutId = setTimeout(() => abortController.abort(), 120_000);

      // 1. Add user message
      const userMessage: Message = {
        id: `temp_${Date.now()}`,
        role: "USER",
        content,
        toolCalls: null,
        createdAt: new Date().toISOString(),
        conversationId: activeConversationId ?? "",
      };
      addMessage(userMessage);

      // 2. Reset streaming state
      setStreamingContent("");
      clearToolCalls();
      setIsStreaming(true);

      let accumulatedContent = "";
      const accumulatedToolCalls: ToolCall[] = [];
      let finalMessageId: string | null = null;
      let finalConversationId: string | null = activeConversationId;

      try {
        // 3. Start SSE stream
        const stream = await apiSendMessage(
          {
            content,
            conversationId: activeConversationId ?? undefined,
            workspaceId: clientId,
          },
          abortController.signal,
        );

        // Clear timeout once stream is connected
        clearTimeout(timeoutId);

        // 4-6. Parse events
        for await (const event of parseSseStream(stream)) {
          // Check if aborted between events
          if (abortController.signal.aborted) break;

          switch (event.type) {
            case "text_delta": {
              accumulatedContent += event.delta;
              appendStreamingContent(event.delta);
              break;
            }

            case "tool_use_start": {
              const toolCall: ToolCall = {
                id: event.toolCall.id,
                name: event.toolCall.name,
                input: event.toolCall.input,
              };
              accumulatedToolCalls.push(toolCall);
              addToolCall(toolCall);
              break;
            }

            case "tool_use_result": {
              const idx = accumulatedToolCalls.findIndex(
                (tc) => tc.id === event.toolCall.id,
              );
              if (idx !== -1) {
                accumulatedToolCalls[idx] = {
                  ...accumulatedToolCalls[idx],
                  output: event.toolCall.output,
                };
              }
              updateToolCallResult(event.toolCall.id, event.toolCall.output);
              break;
            }

            case "dashboard_block": {
              const isFirstBlock = blocksRef.current.length === 0;
              addBlock(event.block);
              if (isFirstBlock) {
                setActivePanelMode("split");
              }
              break;
            }

            case "message_complete": {
              // The backend sends { messageId, conversationId } in this event
              const completeData = event as unknown as {
                type: "message_complete";
                message: { messageId: string; conversationId: string };
              };
              finalMessageId = completeData.message.messageId;
              finalConversationId =
                completeData.message.conversationId ?? finalConversationId;

              const assistantMessage: Message = {
                id: finalMessageId,
                role: "ASSISTANT",
                content: accumulatedContent,
                toolCalls:
                  accumulatedToolCalls.length > 0
                    ? accumulatedToolCalls
                    : null,
                createdAt: new Date().toISOString(),
                conversationId: finalConversationId ?? "",
              };

              addMessage(assistantMessage);
              setStreamingContent("");
              setIsStreaming(false);
              clearToolCalls();

              if (finalConversationId && finalConversationId !== activeConversationId) {
                setActiveConversation(finalConversationId);
              }
              break;
            }

            case "error": {
              setIsStreaming(false);
              const errorMessage: Message = {
                id: `error_${Date.now()}`,
                role: "ASSISTANT",
                content: `Erreur : ${event.error.message}`,
                toolCalls: null,
                createdAt: new Date().toISOString(),
                conversationId: activeConversationId ?? "",
              };
              addMessage(errorMessage);
              break;
            }
          }
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        // Don't treat abort as an error
        if (err instanceof DOMException && err.name === "AbortError") {
          // Stream was intentionally aborted — finalize if we have content
          if (accumulatedContent) {
            const partialMessage: Message = {
              id: `partial_${Date.now()}`,
              role: "ASSISTANT",
              content: accumulatedContent,
              toolCalls:
                accumulatedToolCalls.length > 0 ? accumulatedToolCalls : null,
              createdAt: new Date().toISOString(),
              conversationId: activeConversationId ?? "",
            };
            addMessage(partialMessage);
            setStreamingContent("");
          } else if (!abortControllerRef.current) {
            // Timeout abort (controller was cleared) with no content
            addMessage({
              id: `error_${Date.now()}`,
              role: "ASSISTANT",
              content: "La réponse a pris trop de temps. L'IA est peut-être surchargée — réessayez dans quelques instants.",
              toolCalls: null,
              createdAt: new Date().toISOString(),
              conversationId: activeConversationId ?? "",
            });
          }
        } else {
          const errMsg = err instanceof Error ? err.message : "";
          const isNetworkError = errMsg.includes("fetch") || errMsg.includes("network") || errMsg.includes("Failed");
          addMessage({
            id: `error_${Date.now()}`,
            role: "ASSISTANT",
            content: isNetworkError
              ? "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez."
              : `Erreur : ${errMsg || "Une erreur est survenue. Veuillez réessayer."}`,
            toolCalls: null,
            createdAt: new Date().toISOString(),
            conversationId: activeConversationId ?? "",
          });
        }
        setIsStreaming(false);
        clearToolCalls();
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [
      clientId,
      activeConversationId,
      addMessage,
      setStreamingContent,
      clearToolCalls,
      setIsStreaming,
      appendStreamingContent,
      addToolCall,
      updateToolCallResult,
      addBlock,
      setActivePanelMode,
      setActiveConversation,
    ],
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const loadConversation = useCallback(
    async (id: string) => {
      setIsLoadingConversation(true);
      try {
        const conversation = await getConversation(id);
        setActiveConversation(id);
        setActiveConversationTitle(conversation.title);
        setMessages(conversation.messages);
      } catch {
        // silently fail — conversation may have been deleted
      } finally {
        setIsLoadingConversation(false);
      }
    },
    [setActiveConversation, setActiveConversationTitle, setMessages],
  );

  return {
    messages,
    isStreaming,
    streamingContent,
    activeToolCalls,
    activeConversationId,
    sendMessage,
    stopStreaming,
    startNewConversation,
    loadConversation,
    isLoadingConversation,
  };
}
