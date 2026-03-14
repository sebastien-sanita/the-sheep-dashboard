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
          <label className="mb-1.5 block text-[12px] font-medium text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "h-9 w-full rounded-lg border bg-slate-800 px-3 text-[13px] text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50",
              icon ? "pl-9" : "",
              error ? "border-rose-500" : "border-slate-700",
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
