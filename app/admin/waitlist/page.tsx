"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, DataTable, EmptyState, StatusBadge } from "@/components";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { EnvelopeClosedIcon } from "@radix-ui/react-icons";

interface WaitlistEntry {
  _id: Id<"waitlistEntries">;
  email: string;
  status: string;
  _creationTime: number;
}

const statusMap: Record<string, "default" | "success" | "error"> = {
  pending: "default",
  approved: "success",
  rejected: "error",
};

export default function AdminWaitlistPage() {
  const entries = useQuery(api.waitlist.listWaitlistEntries);
  const approveEntry = useMutation(api.waitlist.approveEntry);
  const rejectEntry = useMutation(api.waitlist.rejectEntry);

  const handleApprove = async (
    entryId: Id<"waitlistEntries">,
    email: string,
  ) => {
    try {
      await approveEntry({ entryId });

      // Send invitation email (AC5)
      try {
        await fetch("/api/waitlist/send-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch {
        // Email send failure is non-blocking — entry is still approved
        console.error("Failed to send invitation email to", email);
      }

      toast({
        title: "Entry approved",
        description: `Invitation sent to ${email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve entry",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (entryId: Id<"waitlistEntries">) => {
    try {
      await rejectEntry({ entryId });
      toast({
        title: "Entry rejected",
        description: "Waitlist entry has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject entry",
        variant: "destructive",
      });
    }
  };

  if (!entries) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Waitlist"
          description="Manage pre-launch waitlist entries"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Waitlist" },
          ]}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading waitlist...</p>
        </div>
      </div>
    );
  }

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
              onClick={() =>
                void handleApprove(row.original._id, row.original.email)
              }
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleReject(row.original._id)}
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
