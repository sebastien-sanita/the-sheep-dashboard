"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import type { ClientSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { AccountBadge } from "./AccountBadge";

interface ClientCardProps {
  client: ClientSummary;
}

function timeAgo(dateStr: string): { label: string; freshness: "fresh" | "stale" | "old" } {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const hours = diffMs / (1000 * 60 * 60);

  let label: string;
  if (hours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    label = `il y a ${mins < 1 ? "1" : mins} min`;
  } else if (hours < 24) {
    label = `il y a ${Math.floor(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    label = `il y a ${days}j`;
  }

  const freshness = hours < 6 ? "fresh" : hours < 24 ? "stale" : "old";
  return { label, freshness };
}

const DOT_COLORS = {
  fresh: "bg-emerald-400",
  stale: "bg-amber-400",
  old: "bg-rose-400",
};

export function ClientCard({ client }: ClientCardProps) {
  const router = useRouter();
  const sync = timeAgo(client.updatedAt);

  return (
    <Link
      href={`/clients/${client.id}`}
      className="block rounded-xl border border-slate-700/50 bg-slate-800 p-5 transition-colors hover:border-primary-500/50"
    >
      {/* Name */}
      <div className="text-[15px] font-semibold text-slate-100">
        {client.name}
      </div>

      {/* Platform badges */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(client.platforms ?? []).map((p) => (
          <AccountBadge key={p} platform={p} />
        ))}
      </div>

      {/* Mini KPIs */}
      <div className="mt-3 flex gap-4">
        <div>
          <div className="text-[13px] text-slate-300">
            {client.totalSpend != null ? formatCurrency(client.totalSpend) : "—"}
          </div>
          <div className="text-[11px] text-slate-500">Dépense</div>
        </div>
        <div>
          <div className="text-[13px] text-slate-300">
            {client.activeCampaignsCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Actives</div>
        </div>
        {client.adAccountsCount != null && (
          <div>
            <div className="text-[13px] text-slate-300">
              {client.adAccountsCount}
            </div>
            <div className="text-[11px] text-slate-500">Comptes</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-700/30 pt-3">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[sync.freshness]}`}
          />
          <span className="text-[11px] text-slate-500">{sync.label}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/clients/${client.id}/chat`);
          }}
          className="rounded p-1 text-slate-400 transition-colors hover:text-primary-400"
        >
          <MessageSquare size={16} />
        </button>
      </div>
    </Link>
  );
}
