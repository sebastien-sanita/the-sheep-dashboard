"use client";

import { useState, useEffect, useMemo } from "react";
import { Image as ImageIcon, Film, LayoutGrid, X } from "lucide-react";
import { motion } from "framer-motion";
import type { AdSetWithMetrics, AdWithMetrics, CreativeData } from "@/lib/types";
import { getCampaignAdsets, getCampaignAds } from "@/lib/api/campaigns";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampaignDrilldownProps {
  workspaceId: string;
  campaignId: string;
  categoryBorder: string;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

type Tab = "audiences" | "creatives";

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAUSED: "bg-amber-500/10 text-amber-400",
  DELETED: "bg-slate-500/10 text-slate-400",
  ARCHIVED: "bg-slate-500/10 text-slate-400",
};

// ---------------------------------------------------------------------------
// Creative data normalizer
// ---------------------------------------------------------------------------

function getCreative(ad: AdWithMetrics): CreativeData | null {
  const c = ad.creative ?? ad.creativeData;
  if (!c) return null;
  return {
    imageUrl: c.imageUrl ?? c.image_url,
    thumbnailUrl: c.thumbnailUrl ?? c.thumbnail_url,
    videoUrl: c.videoUrl ?? c.video_url,
    videoId: c.videoId ?? c.video_id,
    title: c.title,
    body: c.body,
    linkUrl: c.linkUrl ?? c.link_url,
    ctaType: c.ctaType ?? c.call_to_action,
  };
}

function getAdFormat(ad: AdWithMetrics): { label: string; icon: typeof ImageIcon } {
  const name = ad.name.toLowerCase();
  const creative = getCreative(ad);
  if (name.includes("carrousel") || name.includes("carousel")) return { label: "Carrousel", icon: LayoutGrid };
  if (creative?.videoUrl || creative?.videoId || name.includes("vidéo") || name.includes("video")) return { label: "Vidéo", icon: Film };
  return { label: "Image", icon: ImageIcon };
}

function getImageUrl(ad: AdWithMetrics): string | null {
  const creative = getCreative(ad);
  if (!creative) return null;
  return creative.thumbnailUrl ?? creative.imageUrl ?? null;
}

// ---------------------------------------------------------------------------
// Audiences tab
// ---------------------------------------------------------------------------

function AudiencesTab({ adsets }: { adsets: AdSetWithMetrics[] }) {
  const maxSpend = Math.max(...adsets.map((a) => a.metrics.spend ?? 0), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-slate-700/30 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <th className="px-4 py-2 text-left">Audience</th>
            <th className="px-3 py-2 text-left">Statut</th>
            <th className="px-3 py-2 text-right">Impressions</th>
            <th className="px-3 py-2 text-right">Clics</th>
            <th className="px-3 py-2 text-right">CTR</th>
            <th className="px-3 py-2 text-right">CPC</th>
            <th className="px-3 py-2 text-right">Dépense</th>
          </tr>
        </thead>
        <tbody>
          {adsets.map((adset) => {
            const spendPct = ((adset.metrics.spend ?? 0) / maxSpend) * 100;
            return (
              <tr key={adset.id} className="border-t border-slate-700/20 transition-colors hover:bg-slate-800/50">
                <td className="px-4 py-2.5">
                  <div className="text-slate-200">{adset.name}</div>
                  {adset.bidStrategy && (
                    <div className="mt-0.5 text-[10px] text-slate-500">{adset.bidStrategy}</div>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_BADGES[adset.status] ?? "bg-slate-500/10 text-slate-400")}>
                    {adset.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300">{formatCompact(adset.metrics.impressions ?? 0)}</td>
                <td className="px-3 py-2.5 text-right text-slate-300">{formatCompact(adset.metrics.clicks ?? 0)}</td>
                <td className="px-3 py-2.5 text-right text-slate-300">{adset.metrics.ctr != null ? formatPercent(adset.metrics.ctr, 2) : "—"}</td>
                <td className="px-3 py-2.5 text-right text-slate-300">{adset.metrics.cpc != null ? formatCurrency(adset.metrics.cpc) : "—"}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-slate-200">{formatCurrency(adset.metrics.spend ?? 0)}</span>
                  </div>
                  <div className="mt-1 h-1 w-full rounded-full bg-slate-700/50">
                    <div className="h-1 rounded-full bg-primary-500/60" style={{ width: `${spendPct}%` }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creatives tab
// ---------------------------------------------------------------------------

function CreativesTab({ ads }: { ads: AdWithMetrics[] }) {
  const avgCtr = ads.length > 0
    ? ads.reduce((s, a) => s + (a.metrics.ctr ?? 0), 0) / ads.length
    : 0;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {ads.map((ad) => {
        const imgUrl = getImageUrl(ad);
        const format = getAdFormat(ad);
        const FormatIcon = format.icon;
        const ctr = ad.metrics.ctr ?? 0;
        const isTop = avgCtr > 0 && ctr > avgCtr;
        const isLow = avgCtr > 0 && ctr < avgCtr * 0.5;

        return (
          <div
            key={ad.id}
            className="overflow-hidden rounded-lg border border-slate-700/30 bg-slate-800/50 transition-colors hover:border-primary-500/40"
          >
            <div className="flex gap-3 p-3">
              {/* Thumbnail */}
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={ad.name}
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-slate-700/50">
                  <FormatIcon size={20} className="text-slate-500" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium text-slate-200">{ad.name}</span>
                  <span className="shrink-0 rounded bg-slate-700/50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                    {format.label}
                  </span>
                </div>
                {ad.adSetName && (
                  <div className="mt-0.5 truncate text-[11px] text-slate-500">{ad.adSetName}</div>
                )}

                {/* Mini KPIs */}
                <div className="mt-2 flex items-center gap-3 text-[11px]">
                  <span className="text-slate-400">
                    CTR <span className="font-medium text-slate-200">{formatPercent(ctr, 2)}</span>
                  </span>
                  <span className="text-slate-400">
                    CPC <span className="font-medium text-slate-200">{ad.metrics.cpc != null ? formatCurrency(ad.metrics.cpc) : "—"}</span>
                  </span>
                  <span className="text-slate-400">
                    <span className="font-medium text-slate-200">{formatCurrency(ad.metrics.spend ?? 0)}</span>
                  </span>
                </div>
              </div>

              {/* Performance badge */}
              <div className="shrink-0 self-start">
                {isTop && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Top
                  </span>
                )}
                {isLow && (
                  <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                    Sous-perf.
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CampaignDrilldown({
  workspaceId,
  campaignId,
  categoryBorder,
  startDate,
  endDate,
  onClose,
}: CampaignDrilldownProps) {
  const [tab, setTab] = useState<Tab>("audiences");
  const [adsets, setAdsets] = useState<AdSetWithMetrics[] | null>(null);
  const [ads, setAds] = useState<AdWithMetrics[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [adsetsData, adsData] = await Promise.all([
          getCampaignAdsets(workspaceId, campaignId, startDate, endDate),
          getCampaignAds(workspaceId, campaignId, startDate, endDate),
        ]);
        if (!cancelled) {
          setAdsets(adsetsData.sort((a, b) => (b.metrics.spend ?? 0) - (a.metrics.spend ?? 0)));
          const sortedAds = adsData.sort((a, b) => (b.metrics.spend ?? 0) - (a.metrics.spend ?? 0));
          console.log("[DEBUG] AD CREATIVE:", sortedAds.slice(0, 3).map((ad) => ({ name: ad.name, creative: ad.creative, creativeData: ad.creativeData, normalized: getCreative(ad) })));
          setAds(sortedAds);
        }
      } catch {
        if (!cancelled) {
          setAdsets([]);
          setAds([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [workspaceId, campaignId, startDate, endDate]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("overflow-hidden border-l-[3px] bg-slate-900", categoryBorder)}
    >
      <div className="px-6 py-4 pl-8">
        {/* Tabs + close */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {([
              { key: "audiences" as const, label: `Audiences${adsets ? ` (${adsets.length})` : ""}` },
              { key: "creatives" as const, label: `Créatifs${ads ? ` (${ads.length})` : ""}` },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-md px-3 py-1 text-[12px] font-medium transition-colors",
                  tab === key
                    ? "bg-slate-800 text-slate-200"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
            aria-label="Fermer le détail"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : tab === "audiences" ? (
            adsets && adsets.length > 0 ? (
              <AudiencesTab adsets={adsets} />
            ) : (
              <p className="py-6 text-center text-[12px] text-slate-500">Aucune audience trouvée</p>
            )
          ) : (
            ads && ads.length > 0 ? (
              <CreativesTab ads={ads} />
            ) : (
              <p className="py-6 text-center text-[12px] text-slate-500">Aucun créatif trouvé</p>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
