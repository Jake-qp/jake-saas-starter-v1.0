"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader, DataTable, EmptyState } from "@/components";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PersonIcon } from "@radix-ui/react-icons";

// MOCK DATA — Phase 2 only, will be replaced with real Convex queries in Phase 4
interface MockUser {
  _id: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  subscriptionTier: string;
  createdAt: string;
  lastActive: string;
}

const MOCK_USERS: MockUser[] = [
  {
    _id: "u1",
    email: "sarah@acme.com",
    fullName: "Sarah Chen",
    isSuperAdmin: true,
    subscriptionTier: "pro",
    createdAt: "2025-08-14T10:00:00Z",
    lastActive: "2026-02-11T09:30:00Z",
  },
  {
    _id: "u2",
    email: "james@startup.io",
    fullName: "James Wilson",
    isSuperAdmin: false,
    subscriptionTier: "free",
    createdAt: "2026-01-05T14:20:00Z",
    lastActive: "2026-02-10T16:45:00Z",
  },
  {
    _id: "u3",
    email: "maria@enterprise.co",
    fullName: "Maria Garcia",
    isSuperAdmin: false,
    subscriptionTier: "enterprise",
    createdAt: "2025-11-22T08:15:00Z",
    lastActive: "2026-02-11T11:00:00Z",
  },
  {
    _id: "u4",
    email: "alex@devshop.dev",
    fullName: "Alex Kim",
    isSuperAdmin: false,
    subscriptionTier: "pro",
    createdAt: "2026-02-01T12:00:00Z",
    lastActive: "2026-02-09T18:30:00Z",
  },
];

export default function AdminUsersPage() {
  const [impersonateTarget, setImpersonateTarget] = useState<MockUser | null>(
    null,
  );

  const handleImpersonate = () => {
    // Phase 4: Will call real Convex mutation
    setImpersonateTarget(null);
  };

  const columns: ColumnDef<MockUser>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {row.original.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="font-medium">{row.original.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isSuperAdmin",
      header: "Role",
      cell: ({ row }) =>
        row.original.isSuperAdmin ? (
          <Badge variant="default">Super Admin</Badge>
        ) : (
          <Badge variant="secondary">User</Badge>
        ),
    },
    {
      accessorKey: "subscriptionTier",
      header: "Plan",
      cell: ({ row }) => {
        const tier = row.original.subscriptionTier;
        const status =
          tier === "enterprise"
            ? "active"
            : tier === "pro"
              ? "trialing"
              : "inactive";
        return <StatusBadge status={status} label={tier} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => new Date(row.original.lastActive).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImpersonateTarget(row.original)}
          disabled={row.original.isSuperAdmin}
        >
          View as User
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users and impersonate for troubleshooting"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      />

      {MOCK_USERS.length === 0 ? (
        <EmptyState
          icon={<PersonIcon className="h-12 w-12" />}
          title="No users"
          description="No users have registered yet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={MOCK_USERS}
          searchKey="fullName"
          searchPlaceholder="Search users by name..."
          pagination
        />
      )}

      <AlertDialog
        open={impersonateTarget !== null}
        onOpenChange={(open) => !open && setImpersonateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Impersonate User</AlertDialogTitle>
            <AlertDialogDescription>
              You will view the application as{" "}
              <strong>{impersonateTarget?.fullName}</strong> (
              {impersonateTarget?.email}). This is read-only and will
              auto-expire after 30 minutes. All actions are logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImpersonate}>
              Start Impersonation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
