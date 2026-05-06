import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

// Variant tokens aligned with Calm Precision DS (parts/primitives.jsx, VARIANT_BUTTON):
// primary uses the accent token directly (not Tailwind palette) so it follows
// data-accent variants (Moss / Amber / Teal). Text on filled variants uses
// --color-accent-contrast which flips with theme.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-hover)] border border-transparent",
  secondary: "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)]",
  outline:   "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-emphasis)]",
  ghost:     "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] border border-transparent",
  danger:    "bg-[var(--color-danger)] text-[#08080c] hover:opacity-90 border border-transparent",
};

// DS sizes : sm 28h/10px/12fs · md 32h/14px/13fs · lg 36h/18px/13fs.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-[12px]",
  md: "h-8 px-3.5 text-[13px]",
  lg: "h-9 px-4.5 text-[13px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        // DS uses var(--radius-sm) = 6px; "rounded-md" in Tailwind v4 = 6px = matches.
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isDisabled && "pointer-events-none opacity-45",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
