"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-bg-base)" }}>
      <Sidebar />

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 transition-opacity md:pointer-events-none md:opacity-0 ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <main
        className="flex-1 overflow-hidden ml-0 md:ml-[var(--sidebar-collapsed-width)]"
        style={{ background: "var(--color-bg-base)", transition: "margin-left var(--transition-slow)" }}
      >
        {children}
      </main>

      <style>{`
        @media (min-width: 1024px) {
          main { margin-left: ${sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)"} !important; }
        }
      `}</style>
    </div>
  );
}
