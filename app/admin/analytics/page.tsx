"use client";

import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export default function AdminAnalyticsPage() {
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Product analytics via PostHog"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Analytics" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>PostHog Dashboard</CardTitle>
          <CardDescription>
            Product analytics, user behavior, and conversion funnels are managed
            in PostHog. Click below to open the PostHog dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            PostHog provides real-time analytics including page views, custom
            events, feature flag usage, session recordings, and cohort analysis.
            No custom charts are built here — PostHog handles all analytics UI.
          </p>
          <Button asChild>
            <a href={posthogHost} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Open PostHog Dashboard
            </a>
          </Button>
          {!process.env.NEXT_PUBLIC_POSTHOG_KEY && (
            <p className="text-sm text-muted-foreground">
              PostHog is not configured. Set{" "}
              <code className="rounded bg-muted px-1 text-xs">
                NEXT_PUBLIC_POSTHOG_KEY
              </code>{" "}
              to enable analytics.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
