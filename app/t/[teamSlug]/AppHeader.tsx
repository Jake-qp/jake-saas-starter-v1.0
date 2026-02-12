"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment, useCallback } from "react";

import { Notifications } from "@/app/t/Notifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WhatsNewBadge } from "@/components/WhatsNewBadge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const segmentLabels: Record<string, string> = {
  t: "Dashboard",
  settings: "Settings",
  profile: "Profile",
  notifications: "Notifications",
  members: "Members",
  billing: "Billing",
  notes: "Notes",
  ai: "AI Chat",
};

function formatSegment(segment: string): string {
  return (
    segmentLabels[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

export function AppHeader() {
  const pathname = usePathname();

  const openCommandPalette = useCallback(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      }),
    );
  }, []);

  // Build breadcrumbs from pathname: /t/[teamSlug]/settings/profile
  // => ["settings", "profile"]
  const segments = pathname.split("/").filter(Boolean);
  // segments: ["t", teamSlug, ...rest]
  const rest = segments.slice(2); // skip "t" and teamSlug
  const teamBase = `/${segments.slice(0, 2).join("/")}`;

  const breadcrumbs = rest.map((segment, index) => {
    const href = `${teamBase}/${rest.slice(0, index + 1).join("/")}`;
    const isLast = index === rest.length - 1;
    return { label: formatSegment(segment), href, isLast };
  });

  // If no rest segments, show "Projects" as the current page
  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ label: "Projects", href: teamBase, isLast: true });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-2 text-muted-foreground"
          onClick={openCommandPalette}
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span className="text-xs">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>
        <WhatsNewBadge />
        <ThemeToggle />
        <Notifications />
      </div>
    </header>
  );
}
