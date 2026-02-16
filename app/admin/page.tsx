"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminDashboardPage() {
  const metrics = useQuery(api.admin.dashboardMetrics, {});

  if (!metrics) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          description="Platform overview and key metrics"
          breadcrumbs={[{ label: "Admin" }]}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and key metrics"
        breadcrumbs={[{ label: "Admin" }]}
      />

      {/* User Metrics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Users</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            description="All registered accounts"
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.toLocaleString()}
            description="Active in last 30 days"
          />
          <MetricCard
            title="Signups Today"
            value={metrics.signupsToday}
            description="New registrations today"
          />
        </div>
      </div>

      {/* Team Metrics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Teams</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Teams"
            value={metrics.totalTeams.toLocaleString()}
            description="All created teams"
          />
          <MetricCard
            title="Active Teams"
            value={metrics.activeTeams.toLocaleString()}
            description="Teams with recent activity"
          />
          <MetricCard
            title="Paid Teams"
            value={metrics.paidTeams}
            description="Teams on paid plans"
          />
        </div>
      </div>

      {/* Platform Metrics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Platform</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Audit Events"
            value={metrics.totalAuditEvents.toLocaleString()}
            description="Total admin actions logged"
          />
        </div>
      </div>
    </div>
  );
}
