"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { cn } from "@/lib/utils/cn";
import type { Platform } from "@/lib/types";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chat IA", href: "/chat", icon: MessageSquare },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

const PLATFORM_COLORS: Record<Platform, string> = {
  META: "bg-blue-500",
  GOOGLE: "bg-red-500",
  LINKEDIN: "bg-sky-600",
  TIKTOK: "bg-pink-500",
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

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      )}
      style={{
        width: sidebarOpen
          ? "var(--sidebar-width)"
          : "var(--sidebar-collapsed-width)",
      }}
    >
      {/* Logo */}
      <div className="flex h-[var(--topbar-height)] items-center gap-2 border-b border-slate-800 px-4">
        <span className="text-lg leading-none">🐑</span>
        {sidebarOpen && (
          <span className="whitespace-nowrap text-sm font-semibold text-slate-50">
            The Sheep
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2 py-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => {
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-[12px] font-medium transition-colors",
              isActive(href)
                ? "border-l-2 border-primary-500 bg-primary-500/10 text-slate-50"
                : "border-l-2 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200",
            )}
          >
            <Icon size={18} className="shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Quick clients */}
      {sidebarOpen && (
        <>
          <div className="mx-3 border-t border-slate-800" />
          <div className="flex flex-1 flex-col gap-1 overflow-hidden px-2 py-3">
            <span className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Clients
            </span>
            <div className="flex-1 overflow-y-auto">
              {workspaces?.slice(0, 10).map((ws) => {
                const mainPlatform = ws.platforms?.[0];
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      router.push(`/clients/${ws.id}`);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[12px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                  >
                    {mainPlatform && (
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          PLATFORM_COLORS[mainPlatform] ?? "bg-slate-500",
                        )}
                      />
                    )}
                    <span className="truncate">{ws.name}</span>
                  </button>
                );
              })}
              {!workspaces && (
                <div className="px-3 py-2 text-[11px] text-slate-600">
                  Chargement...
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Bottom: user + collapse + logout */}
      <div className="mt-auto border-t border-slate-800 px-2 py-3">
        {/* User info */}
        {sidebarOpen && user && (
          <div className="px-3 pb-2">
            <div className="truncate text-[12px] font-medium text-slate-300">
              {user.name ?? user.email}
            </div>
            {user.name && (
              <div className="truncate text-[11px] text-slate-600">
                {user.email}
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Réduire la sidebar" : "Ouvrir la sidebar"}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[12px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          {sidebarOpen ? (
            <>
              <ChevronsLeft size={18} className="shrink-0" />
              <span>Réduire</span>
            </>
          ) : (
            <ChevronsRight size={18} className="mx-auto shrink-0" />
          )}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Se déconnecter"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[12px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-rose-400"
        >
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
