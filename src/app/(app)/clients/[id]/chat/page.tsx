"use client";

import { use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SplitPanel } from "@/components/layout/SplitPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";

export default function ClientChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-hidden">
        <SplitPanel
          renderChat={() => <ChatPanel clientId={id} />}
          renderDashboard={() => <DashboardRenderer />}
        />
      </div>
    </div>
  );
}
