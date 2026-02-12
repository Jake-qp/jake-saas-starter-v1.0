import { AcceptInviteDialog } from "@/app/t/AcceptInviteDialog";
import { AppHeader } from "@/app/t/[teamSlug]/AppHeader";
import { AppSidebar } from "@/app/t/[teamSlug]/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <AcceptInviteDialog />
      <CommandPalette />
      <Toaster />
    </Suspense>
  );
}
