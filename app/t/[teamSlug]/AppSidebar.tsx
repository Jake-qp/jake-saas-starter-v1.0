"use client";

import {
  HomeIcon,
  FileTextIcon,
  ChatBubbleIcon,
  GearIcon,
  PersonIcon,
  BellIcon,
  AvatarIcon,
  BarChartIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { SidebarTeamSwitcher } from "@/app/t/SidebarTeamSwitcher";
import { SidebarUserMenu } from "@/app/t/[teamSlug]/SidebarUserMenu";
import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Projects", icon: HomeIcon, href: "" },
  { title: "Notes", icon: FileTextIcon, href: "/notes" },
  { title: "AI Chat", icon: ChatBubbleIcon, href: "/ai" },
];

const settingsItems = [
  { title: "General", icon: GearIcon, href: "/settings" },
  { title: "Profile", icon: PersonIcon, href: "/settings/profile" },
  {
    title: "Notifications",
    icon: BellIcon,
    href: "/settings/notifications",
  },
];

const teamSettingsItems = [
  { title: "Members", icon: AvatarIcon, href: "/settings/members" },
  { title: "Billing", icon: BarChartIcon, href: "/settings/billing" },
];

export function AppSidebar() {
  const { teamSlug } = useParams();
  const pathname = usePathname();
  const team = useCurrentTeam();
  const teamBase = `/t/${teamSlug as string}`;

  const isActive = (href: string) => {
    const fullPath = `${teamBase}${href}`;
    if (href === "")
      return pathname === teamBase || pathname === `${teamBase}/`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const isSettingsActive = pathname.startsWith(`${teamBase}/settings`);

  const allSettingsItems = [
    ...settingsItems,
    ...(team?.isPersonal ? [] : teamSettingsItems),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarTeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={`${teamBase}${item.href}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <Collapsible
          defaultOpen={isSettingsActive}
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                Settings
                <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {allSettingsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={`${teamBase}${item.href}`}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
