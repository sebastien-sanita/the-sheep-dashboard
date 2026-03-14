"use client";

import { use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ClientDetail } from "@/components/clients/ClientDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkspace, useWorkspaceCampaigns } from "@/lib/hooks/useWorkspace";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { useAppStore } from "@/lib/stores/app-store";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dateRange = useAppStore((s) => s.dateRange);
  const { data: client, isLoading, isError, refetch } = useWorkspace(id);
  const campaigns = useWorkspaceCampaigns(id);
  const metrics = useMetrics(id, dateRange);

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="space-y-6 p-5">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[13px] text-slate-400">
              Erreur lors du chargement du client
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-primary-600 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-primary-500"
            >
              Réessayer
            </button>
          </div>
        )}

        {client && (
          <ClientDetail
            client={client}
            campaigns={campaigns.data}
            campaignsLoading={campaigns.isLoading}
            metrics={metrics.data}
            metricsLoading={metrics.isLoading}
          />
        )}
      </div>
    </div>
  );
}
