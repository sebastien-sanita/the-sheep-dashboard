"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  placeholder?: string;
}

export function ChatInput({ onSend, isStreaming, onStop, placeholder = "Pose ta question..." }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevStreamingRef = useRef(isStreaming);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) textareaRef.current?.focus();
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  }, [value, isStreaming, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  return (
    <div className="shrink-0 p-3" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border-default)" }}>
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
          className="w-full resize-none outline-none disabled:opacity-60"
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            padding: "10px 44px 10px 14px",
            color: "var(--color-text-primary)",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            lineHeight: 1.5,
            transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-accent-muted)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border-default)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <div className="absolute" style={{ bottom: 8, right: 8 }}>
          {isStreaming ? (
            <button type="button" onClick={onStop} aria-label="Arrêter"
              style={{ width: 26, height: 26, display: "grid", placeItems: "center", borderRadius: "var(--radius-xs)", background: "var(--color-danger)", border: "none", color: "var(--color-accent-contrast)", cursor: "pointer", transition: "all var(--transition-fast)" }}>
              <Square size={12} />
            </button>
          ) : (
            <button type="button" onClick={handleSend} disabled={!value.trim()} aria-label="Envoyer"
              className="disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ width: 26, height: 26, display: "grid", placeItems: "center", borderRadius: "var(--radius-xs)", background: "var(--color-accent)", border: "none", color: "var(--color-accent-contrast)", cursor: "pointer", transition: "all var(--transition-fast)" }}
              onMouseEnter={(e) => { if (value.trim()) { e.currentTarget.style.background = "var(--color-accent-hover)"; e.currentTarget.style.boxShadow = "var(--shadow-glow-accent)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.boxShadow = "none"; }}>
              <ArrowUp size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
