"use client";

import { TopBar } from "@/components/layout/TopBar";
import { SplitPanel } from "@/components/layout/SplitPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-hidden">
        <SplitPanel
          renderChat={() => <ChatPanel />}
          renderDashboard={() => <DashboardRenderer />}
        />
      </div>
    </div>
  );
}
