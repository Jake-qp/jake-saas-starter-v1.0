"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
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
import { toast } from "@/components/ui/use-toast";
import { PersonIcon } from "@radix-ui/react-icons";

interface AdminUser {
  _id: Id<"users">;
  email: string | undefined;
  fullName: string;
  isSuperAdmin: boolean;
  _creationTime: number;
}

export default function AdminUsersPage() {
  const users = useQuery(api.admin.listUsers, {});
  const startImpersonation = useMutation(api.admin.startImpersonation);
  const [impersonateTarget, setImpersonateTarget] = useState<AdminUser | null>(
    null,
  );

  const handleImpersonate = async () => {
    if (!impersonateTarget) return;
    try {
      await startImpersonation({ targetUserId: impersonateTarget._id });
      toast({
        title: "Impersonation started",
        description: `Viewing as ${impersonateTarget.fullName}. Auto-expires in 30 minutes.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start impersonation",
        variant: "destructive",
      });
    } finally {
      setImpersonateTarget(null);
    }
  };

  const columns: ColumnDef<AdminUser>[] = [
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
              {row.original.email ?? "No email"}
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
      accessorKey: "_creationTime",
      header: "Joined",
      cell: ({ row }) =>
        new Date(row.original._creationTime).toLocaleDateString(),
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

  if (!users) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage platform users and impersonate for troubleshooting"
          breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users and impersonate for troubleshooting"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={<PersonIcon className="h-12 w-12" />}
          title="No users"
          description="No users have registered yet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={users}
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
              {impersonateTarget?.email ?? "no email"}). This is read-only and
              will auto-expire after 30 minutes. All actions are logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleImpersonate()}>
              Start Impersonation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
