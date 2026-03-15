"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
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
  list_clients: "Liste des clients",
  get_metrics_summary: "Résumé des métriques",
};

export function ToolCallIndicator({ toolCall }: { toolCall: ToolCall }) {
  const isDone = toolCall.output !== undefined;
  const label = TOOL_LABELS[toolCall.name] ?? toolCall.name;
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (isDone) {
      const t = setTimeout(() => setFaded(true), 1500);
      return () => clearTimeout(t);
    }
  }, [isDone]);

  return (
    <div className="flex items-center gap-1.5 py-0.5" style={{ opacity: faded ? 0.35 : 1, transition: "opacity 400ms" }}>
      {isDone ? (
        <Check size={12} style={{ color: "var(--color-text-muted)" }} />
      ) : (
        <Loader2 size={12} className="animate-spin" style={{ color: "var(--color-text-muted)" }} />
      )}
      <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontStyle: "italic" }}>{label}</span>
    </div>
  );
}
