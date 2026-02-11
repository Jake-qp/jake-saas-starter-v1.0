"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, DataTable, EmptyState, StatusBadge } from "@/components";
import { Button } from "@/components/ui/button";
import { EnvelopeClosedIcon } from "@radix-ui/react-icons";

// --- MOCK DATA (Phase 2 only — will be replaced in Phase 4) ---
interface WaitlistEntry {
  _id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  _creationTime: number;
}

const MOCK_ENTRIES: WaitlistEntry[] = [
  {
    _id: "mock-1",
    email: "alice@startup.io",
    status: "pending",
    _creationTime: Date.now() - 2 * 86400000,
  },
  {
    _id: "mock-2",
    email: "bob.smith@company.com",
    status: "pending",
    _creationTime: Date.now() - 1 * 86400000,
  },
  {
    _id: "mock-3",
    email: "carol.jones@enterprise.co",
    status: "approved",
    _creationTime: Date.now() - 5 * 86400000,
  },
  {
    _id: "mock-4",
    email: "dave@freelancer.me",
    status: "rejected",
    _creationTime: Date.now() - 3 * 86400000,
  },
  {
    _id: "mock-5",
    email:
      "extremely-long-email-address-that-tests-overflow@very-long-domain-name.example.com",
    status: "pending",
    _creationTime: Date.now() - 12 * 3600000,
  },
];
// --- END MOCK DATA ---

const statusMap: Record<string, "default" | "success" | "error"> = {
  pending: "default",
  approved: "success",
  rejected: "error",
};

export default function AdminWaitlistPage() {
  const entries = MOCK_ENTRIES;

  const pendingCount = entries.filter((e) => e.status === "pending").length;

  const columns: ColumnDef<WaitlistEntry>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          variant={statusMap[row.original.status]}
        />
      ),
    },
    {
      accessorKey: "_creationTime",
      header: "Requested",
      cell: ({ row }) =>
        new Date(row.original._creationTime).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (row.original.status !== "pending") return null;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // Mock — Phase 4 will use real mutation
                console.log("Approve:", row.original.email);
              }}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Mock — Phase 4 will use real mutation
                console.log("Reject:", row.original.email);
              }}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waitlist"
        description={`Manage pre-launch waitlist entries \u2022 ${String(pendingCount)} pending`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Waitlist" },
        ]}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<EnvelopeClosedIcon className="h-12 w-12" />}
          title="No waitlist entries"
          description="No one has joined the waitlist yet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={entries}
          searchKey="email"
          searchPlaceholder="Search by email..."
          pagination
        />
      )}
    </div>
  );
}
