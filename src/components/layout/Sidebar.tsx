"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Users, Settings,
  ChevronsLeft, ChevronsRight, LogOut,
} from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chat IA", href: "/chat", icon: MessageSquare },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

const PLATFORM_COLORS: Record<string, string> = {
  META: "bg-blue-500", META_ADS: "bg-blue-500", FACEBOOK: "bg-blue-500", FACEBOOK_PAGE: "bg-blue-500", FACEBOOK_ADS: "bg-blue-500",
  INSTAGRAM: "bg-fuchsia-500", INSTAGRAM_ADS: "bg-fuchsia-500",
  GOOGLE: "bg-red-500", GOOGLE_ADS: "bg-red-500", GOOGLE_ANALYTICS: "bg-amber-500",
  LINKEDIN: "bg-sky-600", LINKEDIN_ADS: "bg-sky-600",
  TIKTOK: "bg-pink-500", TIKTOK_ADS: "bg-pink-500",
  SNAPCHAT: "bg-yellow-500", SNAPCHAT_ADS: "bg-yellow-500",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: workspaces } = useWorkspaces();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  function handleLogout() { logout(); router.push("/login"); }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-white/[0.06] bg-slate-950 transition-all duration-200 ease-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      )}
      style={{ width: sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)" }}
    >
      {/* Logo */}
      <div className="flex h-[var(--topbar-height)] items-center gap-2.5 border-b border-white/[0.06] px-4">
        <span className="text-base leading-none">🐑</span>
        {sidebarOpen && <span className="whitespace-nowrap text-[13px] font-medium tracking-tight text-slate-100">The Sheep</span>}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-px px-2 py-2.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors",
              isActive(href)
                ? "bg-primary-500/10 text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
            )}
          >
            <Icon size={16} className="shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Quick clients */}
      {sidebarOpen && (
        <>
          <div className="mx-3 border-t border-white/[0.06]" />
          <div className="flex flex-1 flex-col gap-0.5 overflow-hidden px-2 py-2.5">
            <span className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
              Clients
            </span>
            <div className="flex-1 overflow-y-auto">
              {workspaces?.slice(0, 10).map((ws) => {
                const mainPlatform = ws.platforms?.[0];
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => { router.push(`/clients/${ws.id}`); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[12px] text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
                  >
                    {mainPlatform && <span className={cn("h-[6px] w-[6px] shrink-0 rounded-full", PLATFORM_COLORS[mainPlatform] ?? "bg-slate-500")} />}
                    <span className="truncate">{ws.name}</span>
                  </button>
                );
              })}
              {!workspaces && <div className="px-3 py-2 text-[11px] text-slate-600">Chargement...</div>}
            </div>
          </div>
        </>
      )}

      {/* Bottom */}
      <div className="mt-auto border-t border-white/[0.06] px-2 py-2.5">
        {sidebarOpen && user && (
          <div className="px-3 pb-2">
            <div className="truncate text-[12px] font-medium text-slate-300">{user.name ?? user.email}</div>
            {user.name && <div className="truncate text-[11px] text-slate-500">{user.email}</div>}
          </div>
        )}
        <button type="button" onClick={toggleSidebar} aria-label={sidebarOpen ? "Réduire la sidebar" : "Ouvrir la sidebar"}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-[7px] text-[12px] text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300">
          {sidebarOpen ? (<><ChevronsLeft size={16} className="shrink-0" /><span>Réduire</span></>) : (<ChevronsRight size={16} className="mx-auto shrink-0" />)}
        </button>
        <button type="button" onClick={handleLogout} aria-label="Se déconnecter"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-[7px] text-[12px] text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-rose-400">
          <LogOut size={16} className="shrink-0" />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
