import { cn } from "@/lib/utils/cn";

type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: CardPadding;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-700/50 bg-slate-800",
        PADDING_CLASSES[padding],
        hover && "cursor-pointer transition-colors hover:border-primary-500/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-b border-slate-700/30 px-5 py-4", className)}>
      {children}
    </div>
  );
}

function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-5 py-4", className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
