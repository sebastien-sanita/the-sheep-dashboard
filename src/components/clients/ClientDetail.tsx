"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { Client, Campaign, AggregatedMetrics, MetricValue, KPIItem } from "@/lib/types";
import { formatCurrency, formatPercent, formatNumber, formatTrend } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import { AccountBadge } from "./AccountBadge";
import { SyncButton } from "./SyncButton";
import { KPICard } from "../dashboard/KPICard";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  EXPIRED: "bg-amber-500/10 text-amber-400",
  ERROR: "bg-rose-500/10 text-rose-400",
  DISCONNECTED: "bg-slate-500/10 text-slate-400",
  PAUSED: "bg-amber-500/10 text-amber-400",
  DELETED: "bg-slate-500/10 text-slate-400",
  ARCHIVED: "bg-slate-500/10 text-slate-400",
};

function metricToKPI(
  label: string,
  mv: MetricValue | undefined,
  formatter: (v: number) => string,
  invertTrend = false,
): KPIItem {
  if (!mv) return { label, value: "—" };
  const trendDir = mv.trendDirection;
  let color: KPIItem["color"] = "default";
  if (trendDir === "up") color = invertTrend ? "danger" : "success";
  if (trendDir === "down") color = invertTrend ? "success" : "danger";
  return {
    label,
    value: formatter(mv.value),
    previousValue: mv.previousValue !== undefined ? formatter(mv.previousValue) : undefined,
    trend: mv.trend !== undefined ? formatTrend(mv.trend) : undefined,
    trendDirection: trendDir,
    color,
  };
}

interface ClientDetailProps {
  client: Client;
  campaigns: Campaign[] | undefined;
  campaignsLoading: boolean;
  metrics: AggregatedMetrics | undefined;
  metricsLoading: boolean;
}

export function ClientDetail({
  client,
  campaigns,
  campaignsLoading,
  metrics,
  metricsLoading,
}: ClientDetailProps) {
  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            {client.name}
          </h1>
          <p className="text-[12px] text-slate-500">{client.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client.id}/chat`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-primary-500"
          >
            <MessageSquare size={14} />
            Ouvrir le chat
          </Link>
          <SyncButton workspaceId={client.id} />
        </div>
      </div>

      {/* Comptes connectes */}
      <section className="mt-6">
        <h2 className="text-[14px] font-medium text-slate-300">
          Comptes publicitaires
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {(client.adAccounts ?? []).map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 rounded-lg bg-slate-800 p-4"
            >
              <AccountBadge platform={account.platform} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] text-slate-200">
                  {account.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {account.platformId}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  STATUS_BADGES[account.status] ?? "bg-slate-500/10 text-slate-400",
                )}
              >
                {account.status}
              </span>
              {account.lastSyncAt && (
                <span className="text-[11px] text-slate-500">
                  {formatDate(account.lastSyncAt, "short")}
                </span>
              )}
            </div>
          ))}
          {(client.adAccounts ?? []).length === 0 && (
            <p className="text-[12px] text-slate-500">
              Aucun compte connecte
            </p>
          )}
        </div>
      </section>

      {/* Metriques */}
      <section className="mt-6">
        <h2 className="text-[14px] font-medium text-slate-300">Performance</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {metricsLoading ? (
            <>
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </>
          ) : metrics?.metrics ? (
            <>
              <KPICard
                item={metricToKPI("Dépense", metrics.metrics.spend, (v) =>
                  formatCurrency(v),
                )}
              />
              <KPICard
                item={metricToKPI(
                  "Coût / Lead",
                  metrics.metrics.costPerConversion,
                  (v) => formatCurrency(v),
                  true,
                )}
              />
              <KPICard
                item={metricToKPI("CTR", metrics.metrics.ctr, (v) =>
                  formatPercent(v),
                )}
              />
              <KPICard
                item={metricToKPI("Leads", metrics.metrics.conversions, (v) =>
                  formatNumber(v),
                )}
              />
            </>
          ) : (
            <p className="col-span-4 text-[12px] text-slate-500">
              Aucune métrique disponible
            </p>
          )}
        </div>
      </section>

      {/* Campagnes */}
      <section className="mt-6">
        <h2 className="text-[14px] font-medium text-slate-300">Campagnes</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800">
          {campaignsLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 border-t border-slate-700/30 px-4 py-3 first:border-t-0">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <table className="w-full text-[13px]">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Objectif
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-slate-700/30 transition-colors hover:bg-slate-700/20"
                  >
                    <td className="px-4 py-3 text-slate-200">{c.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                          STATUS_BADGES[c.status] ?? "bg-slate-500/10 text-slate-400",
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {c.budget !== null ? formatCurrency(c.budget) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.objective ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-6 text-center text-[12px] text-slate-500">
              Aucune campagne synchronisee
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
