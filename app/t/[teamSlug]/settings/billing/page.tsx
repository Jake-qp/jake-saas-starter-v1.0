"use client";

import { useCurrentTeam, useViewerPermissions } from "@/app/t/[teamSlug]/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { UsageMeter } from "@/components/UsageMeter";
import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import {
  PLAN_CONFIG,
  PLAN_FEATURES_DISPLAY,
  type PlanTier,
} from "@/lib/planConfig";
import { useQuery } from "convex/react";
import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "inactive";

export default function BillingSettingsPage() {
  const team = useCurrentTeam();
  const permissions = useViewerPermissions();
  const billing = useQuery(
    api.billing.getTeamBilling,
    team?._id ? { teamId: team._id } : "skip",
  );

  if (team == null || permissions == null) {
    return null;
  }

  if (team.isPersonal) {
    return (
      <>
        <h1 className="text-4xl font-extrabold mt-8">Billing</h1>
        <Card>
          <CardHeader>
            <CardTitle>Personal Account</CardTitle>
            <CardDescription>
              Billing is managed at the team level. Create or join a team to
              manage subscriptions.
            </CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  const canManageBilling = permissions.has("Manage Team");
  const currentTier = billing?.tier ?? "free";
  const displayName = billing?.displayName ?? "Free";
  const status = (billing?.status ?? "active") as SubscriptionStatus;
  const membersUsage = billing?.usage.members ?? { current: 0, limit: 3 };
  const creditsUsage = billing?.usage.aiCredits ?? { current: 0, limit: 100 };

  const tiers: PlanTier[] = ["free", "pro", "enterprise"];

  return (
    <>
      <h1 className="text-4xl font-extrabold mt-8">Billing</h1>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="mt-1">
                Your team is on the{" "}
                <span className="font-semibold text-foreground">
                  {displayName}
                </span>{" "}
                plan
              </CardDescription>
            </div>
            <StatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {membersUsage.limit !== -1 && (
            <UsageMeter
              current={membersUsage.current}
              limit={membersUsage.limit}
              label="Team Members"
            />
          )}
          {creditsUsage.limit !== -1 && (
            <UsageMeter
              current={creditsUsage.current}
              limit={creditsUsage.limit}
              label="AI Credits"
              unit="credits"
            />
          )}
          {membersUsage.limit === -1 && creditsUsage.limit === -1 && (
            <p className="text-sm text-muted-foreground">
              Unlimited usage on the Enterprise plan.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Manage Subscription */}
      {canManageBilling && currentTier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Update your payment method, view invoices, or cancel your
              subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <CustomerPortalLink polarApi={api.billing as any}>
              <Button variant="outline">Manage Subscription</Button>
            </CustomerPortalLink>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {canManageBilling && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => {
              const config = PLAN_CONFIG[tier];
              const display = PLAN_FEATURES_DISPLAY[tier];
              const isCurrent = tier === currentTier;
              const isHighlighted = tier === "pro";

              return (
                <PricingCard
                  key={tier}
                  name={config.displayName}
                  price={display.label}
                  description={config.description}
                  features={display.features}
                  highlighted={isHighlighted}
                  cta={
                    isCurrent ? (
                      <Button variant="outline" disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : tier === "free" ? (
                      <Button variant="outline" disabled className="w-full">
                        Free
                      </Button>
                    ) : (
                      <CheckoutLink
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        polarApi={api.billing as any}
                        productIds={[]}
                        embed={false}
                      >
                        <Button
                          variant={isHighlighted ? "default" : "outline"}
                          className="w-full"
                        >
                          Upgrade to {config.displayName}
                        </Button>
                      </CheckoutLink>
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
