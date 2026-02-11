"use client";

import { useCurrentTeam, useViewerPermissions } from "@/app/t/[teamSlug]/hooks";
import { SettingsMenuButton } from "@/app/t/[teamSlug]/settings/SettingsMenuButton";
import { StatusBadge } from "@/components";
import { UsageMeter } from "@/components";
import { PricingCard } from "@/components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// MOCK DATA — Phase 2 visual validation only. Will be replaced in Phase 4.
const MOCK_CURRENT_PLAN = {
  tier: "free" as const,
  displayName: "Free",
  status: "active" as const,
};

const MOCK_USAGE = {
  members: { current: 2, limit: 3 },
  aiCredits: { current: 47, limit: 100 },
};

const MOCK_PLANS = [
  {
    name: "Free",
    price: "$0/mo",
    description: "For individuals and small teams",
    features: [
      "Up to 3 team members",
      "100 AI credits/month",
      "50 notes",
      "100 MB storage",
    ],
    isCurrent: true,
  },
  {
    name: "Pro",
    price: "$29/mo",
    description: "For growing teams",
    features: [
      "Up to 20 team members",
      "5,000 AI credits/month",
      "Unlimited notes",
      "1 GB storage",
      "API access",
      "Analytics",
    ],
    highlighted: true,
    isCurrent: false,
  },
  {
    name: "Enterprise",
    price: "$99/mo",
    description: "For large organizations",
    features: [
      "Unlimited team members",
      "Unlimited AI credits",
      "Unlimited notes",
      "Unlimited storage",
      "Custom roles & SSO",
      "Priority support",
    ],
    isCurrent: false,
  },
];
// END MOCK DATA

export default function BillingSettingsPage() {
  const team = useCurrentTeam();
  const permissions = useViewerPermissions();

  if (team == null || permissions == null) {
    return null;
  }

  if (team.isPersonal) {
    return (
      <>
        <div className="flex items-center mt-8">
          <SettingsMenuButton />
          <h1 className="text-4xl font-extrabold">Billing</h1>
        </div>
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

  return (
    <>
      <div className="flex items-center mt-8">
        <SettingsMenuButton />
        <h1 className="text-4xl font-extrabold">Billing</h1>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="mt-1">
                Your team is on the{" "}
                <span className="font-semibold text-foreground">
                  {MOCK_CURRENT_PLAN.displayName}
                </span>{" "}
                plan
              </CardDescription>
            </div>
            <StatusBadge status={MOCK_CURRENT_PLAN.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageMeter
            current={MOCK_USAGE.members.current}
            limit={MOCK_USAGE.members.limit}
            label="Team Members"
          />
          <UsageMeter
            current={MOCK_USAGE.aiCredits.current}
            limit={MOCK_USAGE.aiCredits.limit}
            label="AI Credits"
            unit="credits"
          />
        </CardContent>
      </Card>

      {/* Manage Subscription */}
      {canManageBilling && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Update your payment method, view invoices, or cancel your
              subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Manage Subscription</Button>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {canManageBilling && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {MOCK_PLANS.map((plan) => (
              <PricingCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                highlighted={plan.highlighted}
                cta={
                  plan.isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
