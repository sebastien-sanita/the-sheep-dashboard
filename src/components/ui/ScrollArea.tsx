import { cn } from "@/lib/utils/cn";

type ScrollOrientation = "vertical" | "horizontal" | "both";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  orientation?: ScrollOrientation;
}

const OVERFLOW_CLASSES: Record<ScrollOrientation, string> = {
  vertical: "overflow-y-auto",
  horizontal: "overflow-x-auto",
  both: "overflow-auto",
};

export function ScrollArea({
  children,
  className,
  maxHeight,
  orientation = "vertical",
}: ScrollAreaProps) {
  return (
    <div
      className={cn(OVERFLOW_CLASSES[orientation], className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {children}
    </div>
  );
}
