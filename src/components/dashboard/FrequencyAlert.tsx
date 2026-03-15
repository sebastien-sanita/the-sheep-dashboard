"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { AlertBlock } from "@/lib/types";

const SEV: Record<string, { border: string; icon: string }> = {
  info: { border: "var(--color-info)", icon: "var(--color-info)" },
  warning: { border: "var(--color-warning)", icon: "var(--color-warning)" },
  danger: { border: "var(--color-danger)", icon: "var(--color-danger)" },
};

export function FrequencyAlert({ block }: { block: AlertBlock }) {
  const s = SEV[block.severity] ?? SEV.info;
  const Icon = block.severity === "info" ? Info : AlertTriangle;

  return (
    <div role="alert" className="flex items-start gap-3"
      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderLeft: `2px solid ${s.border}`, borderRadius: "var(--radius-md)", padding: "10px 16px" }}>
      <Icon size={16} className="mt-0.5 shrink-0" style={{ color: s.icon }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{block.title}</p>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{block.message}</p>
        {block.relatedEntity && (
          <p style={{ fontSize: 12, color: "var(--color-accent)", marginTop: 2, cursor: "pointer" }} className="hover:underline">
            Voir {block.relatedEntity.name}
          </p>
        )}
      </div>
    </div>
  );
}
