"use client";

import { useState, useEffect, useMemo } from "react";
import { Image as ImageIcon, Film, LayoutGrid, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdSetWithMetrics, AdWithMetrics, CreativeData } from "@/lib/types";
import { getCampaignAdsets, getCampaignAds } from "@/lib/api/campaigns";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { type CategoryKey, getObjectiveConfig, formatKpi, type ObjectiveMetricsConfig, hasConversionData } from "@/lib/utils/objective-metrics";
import { translateTargeting } from "@/lib/utils/targeting";
import { CreativePreviewModal } from "./CreativePreviewModal";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampaignDrilldownProps {
  workspaceId: string;
  campaignId: string;
  categoryKey: CategoryKey;
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
  DELETED: "bg-slate-500/10 text-[var(--color-text-secondary)]",
  ARCHIVED: "bg-slate-500/10 text-[var(--color-text-secondary)]",
};

// ---------------------------------------------------------------------------
// Creative data normalizer
// ---------------------------------------------------------------------------

function getCreative(ad: AdWithMetrics): CreativeData | null {
  const c = ad.creative ?? ad.creativeData;
  if (!c) return null;
  return { imageUrl: c.imageUrl ?? c.image_url, thumbnailUrl: c.thumbnailUrl ?? c.thumbnail_url, videoUrl: c.videoUrl ?? c.video_url, videoId: c.videoId ?? c.video_id, title: c.title, body: c.body, linkUrl: c.linkUrl ?? c.link_url, ctaType: c.ctaType ?? c.call_to_action };
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
  return creative?.thumbnailUrl ?? creative?.imageUrl ?? null;
}

// ---------------------------------------------------------------------------
// Tier classification using objective-specific scoring
// ---------------------------------------------------------------------------

const TIERS: { key: TierKey; emoji: string; label: string; border: string; bg: string; text: string }[] = [
  { key: "top", emoji: "🏆", label: "Top performers", border: "border-l-emerald-500", bg: "bg-emerald-500/5", text: "text-emerald-400" },
  { key: "mid", emoji: "⚡", label: "Performers", border: "border-l-blue-500", bg: "bg-blue-500/5", text: "text-blue-400" },
  { key: "low", emoji: "⚠️", label: "À optimiser", border: "border-l-amber-500", bg: "bg-amber-500/5", text: "text-amber-400" },
];

function classifyAds(ads: AdWithMetrics[], config: ObjectiveMetricsConfig): Map<TierKey, AdWithMetrics[]> {
  // Score each ad using the objective's primary KPI
  const scored = ads.map((ad) => ({ ad, score: config.scoringExtract(ad.metrics) }));

  // Separate ads with no score (null) → low tier
  const withScore = scored.filter((s) => s.score != null) as { ad: AdWithMetrics; score: number }[];
  const noScore = scored.filter((s) => s.score == null).map((s) => s.ad);

  // Sort by scoring direction
  withScore.sort((a, b) => config.scoringDirection === "asc" ? a.score - b.score : b.score - a.score);

  const n = withScore.length;
  const topN = Math.max(1, Math.ceil(n * 0.25));
  const lowStart = Math.max(topN, n - Math.max(1, Math.ceil(n * 0.25)));

  const tiers = new Map<TierKey, AdWithMetrics[]>([["top", []], ["mid", []], ["low", [...noScore]]]);

  withScore.forEach(({ ad }, i) => {
    if (i < topN) tiers.get("top")!.push(ad);
    else if (i >= lowStart) tiers.get("low")!.push(ad);
    else tiers.get("mid")!.push(ad);
  });

  return tiers;
}

function getAdTier(ad: AdWithMetrics, tiers: Map<TierKey, AdWithMetrics[]>): TierKey {
  for (const [key, list] of tiers) { if (list.some((a) => a.id === ad.id)) return key; }
  return "mid";
}

// ---------------------------------------------------------------------------
// Audiences tab — columns adapt to objective
// ---------------------------------------------------------------------------

function AudiencesTab({ adsets, config }: { adsets: AdSetWithMetrics[]; config: ObjectiveMetricsConfig }) {
  const maxSpend = Math.max(...adsets.map((a) => a.metrics.spend ?? 0), 1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[var(--color-border-subtle)] text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            <th className="px-4 py-2 text-left">Audience</th>
            <th className="px-3 py-2 text-left">Statut</th>
            {config.kpis.slice(0, 3).map((kpi) => (
              <th key={kpi.key} className="px-3 py-2 text-right">{kpi.label}</th>
            ))}
            <th className="px-3 py-2 text-right">Dépense</th>
          </tr>
        </thead>
        <tbody>
          {adsets.map((adset) => {
            const spendPct = ((adset.metrics.spend ?? 0) / maxSpend) * 100;
            const isExpanded = expandedId === adset.id;
            const targeting = adset.targeting ? translateTargeting(adset.targeting) : null;
            const colSpan = 4 + config.kpis.slice(0, 3).length;

            return (
              <tr key={adset.id} className="group border-t border-[var(--color-border-default)]/20">
                <td className="px-4 py-2.5">
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : adset.id)} className="text-left">
                    <div className="text-[var(--color-text-primary)] group-hover:text-primary-400 transition-colors">{adset.name}</div>
                    {adset.bidStrategy && <div className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">{adset.bidStrategy}</div>}
                    {targeting && !isExpanded && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {targeting.location !== "—" && <span className="rounded-full bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[9px] text-[var(--color-text-secondary)]">📍 {targeting.location}</span>}
                        {targeting.age !== "—" && <span className="rounded-full bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[9px] text-[var(--color-text-secondary)]">👤 {targeting.age}</span>}
                      </div>
                    )}
                  </button>
                  {/* Expanded targeting */}
                  {isExpanded && targeting && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }} className="mt-2 overflow-hidden rounded-lg bg-[var(--color-bg-surface)] p-3">
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px]">
                        <span className="text-[var(--color-text-secondary)]">📍 <span className="text-[var(--color-text-secondary)]">{targeting.location}</span></span>
                        <span className="text-[var(--color-text-secondary)]">👤 <span className="text-[var(--color-text-secondary)]">{targeting.age}, {targeting.gender}</span></span>
                        <span className="text-[var(--color-text-secondary)]">📱 <span className="text-[var(--color-text-secondary)]">{targeting.devices}</span></span>
                      </div>
                      {targeting.interests.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">🎯</span>
                          {targeting.interests.slice(0, 6).map((i) => (
                            <span key={i} className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)]">{i}</span>
                          ))}
                          {targeting.interests.length > 6 && <span className="text-[10px] text-[var(--color-text-tertiary)]">+{targeting.interests.length - 6} autres</span>}
                        </div>
                      )}
                      {targeting.placements.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">📍</span>
                          {targeting.placements.map((p) => (
                            <span key={p} className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)]">{p}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_BADGES[adset.status] ?? "bg-slate-500/10 text-[var(--color-text-secondary)]")}>{adset.status}</span>
                </td>
                {config.kpis.slice(0, 3).map((kpi) => (
                  <td key={kpi.key} className="px-3 py-2.5 text-right align-top text-[var(--color-text-secondary)]">
                    {formatKpi(kpi.extract(adset.metrics), kpi.format)}
                  </td>
                ))}
                <td className="px-3 py-2.5 align-top">
                  <div className="text-right text-[var(--color-text-primary)]">{formatCurrency(adset.metrics.spend ?? 0)}</div>
                  <div className="mt-1 h-1 w-full rounded-full bg-[var(--color-bg-elevated)]">
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
// Ad card
// ---------------------------------------------------------------------------

function AdCard({ ad, config, onClick }: { ad: AdWithMetrics; config: ObjectiveMetricsConfig; onClick: () => void }) {
  const imgUrl = getImageUrl(ad);
  const format = getAdFormat(ad);
  const FormatIcon = format.icon;
  const primaryVal = config.scoringExtract(ad.metrics);

  return (
    <button type="button" onClick={onClick} className="w-full overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-left transition-colors hover:border-primary-500/40">
      <div className="flex gap-3 p-3">
        {imgUrl ? (
          <img src={imgUrl} alt={ad.name} className="h-16 w-16 shrink-0 rounded-md object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[var(--color-bg-elevated)]"><FormatIcon size={20} className="text-[var(--color-text-tertiary)]" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">{ad.name}</span>
            <span className="shrink-0 rounded bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-text-secondary)]">{format.label}</span>
          </div>
          {ad.adSetName && <div className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">{ad.adSetName}</div>}
          <div className="mt-2 flex items-center gap-3 text-[11px]">
            <span className="text-[var(--color-text-secondary)]">{config.primaryKpiLabel} <span className="font-medium text-[var(--color-text-primary)]">{formatKpi(primaryVal, config.kpis.find((k) => k.key === config.primaryKpi)?.format ?? "currency")}</span></span>
            <span className="text-[var(--color-text-secondary)]">CTR <span className="font-medium text-[var(--color-text-primary)]">{formatPercent(ad.metrics.ctr ?? 0, 2)}</span></span>
            <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(ad.metrics.spend ?? 0)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tier section
// ---------------------------------------------------------------------------

function TierSection({ tier, ads, config, defaultOpen, onAdClick }: { tier: typeof TIERS[number]; ads: AdWithMetrics[]; config: ObjectiveMetricsConfig; defaultOpen: boolean; onAdClick: (id: string) => void }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  if (ads.length === 0) return null;

  // Average of primary KPI for this tier
  const scores = ads.map((a) => config.scoringExtract(a.metrics)).filter((v): v is number => v != null);
  const avgScore = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : null;
  const primaryFormat = config.kpis.find((k) => k.key === config.primaryKpi)?.format ?? "currency";

  return (
    <div className={cn("rounded-lg border-l-[3px]", tier.border, tier.bg)}>
      <button type="button" onClick={() => setExpanded((e) => !e)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">{tier.emoji}</span>
          <span className={cn("text-[13px] font-medium", tier.text)}>{tier.label}</span>
          <span className="text-[11px] text-[var(--color-text-tertiary)]">({ads.length})</span>
          {avgScore != null && <span className="text-[11px] text-[var(--color-text-tertiary)]">· {config.primaryKpiLabel} moy. {formatKpi(avgScore, primaryFormat)}</span>}
        </div>
        <ChevronDown size={14} className={cn("text-[var(--color-text-secondary)] transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className="grid grid-cols-1 gap-2 px-4 pb-4 md:grid-cols-2">
          {ads.map((ad) => <AdCard key={ad.id} ad={ad} config={config} onClick={() => onAdClick(ad.id)} />)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creatives tab with tiers
// ---------------------------------------------------------------------------

function CreativesTab({ ads, config, usingFallback, onAdClick }: { ads: AdWithMetrics[]; config: ObjectiveMetricsConfig; usingFallback?: boolean; onAdClick: (id: string) => void }) {
  const tiers = useMemo(() => classifyAds(ads, config), [ads, config]);

  const scores = ads.map((a) => config.scoringExtract(a.metrics)).filter((v): v is number => v != null);
  const avgScore = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : null;
  const primaryFormat = config.kpis.find((k) => k.key === config.primaryKpi)?.format ?? "currency";

  // Best ad by scoring
  const sortedForBest = [...ads].filter((a) => config.scoringExtract(a.metrics) != null);
  sortedForBest.sort((a, b) => {
    const sa = config.scoringExtract(a.metrics)!;
    const sb = config.scoringExtract(b.metrics)!;
    return config.scoringDirection === "asc" ? sa - sb : sb - sa;
  });
  const bestAd = sortedForBest[0] ?? null;
  const bestScore = bestAd ? config.scoringExtract(bestAd.metrics) : null;

  const topCount = tiers.get("top")?.length ?? 0;
  const midCount = tiers.get("mid")?.length ?? 0;
  const lowCount = tiers.get("low")?.length ?? 0;
  const total = ads.length;

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[var(--color-bg-surface)] p-3">
        <div className="text-[12px] text-[var(--color-text-secondary)]">
          <span className="font-medium">{total} créatifs</span>
          {avgScore != null && <span className="text-[var(--color-text-tertiary)]"> · {config.primaryKpiLabel} moy. {formatKpi(avgScore, primaryFormat)}</span>}
          {bestAd && bestScore != null && (
            <span className="text-[var(--color-text-tertiary)]"> · Meilleur : <span className="text-emerald-400">{bestAd.name.slice(0, 30)}{bestAd.name.length > 30 ? "…" : ""}</span> ({config.primaryKpiLabel} {formatKpi(bestScore, primaryFormat)})</span>
          )}
        </div>
        {total > 0 && (
          <>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full">
              {topCount > 0 && <div className="bg-emerald-500" style={{ width: `${(topCount / total) * 100}%` }} />}
              {midCount > 0 && <div className="bg-blue-500" style={{ width: `${(midCount / total) * 100}%` }} />}
              {lowCount > 0 && <div className="bg-amber-500" style={{ width: `${(lowCount / total) * 100}%` }} />}
            </div>
            <div className="mt-1.5 flex gap-4 text-[10px] text-[var(--color-text-tertiary)]">
              <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Top {topCount}</span>
              <span><span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Perf. {midCount}</span>
              <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> À opt. {lowCount}</span>
            </div>
          </>
        )}
        {usingFallback && (
          <p className="mt-2 text-[10px] italic text-[var(--color-text-tertiary)]">Classement par CTR (conversions non disponibles)</p>
        )}
      </div>

      {TIERS.map((tier) => (
        <TierSection key={tier.key} tier={tier} ads={tiers.get(tier.key) ?? []} config={config} defaultOpen={tier.key !== "low"} onAdClick={onAdClick} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function CampaignDrilldown({ workspaceId, campaignId, categoryKey, categoryBorder, startDate, endDate, onClose }: CampaignDrilldownProps) {
  const [tab, setTab] = useState<Tab>("audiences");
  const [adsets, setAdsets] = useState<AdSetWithMetrics[] | null>(null);
  const [ads, setAds] = useState<AdWithMetrics[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewAdId, setPreviewAdId] = useState<string | null>(null);

  // Resolve config after data loads — pass sample metrics for fallback detection
  const config = useMemo(() => {
    const sample = ads?.[0]?.metrics ?? adsets?.[0]?.metrics;
    return getObjectiveConfig(categoryKey, sample);
  }, [categoryKey, ads, adsets]);

  const usingFallback = useMemo(() => {
    const baseConfig = getObjectiveConfig(categoryKey);
    return baseConfig.needsConversions && config.primaryKpi !== baseConfig.primaryKpi;
  }, [categoryKey, config]);

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

  const previewAd = previewAdId && ads ? ads.find((a) => a.id === previewAdId) : null;
  const tiers = useMemo(() => ads ? classifyAds(ads, config) : new Map<TierKey, AdWithMetrics[]>(), [ads, config]);
  const maxCtr = useMemo(() => ads ? Math.max(...ads.map((a) => a.metrics.ctr ?? 0), 0.01) : 1, [ads]);
  const maxSpend = useMemo(() => ads ? Math.max(...ads.map((a) => a.metrics.spend ?? 0), 1) : 1, [ads]);

  return (
    <>
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className={cn("overflow-hidden border-l-[3px] bg-[var(--color-bg-subtle)]", categoryBorder)}>
        <div className="px-6 py-4 pl-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {([{ key: "audiences" as const, label: `Audiences${adsets ? ` (${adsets.length})` : ""}` }, { key: "creatives" as const, label: `Créatifs${ads ? ` (${ads.length})` : ""}` }]).map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setTab(key)} className={cn("rounded-md px-3 py-1 text-[12px] font-medium transition-colors", tab === key ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]")}>{label}</button>
              ))}
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]" aria-label="Fermer"><X size={14} /></button>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : tab === "audiences" ? (
              adsets && adsets.length > 0 ? <AudiencesTab adsets={adsets} config={config} /> : <p className="py-6 text-center text-[12px] text-[var(--color-text-tertiary)]">Aucune audience trouvée</p>
            ) : (
              ads && ads.length > 0 ? <CreativesTab ads={ads} config={config} usingFallback={usingFallback} onAdClick={setPreviewAdId} /> : <p className="py-6 text-center text-[12px] text-[var(--color-text-tertiary)]">Aucun créatif trouvé</p>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {previewAd && ads && (
          <CreativePreviewModal ad={previewAd} ads={ads} tier={getAdTier(previewAd, tiers)} rank={ads.findIndex((a) => a.id === previewAd.id) + 1} maxCtr={maxCtr} maxSpend={maxSpend} config={config} onClose={() => setPreviewAdId(null)} onNavigate={setPreviewAdId} />
        )}
      </AnimatePresence>
    </>
  );
}
