"use client";

import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/lib/api/chat";
import { formatDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ConversationSummary } from "@/lib/types";

interface ConversationListProps {
  onSelect: (id: string) => void;
  activeConversationId: string | null;
  clientId?: string;
}

export function ConversationList({
  onSelect,
  activeConversationId,
  clientId,
}: ConversationListProps) {
  const { data: conversations, isLoading } = useQuery<ConversationSummary[]>({
    queryKey: ["conversations", clientId || "all"],
    queryFn: () => getConversations(clientId),
  });

  const sorted = conversations
    ? [...conversations].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Aucune conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex flex-col gap-0.5">
        {sorted.map((conv) => {
          const isActive = conv.id === activeConversationId;
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelect(conv.id)}
              className="w-full rounded-lg p-2 text-left"
              style={{
                borderLeft: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
                background: isActive ? "var(--color-accent-subtle)" : "transparent",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--color-bg-elevated)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate" style={{ fontSize: 13, color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
                  {conv.title || "Conversation sans titre"}
                </span>
                {conv.messageCount !== undefined && conv.messageCount > 0 && (
                  <span className="shrink-0" style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                    {conv.messageCount}
                  </span>
                )}
              </div>
              <div className="mt-0.5" style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                {formatDate(conv.updatedAt, "short")}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
