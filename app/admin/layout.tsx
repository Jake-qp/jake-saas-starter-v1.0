"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmptyState } from "@/components/EmptyState";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const isSuperAdmin = useQuery(api.admin.isSuperAdmin, {});

  // Loading state
  if (isSuperAdmin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Access denied
  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EmptyState
          icon={<LockClosedIcon className="h-12 w-12" />}
          title="Access Denied"
          description="You must be a super admin to access this area."
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold">Admin</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
