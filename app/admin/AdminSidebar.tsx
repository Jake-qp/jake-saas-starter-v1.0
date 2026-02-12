"use client";

import {
  DashboardIcon,
  PersonIcon,
  GroupIcon,
  EnvelopeClosedIcon,
  MixerHorizontalIcon,
  BarChartIcon,
  ReaderIcon,
  ChevronLeftIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const adminNavItems = [
  { title: "Dashboard", icon: DashboardIcon, href: "/admin", exact: true },
  { title: "Users", icon: PersonIcon, href: "/admin/users", exact: false },
  { title: "Teams", icon: GroupIcon, href: "/admin/teams", exact: false },
  {
    title: "Waitlist",
    icon: EnvelopeClosedIcon,
    href: "/admin/waitlist",
    exact: false,
  },
  {
    title: "Feature Flags",
    icon: MixerHorizontalIcon,
    href: "/admin/flags",
    exact: false,
  },
  {
    title: "Analytics",
    icon: BarChartIcon,
    href: "/admin/analytics",
    exact: false,
  },
  {
    title: "Audit Log",
    icon: ReaderIcon,
    href: "/admin/audit",
    exact: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (item: { href: string; exact: boolean }) => {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Admin Panel">
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MixerHorizontalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Super Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to App">
              <Link href="/t">
                <ChevronLeftIcon />
                <span>Back to App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
