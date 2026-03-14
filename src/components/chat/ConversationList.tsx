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
        <p className="text-[12px] text-slate-500">Aucune conversation</p>
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
              className={cn(
                "w-full rounded-lg p-2 text-left transition-colors",
                isActive
                  ? "border-l-2 border-primary-500 bg-slate-800/80"
                  : "border-l-2 border-transparent hover:bg-slate-800",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] text-slate-300">
                  {conv.title || "Conversation sans titre"}
                </span>
                {conv.messageCount !== undefined && conv.messageCount > 0 && (
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {conv.messageCount}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                {formatDate(conv.updatedAt, "short")}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
