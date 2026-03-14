"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, History } from "lucide-react";
import { useChat } from "@/lib/hooks/useChat";
import { useChatStore } from "@/lib/stores/chat-store";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ConversationList } from "./ConversationList";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

interface ChatPanelProps {
  clientId?: string;
}

export function ChatPanel({ clientId }: ChatPanelProps) {
  const {
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
  } = useChat(clientId);

  const activeConversationTitle = useChatStore((s) => s.activeConversationTitle);

  const [showHistory, setShowHistory] = useState(false);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      await loadConversation(id);
      setShowHistory(false);
    },
    [loadConversation],
  );

  const headerTitle = useMemo(() => {
    if (!activeConversationId && messages.length === 0) return "Nouvelle conversation";
    if (activeConversationTitle) return activeConversationTitle;
    return "Conversation en cours...";
  }, [activeConversationId, activeConversationTitle, messages.length]);

  const isEmpty = messages.length === 0 && !isStreaming && !isLoadingConversation;

  return (
    <div className="relative flex h-full flex-col bg-slate-900">
      {/* History drawer */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 z-10 w-60 border-r border-slate-700 bg-slate-900 transition-transform duration-200 ease-in-out",
          showHistory ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 items-center border-b border-slate-700/50 px-3">
          <span className="text-[12px] font-medium text-slate-400">
            Historique
          </span>
        </div>
        <ConversationList
          onSelect={handleSelectConversation}
          activeConversationId={activeConversationId}
          clientId={clientId}
        />
      </div>

      {/* Click-away overlay when drawer is open */}
      {showHistory && (
        <div
          className="absolute inset-0 z-[5]"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-700/50 bg-slate-900 px-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              showHistory
                ? "bg-slate-800 text-primary-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
            )}
            aria-label="Historique des conversations"
          >
            <History size={16} />
          </button>
          <span className="truncate text-[13px] font-medium text-slate-300">
            {headerTitle}
          </span>
        </div>
        <button
          type="button"
          onClick={startNewConversation}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          aria-label="Nouvelle conversation"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Content */}
      {isLoadingConversation ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-primary-400" />
          <span className="text-[12px] text-slate-500">Chargement de la conversation...</span>
        </div>
      ) : isEmpty ? (
        <SuggestedPrompts onSend={sendMessage} clientId={clientId} />
      ) : (
        <>
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            activeToolCalls={activeToolCalls}
          />
          <ChatInput
            onSend={sendMessage}
            isStreaming={isStreaming}
            onStop={stopStreaming}
          />
        </>
      )}

      {isEmpty && (
        <ChatInput
          onSend={sendMessage}
          isStreaming={isStreaming}
          onStop={stopStreaming}
          placeholder="Ou tape ta question directement..."
        />
      )}
    </div>
  );
}
