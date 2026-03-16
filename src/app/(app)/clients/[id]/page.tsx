"use client";

import { use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ClientDashboard } from "@/components/clients/ClientDashboard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkspace, useWorkspaceCampaigns } from "@/lib/hooks/useWorkspace";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { useAppStore } from "@/lib/stores/app-store";
import { getPreviousPeriod } from "@/lib/utils/dates";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dateRange = useAppStore((s) => s.dateRange);
  const previousRange = getPreviousPeriod(dateRange);

  const workspace = useWorkspace(id);
  const campaigns = useWorkspaceCampaigns(id);
  const metrics = useMetrics(id, dateRange);
  const prevMetrics = useMetrics(id, previousRange);

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-auto">
        {workspace.isLoading && (
          <div className="space-y-6 p-5">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-8 w-56" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-80" />
            <Skeleton className="h-64" />
          </div>
        )}

        {workspace.isError && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              Erreur lors du chargement du client
            </p>
            <button
              type="button"
              onClick={() => workspace.refetch()}
              className="mt-3 rounded-lg bg-primary-600 px-4 py-1.5 text-[12px] font-medium text-[var(--color-text-primary)] hover:bg-primary-500"
            >
              Réessayer
            </button>
          </div>
        )}

        {workspace.data && (
          <ClientDashboard
            client={workspace.data}
            campaigns={campaigns.data}
            campaignsLoading={campaigns.isLoading}
            metrics={metrics.data}
            metricsLoading={metrics.isLoading}
            prevMetrics={prevMetrics.data}
            prevMetricsLoading={prevMetrics.isLoading}
          />
        )}
      </div>
    </div>
  );
}
