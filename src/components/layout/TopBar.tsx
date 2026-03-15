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

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard", chat: "Chat", clients: "Clients", settings: "Paramètres",
};

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

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dateDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDateDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dateDropdownOpen]);

  const activePresetLabel = DATE_PRESETS.find((p) => p.key === datePreset)?.label ?? "30 derniers jours";

  return (
    <header className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-white/[0.06] px-4 md:px-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleSidebar} aria-label="Ouvrir le menu"
          className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 md:hidden">
          <Menu size={16} />
        </button>
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[13px]">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={11} className="text-slate-600" aria-hidden="true" />}
              {item.loading ? <Skeleton className="inline-block h-4 w-24" /> : (
                <span className={i === breadcrumb.length - 1 ? "font-medium text-white" : "text-slate-500"}>{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button type="button" onClick={() => setDateDropdownOpen((o) => !o)} aria-label="Sélectionner la période" aria-expanded={dateDropdownOpen}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-slate-400 transition-all hover:border-white/[0.12] hover:text-slate-200">
            <Calendar size={13} />
            <span className="hidden sm:inline">{activePresetLabel}</span>
          </button>
          {dateDropdownOpen && (
            <div role="listbox" className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-white/[0.08] bg-slate-900 py-1 shadow-2xl shadow-black/40">
              {DATE_PRESETS.map(({ key, label }) => (
                <button key={key} type="button" role="option" aria-selected={key === datePreset} onClick={() => { setDatePreset(key); setDateDropdownOpen(false); }}
                  className={cn("flex w-full px-3 py-1.5 text-left text-[12px] transition-colors", key === datePreset ? "bg-primary-500/10 text-primary-400" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200")}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={() => { startNewConversation(); router.push("/chat"); }} aria-label="Nouveau chat"
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-primary-500">
          <Plus size={13} />
          <MessageSquare size={13} />
        </button>
      </div>
    </header>
  );
}
