"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { ReaderIcon } from "@radix-ui/react-icons";

interface AuditEntry {
  _id: Id<"auditLog">;
  action: string;
  actorName: string;
  actorEmail: string;
  targetName: string | null;
  targetEmail: string | null;
  metadata: unknown;
  timestamp: number;
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    impersonation_start: "Started Impersonation",
    impersonation_stop: "Stopped Impersonation",
    impersonation_expired: "Impersonation Expired",
  };
  return labels[action] ?? action;
}

function actionVariant(action: string): "default" | "secondary" | "outline" {
  if (action.includes("start")) return "default";
  if (action.includes("expired")) return "outline";
  return "secondary";
}

export default function AdminAuditPage() {
  const entries = useQuery(api.admin.listAuditLog);

  const columns: ColumnDef<AuditEntry>[] = [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }) =>
        new Date(row.original.timestamp).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge variant={actionVariant(row.original.action)}>
          {actionLabel(row.original.action)}
        </Badge>
      ),
    },
    {
      accessorKey: "actorName",
      header: "Admin",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.actorName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.actorEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "targetName",
      header: "Target",
      cell: ({ row }) =>
        row.original.targetName ? (
          <div>
            <p className="text-sm">{row.original.targetName}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.targetEmail}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "metadata",
      header: "Details",
      cell: ({ row }) => {
        const meta = row.original.metadata as Record<string, string> | null;
        const detail = meta?.reason ?? meta?.targetEmail ?? null;
        return detail ? (
          <span className="text-sm text-muted-foreground">{detail}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
  ];

  if (!entries) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Audit Log"
          description="Track all admin actions and impersonation events"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Audit Log" },
          ]}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading audit log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all admin actions and impersonation events"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Audit Log" },
        ]}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<ReaderIcon className="h-12 w-12" />}
          title="No audit events"
          description="Admin actions will appear here once logged."
        />
      ) : (
        <DataTable
          columns={columns}
          data={entries}
          searchKey="action"
          searchPlaceholder="Search audit events..."
          pagination
        />
      )}
    </div>
  );
}
