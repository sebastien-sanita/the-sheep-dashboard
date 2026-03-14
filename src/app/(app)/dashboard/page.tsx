"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Check } from "lucide-react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/dashboard/KPICard";
import { FrequencyAlert } from "@/components/dashboard/FrequencyAlert";
import { AccountBadge } from "@/components/clients/AccountBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { useAppStore } from "@/lib/stores/app-store";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { formatDateRange } from "@/lib/utils/dates";
import type { KPIItem, AlertBlock, ClientSummary } from "@/lib/types";

function buildKPIs(clients: ClientSummary[]): KPIItem[] {
  const totalSpend = clients.reduce((s, c) => s + (c.totalSpend ?? 0), 0);
  const activeClients = clients.filter((c) => (c.totalSpend ?? 0) > 0).length;
  const totalCampaigns = clients.reduce((s, c) => s + (c.activeCampaignsCount ?? 0), 0);
  const totalAccounts = clients.reduce((s, c) => s + (c.adAccountsCount ?? 0), 0);

  const now = Date.now();
  const staleClients = clients.filter(
    (c) => now - new Date(c.updatedAt).getTime() > 24 * 60 * 60 * 1000,
  ).length;

  return [
    { label: "Dépense totale", value: formatCurrency(totalSpend) },
    { label: "Clients actifs", value: formatNumber(activeClients) },
    { label: "Campagnes actives", value: formatNumber(totalCampaigns) },
    { label: "Comptes connectés", value: formatNumber(totalAccounts) },
    {
      label: "Clients en alerte",
      value: formatNumber(staleClients),
      color: staleClients > 0 ? ("danger" as const) : ("default" as const),
    },
  ];
}

function buildAlerts(clients: ClientSummary[]): AlertBlock[] {
  const now = Date.now();
  const alerts: AlertBlock[] = [];

  for (const c of clients) {
    const hoursAgo = (now - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60);

    if (hoursAgo > 72) {
      alerts.push({
        type: "alert",
        severity: "danger",
        title: "Sync critique",
        message: `${c.name} n'a pas été synchronisé depuis ${Math.floor(hoursAgo / 24)} jours`,
        relatedEntity: { type: "client", id: c.id, name: c.name },
      });
    } else if (hoursAgo > 24) {
      alerts.push({
        type: "alert",
        severity: "warning",
        title: "Sync obsolète",
        message: `${c.name} n'a pas été synchronisé depuis ${Math.floor(hoursAgo)}h`,
        relatedEntity: { type: "client", id: c.id, name: c.name },
      });
    }

    if ((c.activeCampaignsCount ?? 0) === 0 && (c.adAccountsCount ?? 0) > 0) {
      alerts.push({
        type: "alert",
        severity: "info",
        title: "Aucune campagne active",
        message: `${c.name} a ${c.adAccountsCount ?? 0} compte(s) connecté(s) mais aucune campagne active`,
        relatedEntity: { type: "client", id: c.id, name: c.name },
      });
    }
  }

  return alerts;
}

export default function DashboardPage() {
  const router = useRouter();
  const dateRange = useAppStore((s) => s.dateRange);
  const { data: clients, isLoading, isError, refetch } = useWorkspaces();

  const kpis = useMemo(() => (clients ? buildKPIs(clients) : []), [clients]);
  const alerts = useMemo(() => (clients ? buildAlerts(clients) : []), [clients]);
  const topClients = useMemo(
    () =>
      clients
        ? [...clients].sort((a, b) => (b.totalSpend ?? 0) - (a.totalSpend ?? 0)).slice(0, 10)
        : [],
    [clients],
  );

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-auto p-6">
        {/* Section 1 — KPIs */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold text-slate-100">
            Vue d&apos;ensemble
          </h1>
          <span className="text-[13px] text-slate-400">
            {formatDateRange(dateRange)}
          </span>
        </div>

        {isLoading && (
          <div className="mt-4 space-y-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-64" />
            <Skeleton className="h-5 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-[13px] text-slate-400">
              Impossible de charger le dashboard
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

        {clients && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {kpis.map((kpi) => (
                <KPICard key={kpi.label} item={kpi} />
              ))}
            </div>

            {/* Section 2 — Top clients */}
            <h2 className="mt-8 text-[14px] font-medium text-slate-300">
              Top clients
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400 w-10">
                      #
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Client
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Plateformes
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Dépense
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Campagnes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((c, i) => (
                    <tr
                      key={c.id}
                      className="border-t border-slate-700/30 transition-colors hover:bg-slate-700/20"
                    >
                      <td className="px-4 py-3 text-[12px] text-slate-500">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/clients/${c.id}`}
                          className="text-slate-200 hover:text-primary-400"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {(c.platforms ?? []).map((p) => (
                            <AccountBadge key={p} platform={p} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200">
                        {formatCurrency(c.totalSpend ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {c.activeCampaignsCount ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 3 — Alerts */}
            <div className="mt-8 flex items-center gap-2">
              <h2 className="text-[14px] font-medium text-slate-300">
                Alertes
              </h2>
              {alerts.length > 0 && (
                <span className="rounded-full bg-danger-500/10 px-2 py-0.5 text-[11px] font-medium text-danger-400">
                  {alerts.length}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800 px-4 py-6 justify-center">
                  <Check size={18} className="text-emerald-400" />
                  <span className="text-[13px] text-slate-400">
                    Aucune alerte — tout est opérationnel
                  </span>
                </div>
              ) : (
                <>
                  {alerts.slice(0, 5).map((alert, i) => (
                    <FrequencyAlert key={i} block={alert} />
                  ))}
                  {alerts.length > 5 && (
                    <p className="text-center text-[12px] text-slate-500">
                      +{alerts.length - 5} autres alertes
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating chat button */}
      <motion.button
        type="button"
        onClick={() => router.push("/chat")}
        aria-label="Ouvrir le chat IA"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
}
