"use client";

import { useMemo } from "react";
import { marked } from "marked";
import type { MessageRole } from "@/lib/types";

// ---------------------------------------------------------------------------
// Configure marked (v17 API)
// ---------------------------------------------------------------------------

marked.use({ breaks: true, gfm: true });

// ---------------------------------------------------------------------------
// Post-process: add dark mode classes + highlight metrics
// ---------------------------------------------------------------------------

function postProcess(html: string): string {
  let r = html;

  // --- Tables ---
  r = r.replace(/<table>/g, '<div class="overflow-x-auto rounded-lg border border-slate-700 my-3"><table class="w-full text-[12px]">');
  r = r.replace(/<\/table>/g, "</table></div>");
  r = r.replace(/<thead>/g, '<thead class="bg-slate-800">');
  r = r.replace(/<th(?=>| )/g, '<th class="text-slate-300 font-semibold text-[10px] uppercase tracking-wider px-3 py-2 text-left"');
  r = r.replace(/<td(?=>| )/g, '<td class="px-3 py-2 text-slate-200 border-t border-slate-700/30"');

  // --- Headers ---
  r = r.replace(/<h1>/g, '<h1 class="text-[17px] font-bold text-white mt-4 mb-2">');
  r = r.replace(/<h2>/g, '<h2 class="text-[15px] font-semibold text-white mt-4 mb-2">');
  r = r.replace(/<h3>/g, '<h3 class="text-[14px] font-semibold text-slate-200 mt-3 mb-1">');
  r = r.replace(/<h4>/g, '<h4 class="text-[13px] font-semibold text-slate-300 mt-2 mb-1">');

  // --- Code ---
  r = r.replace(/<pre>/g, '<pre class="my-2 overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-[12px] text-slate-200">');
  r = r.replace(/<code(?=>)/g, '<code class="rounded bg-slate-700 px-1 py-0.5 font-mono text-[12px]"');
  // Don't double-class code inside pre
  r = r.replace(/(<pre[^>]*>)\s*<code class="[^"]*"/g, "$1<code");

  // --- Lists ---
  r = r.replace(/<ul>/g, '<ul class="my-2 list-disc pl-5 space-y-0.5">');
  r = r.replace(/<ol>/g, '<ol class="my-2 list-decimal pl-5 space-y-0.5">');

  // --- Strong & em ---
  r = r.replace(/<strong>/g, '<strong class="font-semibold text-white">');
  r = r.replace(/<em>/g, '<em class="italic text-slate-300">');

  // --- Hr ---
  r = r.replace(/<hr>/g, '<hr class="my-3 border-slate-700">');
  r = r.replace(/<hr\/>/g, '<hr class="my-3 border-slate-700">');

  // --- Links ---
  r = r.replace(/<a href="/g, '<a target="_blank" rel="noopener noreferrer" class="text-primary-400 underline hover:text-primary-300" href="');

  // --- Highlight metrics ---
  // Positive %
  r = r.replace(/(\+\d+[,.]?\d*\s*%)/g, '<span class="font-semibold text-emerald-400">$1</span>');
  // Negative %
  r = r.replace(/(-\d+[,.]?\d*\s*%)/g, '<span class="font-semibold text-rose-400">$1</span>');
  // Currency (€)
  r = r.replace(/(\d[\d\s,.]*\s*€)/g, '<span class="font-mono font-semibold">$1</span>');

  return r;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MessageBubbleProps {
  message: { role: MessageRole; content: string; createdAt?: string };
  isStreaming?: boolean;
}

function formatTime(iso?: string): string | null {
  if (!iso) return null;
  try { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); } catch { return null; }
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "USER";
  const time = formatTime(message.createdAt);

  const html = useMemo(() => {
    if (isUser) return "";
    const raw = marked.parse(message.content) as string;
    return postProcess(raw);
  }, [message.content, isUser]);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[500px] rounded-2xl rounded-br-md bg-primary-600 px-4 py-2.5">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white">{message.content}</p>
          {time && <p className="mt-1 text-right text-[11px] text-primary-200/60">{time}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[800px] rounded-2xl rounded-bl-md bg-slate-800 px-5 py-3">
        <div className="text-[13px] leading-relaxed text-slate-50" dangerouslySetInnerHTML={{ __html: html }} />
        {isStreaming && <span className="inline-block animate-blink text-primary-400">█</span>}
        {time && !isStreaming && <p className="mt-1.5 text-[11px] text-slate-600">{time}</p>}
      </div>
    </div>
  );
}
