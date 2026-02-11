import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/PricingCard";
import {
  PLAN_CONFIG,
  PLAN_FEATURES_DISPLAY,
  type PlanTier,
} from "@/lib/planConfig";

const RECOMMENDED_PLAN: PlanTier = "pro";

export function PricingTable() {
  const tiers = Object.keys(PLAN_CONFIG) as PlanTier[];

  return (
    <section className="py-20" id="pricing">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => {
            const config = PLAN_CONFIG[tier];
            const display = PLAN_FEATURES_DISPLAY[tier];
            const isRecommended = tier === RECOMMENDED_PLAN;

            return (
              <PricingCard
                key={tier}
                name={config.displayName}
                price={config.price === 0 ? "$0/mo" : `$${config.price}/mo`}
                description={config.description}
                features={display.features}
                highlighted={isRecommended}
                cta={
                  <Button
                    className="w-full"
                    variant={isRecommended ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/auth/sign-up">
                      {config.price === 0 ? "Start Free" : "Get Started"}
                    </Link>
                  </Button>
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
