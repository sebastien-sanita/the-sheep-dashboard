"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useSyncWorkspace } from "@/lib/hooks/useSyncStatus";
import type { SyncStatus } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface SyncButtonProps {
  workspaceId: string;
}

export function SyncButton({ workspaceId }: SyncButtonProps) {
  const mutation = useSyncWorkspace();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick() {
    if (status !== "idle") return;
    setStatus("syncing");
    mutation.mutate(workspaceId, {
      onSuccess: () => {
        setStatus("success");
        timerRef.current = setTimeout(() => setStatus("idle"), 3000);
      },
      onError: () => {
        setStatus("error");
        timerRef.current = setTimeout(() => setStatus("idle"), 5000);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "syncing"}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
        status === "idle" &&
          "border-[var(--color-border-emphasis)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-emphasis)] hover:text-[var(--color-text-primary)]",
        status === "syncing" &&
          "border-[var(--color-border-emphasis)] text-[var(--color-text-secondary)] opacity-70",
        status === "success" &&
          "border-emerald-500/30 text-emerald-400",
        status === "error" &&
          "border-rose-500/30 text-rose-400",
      )}
    >
      {status === "idle" && (
        <>
          <RefreshCw size={14} />
          Synchroniser
        </>
      )}
      {status === "syncing" && (
        <>
          <RefreshCw size={14} className="animate-spin" />
          Sync en cours...
        </>
      )}
      {status === "success" && (
        <>
          <Check size={14} />
          Synchronise
        </>
      )}
      {status === "error" && (
        <>
          <AlertTriangle size={14} />
          Erreur
        </>
      )}
    </button>
  );
}
