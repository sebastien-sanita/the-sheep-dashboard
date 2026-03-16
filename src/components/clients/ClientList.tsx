"use client";

import { useMemo } from "react";
import type { ClientSummary } from "@/lib/types";
import { ClientCard } from "./ClientCard";

interface ClientListProps {
  clients: ClientSummary[];
  searchQuery: string;
  sortBy: "name" | "spend" | "lastSync";
}

export function ClientList({ clients, searchQuery, sortBy }: ClientListProps) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, searchQuery]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "name":
        return arr.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      case "spend":
        return arr.sort((a, b) => (b.totalSpend ?? 0) - (a.totalSpend ?? 0));
      case "lastSync":
        return arr.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }
  }, [filtered, sortBy]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[13px] text-[var(--color-text-secondary)]">Aucun client trouve</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
