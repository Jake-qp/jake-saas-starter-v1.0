"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
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
import { MixerHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";

// --- MOCK DATA (Phase 2 only — will be replaced with real PostHog API in Phase 4) ---
interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  active: boolean;
  created_at: string;
  filters: Record<string, unknown>;
}

const MOCK_FLAGS: FeatureFlag[] = [
  {
    id: "1",
    key: "new-dashboard-v2",
    name: "New Dashboard V2",
    active: true,
    created_at: "2026-02-01T10:00:00Z",
    filters: {},
  },
  {
    id: "2",
    key: "ai-chat-beta",
    name: "AI Chat Beta",
    active: true,
    created_at: "2026-02-05T14:30:00Z",
    filters: {},
  },
  {
    id: "3",
    key: "dark-mode-experiment",
    name: "Dark Mode Experiment",
    active: false,
    created_at: "2026-01-20T08:00:00Z",
    filters: {},
  },
  {
    id: "4",
    key: "waitlist-mode",
    name: "Waitlist Mode",
    active: false,
    created_at: "2026-02-10T16:45:00Z",
    filters: {},
  },
];
// --- END MOCK DATA ---

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FLAGS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeatureFlag | null>(null);
  const [newFlagKey, setNewFlagKey] = useState("");
  const [newFlagName, setNewFlagName] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- real check in Phase 4
  const posthogConfigured = true; // Mock — will check real env in Phase 4

  const handleToggle = (flagId: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, active: !f.active } : f)),
    );
  };

  const handleCreate = () => {
    if (!newFlagKey.trim()) return;
    const flag: FeatureFlag = {
      id: String(Date.now()),
      key: newFlagKey.trim(),
      name: newFlagName.trim() || newFlagKey.trim(),
      active: false,
      created_at: new Date().toISOString(),
      filters: {},
    };
    setFlags((prev) => [flag, ...prev]);
    setNewFlagKey("");
    setNewFlagName("");
    setIsCreateOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setFlags((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
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
          onCheckedChange={() => handleToggle(row.original.id)}
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- will be dynamic in Phase 4
  if (!posthogConfigured) {
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
          title="PostHog not configured"
          description="Set NEXT_PUBLIC_POSTHOG_KEY and POSTHOG_PERSONAL_API_KEY environment variables to enable feature flag management."
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
                <Button onClick={handleCreate} disabled={!newFlagKey.trim()}>
                  Create
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
              onClick={handleDelete}
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
