import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

// Variant tokens aligned with Calm Precision DS (parts/primitives.jsx, BadgeRow):
// each pair uses the semantic token + its -muted background, not the Tailwind
// rgba palette ; this also keeps the badge consistent when --color-success
// is retoned in tokens.css.
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
  success: "bg-[var(--color-success-muted)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-muted)] text-[var(--color-warning)]",
  danger:  "bg-[var(--color-danger-muted)] text-[var(--color-danger)]",
  info:    "bg-[var(--color-info-muted)] text-[var(--color-info)]",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-[11px]",
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
