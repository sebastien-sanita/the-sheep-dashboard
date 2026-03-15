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
    <div className="grid w-full grid-cols-2 gap-2 px-4">
      {suggestions.map(({ text, icon: Icon }, i) => (
        <button
          key={text}
          type="button"
          onClick={() => onSend(text)}
          className="group flex items-start gap-2.5 rounded-lg p-3 text-left animate-fade-in"
          style={{
            background: "transparent",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            transition: "all var(--transition-fast)",
            animationDelay: `${i * 0.04}s`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-border-emphasis)"; e.currentTarget.style.background = "var(--color-bg-surface)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-default)"; e.currentTarget.style.background = "transparent"; }}
        >
          <Icon size={14} style={{ color: "var(--color-text-muted)", marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{text}</span>
        </button>
      ))}
    </div>
  );
}
