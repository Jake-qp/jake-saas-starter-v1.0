"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Component1Icon } from "@radix-ui/react-icons";

interface AdminTeam {
  _id: Id<"teams">;
  name: string;
  slug: string;
  isPersonal: boolean;
  memberCount: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  ownerName: string;
  ownerEmail: string;
  _creationTime: number;
}

export default function AdminTeamsPage() {
  const teams = useQuery(api.admin.listTeams);

  const columns: ColumnDef<AdminTeam>[] = [
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
      accessorKey: "_creationTime",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original._creationTime).toLocaleDateString(),
    },
  ];

  if (!teams) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Teams"
          description="View and manage all platform teams"
          breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Teams" }]}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="View and manage all platform teams"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Teams" }]}
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={<Component1Icon className="h-12 w-12" />}
          title="No teams"
          description="No teams have been created yet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={teams}
          searchKey="name"
          searchPlaceholder="Search teams by name..."
          pagination
        />
      )}
    </div>
  );
}
