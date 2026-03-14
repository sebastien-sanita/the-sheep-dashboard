"use client";

import dynamic from "next/dynamic";
import { BarChart3, X } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/stores/dashboard-store";
import type { DashboardBlock } from "@/lib/types";
import { KPIGrid } from "./KPIGrid";
import { FrequencyAlert } from "./FrequencyAlert";

const SpendChart = dynamic(() => import("./SpendChart").then((m) => m.SpendChart), { ssr: false });
const CampaignTable = dynamic(() => import("./CampaignTable").then((m) => m.CampaignTable), { ssr: false });
const PlatformBreakdown = dynamic(() => import("./PlatformBreakdown").then((m) => m.PlatformBreakdown), { ssr: false });
const ComparisonChart = dynamic(() => import("./ComparisonChart").then((m) => m.ComparisonChart), { ssr: false });

function BlockRenderer({ block }: { block: DashboardBlock }) {
  switch (block.type) {
    case "kpi_grid":
      return <KPIGrid block={block} />;
    case "line_chart":
      return <SpendChart block={block} chartType="line" />;
    case "bar_chart":
      return <SpendChart block={block} chartType="bar" />;
    case "donut_chart":
      return <PlatformBreakdown block={block} />;
    case "table":
      return <CampaignTable block={block} />;
    case "comparison":
      return <ComparisonChart block={block} />;
    case "alert":
      return <FrequencyAlert block={block} />;
    case "text_summary":
      return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800 p-4">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-300">
            {block.content}
          </p>
        </div>
      );
  }
}

function getColSpan(type: DashboardBlock["type"]): string {
  switch (type) {
    case "line_chart":
    case "bar_chart":
    case "donut_chart":
      return "col-span-12 lg:col-span-6";
    default:
      return "col-span-12";
  }
}

export function DashboardRenderer() {
  const blocks = useDashboardStore((s) => s.blocks);
  const dashboardTitle = useDashboardStore((s) => s.dashboardTitle);
  const pushToHistory = useDashboardStore((s) => s.pushToHistory);
  const clearDashboard = useDashboardStore((s) => s.clearDashboard);

  if (blocks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
        <BarChart3 size={48} className="text-slate-600" />
        <p className="text-[13px] text-slate-500">
          Les visualisations apparaitront ici
        </p>
        <p className="text-center text-[12px] text-slate-600">
          Pose une question dans le chat pour generer des graphiques et tableaux
        </p>
      </div>
    );
  }

  function handleClear() {
    pushToHistory();
    clearDashboard();
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">
          {dashboardTitle ?? "Dashboard"}
        </h2>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          title="Effacer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {blocks.map((block, i) => (
          <motion.div
            key={`${block.type}-${i}`}
            className={getColSpan(block.type)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <BlockRenderer block={block} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
