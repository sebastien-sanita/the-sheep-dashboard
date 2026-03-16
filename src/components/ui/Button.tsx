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

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-[var(--color-text-primary)] hover:bg-primary-700",
  secondary: "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-slate-600",
  outline: "border border-[var(--color-border-emphasis)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]",
  ghost: "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]",
  danger: "bg-danger-600 text-[var(--color-text-primary)] hover:bg-danger-700",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-9 px-4 text-[13px]",
  lg: "h-10 px-5 text-[14px]",
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
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
