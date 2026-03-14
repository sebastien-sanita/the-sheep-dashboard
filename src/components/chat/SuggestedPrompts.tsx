"use client";

import {
  Target,
  ClipboardCheck,
  ArrowLeftRight,
  Repeat,
  Image,
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface SuggestedPromptsProps {
  onSend: (content: string) => void;
  clientId?: string;
}

interface Suggestion {
  text: string;
  icon: LucideIcon;
}

const CLIENT_SUGGESTIONS: Suggestion[] = [
  { text: "Quel est le CPL ce mois-ci ?", icon: Target },
  { text: "Fais un audit des campagnes actives", icon: ClipboardCheck },
  { text: "Compare avec le mois dernier", icon: ArrowLeftRight },
  { text: "Quelles campagnes ont une frequence > 3 ?", icon: Repeat },
  { text: "Montre les creatifs les plus performants", icon: Image },
  { text: "Resume des depenses de la semaine", icon: Wallet },
];

const GLOBAL_SUGGESTIONS: Suggestion[] = [
  { text: "Donne-moi un apercu de tous les clients", icon: Users },
  { text: "Quels clients ont le plus depense cette semaine ?", icon: TrendingUp },
  { text: "Y a-t-il des alertes de frequence ?", icon: AlertTriangle },
  { text: "Compare les performances Meta vs Google", icon: BarChart3 },
  { text: "Quel client a le meilleur ROAS ?", icon: Trophy },
  { text: "Resume global des campagnes actives", icon: Zap },
];

export function SuggestedPrompts({ onSend, clientId }: SuggestedPromptsProps) {
  const suggestions = clientId ? CLIENT_SUGGESTIONS : GLOBAL_SUGGESTIONS;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="mb-1 text-xl font-semibold text-slate-300">
        🐑 The Sheep
      </div>
      <div className="mb-8 text-[13px] text-slate-500">
        Assistant Ads Intelligence
      </div>

      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        {suggestions.map(({ text, icon: Icon }) => (
          <button
            key={text}
            type="button"
            onClick={() => onSend(text)}
            className="group rounded-xl border border-slate-700 bg-slate-800 p-3 text-left transition-colors hover:border-primary-500 hover:bg-slate-800/80"
          >
            <Icon
              size={16}
              className="mb-2 text-slate-400 transition-colors group-hover:text-primary-400"
            />
            <span className="text-[13px] leading-snug text-slate-300">
              {text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
