"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, ChevronRight, Plus, MessageSquare, Menu } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";

const DATE_PRESETS = [
  { key: "today", label: "Aujourd'hui" },
  { key: "yesterday", label: "Hier" },
  { key: "last7d", label: "7 derniers jours" },
  { key: "last30d", label: "30 derniers jours" },
  { key: "thisMonth", label: "Ce mois" },
  { key: "lastMonth", label: "Mois dernier" },
  { key: "thisQuarter", label: "Ce trimestre" },
  { key: "lastQuarter", label: "Trimestre dernier" },
] as const;

const ROUTE_LABELS: Record<string, string> = { dashboard: "Dashboard", chat: "Chat", clients: "Clients", settings: "Paramètres" };

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const datePreset = useAppStore((s) => s.datePreset);
  const setDatePreset = useAppStore((s) => s.setDatePreset);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const startNewConversation = useChatStore((s) => s.startNewConversation);

  const clientIdMatch = pathname.match(/\/clients\/([^/]+)/);
  const clientId = clientIdMatch ? clientIdMatch[1] : null;
  const { data: workspace, isLoading: wsLoading } = useWorkspace(clientId ?? "");

  const breadcrumb = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, i) => {
      if (ROUTE_LABELS[seg]) return { label: ROUTE_LABELS[seg], loading: false };
      if (i > 0 && segments[i - 1] === "clients") {
        if (wsLoading) return { label: seg, loading: true };
        return { label: workspace?.name ?? seg, loading: false };
      }
      return { label: seg, loading: false };
    });
  }, [pathname, workspace, wsLoading]);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const label = DATE_PRESETS.find((p) => p.key === datePreset)?.label ?? "30 jours";

  return (
    <header className="flex shrink-0 items-center justify-between px-6" style={{ height: "var(--topbar-height)", borderBottom: "1px solid var(--color-border-default)" }}>
      {/* Left */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleSidebar} aria-label="Menu" className="rounded-md p-1.5 md:hidden" style={{ color: "var(--color-text-tertiary)", transition: "color var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; }}>
          <Menu size={16} />
        </button>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>/</span>}
              {item.loading ? <Skeleton className="inline-block h-4 w-24" /> : (
                <span style={{ color: i === breadcrumb.length - 1 ? "var(--color-text-primary)" : "var(--color-text-tertiary)", fontWeight: i === breadcrumb.length - 1 ? 500 : 400 }}>{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={ref}>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Période" aria-expanded={open}
            className="flex items-center gap-2 px-2.5"
            style={{ height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-default)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 12, transition: "all var(--transition-fast)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-border-emphasis)"; e.currentTarget.style.background = "var(--color-bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-default)"; e.currentTarget.style.background = "transparent"; }}
          >
            <Calendar size={13} style={{ color: "var(--color-text-tertiary)" }} />
            <span className="hidden sm:inline">{label}</span>
          </button>
          {open && (
            <div role="listbox" className="absolute right-0 top-full z-50 mt-1.5 w-48 py-1"
              style={{ background: "var(--color-bg-overlay)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)" }}>
              {DATE_PRESETS.map(({ key, label: l }) => (
                <button key={key} type="button" role="option" aria-selected={key === datePreset} onClick={() => { setDatePreset(key); setOpen(false); }}
                  className="flex w-full px-3 py-1.5 text-left transition-colors"
                  style={{ fontSize: 12, color: key === datePreset ? "var(--color-accent)" : "var(--color-text-secondary)", background: key === datePreset ? "var(--color-accent-subtle)" : "transparent", transition: "all var(--transition-fast)" }}
                  onMouseEnter={(e) => { if (key !== datePreset) { e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-primary)"; } }}
                  onMouseLeave={(e) => { if (key !== datePreset) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; } }}
                >{l}</button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={() => { startNewConversation(); router.push("/chat"); }} aria-label="Nouveau chat"
          className="flex items-center justify-center"
          style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-default)", color: "var(--color-text-tertiary)", transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-border-emphasis)"; e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-default)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-tertiary)"; }}
        >
          <Plus size={14} />
        </button>
      </div>
    </header>
  );
}
