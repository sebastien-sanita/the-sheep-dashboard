"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { AlertBlock } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface FrequencyAlertProps {
  block: AlertBlock;
}

const SEVERITY_STYLES: Record<string, { border: string; bg: string; iconColor: string }> = {
  info: { border: "border-primary-500", bg: "bg-slate-800", iconColor: "text-primary-400" },
  warning: { border: "border-amber-500", bg: "bg-amber-950/30", iconColor: "text-amber-400" },
  danger: { border: "border-rose-500", bg: "bg-rose-950/30", iconColor: "text-rose-400" },
};

export function FrequencyAlert({ block }: FrequencyAlertProps) {
  const styles = SEVERITY_STYLES[block.severity] ?? SEVERITY_STYLES.info;
  const IconComponent = block.severity === "info" ? Info : AlertTriangle;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-r-xl border-l-4 p-4",
        styles.border,
        styles.bg,
      )}
    >
      <IconComponent size={18} className={cn("mt-0.5 shrink-0", styles.iconColor)} />
      <div>
        <p className="text-[13px] font-medium text-slate-200">{block.title}</p>
        <p className="mt-1 text-[12px] text-slate-400">{block.message}</p>
        {block.relatedEntity && (
          <p className="mt-1 text-[12px] text-primary-400 hover:underline">
            Voir {block.relatedEntity.name}
          </p>
        )}
      </div>
    </div>
  );
}
