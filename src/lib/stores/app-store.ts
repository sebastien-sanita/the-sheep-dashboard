import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DateRange } from "../types";
import { getDateRange } from "../utils/dates";

type PanelMode = "chat" | "split" | "dashboard";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Panel layout
  activePanelMode: PanelMode;
  setActivePanelMode: (mode: PanelMode) => void;

  // Workspace context
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string | null) => void;

  // Date range
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  datePreset: string;
  setDatePreset: (preset: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Panel layout
      activePanelMode: "chat",
      setActivePanelMode: (mode) => set({ activePanelMode: mode }),

      // Workspace context
      activeWorkspaceId: null,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

      // Date range
      dateRange: getDateRange("last30d"),
      setDateRange: (range) => set({ dateRange: range }),
      datePreset: "last30d",
      setDatePreset: (preset) => set({ datePreset: preset }),
    }),
    {
      name: "the-sheep-app",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        datePreset: state.datePreset,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    },
  ),
);
