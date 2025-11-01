"use client";

import { Crown } from "lucide-react";
import { cn } from "@kyosan-map/ui/lib/utils";

export function ProgressBadge({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const isComplete = current >= total;

  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
      <Crown
        className={cn(
          "w-4 h-4 transition-colors",
          isComplete ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
        )}
      />
      <div className="text-center">
        <div className="text-[10px] font-medium text-muted-foreground mb-0.5">
          {label}
        </div>
        <div className="text-xs font-semibold">
          {current}/{total}
        </div>
      </div>
    </div>
  );
}
