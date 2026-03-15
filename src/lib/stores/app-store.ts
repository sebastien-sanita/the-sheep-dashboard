import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DateRange } from "../types";
import { getDateRange } from "../utils/dates";

type DatePreset = "today" | "yesterday" | "last7d" | "last30d" | "thisMonth" | "lastMonth" | "thisQuarter" | "lastQuarter";
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
  datePreset: string;
  setDatePreset: (preset: string) => void;
  setDateRange: (range: DateRange) => void;
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

      // Date range — preset + range are kept in sync
      dateRange: getDateRange("last30d"),
      datePreset: "last30d",
      setDatePreset: (preset) => {
        try {
          const range = getDateRange(preset as DatePreset);
          set({ datePreset: preset, dateRange: range });
        } catch {
          set({ datePreset: preset });
        }
      },
      setDateRange: (range) => set({ dateRange: range }),
    }),
    {
      name: "the-sheep-app",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        datePreset: state.datePreset,
        dateRange: state.dateRange,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    },
  ),
);
