"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

/**
 * FluxChatDock — pill flottante bottom-right qui amène vers le chat.
 *
 * État collapsed only pour l'instant — le state expanded (panel inline)
 * arrivera quand on remplacera /chat par la toile chat-as-page.
 */

interface FluxChatDockProps {
  /** Scope affiché dans le tag au-dessus de la pill, ex. "Tous les clients". */
  scope: string;
  /** Placeholder de l'input invitant à dicter. */
  placeholder?: string;
  /** Cible du clic — par défaut /chat. */
  href?: string;
}

export function FluxChatDock({
  scope,
  placeholder = "Demande à l'IA, dicte une mutation…",
  href = "/chat",
}: FluxChatDockProps) {
  return (
    <Link
      href={href}
      className="fixed z-50 hidden md:flex items-center"
      style={{
        bottom: 28,
        right: 28,
        width: 360,
        height: 48,
        padding: "0 16px",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-emphasis)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(127, 153, 109, 0.04)",
        cursor: "text",
        textDecoration: "none",
        transition: "all var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-accent)";
        e.currentTarget.style.boxShadow =
          "var(--shadow-lg), 0 0 0 1px var(--color-accent-muted)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-emphasis)";
        e.currentTarget.style.boxShadow =
          "var(--shadow-lg), 0 0 0 1px rgba(127, 153, 109, 0.04)";
      }}
    >
      {/* Scope tag suspendu au-dessus */}
      <span
        style={{
          position: "absolute",
          top: -28,
          right: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 9px",
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-default)",
          borderRadius: 999,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--color-accent)",
          }}
        />
        Scope · {scope}
      </span>

      <span
        style={{
          width: 22,
          height: 22,
          display: "grid",
          placeItems: "center",
          color: "var(--color-accent)",
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        <MessageSquare size={14} strokeWidth={2} />
      </span>

      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--color-text-tertiary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {placeholder}
      </span>

      <kbd
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          padding: "2px 6px",
          background: "var(--color-bg-base)",
          border: "1px solid var(--color-border-default)",
          borderRadius: 3,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}
      >
        ⌘K
      </kbd>
    </Link>
  );
}
