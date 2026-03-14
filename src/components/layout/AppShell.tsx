"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity md:pointer-events-none md:opacity-0 ${
          sidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main area: no margin on mobile, collapsed margin on md, dynamic on lg+ */}
      <main
        className={`
          flex-1 overflow-hidden bg-slate-900 transition-[margin-left] duration-300 ease-in-out
          ml-0
          md:ml-[var(--sidebar-collapsed-width)]
        `}
        style={{
          // On lg+ override with JS-driven value
          // This inline style has lower specificity than @media but we use it as progressive enhancement
        }}
      >
        <div
          className="h-full hidden lg:block"
          style={{ display: "contents" }}
        />
        {children}
      </main>

      {/* Override margin for lg+ via a style tag driven by state */}
      <style>{`
        @media (min-width: 1024px) {
          main {
            margin-left: ${sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)"} !important;
          }
        }
      `}</style>
    </div>
  );
}
