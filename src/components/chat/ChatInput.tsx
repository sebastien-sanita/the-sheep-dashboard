"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { SendHorizontal, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
  placeholder = "Pose ta question sur les performances...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevStreamingRef = useRef(isStreaming);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Re-focus when streaming ends
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      textareaRef.current?.focus();
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  }, [value, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="shrink-0 border-t border-slate-700/50 bg-slate-900 p-3">
      <div className="relative mx-auto max-w-3xl">
        <label htmlFor="chat-input" className="sr-only">Message</label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 py-3 pl-4 pr-12 text-[13px] text-slate-50 outline-none placeholder:text-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 disabled:opacity-60"
        />

        <div className="absolute bottom-2.5 right-2.5">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="rounded-lg bg-danger-600 p-1.5 text-white transition-colors hover:bg-danger-500"
              aria-label="Arrêter la génération"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!value.trim()}
              className="rounded-lg bg-primary-600 p-1.5 text-white transition-colors hover:bg-primary-500 disabled:opacity-40"
              aria-label="Envoyer le message"
            >
              <SendHorizontal size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
