import { create } from "zustand";
import type { DashboardBlock, DashboardData } from "../types";

interface DashboardState {
  // Current dashboard
  blocks: DashboardBlock[];
  dashboardTitle: string | null;
  dashboardClientId: string | null;

  // Actions
  setDashboard: (data: DashboardData) => void;
  addBlock: (block: DashboardBlock) => void;
  clearDashboard: () => void;

  // History
  history: DashboardData[];
  pushToHistory: () => void;
  restoreFromHistory: (index: number) => void;
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  // Current dashboard
  blocks: [],
  dashboardTitle: null,
  dashboardClientId: null,

  // Actions
  setDashboard: (data) =>
    set({
      blocks: data.blocks,
      dashboardTitle: data.title ?? null,
      dashboardClientId: data.clientId ?? null,
    }),

  addBlock: (block) => set((s) => ({ blocks: [...s.blocks, block] })),

  clearDashboard: () =>
    set({ blocks: [], dashboardTitle: null, dashboardClientId: null }),

  // History
  history: [],

  pushToHistory: () => {
    const { blocks, dashboardTitle, dashboardClientId, history } = get();
    if (blocks.length === 0) return;
    const snapshot: DashboardData = {
      title: dashboardTitle ?? undefined,
      clientId: dashboardClientId ?? undefined,
      blocks,
    };
    set({ history: [...history, snapshot] });
  },

  restoreFromHistory: (index) => {
    const { history } = get();
    const entry = history[index];
    if (!entry) return;
    set({
      blocks: entry.blocks,
      dashboardTitle: entry.title ?? null,
      dashboardClientId: entry.clientId ?? null,
    });
  },
}));
