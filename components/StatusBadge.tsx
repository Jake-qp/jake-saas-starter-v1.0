import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusVariants = cva("", {
  variants: {
    status: {
      active: "bg-success text-success-foreground hover:bg-success/80",
      trialing: "bg-info text-info-foreground hover:bg-info/80",
      past_due: "bg-warning text-warning-foreground hover:bg-warning/80",
      canceled:
        "bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inactive: "bg-muted text-muted-foreground hover:bg-muted/80",
      pending: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    },
  },
  defaultVariants: {
    status: "inactive",
  },
});

const defaultLabels: Record<StatusValue, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past Due",
  canceled: "Canceled",
  inactive: "Inactive",
  pending: "Pending",
};

type StatusValue = NonNullable<VariantProps<typeof statusVariants>["status"]>;

export interface StatusBadgeProps {
  status: StatusValue;
  label?: string;
  className?: string;
}

/**
 * Semantic status badge for subscription states and general status indicators.
 * Maps statuses to the design system's semantic color tokens.
 *
 * @example
 * <StatusBadge status="active" />
 *
 * @example
 * <StatusBadge status="past_due" label="Payment Required" />
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "border-transparent",
        statusVariants({ status }),
        className,
      )}
    >
      {label ?? defaultLabels[status]}
    </Badge>
  );
}
