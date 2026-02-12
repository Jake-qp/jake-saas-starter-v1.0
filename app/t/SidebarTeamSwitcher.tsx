"use client";

import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";

import { useCreateTeamDialog } from "@/app/t/CreateTeamDialog";
import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SidebarTeamSwitcher() {
  const pathname = usePathname();
  const teams = useQuery(api.users.teams.list);
  const selectedTeam = useCurrentTeam();
  const { isMobile } = useSidebar();

  const [open, setOpen] = useState(false);

  const [showNewTeamDialog, handleShowNewTeamDialog, createTeamDialogContent] =
    useCreateTeamDialog();

  if (teams == null || selectedTeam == null) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Skeleton className="h-12 w-full" />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const personalTeams = teams.filter((team) => team.isPersonal);
  const nonPersonalTeams = teams.filter((team) => !team.isPersonal);
  const groups = [
    { label: "Personal Account", teams: personalTeams },
    ...(nonPersonalTeams.length > 0
      ? [{ label: "Teams", teams: nonPersonalTeams }]
      : []),
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={showNewTeamDialog} onOpenChange={handleShowNewTeamDialog}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={
                      selectedTeam.pictureUrl ??
                      `https://avatar.vercel.sh/${selectedTeam.slug}.png`
                    }
                    alt={selectedTeam.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {selectedTeam.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {selectedTeam.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedTeam.isPersonal ? "Personal" : "Team"}
                  </span>
                </div>
                <CaretSortIcon className="ml-auto" />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] min-w-56 p-0"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <Command>
                <CommandList>
                  <CommandInput placeholder="Search team..." />
                  <CommandEmpty>No team found.</CommandEmpty>
                  {groups.map((group) => (
                    <CommandGroup key={group.label} heading={group.label}>
                      {group.teams.map((team) => (
                        <CommandItem key={team.name} className="text-sm p-0">
                          <Link
                            className="flex w-full items-center gap-2 px-2 py-1.5"
                            href={{
                              pathname: `/t/${team.slug}/${pathname
                                .split("/")
                                .slice(3)
                                .join("/")}`,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpen(false);
                            }}
                          >
                            <Avatar className="h-5 w-5 rounded-sm">
                              <AvatarImage
                                src={
                                  team.pictureUrl ??
                                  `https://avatar.vercel.sh/${team.slug}.png`
                                }
                                alt={team.name}
                              />
                              <AvatarFallback className="rounded-sm text-xs">
                                {team.name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="flex-1 truncate">{team.name}</span>
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedTeam.slug === team.slug
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </Link>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <DialogTrigger asChild>
                      <CommandItem
                        className="cursor-pointer"
                        onSelect={() => {
                          setOpen(false);
                          handleShowNewTeamDialog(true);
                        }}
                      >
                        <PlusCircledIcon className="mr-2 h-5 w-5" />
                        Create Team
                      </CommandItem>
                    </DialogTrigger>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {createTeamDialogContent}
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
