import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)]0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "h-9 w-full rounded-lg border bg-[var(--color-bg-surface)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-primary)]0 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-primary-500/50",
              icon ? "pl-9" : "",
              error ? "border-rose-500" : "border-[var(--color-border-default)]",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-[11px] text-rose-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
