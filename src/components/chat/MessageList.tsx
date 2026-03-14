"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Message, ToolCall } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ToolCallIndicator } from "./ToolCallIndicator";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  activeToolCalls: ToolCall[];
}

export function MessageList({
  messages,
  isStreaming,
  streamingContent,
  activeToolCalls,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 150;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      sentinelRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, streamingContent]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Active tool calls */}
        {activeToolCalls.map((tc) => (
          <ToolCallIndicator key={tc.id} toolCall={tc} />
        ))}

        {/* Streaming bubble */}
        {isStreaming && streamingContent && (
          <MessageBubble
            message={{
              role: "ASSISTANT",
              content: streamingContent,
            }}
            isStreaming
          />
        )}

        <div ref={sentinelRef} />
      </div>
    </div>
  );
}
