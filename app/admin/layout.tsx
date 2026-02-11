"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components";
import { LockClosedIcon } from "@radix-ui/react-icons";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Users", exact: false },
  { href: "/admin/teams", label: "Teams", exact: false },
  { href: "/admin/waitlist", label: "Waitlist", exact: false },
  { href: "/admin/flags", label: "Feature Flags", exact: false },
  { href: "/admin/analytics", label: "Analytics", exact: false },
  { href: "/admin/audit", label: "Audit Log", exact: false },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSuperAdmin = useQuery(api.admin.isSuperAdmin);

  // Loading state
  if (isSuperAdmin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Access denied (AC2)
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
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-border bg-muted/30 p-4">
        <div className="mb-6">
          <Link href="/admin" className="text-lg font-bold">
            Admin
          </Link>
        </div>
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
