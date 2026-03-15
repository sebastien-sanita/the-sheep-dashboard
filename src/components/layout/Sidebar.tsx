"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MessageSquare, Users, Settings, ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
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

const PLATFORM_DOT: Record<string, string> = {
  META: "bg-[#1877F2]", META_ADS: "bg-[#1877F2]", FACEBOOK: "bg-[#1877F2]", FACEBOOK_PAGE: "bg-[#1877F2]",
  INSTAGRAM: "bg-[#E4405F]", INSTAGRAM_ADS: "bg-[#E4405F]",
  GOOGLE: "bg-[#EA4335]", GOOGLE_ADS: "bg-[#EA4335]",
  LINKEDIN: "bg-[#0A66C2]", LINKEDIN_ADS: "bg-[#0A66C2]",
  TIKTOK: "bg-[#ff0050]", TIKTOK_ADS: "bg-[#ff0050]",
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

  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside
      className={cn("fixed left-0 top-0 z-30 flex h-screen flex-col overflow-hidden transition-all", sidebarOpen ? "translate-x-0" : "-translate-x-full", "md:translate-x-0")}
      style={{ width: sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)", background: "var(--color-bg-surface)", borderRight: "1px solid var(--color-border-default)", transition: "width var(--transition-slow), transform var(--transition-slow)" }}
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2.5 px-4" style={{ height: "var(--topbar-height)", borderBottom: "1px solid var(--color-border-default)" }}>
        <span className="text-base leading-none">🐑</span>
        {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em", color: "var(--color-text-primary)" }}>The Sheep</span>}
        {!sidebarOpen && <span className="mx-auto" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>TS</span>}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-px p-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={cn("group flex items-center gap-2.5 px-2.5", sidebarOpen ? "" : "justify-center")}
            style={{
              height: 34, borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: isActive(href) ? 500 : 450, transition: "all var(--transition-fast)",
              background: isActive(href) ? "var(--color-accent-subtle)" : "transparent",
              color: isActive(href) ? "var(--color-accent-hover)" : "var(--color-text-secondary)",
              borderLeft: isActive(href) ? "2px solid var(--color-accent)" : "2px solid transparent",
              paddingLeft: isActive(href) ? 8 : 10,
            }}
            onMouseEnter={(e) => { if (!isActive(href)) { e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-primary)"; } }}
            onMouseLeave={(e) => { if (!isActive(href)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; } }}
          >
            <Icon size={16} className="shrink-0" style={{ color: isActive(href) ? "var(--color-accent)" : "var(--color-text-tertiary)" }} />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Clients */}
      {sidebarOpen && (
        <>
          <div className="mx-3" style={{ borderTop: "1px solid var(--color-border-default)" }} />
          <div className="flex flex-1 flex-col gap-0.5 overflow-hidden px-2 py-2">
            <span className="text-caption px-3 pb-1" style={{ color: "var(--color-text-muted)" }}>Clients</span>
            <div className="flex-1 overflow-y-auto">
              {workspaces?.slice(0, 12).map((ws) => {
                const dot = ws.platforms?.[0];
                return (
                  <button key={ws.id} type="button" onClick={() => { router.push(`/clients/${ws.id}`); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 text-left transition-colors"
                    style={{ height: 30, fontSize: 12, color: "var(--color-text-secondary)", transition: "all var(--transition-fast)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                  >
                    {dot && <span className={cn("h-[6px] w-[6px] shrink-0 rounded-full", PLATFORM_DOT[dot] ?? "bg-slate-500")} />}
                    <span className="truncate">{ws.name}</span>
                  </button>
                );
              })}
              {!workspaces && <div className="px-3 py-2 text-[11px]" style={{ color: "var(--color-text-muted)" }}>Chargement...</div>}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto shrink-0 p-2" style={{ borderTop: "1px solid var(--color-border-default)" }}>
        {sidebarOpen && user && (
          <div className="px-3 pb-2">
            <div className="truncate text-[12px] font-medium" style={{ color: "var(--color-text-secondary)" }}>{user.name ?? user.email}</div>
            {user.name && <div className="truncate text-[11px]" style={{ color: "var(--color-text-muted)" }}>{user.email}</div>}
          </div>
        )}
        <button type="button" onClick={toggleSidebar} aria-label={sidebarOpen ? "Réduire" : "Ouvrir"}
          className={cn("flex w-full items-center gap-2.5 rounded-md px-3", sidebarOpen ? "" : "justify-center")}
          style={{ height: 30, fontSize: 12, color: "var(--color-text-muted)", transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
        >
          {sidebarOpen ? <><ChevronsLeft size={16} /><span>Réduire</span></> : <ChevronsRight size={16} />}
        </button>
        <button type="button" onClick={() => { logout(); router.push("/login"); }} aria-label="Déconnexion"
          className={cn("flex w-full items-center gap-2.5 rounded-md px-3", sidebarOpen ? "" : "justify-center")}
          style={{ height: 30, fontSize: 12, color: "var(--color-text-muted)", transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-danger)"; e.currentTarget.style.background = "var(--color-bg-elevated)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={16} />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
