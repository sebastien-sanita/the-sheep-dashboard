"use client";

import { useState, useEffect, useMemo } from "react";
import { Image as ImageIcon, Film, LayoutGrid, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdSetWithMetrics, AdWithMetrics, CreativeData } from "@/lib/types";
import { getCampaignAdsets, getCampaignAds } from "@/lib/api/campaigns";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { CreativePreviewModal } from "./CreativePreviewModal";
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
type TierKey = "top" | "mid" | "low";

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
// Tier classification
// ---------------------------------------------------------------------------

interface TierDef {
  key: TierKey;
  emoji: string;
  label: string;
  border: string;
  bg: string;
  text: string;
}

const TIERS: TierDef[] = [
  { key: "top", emoji: "🏆", label: "Top performers", border: "border-l-emerald-500", bg: "bg-emerald-500/5", text: "text-emerald-400" },
  { key: "mid", emoji: "⚡", label: "Performers", border: "border-l-blue-500", bg: "bg-blue-500/5", text: "text-blue-400" },
  { key: "low", emoji: "⚠️", label: "À optimiser", border: "border-l-amber-500", bg: "bg-amber-500/5", text: "text-amber-400" },
];

function classifyAds(ads: AdWithMetrics[]): Map<TierKey, AdWithMetrics[]> {
  // Sort by CTR descending
  const sorted = [...ads].sort((a, b) => (b.metrics.ctr ?? 0) - (a.metrics.ctr ?? 0));
  const n = sorted.length;
  const topN = Math.max(1, Math.ceil(n * 0.25));
  const lowStart = Math.max(topN + 1, n - Math.max(1, Math.ceil(n * 0.25)));

  const tiers = new Map<TierKey, AdWithMetrics[]>();
  tiers.set("top", []);
  tiers.set("mid", []);
  tiers.set("low", []);

  sorted.forEach((ad, i) => {
    // Ads with 0 impressions or 0 spend → low
    if ((ad.metrics.impressions ?? 0) === 0 || (ad.metrics.spend ?? 0) === 0) {
      tiers.get("low")!.push(ad);
    } else if (i < topN) {
      tiers.get("top")!.push(ad);
    } else if (i >= lowStart) {
      tiers.get("low")!.push(ad);
    } else {
      tiers.get("mid")!.push(ad);
    }
  });

  return tiers;
}

function getAdTier(ad: AdWithMetrics, tiers: Map<TierKey, AdWithMetrics[]>): TierKey {
  for (const [key, list] of tiers) {
    if (list.some((a) => a.id === ad.id)) return key;
  }
  return "mid";
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
                  {adset.bidStrategy && <div className="mt-0.5 text-[10px] text-slate-500">{adset.bidStrategy}</div>}
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
                  <div className="text-right text-slate-200">{formatCurrency(adset.metrics.spend ?? 0)}</div>
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
// Ad card (used in tier sections)
// ---------------------------------------------------------------------------

function AdCard({ ad, onClick }: { ad: AdWithMetrics; onClick: () => void }) {
  const imgUrl = getImageUrl(ad);
  const format = getAdFormat(ad);
  const FormatIcon = format.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-lg border border-slate-700/30 bg-slate-800/50 text-left transition-colors hover:border-primary-500/40"
    >
      <div className="flex gap-3 p-3">
        {imgUrl ? (
          <img src={imgUrl} alt={ad.name} className="h-16 w-16 shrink-0 rounded-md object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-slate-700/50">
            <FormatIcon size={20} className="text-slate-500" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-slate-200">{ad.name}</span>
            <span className="shrink-0 rounded bg-slate-700/50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">{format.label}</span>
          </div>
          {ad.adSetName && <div className="mt-0.5 truncate text-[11px] text-slate-500">{ad.adSetName}</div>}
          <div className="mt-2 flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">CTR <span className="font-medium text-slate-200">{formatPercent(ad.metrics.ctr ?? 0, 2)}</span></span>
            <span className="text-slate-400">CPC <span className="font-medium text-slate-200">{ad.metrics.cpc != null ? formatCurrency(ad.metrics.cpc) : "—"}</span></span>
            <span className="font-medium text-slate-200">{formatCurrency(ad.metrics.spend ?? 0)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tier section
// ---------------------------------------------------------------------------

function TierSection({ tier, ads, defaultOpen, onAdClick }: { tier: TierDef; ads: AdWithMetrics[]; defaultOpen: boolean; onAdClick: (id: string) => void }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const avgCtr = ads.length > 0 ? ads.reduce((s, a) => s + (a.metrics.ctr ?? 0), 0) / ads.length : 0;

  if (ads.length === 0) return null;

  return (
    <div className={cn("rounded-lg border-l-[3px]", tier.border, tier.bg)}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px]">{tier.emoji}</span>
          <span className={cn("text-[13px] font-medium", tier.text)}>{tier.label}</span>
          <span className="text-[11px] text-slate-500">({ads.length})</span>
          <span className="text-[11px] text-slate-500">· CTR moy. {formatPercent(avgCtr, 2)}</span>
        </div>
        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className="grid grid-cols-1 gap-2 px-4 pb-4 md:grid-cols-2">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} onClick={() => onAdClick(ad.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creatives tab with tiers
// ---------------------------------------------------------------------------

function CreativesTab({ ads, onAdClick }: { ads: AdWithMetrics[]; onAdClick: (id: string) => void }) {
  const tiers = useMemo(() => classifyAds(ads), [ads]);
  const avgCtr = ads.length > 0 ? ads.reduce((s, a) => s + (a.metrics.ctr ?? 0), 0) / ads.length : 0;
  const bestAd = ads.length > 0 ? [...ads].sort((a, b) => (b.metrics.ctr ?? 0) - (a.metrics.ctr ?? 0))[0] : null;

  const topCount = tiers.get("top")?.length ?? 0;
  const midCount = tiers.get("mid")?.length ?? 0;
  const lowCount = tiers.get("low")?.length ?? 0;
  const total = ads.length;

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="rounded-lg bg-slate-800/50 p-3">
        <div className="text-[12px] text-slate-300">
          <span className="font-medium">{total} créatifs</span>
          <span className="text-slate-500"> · CTR moyen {formatPercent(avgCtr, 2)}</span>
          {bestAd && (
            <span className="text-slate-500"> · Meilleur : <span className="text-emerald-400">{bestAd.name.slice(0, 30)}{bestAd.name.length > 30 ? "…" : ""}</span> ({formatPercent(bestAd.metrics.ctr ?? 0, 2)})</span>
          )}
        </div>
        {/* Distribution bar */}
        <div className="mt-2 flex h-2 overflow-hidden rounded-full">
          {topCount > 0 && <div className="bg-emerald-500" style={{ width: `${(topCount / total) * 100}%` }} />}
          {midCount > 0 && <div className="bg-blue-500" style={{ width: `${(midCount / total) * 100}%` }} />}
          {lowCount > 0 && <div className="bg-amber-500" style={{ width: `${(lowCount / total) * 100}%` }} />}
        </div>
        <div className="mt-1.5 flex gap-4 text-[10px] text-slate-500">
          <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Top {topCount}</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Perf. {midCount}</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> À opt. {lowCount}</span>
        </div>
      </div>

      {/* Tier sections */}
      {TIERS.map((tier) => (
        <TierSection
          key={tier.key}
          tier={tier}
          ads={tiers.get(tier.key) ?? []}
          defaultOpen={tier.key !== "low"}
          onAdClick={onAdClick}
        />
      ))}
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
  const [previewAdId, setPreviewAdId] = useState<string | null>(null);

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
          setAds(adsData.sort((a, b) => (b.metrics.spend ?? 0) - (a.metrics.spend ?? 0)));
        }
      } catch {
        if (!cancelled) { setAdsets([]); setAds([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [workspaceId, campaignId, startDate, endDate]);

  // Modal data
  const previewAd = previewAdId && ads ? ads.find((a) => a.id === previewAdId) : null;
  const tiers = useMemo(() => ads ? classifyAds(ads) : new Map<TierKey, AdWithMetrics[]>(), [ads]);
  const maxCtr = useMemo(() => ads ? Math.max(...ads.map((a) => a.metrics.ctr ?? 0), 0.01) : 1, [ads]);
  const maxSpend = useMemo(() => ads ? Math.max(...ads.map((a) => a.metrics.spend ?? 0), 1) : 1, [ads]);

  return (
    <>
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
                    tab === key ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:text-slate-300",
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
                <CreativesTab ads={ads} onAdClick={setPreviewAdId} />
              ) : (
                <p className="py-6 text-center text-[12px] text-slate-500">Aucun créatif trouvé</p>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewAd && ads && (
          <CreativePreviewModal
            ad={previewAd}
            ads={ads}
            tier={getAdTier(previewAd, tiers)}
            rank={ads.findIndex((a) => a.id === previewAd.id) + 1}
            maxCtr={maxCtr}
            maxSpend={maxSpend}
            onClose={() => setPreviewAdId(null)}
            onNavigate={setPreviewAdId}
          />
        )}
      </AnimatePresence>
    </>
  );
}
