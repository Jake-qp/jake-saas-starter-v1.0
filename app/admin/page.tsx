"use client";

import { PageHeader } from "@/components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// MOCK DATA — Phase 2 only, will be replaced with real Convex queries in Phase 4
const MOCK_METRICS = {
  totalUsers: 1_247,
  activeUsers: 892,
  signupsToday: 14,
  totalTeams: 438,
  activeTeams: 312,
  paidTeams: 87,
  mrr: 4_350,
  totalAuditEvents: 2_391,
};

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
            value={MOCK_METRICS.totalUsers.toLocaleString()}
            description="All registered accounts"
          />
          <MetricCard
            title="Active Users"
            value={MOCK_METRICS.activeUsers.toLocaleString()}
            description="Active in last 30 days"
          />
          <MetricCard
            title="Signups Today"
            value={MOCK_METRICS.signupsToday}
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
            value={MOCK_METRICS.totalTeams.toLocaleString()}
            description="All created teams"
          />
          <MetricCard
            title="Active Teams"
            value={MOCK_METRICS.activeTeams.toLocaleString()}
            description="Teams with recent activity"
          />
          <MetricCard
            title="Paid Teams"
            value={MOCK_METRICS.paidTeams}
            description="Teams on paid plans"
          />
        </div>
      </div>

      {/* Revenue Metrics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Revenue</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={`$${MOCK_METRICS.mrr.toLocaleString()}`}
            description="Active subscriptions MRR"
          />
          <MetricCard
            title="Audit Events"
            value={MOCK_METRICS.totalAuditEvents.toLocaleString()}
            description="Total admin actions logged"
          />
        </div>
      </div>
    </div>
  );
}
