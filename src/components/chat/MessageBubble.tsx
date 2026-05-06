"use client";

import { useMemo } from "react";
import { marked } from "marked";
import type { MessageRole } from "@/lib/types";

// Configure marked
marked.use({ breaks: true, gfm: true });

// Post-process HTML with design system styles
function postProcess(html: string): string {
  let r = html;

  // Tables — premium dark style
  r = r.replace(/<table>/g, '<div class="overflow-x-auto my-3" style="border:1px solid var(--color-border-default);border-radius:var(--radius-md)"><table style="width:100%;font-size:12px;border-collapse:collapse">');
  r = r.replace(/<\/table>/g, "</table></div>");
  r = r.replace(/<thead>/g, "<thead>");
  r = r.replace(/<th(?=>| )/g, '<th style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;color:var(--color-text-muted);padding:8px 12px;text-align:left;border-bottom:1px solid var(--color-border-default)"');
  r = r.replace(/<td(?=>| )/g, '<td style="padding:8px 12px;color:var(--color-text-primary);border-bottom:1px solid var(--color-border-subtle)"');

  // Headers
  r = r.replace(/<h1>/g, '<h1 style="font-size:17px;font-weight:700;color:var(--color-text-primary);margin:16px 0 8px;letter-spacing:-0.02em">');
  r = r.replace(/<h2>/g, '<h2 style="font-size:15px;font-weight:600;color:var(--color-text-primary);margin:14px 0 6px;letter-spacing:-0.01em">');
  r = r.replace(/<h3>/g, '<h3 style="font-size:14px;font-weight:600;color:var(--color-text-secondary);margin:12px 0 4px">');

  // Code
  r = r.replace(/<pre>/g, '<pre style="background:var(--color-bg-surface);border:1px solid var(--color-border-default);border-radius:var(--radius-md);padding:14px 16px;font-family:var(--font-mono);font-size:12px;color:var(--color-text-primary);overflow-x:auto;margin:8px 0">');
  r = r.replace(/<code(?=>)/g, '<code style="font-family:var(--font-mono);font-size:12px;background:var(--color-bg-elevated);padding:2px 6px;border-radius:var(--radius-xs);color:var(--color-accent-hover)"');
  r = r.replace(/(<pre[^>]*>)\s*<code style="[^"]*"/g, "$1<code");

  // Lists
  r = r.replace(/<ul>/g, '<ul style="margin:8px 0;padding-left:16px;list-style-type:disc">');
  r = r.replace(/<ol>/g, '<ol style="margin:8px 0;padding-left:16px;list-style-type:decimal">');
  r = r.replace(/<li>/g, '<li style="margin:2px 0;color:var(--color-text-primary)">');

  // Strong & em
  r = r.replace(/<strong>/g, '<strong style="font-weight:600;color:var(--color-text-primary)">');
  r = r.replace(/<em>/g, '<em style="font-style:italic;color:var(--color-text-secondary)">');

  // Hr & links
  r = r.replace(/<hr\s*\/?>/g, '<hr style="border:none;border-top:1px solid var(--color-border-default);margin:12px 0">');
  r = r.replace(/<a href="/g, '<a target="_blank" rel="noopener noreferrer" style="color:var(--color-accent);text-decoration:underline" href="');

  // Metrics highlighting
  r = r.replace(/(\+\d+[,.]?\d*\s*%)/g, '<span style="font-weight:600;color:var(--color-success)">$1</span>');
  r = r.replace(/(-\d+[,.]?\d*\s*%)/g, '<span style="font-weight:600;color:var(--color-danger)">$1</span>');
  r = r.replace(/(\d[\d\s,.]*\s*€)/g, '<span style="font-family:var(--font-mono);font-weight:600">$1</span>');

  return r;
}

function formatTime(iso?: string): string | null {
  if (!iso) return null;
  try { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); } catch { return null; }
}

interface MessageBubbleProps {
  message: { role: MessageRole; content: string; createdAt?: string };
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "USER";
  const time = formatTime(message.createdAt);

  const html = useMemo(() => {
    if (isUser) return "";
    return postProcess(marked.parse(message.content) as string);
  }, [message.content, isUser]);

  if (isUser) {
    return (
      <div className="flex justify-end group">
        <div style={{ maxWidth: "72%", background: "var(--color-accent)", borderRadius: "14px 14px 4px 14px", padding: "10px 14px", boxShadow: "var(--shadow-xs)" }}>
          <p className="whitespace-pre-wrap" style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-accent-contrast)" }}>{message.content}</p>
          {time && <p className="mt-1 text-right" style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(0,0,0,0.45)", fontFamily: "var(--font-mono)" }}>{time}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex justify-start">
      <div style={{ maxWidth: "88%", padding: "4px 0" }}>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)" }} dangerouslySetInnerHTML={{ __html: html }} />
        {isStreaming && <span style={{ color: "var(--color-accent)", animation: "blink 0.8s ease-in-out infinite" }}>▍</span>}
        {time && !isStreaming && (
          <p className="mt-1 opacity-0 transition-opacity group-hover:opacity-100" style={{ fontSize: 11, color: "var(--color-text-muted)", transition: "opacity 150ms" }}>{time}</p>
        )}
      </div>
    </div>
  );
}
