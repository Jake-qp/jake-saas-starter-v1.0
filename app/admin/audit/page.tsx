"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, DataTable, EmptyState } from "@/components";
import { Badge } from "@/components/ui/badge";
import { ReaderIcon } from "@radix-ui/react-icons";

// MOCK DATA — Phase 2 only, will be replaced with real Convex queries in Phase 4
interface MockAuditEntry {
  _id: string;
  action: string;
  actorName: string;
  actorEmail: string;
  targetName: string | null;
  targetEmail: string | null;
  metadata: string | null;
  timestamp: string;
}

const MOCK_AUDIT_LOG: MockAuditEntry[] = [
  {
    _id: "a1",
    action: "impersonation_start",
    actorName: "Sarah Chen",
    actorEmail: "sarah@acme.com",
    targetName: "James Wilson",
    targetEmail: "james@startup.io",
    metadata: null,
    timestamp: "2026-02-11T09:30:00Z",
  },
  {
    _id: "a2",
    action: "impersonation_stop",
    actorName: "Sarah Chen",
    actorEmail: "sarah@acme.com",
    targetName: "James Wilson",
    targetEmail: "james@startup.io",
    metadata: "Manual exit",
    timestamp: "2026-02-11T09:35:00Z",
  },
  {
    _id: "a3",
    action: "impersonation_start",
    actorName: "Sarah Chen",
    actorEmail: "sarah@acme.com",
    targetName: "Maria Garcia",
    targetEmail: "maria@enterprise.co",
    metadata: null,
    timestamp: "2026-02-11T10:15:00Z",
  },
  {
    _id: "a4",
    action: "impersonation_expired",
    actorName: "Sarah Chen",
    actorEmail: "sarah@acme.com",
    targetName: "Maria Garcia",
    targetEmail: "maria@enterprise.co",
    metadata: "Auto-expired after 30 minutes",
    timestamp: "2026-02-11T10:45:00Z",
  },
];

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
  const columns: ColumnDef<MockAuditEntry>[] = [
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
      cell: ({ row }) =>
        row.original.metadata ? (
          <span className="text-sm text-muted-foreground">
            {row.original.metadata}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

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

      {MOCK_AUDIT_LOG.length === 0 ? (
        <EmptyState
          icon={<ReaderIcon className="h-12 w-12" />}
          title="No audit events"
          description="Admin actions will appear here once logged."
        />
      ) : (
        <DataTable
          columns={columns}
          data={MOCK_AUDIT_LOG}
          searchKey="action"
          searchPlaceholder="Search audit events..."
          pagination
        />
      )}
    </div>
  );
}
