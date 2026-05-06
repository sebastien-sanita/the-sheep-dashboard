"use client";

import { useEffect, type ReactNode } from "react";
import { Group, Panel, Separator, useGroupRef } from "react-resizable-panels";
import { MessageSquare, Columns2, BarChart3 } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils/cn";

type PanelMode = "chat" | "split" | "dashboard";

interface SplitPanelProps {
  renderChat: () => ReactNode;
  renderDashboard: () => ReactNode;
}

const CHAT_PANEL_ID = "chat-panel";
const DASH_PANEL_ID = "dash-panel";

const MODE_LAYOUTS: Record<PanelMode, Record<string, number>> = {
  chat: { [CHAT_PANEL_ID]: 100, [DASH_PANEL_ID]: 0 },
  split: { [CHAT_PANEL_ID]: 40, [DASH_PANEL_ID]: 60 },
  dashboard: { [CHAT_PANEL_ID]: 0, [DASH_PANEL_ID]: 100 },
};

export function SplitPanel({ renderChat, renderDashboard }: SplitPanelProps) {
  const activePanelMode = useAppStore((s) => s.activePanelMode);
  const setActivePanelMode = useAppStore((s) => s.setActivePanelMode);
  const groupRef = useGroupRef();

  useEffect(() => {
    groupRef.current?.setLayout(MODE_LAYOUTS[activePanelMode]);
  }, [activePanelMode, groupRef]);

  const modeButtons: { mode: PanelMode; icon: typeof MessageSquare; label: string }[] = [
    { mode: "chat", icon: MessageSquare, label: "Chat" },
    { mode: "split", icon: Columns2, label: "Split" },
    { mode: "dashboard", icon: BarChart3, label: "Dashboard" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Mode toggle buttons */}
      <div className="flex shrink-0 items-center gap-0.5 border-b border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
        {modeButtons.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setActivePanelMode(mode)}
            title={label}
            className={cn(
              "rounded p-1.5 transition-colors",
              activePanelMode === mode
                ? "bg-primary-500/15 text-primary-400"
                : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]",
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      {/* Resizable panels */}
      <Group
        groupRef={groupRef}
        className="flex-1"
        style={{ flexDirection: "row" }}
      >
        <Panel
          id={CHAT_PANEL_ID}
          defaultSize={MODE_LAYOUTS[activePanelMode][CHAT_PANEL_ID]}
          minSize={activePanelMode === "split" ? 30 : 0}
          collapsible={activePanelMode !== "split"}
        >
          <div className="h-full overflow-auto">{renderChat()}</div>
        </Panel>

        <Separator className="group relative w-[2px] bg-[var(--color-bg-elevated)] transition-colors hover:bg-primary-500 data-[resize-handle-active]:bg-primary-500">
          <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
        </Separator>

        <Panel
          id={DASH_PANEL_ID}
          defaultSize={MODE_LAYOUTS[activePanelMode][DASH_PANEL_ID]}
          minSize={activePanelMode === "split" ? 30 : 0}
          collapsible={activePanelMode !== "split"}
        >
          <div className="h-full overflow-auto">{renderDashboard()}</div>
        </Panel>
      </Group>
    </div>
  );
}
