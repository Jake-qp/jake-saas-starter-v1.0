"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "@/convex/_generated/api";
import { PageHeader, DataTable, EmptyState } from "@/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MixerHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";

interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  active: boolean;
  created_at: string;
}

export default function AdminFlagsPage() {
  const isSuperAdmin = useQuery(api.admin.isSuperAdmin);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeatureFlag | null>(null);
  const [newFlagKey, setNewFlagKey] = useState("");
  const [newFlagName, setNewFlagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/flags");
      if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to manage feature flags.",
          variant: "destructive",
        });
        return;
      }
      if (response.status === 503) {
        setIsLoading(false);
        return; // PostHog not configured
      }
      if (!response.ok) throw new Error("Failed to fetch flags");
      const data = await response.json();
      setFlags(data.results ?? []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load feature flags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin === true) {
      void fetchFlags();
    } else if (isSuperAdmin === false) {
      setIsLoading(false);
    }
  }, [isSuperAdmin, fetchFlags]);

  const handleToggle = async (flag: FeatureFlag) => {
    // Optimistic update
    setFlags((prev) =>
      prev.map((f) => (f.id === flag.id ? { ...f, active: !f.active } : f)),
    );

    try {
      const response = await fetch(`/api/admin/flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !flag.active }),
      });
      if (!response.ok) throw new Error("Failed to toggle flag");
    } catch {
      // Revert optimistic update
      setFlags((prev) =>
        prev.map((f) => (f.id === flag.id ? { ...f, active: flag.active } : f)),
      );
      toast({
        title: "Error",
        description: "Failed to toggle feature flag.",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    if (!newFlagKey.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newFlagKey.trim(),
          name: newFlagName.trim() || newFlagKey.trim(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create flag");
      setNewFlagKey("");
      setNewFlagName("");
      setIsCreateOpen(false);
      await fetchFlags();
      toast({
        title: "Flag created",
        description: `Created flag "${newFlagKey.trim()}"`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create feature flag.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const flagKey = deleteTarget.key;

    try {
      const response = await fetch(`/api/admin/flags/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete flag");
      setDeleteTarget(null);
      await fetchFlags();
      toast({
        title: "Flag deleted",
        description: `Deleted flag "${flagKey}"`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete feature flag.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<FeatureFlag>[] = [
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {row.original.key}
        </code>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "toggle",
      header: "Toggle",
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          onCheckedChange={() => void handleToggle(row.original)}
        />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteTarget(row.original)}
        >
          Delete
        </Button>
      ),
    },
  ];

  // Loading state
  if (isSuperAdmin === undefined || isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Feature Flags"
          description="Manage PostHog feature flags"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Feature Flags" },
          ]}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not a super admin
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Feature Flags"
          description="Manage PostHog feature flags"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Feature Flags" },
          ]}
        />
        <EmptyState
          icon={<MixerHorizontalIcon className="h-12 w-12" />}
          title="Access Denied"
          description="You must be a super admin to manage feature flags."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Manage PostHog feature flags"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Feature Flags" },
        ]}
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Feature Flag</DialogTitle>
                <DialogDescription>
                  Create a new feature flag in PostHog. The flag will be
                  inactive by default.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="flagKey">Flag Key</Label>
                  <Input
                    id="flagKey"
                    placeholder="e.g. new-feature-v2"
                    value={newFlagKey}
                    onChange={(e) => setNewFlagKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in code: useFeatureFlag(&quot;{newFlagKey || "key"}
                    &quot;)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flagName">Display Name (optional)</Label>
                  <Input
                    id="flagName"
                    placeholder="e.g. New Feature V2"
                    value={newFlagName}
                    onChange={(e) => setNewFlagName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleCreate()}
                  disabled={!newFlagKey.trim() || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {flags.length === 0 ? (
        <EmptyState
          icon={<MixerHorizontalIcon className="h-12 w-12" />}
          title="No feature flags"
          description="Create your first feature flag to control feature rollout."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Flag
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={flags}
          searchKey="key"
          searchPlaceholder="Search flags..."
          pagination
        />
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the flag{" "}
              <code className="rounded bg-muted px-1">{deleteTarget?.key}</code>
              ? This action cannot be undone and will immediately affect all
              users relying on this flag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
