"use client";

import { use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ChatPanel } from "@/components/chat/ChatPanel";

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
        <ChatPanel clientId={id} />
      </div>
    </div>
  );
}
