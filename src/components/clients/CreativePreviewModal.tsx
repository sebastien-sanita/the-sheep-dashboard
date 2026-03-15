"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink, Play, Image as ImageIcon, Film, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import type { AdWithMetrics, CreativeData } from "@/lib/types";
import { formatCurrency, formatCompact, formatPercent } from "@/lib/utils/format";
import { type ObjectiveMetricsConfig, formatKpi } from "@/lib/utils/objective-metrics";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TierKey = "top" | "mid" | "low";

const TIER_BADGES: Record<TierKey, { label: string; cls: string }> = {
  top: { label: "Top performer", cls: "bg-emerald-500/10 text-emerald-400" },
  mid: { label: "Performer", cls: "bg-blue-500/10 text-blue-400" },
  low: { label: "À optimiser", cls: "bg-amber-500/10 text-amber-400" },
};

const CTA_LABELS: Record<string, string> = {
  LEARN_MORE: "En savoir plus",
  SHOP_NOW: "Acheter",
  SIGN_UP: "S'inscrire",
  CONTACT_US: "Nous contacter",
  BOOK_NOW: "Réserver",
  GET_QUOTE: "Obtenir un devis",
  DOWNLOAD: "Télécharger",
  APPLY_NOW: "Postuler",
  SUBSCRIBE: "S'abonner",
  GET_OFFER: "Obtenir l'offre",
  SEND_MESSAGE: "Envoyer un message",
};

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

function getImageUrl(ad: AdWithMetrics): string | null {
  const creative = getCreative(ad);
  if (!creative) return null;
  return creative.thumbnailUrl ?? creative.imageUrl ?? null;
}

function getAdFormatLabel(ad: AdWithMetrics): { label: string; icon: typeof ImageIcon } {
  const name = ad.name.toLowerCase();
  const creative = getCreative(ad);
  if (name.includes("carrousel") || name.includes("carousel")) return { label: "Carrousel", icon: LayoutGrid };
  if (creative?.videoUrl || creative?.videoId || name.includes("vidéo") || name.includes("video")) return { label: "Vidéo", icon: Film };
  return { label: "Image", icon: ImageIcon };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreativePreviewModalProps {
  ad: AdWithMetrics;
  ads: AdWithMetrics[];
  tier: TierKey;
  rank: number;
  maxCtr: number;
  maxSpend: number;
  config: ObjectiveMetricsConfig;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreativePreviewModal({
  ad,
  ads,
  tier,
  rank,
  maxCtr,
  maxSpend,
  config,
  onClose,
  onNavigate,
}: CreativePreviewModalProps) {
  const currentIndex = ads.findIndex((a) => a.id === ad.id);
  const prevAd = currentIndex > 0 ? ads[currentIndex - 1] : null;
  const nextAd = currentIndex < ads.length - 1 ? ads[currentIndex + 1] : null;

  const creative = getCreative(ad);
  const imgUrl = getImageUrl(ad);
  const format = getAdFormatLabel(ad);
  const FormatIcon = format.icon;
  const isVideo = !!(creative?.videoUrl || creative?.videoId);
  const tierBadge = TIER_BADGES[tier];
  const percentile = ads.length > 0 ? Math.round(((rank) / ads.length) * 100) : 0;

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && prevAd) onNavigate(prevAd.id);
    if (e.key === "ArrowRight" && nextAd) onNavigate(nextAd.id);
  }, [onClose, onNavigate, prevAd, nextAd]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  // KPI bar helper
  function KpiBar({ label, value, formatted, max }: { label: string; value: number; formatted: string; max: number }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">{label}</span>
          <span className="font-medium text-slate-200">{formatted}</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700/50">
          <div className="h-1.5 rounded-full bg-primary-500/60 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl md:flex-row"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-lg bg-slate-800/80 p-1.5 text-slate-400 transition-colors hover:text-slate-200"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        {/* Left: Image preview */}
        <div className="relative flex min-h-[200px] flex-1 items-center justify-center bg-slate-950 md:min-h-0 md:w-[60%]">
          {imgUrl ? (
            <>
              <img
                src={imgUrl}
                alt={ad.name}
                className="max-h-[70vh] w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/50 p-4">
                    <Play size={32} className="text-white" fill="white" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <FormatIcon size={48} />
              <span className="text-[12px]">{format.label}</span>
            </div>
          )}

          {/* Navigation arrows */}
          {prevAd && (
            <button
              type="button"
              onClick={() => onNavigate(prevAd.id)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/80 p-2 text-slate-400 transition-colors hover:text-slate-200"
              aria-label="Créatif précédent"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {nextAd && (
            <button
              type="button"
              onClick={() => onNavigate(nextAd.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/80 p-2 text-slate-400 transition-colors hover:text-slate-200"
              aria-label="Créatif suivant"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full overflow-y-auto border-t border-slate-700 p-5 md:w-[40%] md:border-l md:border-t-0">
          {/* Name + badges */}
          <h3 className="text-[15px] font-semibold text-slate-100">{ad.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              {format.label}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", tierBadge.cls)}>
              {tierBadge.label}
            </span>
          </div>

          {ad.adSetName && (
            <div className="mt-2 text-[11px] text-slate-500">{ad.adSetName}</div>
          )}

          {/* Rank */}
          <div className="mt-3 text-[12px] text-slate-400">
            #{rank} sur {ads.length} créatifs (Top {percentile}%)
          </div>

          {/* KPIs — objective-adaptive */}
          <div className="mt-4 space-y-3">
            {config.kpis.map((kpi) => {
              const val = kpi.extract(ad.metrics);
              const maxVal = Math.max(...ads.map((a) => kpi.extract(a.metrics) ?? 0), 0.01);
              return (
                <KpiBar
                  key={kpi.key}
                  label={kpi.label}
                  value={val ?? 0}
                  formatted={formatKpi(val, kpi.format)}
                  max={maxVal}
                />
              );
            })}
            {/* Always show spend + impressions if not in config */}
            {!config.kpis.some((k) => k.key === "impressions") && (
              <KpiBar label="Impressions" value={ad.metrics.impressions ?? 0} formatted={formatCompact(ad.metrics.impressions ?? 0)} max={Math.max(...ads.map((a) => a.metrics.impressions ?? 0), 1)} />
            )}
          </div>

          {/* Creative text */}
          {creative && (creative.title || creative.body) && (
            <div className="mt-5 border-t border-slate-700/50 pt-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Contenu</div>
              {creative.title && (
                <p className="mt-2 text-[13px] font-medium text-slate-200">{creative.title}</p>
              )}
              {creative.body && (
                <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{creative.body}</p>
              )}
              {creative.ctaType && (
                <div className="mt-2">
                  <span className="rounded bg-primary-500/10 px-2 py-0.5 text-[11px] font-medium text-primary-400">
                    {CTA_LABELS[creative.ctaType] ?? creative.ctaType}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Destination link */}
          {creative?.linkUrl && (
            <div className="mt-3">
              <a
                href={creative.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary-400 hover:underline"
              >
                <ExternalLink size={11} />
                <span className="max-w-[250px] truncate">{creative.linkUrl}</span>
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
