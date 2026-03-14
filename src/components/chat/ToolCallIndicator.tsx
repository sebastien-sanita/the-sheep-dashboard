"use client";

import { Wrench, Check } from "lucide-react";
import type { ToolCall } from "@/lib/types";

const TOOL_LABELS: Record<string, string> = {
  get_campaign_insights: "Analyse des campagnes",
  get_conversion_events: "Récupération des conversions",
  get_adset_details: "Lecture des audiences",
  get_ad_creatives: "Analyse des créatifs",
  get_frequency_data: "Vérification des fréquences",
  run_custom_query: "Requête personnalisée",
  generate_dashboard_data: "Génération du dashboard",
  get_clients: "Chargement des clients",
};

interface ToolCallIndicatorProps {
  toolCall: ToolCall;
}

export function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
  const isDone = toolCall.output !== undefined;
  const label = TOOL_LABELS[toolCall.name] ?? toolCall.name;

  return (
    <div className="flex justify-center py-1" role="status" aria-label={isDone ? `${label} terminé` : `${label} en cours`}>
      <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 transition-all duration-300">
        {isDone ? (
          <Check size={14} className="shrink-0 text-success-400" />
        ) : (
          <Wrench size={14} className="shrink-0 text-slate-400" />
        )}
        <span
          className={`text-[12px] ${isDone ? "text-slate-500" : "text-slate-400"}`}
        >
          {label}
          {!isDone && <LoadingDots />}
        </span>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="ml-0.5 inline-flex gap-[2px]">
      <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-slate-400 [animation-delay:0ms]" />
      <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
    </span>
  );
}
