"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { ClientList } from "@/components/clients/ClientList";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkspaces } from "@/lib/hooks/useWorkspace";
import { cn } from "@/lib/utils/cn";

type SortBy = "name" | "spend" | "lastSync";

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: "name", label: "Nom" },
  { key: "spend", label: "Dépense" },
  { key: "lastSync", label: "Dernière sync" },
];

export default function ClientsPage() {
  const { data: clients, isLoading, isError, refetch } = useWorkspaces();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex-1 overflow-auto p-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-semibold text-slate-100">Clients</h1>
            {clients && (
              <span className="text-[13px] text-slate-400">
                ({clients.length} clients)
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <label htmlFor="client-search" className="sr-only">Rechercher un client</label>
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="client-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-9 pr-3 text-[13px] text-slate-50 outline-none placeholder:text-slate-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Sort bar */}
        <div className="mb-4 flex gap-1">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(key)}
              className={cn(
                "rounded-md px-3 py-1 text-[12px] font-medium transition-colors",
                sortBy === key
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[13px] text-slate-400">
              Erreur lors du chargement des clients
            </p>
            <Button size="sm" onClick={() => refetch()} className="mt-3">
              Réessayer
            </Button>
          </div>
        )}

        {clients && (
          <ClientList
            clients={clients}
            searchQuery={searchQuery}
            sortBy={sortBy}
          />
        )}
      </div>
    </div>
  );
}
