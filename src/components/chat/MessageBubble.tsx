"use client";

import type { MessageRole } from "@/lib/types";

interface MessageBubbleProps {
  message: {
    role: MessageRole;
    content: string;
    createdAt?: string;
  };
  isStreaming?: boolean;
}

// --- Markdown parser (no external deps) ---

function parseMarkdown(content: string): string {
  // 1. Code blocks: ```...```
  let result = content.replace(
    /```(?:\w*)\n?([\s\S]*?)```/g,
    '<pre class="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-[12px]"><code>$1</code></pre>',
  );

  // Split by code blocks to avoid processing markdown inside them
  const parts = result.split(/(<pre[\s\S]*?<\/pre>)/g);

  result = parts
    .map((part) => {
      // Don't process inside <pre> blocks
      if (part.startsWith("<pre")) return part;

      let text = part;

      // 2. Bold: **text**
      text = text.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>",
      );

      // 3. Italic: *text*
      text = text.replace(
        /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
        "<em>$1</em>",
      );

      // 4. Inline code: `text`
      text = text.replace(
        /`([^`]+)`/g,
        '<code class="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-[12px]">$1</code>',
      );

      // 5. Process line by line for lists and line breaks
      const lines = text.split("\n");
      let inUl = false;
      let inOl = false;
      const processed: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();

        // Unordered list
        if (/^[-*]\s+/.test(trimmed)) {
          if (!inUl) {
            if (inOl) { processed.push("</ol>"); inOl = false; }
            processed.push('<ul class="my-1 list-disc pl-5">');
            inUl = true;
          }
          processed.push(`<li>${trimmed.replace(/^[-*]\s+/, "")}</li>`);
          continue;
        }

        // Ordered list
        if (/^\d+\.\s+/.test(trimmed)) {
          if (!inOl) {
            if (inUl) { processed.push("</ul>"); inUl = false; }
            processed.push('<ol class="my-1 list-decimal pl-5">');
            inOl = true;
          }
          processed.push(`<li>${trimmed.replace(/^\d+\.\s+/, "")}</li>`);
          continue;
        }

        // Close lists if no longer in one
        if (inUl) { processed.push("</ul>"); inUl = false; }
        if (inOl) { processed.push("</ol>"); inOl = false; }

        // Empty line → spacing
        if (!trimmed) {
          processed.push('<div class="h-2"></div>');
          continue;
        }

        processed.push(trimmed);
      }

      if (inUl) processed.push("</ul>");
      if (inOl) processed.push("</ol>");

      // Join non-list lines with <br>
      return processed
        .map((line, i) => {
          if (line.startsWith("<") ) return line;
          const next = processed[i + 1];
          if (next && !next.startsWith("<")) return line + "<br>";
          return line;
        })
        .join("");
    })
    .join("");

  // Highlight monetary values (€) with font-mono
  result = result.replace(
    /(\d[\d\s,.]*\s*€)/g,
    '<span class="font-mono">$1</span>',
  );

  return result;
}

function formatTime(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "USER";
  const time = formatTime(message.createdAt);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary-600 px-4 py-2.5">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white">
            {message.content}
          </p>
          {time && (
            <p className="mt-1 text-right text-[11px] text-primary-200/60">
              {time}
            </p>
          )}
        </div>
      </div>
    );
  }

  const html = parseMarkdown(message.content);

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-800 px-4 py-2.5">
        <div
          className="text-[13px] leading-relaxed text-slate-50 [&_strong]:font-semibold [&_em]:italic"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {isStreaming && (
          <span className="inline-block animate-blink text-primary-400">
            █
          </span>
        )}
        {time && !isStreaming && (
          <p className="mt-1 text-[11px] text-slate-600">{time}</p>
        )}
      </div>
    </div>
  );
}
