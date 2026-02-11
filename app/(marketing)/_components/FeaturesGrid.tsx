import {
  RocketIcon,
  LockClosedIcon,
  PersonIcon,
  LightningBoltIcon,
  BarChartIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Phase 2 mock data — will be replaced with static config in Phase 4
const MOCK_FEATURES = [
  {
    icon: RocketIcon,
    title: "Ready to Ship",
    description:
      "Production-ready with CI/CD, error tracking, and analytics built in. Deploy to Vercel in minutes.",
  },
  {
    icon: LockClosedIcon,
    title: "Auth & Teams",
    description:
      "Email/password and magic link auth with multi-tenant teams, roles, and permissions.",
  },
  {
    icon: LightningBoltIcon,
    title: "AI Integration",
    description:
      "Vercel AI SDK with dual streaming, credit-based billing, and support for OpenAI + Anthropic models.",
  },
  {
    icon: PersonIcon,
    title: "Billing & Credits",
    description:
      "Team-level billing via Polar with configurable plan tiers, usage limits, and AI credit tracking.",
  },
  {
    icon: BarChartIcon,
    title: "Analytics & Flags",
    description:
      "PostHog product analytics and feature flags, fully integrated with env-var gated graceful degradation.",
  },
  {
    icon: GlobeIcon,
    title: "Real-time Backend",
    description:
      "Convex provides real-time database, serverless functions, and file storage — no API layer to build.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to launch
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop reinventing the wheel. Focus on what makes your product unique.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_FEATURES.map((feature) => (
            <Card key={feature.title} className="border-border">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
