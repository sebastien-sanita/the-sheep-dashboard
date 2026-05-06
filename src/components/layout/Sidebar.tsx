"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MessageSquare, Users, Settings, ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { cn } from "@/lib/utils/cn";
import { SheepMark } from "@/components/ui/SheepMark";

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
      {/* Logo — SheepMark in bordered 22px square (Calm Precision DS spec) */}
      <div className="flex shrink-0 items-center gap-2.5" style={{ height: "var(--topbar-height)", padding: "0 14px", borderBottom: "1px solid var(--color-border-default)" }}>
        <span style={{ width: 22, height: 22, display: "grid", placeItems: "center", border: "1px solid var(--color-border-emphasis)", borderRadius: "var(--radius-xs)", color: "var(--color-text-primary)", flexShrink: 0 }}>
          <SheepMark size={12} />
        </span>
        {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--color-text-primary)" }}>The Sheep</span>}
      </div>

      {/* Nav — Hub density (30px rows, 12px font, 14px icons) */}
      <nav className="flex flex-col gap-px p-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={cn("group flex items-center gap-2.5", sidebarOpen ? "" : "justify-center")}
            style={{
              height: 30, borderRadius: "var(--radius-xs)", fontSize: 12, fontWeight: isActive(href) ? 500 : 400, transition: "all var(--transition-fast)",
              background: isActive(href) ? "var(--color-accent-subtle)" : "transparent",
              color: isActive(href) ? "var(--color-accent-hover)" : "var(--color-text-secondary)",
              borderLeft: isActive(href) ? "2px solid var(--color-accent)" : "2px solid transparent",
              paddingLeft: isActive(href) ? 8 : 10,
              paddingRight: 10,
            }}
            onMouseEnter={(e) => { if (!isActive(href)) { e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-primary)"; } }}
            onMouseLeave={(e) => { if (!isActive(href)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; } }}
          >
            <Icon size={14} className="shrink-0" style={{ color: isActive(href) ? "var(--color-accent)" : "var(--color-text-tertiary)" }} />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Clients — Hub density (28px rows, 11px font, 5px platform dot) */}
      {sidebarOpen && (
        <>
          <div className="mx-3" style={{ borderTop: "1px solid var(--color-border-default)" }} />
          <div className="flex flex-1 flex-col gap-0.5 overflow-hidden" style={{ padding: "10px 6px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 12px 6px" }}>Clients</span>
            <div className="flex-1 overflow-y-auto">
              {workspaces?.slice(0, 12).map((ws) => {
                const dot = ws.platforms?.[0];
                return (
                  <button key={ws.id} type="button" onClick={() => { router.push(`/clients/${ws.id}`); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className="flex w-full items-center gap-2 text-left"
                    style={{ height: 28, padding: "0 12px", fontSize: 11, color: "var(--color-text-secondary)", borderRadius: "var(--radius-xs)", border: "none", background: "transparent", transition: "all var(--transition-fast)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                  >
                    {dot && <span className={cn("h-[5px] w-[5px] shrink-0 rounded-full", PLATFORM_DOT[dot] ?? "bg-slate-500")} />}
                    <span className="truncate">{ws.name}</span>
                  </button>
                );
              })}
              {!workspaces && <div className="px-3 py-2 text-[11px]" style={{ color: "var(--color-text-muted)" }}>Chargement...</div>}
            </div>
          </div>
        </>
      )}

      {/* Footer — user info + collapse + logout (Hub density: 28px rows, 11px font) */}
      <div className="mt-auto shrink-0 p-2" style={{ borderTop: "1px solid var(--color-border-default)" }}>
        {sidebarOpen && user && (
          <div className="px-3 pb-2">
            <div className="truncate" style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>{user.name ?? user.email}</div>
            {user.name && <div className="truncate" style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{user.email}</div>}
          </div>
        )}
        <button type="button" onClick={toggleSidebar} aria-label={sidebarOpen ? "Réduire" : "Ouvrir"}
          className={cn("flex w-full items-center gap-2", sidebarOpen ? "" : "justify-center")}
          style={{ height: 28, padding: "0 10px", fontSize: 11, color: "var(--color-text-muted)", borderRadius: "var(--radius-xs)", border: "none", background: "transparent", transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-elevated)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
        >
          {sidebarOpen ? <><ChevronsLeft size={13} /><span>Réduire</span></> : <ChevronsRight size={13} />}
        </button>
        <button type="button" onClick={() => { logout(); router.push("/login"); }} aria-label="Déconnexion"
          className={cn("flex w-full items-center gap-2", sidebarOpen ? "" : "justify-center")}
          style={{ height: 28, padding: "0 10px", fontSize: 11, color: "var(--color-text-muted)", borderRadius: "var(--radius-xs)", border: "none", background: "transparent", transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-danger)"; e.currentTarget.style.background = "var(--color-bg-elevated)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={13} />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
