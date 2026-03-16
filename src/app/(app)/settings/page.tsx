"use client";

import { useState, useCallback, useRef } from "react";
import { Play, RotateCw, Check, X, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { useAppStore } from "@/lib/stores/app-store";
import { getWorkspaces, getWorkspace, getWorkspaceCampaigns } from "@/lib/api/workspaces";
import { getMetrics } from "@/lib/api/metrics";
import { getConversations } from "@/lib/api/chat";
import { apiStream } from "@/lib/api/client";
import { getDateRange, formatDateRange } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { ClientSummary } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TestStatus = "idle" | "testing" | "success" | "error";

interface TestEntry {
  id: string;
  name: string;
  endpoint: string;
  status: TestStatus;
  responseTime?: number;
  result?: string;
  error?: string;
}

const INITIAL_TESTS: TestEntry[] = [
  { id: "workspaces", name: "Liste des clients", endpoint: "GET /api/workspaces/me", status: "idle" },
  { id: "workspace", name: "Detail client", endpoint: "GET /api/workspaces/:id", status: "idle" },
  { id: "campaigns", name: "Campagnes client", endpoint: "GET /api/workspaces/:id/campaigns", status: "idle" },
  { id: "metrics", name: "Metriques client", endpoint: "GET /api/metrics?workspaceId=:id&startDate&endDate", status: "idle" },
  { id: "conversations", name: "Conversations", endpoint: "GET /api/chat/conversations", status: "idle" },
  { id: "chat_sse", name: "Chat SSE stream", endpoint: "POST /api/chat/message (SSE)", status: "idle" },
];

// ---------------------------------------------------------------------------
// Minimal SSE reader (reads N events then aborts)
// ---------------------------------------------------------------------------

async function readSseEvents(
  stream: ReadableStream<Uint8Array>,
  maxEvents: number,
  signal: AbortSignal,
): Promise<string[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events: string[] = [];

  try {
    for (;;) {
      if (signal.aborted || events.length >= maxEvents) break;
      const { done, value } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop()!;
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const eventLine = trimmed.split("\n").find((l) => l.startsWith("event: "));
        events.push(eventLine?.slice(7) ?? "unknown");
        if (events.length >= maxEvents) break;
      }
      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }

  return events;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [tests, setTests] = useState<TestEntry[]>(INITIAL_TESTS);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const firstClientRef = useRef<ClientSummary | null>(null);

  const dateRange = useAppStore((s) => s.dateRange);
  const datePreset = useAppStore((s) => s.datePreset);
  const { data: cachedWorkspaces } = useWorkspaces();

  const updateTest = useCallback(
    (id: string, patch: Partial<TestEntry>) => {
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    [],
  );

  // --- Individual test runners ---

  const runWorkspaces = useCallback(async () => {
    updateTest("workspaces", { status: "testing", result: undefined, error: undefined });
    const t0 = performance.now();
    try {
      const data = await getWorkspaces();
      const ms = Math.round(performance.now() - t0);
      firstClientRef.current = data[0] ?? null;
      updateTest("workspaces", {
        status: "success",
        responseTime: ms,
        result: `${data.length} client(s) retourne(s)`,
      });
      return data;
    } catch (err: unknown) {
      updateTest("workspaces", {
        status: "error",
        responseTime: Math.round(performance.now() - t0),
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }, [updateTest]);

  const runWorkspace = useCallback(
    async (clientId?: string) => {
      const id = clientId ?? firstClientRef.current?.id;
      if (!id) {
        updateTest("workspace", { status: "error", error: "Aucun client disponible (lancer test 1 d'abord)" });
        return null;
      }
      updateTest("workspace", { status: "testing", result: undefined, error: undefined });
      const t0 = performance.now();
      try {
        const data = await getWorkspace(id);
        const ms = Math.round(performance.now() - t0);
        updateTest("workspace", {
          status: "success",
          responseTime: ms,
          result: `${data.name} — ${(data.adAccounts ?? []).length} compte(s)`,
        });
        return data;
      } catch (err: unknown) {
        updateTest("workspace", {
          status: "error",
          responseTime: Math.round(performance.now() - t0),
          error: err instanceof Error ? err.message : String(err),
        });
        return null;
      }
    },
    [updateTest],
  );

  const runCampaigns = useCallback(
    async (clientId?: string) => {
      const id = clientId ?? firstClientRef.current?.id;
      if (!id) {
        updateTest("campaigns", { status: "error", error: "Aucun client disponible" });
        return;
      }
      updateTest("campaigns", { status: "testing", result: undefined, error: undefined });
      const t0 = performance.now();
      try {
        const data = await getWorkspaceCampaigns(id);
        const ms = Math.round(performance.now() - t0);
        updateTest("campaigns", {
          status: "success",
          responseTime: ms,
          result: `${data.length} campagne(s)`,
        });
      } catch (err: unknown) {
        updateTest("campaigns", {
          status: "error",
          responseTime: Math.round(performance.now() - t0),
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [updateTest],
  );

  const runMetrics = useCallback(
    async (clientId?: string) => {
      const id = clientId ?? firstClientRef.current?.id;
      if (!id) {
        updateTest("metrics", { status: "error", error: "Aucun client disponible" });
        return;
      }
      const range = getDateRange("last30d");
      updateTest("metrics", { status: "testing", result: undefined, error: undefined });
      const t0 = performance.now();
      try {
        const data = await getMetrics({
          workspaceId: id,
          startDate: range.from,
          endDate: range.to,
        });
        const ms = Math.round(performance.now() - t0);
        const dailyCount = data.daily?.length ?? 0;
        updateTest("metrics", {
          status: "success",
          responseTime: ms,
          result: `${dailyCount} jour(s) de donnees, spend=${data.metrics?.spend?.value ?? "N/A"}`,
        });
      } catch (err: unknown) {
        updateTest("metrics", {
          status: "error",
          responseTime: Math.round(performance.now() - t0),
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [updateTest],
  );

  const runConversations = useCallback(async () => {
    updateTest("conversations", { status: "testing", result: undefined, error: undefined });
    const t0 = performance.now();
    try {
      const data = await getConversations();
      const ms = Math.round(performance.now() - t0);
      updateTest("conversations", {
        status: "success",
        responseTime: ms,
        result: `${data.length} conversation(s)`,
      });
    } catch (err: unknown) {
      updateTest("conversations", {
        status: "error",
        responseTime: Math.round(performance.now() - t0),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [updateTest]);

  const runChatSse = useCallback(async () => {
    updateTest("chat_sse", { status: "testing", result: undefined, error: undefined });
    const t0 = performance.now();
    const controller = new AbortController();
    try {
      const stream = await apiStream(
        "/api/chat/message",
        { content: "Bonjour, test de connexion" },
        controller.signal,
      );
      const events = await readSseEvents(stream, 3, controller.signal);
      controller.abort();
      const ms = Math.round(performance.now() - t0);
      updateTest("chat_sse", {
        status: "success",
        responseTime: ms,
        result: `Stream OK — ${events.length} event(s): [${events.join(", ")}]`,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Expected after reading events
        const ms = Math.round(performance.now() - t0);
        updateTest("chat_sse", {
          status: "success",
          responseTime: ms,
          result: "Stream OK (aborted apres lecture)",
        });
      } else {
        updateTest("chat_sse", {
          status: "error",
          responseTime: Math.round(performance.now() - t0),
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }, [updateTest]);

  // --- Run individual test by id ---

  const runSingleTest = useCallback(
    (id: string) => {
      switch (id) {
        case "workspaces":
          return runWorkspaces();
        case "workspace":
          return runWorkspace();
        case "campaigns":
          return runCampaigns();
        case "metrics":
          return runMetrics();
        case "conversations":
          return runConversations();
        case "chat_sse":
          return runChatSse();
      }
    },
    [runWorkspaces, runWorkspace, runCampaigns, runMetrics, runConversations, runChatSse],
  );

  // --- Run all sequentially ---

  const runAll = useCallback(async () => {
    setIsRunningAll(true);
    setTests(INITIAL_TESTS);
    firstClientRef.current = null;

    const clients = await runWorkspaces();
    const clientId = clients?.[0]?.id;

    await runWorkspace(clientId);
    await runCampaigns(clientId);
    await runMetrics(clientId);
    await runConversations();
    await runChatSse();

    setIsRunningAll(false);
  }, [runWorkspaces, runWorkspace, runCampaigns, runMetrics, runConversations, runChatSse]);

  // --- Status rendering ---

  const successCount = tests.filter((t) => t.status === "success").length;
  const errorCount = tests.filter((t) => t.status === "error").length;

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-auto p-6">
        {/* Section 1 — Diagnostic API */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Diagnostic API
            </h1>
            {(successCount > 0 || errorCount > 0) && (
              <p className="mt-1 text-[12px] text-[var(--color-text-primary)]0">
                {successCount}/{tests.length} OK
                {errorCount > 0 && (
                  <span className="ml-2 text-rose-400">
                    {errorCount} erreur(s)
                  </span>
                )}
              </p>
            )}
          </div>
          <Button
            onClick={runAll}
            loading={isRunningAll}
            icon={!isRunningAll ? <Play size={14} /> : undefined}
          >
            {isRunningAll ? "Tests en cours..." : "Lancer tous les tests"}
          </Button>
        </div>

        {/* Test table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-bg-subtle)]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Endpoint
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)] w-24">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)] w-20">
                  Temps
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Resultat
                </th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr
                  key={test.id}
                  className="border-t border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-bg-elevated)]"
                >
                  <td className="px-4 py-3">
                    <div className="text-[var(--color-text-primary)]">{test.name}</div>
                    <div className="font-mono text-[11px] text-[var(--color-text-primary)]0">
                      {test.endpoint}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={test.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-text-secondary)]">
                    {test.responseTime !== undefined ? `${test.responseTime}ms` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {test.status === "success" && (
                      <span className="text-[12px] text-[var(--color-text-secondary)]">
                        {test.result}
                      </span>
                    )}
                    {test.status === "error" && (
                      <span className="text-[12px] text-rose-400">
                        {test.error}
                      </span>
                    )}
                    {test.status === "idle" && (
                      <span className="text-[12px] text-[var(--color-text-muted)]">—</span>
                    )}
                    {test.status === "testing" && (
                      <Skeleton className="h-4 w-32" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => runSingleTest(test.id)}
                      disabled={test.status === "testing" || isRunningAll}
                      className="rounded p-1 text-[var(--color-text-primary)]0 transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-secondary)] disabled:opacity-30"
                      title="Relancer ce test"
                    >
                      <RotateCw size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2 — Configuration */}
        <h2 className="mt-8 text-[14px] font-medium text-[var(--color-text-secondary)]">
          Configuration
        </h2>
        <div className="mt-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
          <dl className="flex flex-col gap-3">
            <ConfigRow label="API URL" value={process.env.NEXT_PUBLIC_API_URL ?? "non defini"} mono />
            <ConfigRow
              label="Date range active"
              value={`${datePreset} — ${formatDateRange(dateRange)}`}
            />
            <ConfigRow
              label="Clients en cache"
              value={cachedWorkspaces ? `${cachedWorkspaces.length} client(s)` : "Aucun (pas encore charge)"}
            />
            <ConfigRow label="Version" value="The Sheep Dashboard v2.0.0" />
          </dl>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: TestStatus }) {
  switch (status) {
    case "idle":
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-text-primary)]0">
          <span className="h-2 w-2 rounded-full bg-slate-600" />
          En attente
        </span>
      );
    case "testing":
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-amber-400">
          <Loader2 size={12} className="animate-spin" />
          Test...
        </span>
      );
    case "success":
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-400">
          <Check size={12} />
          OK
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-rose-400">
          <X size={12} />
          Erreur
        </span>
      );
  }
}

function ConfigRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[12px] text-[var(--color-text-primary)]0">{label}</dt>
      <dd
        className={cn(
          "text-right text-[13px] text-[var(--color-text-primary)]",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
