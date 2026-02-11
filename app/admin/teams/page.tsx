"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, DataTable, EmptyState } from "@/components";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Component1Icon } from "@radix-ui/react-icons";

// MOCK DATA — Phase 2 only, will be replaced with real Convex queries in Phase 4
interface MockTeam {
  _id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  memberCount: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: string;
  isPersonal: boolean;
}

const MOCK_TEAMS: MockTeam[] = [
  {
    _id: "t1",
    name: "Acme Corp",
    slug: "acme-corp",
    ownerName: "Sarah Chen",
    ownerEmail: "sarah@acme.com",
    memberCount: 12,
    subscriptionTier: "enterprise",
    subscriptionStatus: "active",
    createdAt: "2025-08-14T10:00:00Z",
    isPersonal: false,
  },
  {
    _id: "t2",
    name: "Startup Labs",
    slug: "startup-labs",
    ownerName: "James Wilson",
    ownerEmail: "james@startup.io",
    memberCount: 3,
    subscriptionTier: "pro",
    subscriptionStatus: "active",
    createdAt: "2026-01-05T14:20:00Z",
    isPersonal: false,
  },
  {
    _id: "t3",
    name: "Maria's Personal",
    slug: "maria-personal",
    ownerName: "Maria Garcia",
    ownerEmail: "maria@enterprise.co",
    memberCount: 1,
    subscriptionTier: "free",
    subscriptionStatus: "active",
    createdAt: "2025-11-22T08:15:00Z",
    isPersonal: true,
  },
  {
    _id: "t4",
    name: "DevShop Inc",
    slug: "devshop",
    ownerName: "Alex Kim",
    ownerEmail: "alex@devshop.dev",
    memberCount: 5,
    subscriptionTier: "pro",
    subscriptionStatus: "past_due",
    createdAt: "2026-02-01T12:00:00Z",
    isPersonal: false,
  },
];

export default function AdminTeamsPage() {
  const columns: ColumnDef<MockTeam>[] = [
    {
      accessorKey: "name",
      header: "Team",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "ownerName",
      header: "Owner",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.ownerName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.ownerEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "memberCount",
      header: "Members",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.memberCount}</Badge>
      ),
    },
    {
      accessorKey: "subscriptionTier",
      header: "Plan",
      cell: ({ row }) => {
        const tier = row.original.subscriptionTier;
        const statusMap: Record<
          string,
          "active" | "trialing" | "inactive" | "past_due"
        > = {
          enterprise: "active",
          pro: "trialing",
          free: "inactive",
        };
        return (
          <StatusBadge status={statusMap[tier] ?? "inactive"} label={tier} />
        );
      },
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.subscriptionStatus as
          | "active"
          | "past_due"
          | "canceled"
          | "inactive";
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "isPersonal",
      header: "Type",
      cell: ({ row }) =>
        row.original.isPersonal ? (
          <Badge variant="outline">Personal</Badge>
        ) : (
          <Badge variant="secondary">Organization</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="View and manage all platform teams"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Teams" }]}
      />

      {MOCK_TEAMS.length === 0 ? (
        <EmptyState
          icon={<Component1Icon className="h-12 w-12" />}
          title="No teams"
          description="No teams have been created yet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={MOCK_TEAMS}
          searchKey="name"
          searchPlaceholder="Search teams by name..."
          pagination
        />
      )}
    </div>
  );
}
