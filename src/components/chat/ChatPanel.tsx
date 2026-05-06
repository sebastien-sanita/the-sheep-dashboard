"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, History } from "lucide-react";
import { useChat } from "@/lib/hooks/useChat";
import { useChatStore } from "@/lib/stores/chat-store";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ConversationList } from "./ConversationList";
import { SheepMark } from "@/components/ui/SheepMark";
import { cn } from "@/lib/utils/cn";

interface ChatPanelProps { clientId?: string }

export function ChatPanel({ clientId }: ChatPanelProps) {
  const { messages, isStreaming, streamingContent, activeToolCalls, activeConversationId, sendMessage, stopStreaming, startNewConversation, loadConversation, isLoadingConversation } = useChat(clientId);
  const activeConversationTitle = useChatStore((s) => s.activeConversationTitle);
  const [showHistory, setShowHistory] = useState(false);

  const handleSelectConversation = useCallback(async (id: string) => { await loadConversation(id); setShowHistory(false); }, [loadConversation]);

  const headerTitle = useMemo(() => {
    if (!activeConversationId && messages.length === 0) return "Nouvelle conversation";
    if (activeConversationTitle) return activeConversationTitle;
    return "Conversation en cours...";
  }, [activeConversationId, activeConversationTitle, messages.length]);

  const isEmpty = messages.length === 0 && !isStreaming && !isLoadingConversation;

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--color-bg-base)" }}>
      {/* History drawer */}
      <div className={cn("absolute inset-y-0 left-0 z-10 w-60 transition-transform duration-200 ease-in-out", showHistory ? "translate-x-0" : "-translate-x-full")}
        style={{ background: "var(--color-bg-surface)", borderRight: "1px solid var(--color-border-default)" }}>
        <div className="flex h-12 items-center px-3" style={{ borderBottom: "1px solid var(--color-border-default)" }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)" }}>Historique</span>
        </div>
        <ConversationList onSelect={handleSelectConversation} activeConversationId={activeConversationId} clientId={clientId} />
      </div>

      {showHistory && <div className="absolute inset-0 z-[5]" onClick={() => setShowHistory(false)} />}

      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between px-5" style={{ borderBottom: "1px solid var(--color-border-default)" }}>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowHistory((s) => !s)} aria-label="Historique"
            className="rounded-md p-1.5" style={{ color: showHistory ? "var(--color-accent)" : "var(--color-text-tertiary)", background: showHistory ? "var(--color-accent-subtle)" : "transparent", transition: "all var(--transition-fast)" }}>
            <History size={15} />
          </button>
          <span className="truncate" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{headerTitle}</span>
        </div>
        <button type="button" onClick={startNewConversation} aria-label="Nouvelle conversation"
          className="rounded-md p-1.5" style={{ color: "var(--color-text-tertiary)", transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; e.currentTarget.style.background = "var(--color-bg-elevated)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; e.currentTarget.style.background = "transparent"; }}>
          <Plus size={15} />
        </button>
      </div>

      {/* Content */}
      {isLoadingConversation ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full" style={{ border: "2px solid var(--color-border-emphasis)", borderTopColor: "var(--color-accent)" }} />
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Chargement...</span>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <span style={{ width: 44, height: 44, display: "grid", placeItems: "center", border: "1px solid var(--color-border-emphasis)", borderRadius: "var(--radius-md)", color: "var(--color-text-primary)" }}>
            <SheepMark size={22} />
          </span>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", color: "var(--color-text-primary)", marginTop: 14 }}>The Sheep</span>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>Interroge tes données marketing</span>
          <div style={{ marginTop: 28, width: "100%", maxWidth: 480 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, padding: "0 16px" }}>Suggestions</div>
            <SuggestedPrompts onSend={sendMessage} clientId={clientId} />
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} isStreaming={isStreaming} streamingContent={streamingContent} activeToolCalls={activeToolCalls} />
          <ChatInput onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
        </>
      )}

      {isEmpty && <ChatInput onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} placeholder="Pose ta question..." />}
    </div>
  );
}
