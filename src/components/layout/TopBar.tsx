"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, ChevronRight, Plus, MessageSquare, Menu } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
// dates utils no longer needed here — setDatePreset handles range
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
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

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  chat: "Chat",
  clients: "Clients",
  settings: "Paramètres",
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const datePreset = useAppStore((s) => s.datePreset);
  const setDatePreset = useAppStore((s) => s.setDatePreset);
  // setDateRange removed — setDatePreset updates both
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const startNewConversation = useChatStore((s) => s.startNewConversation);

  // Resolve client name for breadcrumb
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

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dateDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dateDropdownOpen]);

  const activePresetLabel =
    DATE_PRESETS.find((p) => p.key === datePreset)?.label ?? "30 derniers jours";

  function handlePresetSelect(key: string) {
    setDatePreset(key);
    setDateDropdownOpen(false);
  }

  function handleNewChat() {
    startNewConversation();
    router.push("/chat");
  }

  return (
    <header className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-slate-700/50 bg-slate-900 px-4 md:px-5">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Ouvrir le menu"
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-[12px]">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight size={12} className="text-slate-600" aria-hidden="true" />
              )}
              {item.loading ? (
                <Skeleton className="inline-block h-4 w-24" />
              ) : (
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? "font-medium text-slate-50"
                      : "text-slate-400"
                  }
                >
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDateDropdownOpen((o) => !o)}
            aria-label="Sélectionner la période"
            aria-expanded={dateDropdownOpen}
            className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-[12px] text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
          >
            <Calendar size={14} />
            <span className="hidden sm:inline">{activePresetLabel}</span>
          </button>

          {dateDropdownOpen && (
            <div role="listbox" className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-slate-700 bg-slate-800 py-1 shadow-xl">
              {DATE_PRESETS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={key === datePreset}
                  onClick={() => handlePresetSelect(key)}
                  className={cn(
                    "flex w-full px-3 py-1.5 text-left text-[12px] transition-colors",
                    key === datePreset
                      ? "bg-primary-500/10 text-primary-400"
                      : "text-slate-300 hover:bg-slate-700 hover:text-slate-100",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button size="sm" onClick={handleNewChat} aria-label="Nouveau chat" icon={<Plus size={14} />}>
          <MessageSquare size={14} />
        </Button>
      </div>
    </header>
  );
}
