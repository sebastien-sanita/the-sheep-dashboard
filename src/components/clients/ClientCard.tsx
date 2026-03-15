"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import type { ClientSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { AccountBadge } from "./AccountBadge";

function timeAgo(dateStr: string): { label: string; freshness: "fresh" | "stale" | "old" } {
  const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  const label = hours < 1 ? `il y a ${Math.max(1, Math.floor(hours * 60))} min` : hours < 24 ? `il y a ${Math.floor(hours)}h` : `il y a ${Math.floor(hours / 24)}j`;
  return { label, freshness: hours < 6 ? "fresh" : hours < 24 ? "stale" : "old" };
}

const DOT_STYLE: Record<string, string> = { fresh: "var(--color-success)", stale: "var(--color-warning)", old: "var(--color-danger)" };

export function ClientCard({ client }: { client: ClientSummary }) {
  const router = useRouter();
  const sync = timeAgo(client.updatedAt);

  return (
    <Link href={`/clients/${client.id}`}
      className="group block overflow-hidden"
      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "16px 18px", transition: "transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--color-border-emphasis)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--color-border-default)"; }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{client.name}</span>
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/clients/${client.id}/chat`); }}
          className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--color-text-tertiary)", transition: "color var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; }}>
          <MessageSquare size={14} />
        </button>
      </div>

      {/* Badges */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(client.platforms ?? []).map((p) => <AccountBadge key={p} platform={p} />)}
      </div>

      {/* Separator */}
      <div className="my-3" style={{ borderTop: "1px solid var(--color-border-subtle)" }} />

      {/* Mini KPIs */}
      <div className="flex gap-4">
        <div>
          <div className="text-caption" style={{ fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.04em" }}>Dépense</div>
          <div className="text-metric" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>
            {(client.totalSpend30d ?? client.totalSpend) != null ? formatCurrency(client.totalSpend30d ?? client.totalSpend ?? 0) : "—"}
          </div>
        </div>
        <div>
          <div className="text-caption" style={{ fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.04em" }}>Actives</div>
          <div className="text-metric" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{client.activeCampaignsCount ?? 0}</div>
        </div>
        {(client.connectedAccountCount ?? client.adAccountsCount) != null && (
          <div>
            <div className="text-caption" style={{ fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.04em" }}>Comptes</div>
            <div className="text-metric" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{client.connectedAccountCount ?? client.adAccountsCount}</div>
          </div>
        )}
      </div>

      {/* Sync */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="rounded-full" style={{ width: 5, height: 5, background: DOT_STYLE[sync.freshness] }} />
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{sync.label}</span>
      </div>
    </Link>
  );
}
