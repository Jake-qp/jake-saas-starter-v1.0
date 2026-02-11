"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface UsageMeterProps {
  current: number;
  limit: number;
  label?: string;
  unit?: string;
  className?: string;
}

/**
 * Usage/quota meter with color thresholds: green (<70%), yellow (70-90%), red (>90%).
 * REQUIRED for all usage/quota displays.
 *
 * @example
 * <UsageMeter current={7500} limit={10000} label="API Calls" unit="calls" />
 *
 * @example
 * <UsageMeter current={45} limit={50} label="Team Members" />
 */
export function UsageMeter({
  current,
  limit,
  label,
  unit,
  className,
}: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;

  const colorClass =
    percentage > 90
      ? "[&>div]:bg-destructive"
      : percentage > 70
        ? "[&>div]:bg-warning"
        : "[&>div]:bg-success";

  return (
    <div className={cn("space-y-2", className)}>
      {(label || unit) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          <span className="text-muted-foreground">
            {current.toLocaleString()} / {limit.toLocaleString()}
            {unit && ` ${unit}`}
          </span>
        </div>
      )}
      <Progress value={percentage} className={cn("h-2", colorClass)} />
    </div>
  );
}
