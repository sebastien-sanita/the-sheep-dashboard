"use client";

import type { KPIGridBlock } from "@/lib/types";
import { KPICard } from "./KPICard";

interface KPIGridProps {
  block: KPIGridBlock;
}

export function KPIGrid({ block }: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {block.items.map((item, i) => (
        <KPICard key={`${item.label}-${i}`} item={item} />
      ))}
    </div>
  );
}
