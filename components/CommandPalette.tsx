"use client";

import { api } from "@/convex/_generated/api";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  FileTextIcon,
  PersonIcon,
  MagnifyingGlassIcon,
  GearIcon,
  ChatBubbleIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { teamSlug } = useParams();
  const team = useCurrentTeam();

  // Search queries — only run when searching
  const noteResults = useQuery(
    api.notes.search,
    team && search.trim() ? { teamId: team._id, query: search } : "skip",
  );

  const memberResults = useQuery(
    api.notes.searchMembers,
    team && search.trim() ? { teamId: team._id, query: search } : "skip",
  );

  // Recent notes (last 5)
  const recentNotes = useQuery(
    api.notes.list,
    team ? { teamId: team._id } : "skip",
  );

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      setSearch("");
      router.push(path);
    },
    [router],
  );

  const isSearching = search.length > 0;
  const teamBase = `/t/${teamSlug as string}`;

  // Take first 3 recent notes for the non-search view
  const recentItems = (recentNotes ?? []).slice(0, 3);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search notes, teams, members..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No results found</p>
          </div>
        </CommandEmpty>

        {/* Recent items (shown when not searching) */}
        {!isSearching && (
          <>
            {recentItems.length > 0 && (
              <CommandGroup heading="Recent Notes">
                {recentItems.map((note) => (
                  <CommandItem
                    key={note._id}
                    value={`note-${note.title}`}
                    onSelect={() => navigate(`${teamBase}/notes`)}
                  >
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    {note.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem
                value="nav-dashboard"
                onSelect={() => navigate(teamBase)}
              >
                <HomeIcon className="mr-2 h-4 w-4" />
                Dashboard
                <CommandShortcut>Go</CommandShortcut>
              </CommandItem>
              <CommandItem
                value="nav-notes"
                onSelect={() => navigate(`${teamBase}/notes`)}
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                Notes
                <CommandShortcut>Go</CommandShortcut>
              </CommandItem>
              <CommandItem
                value="nav-ai"
                onSelect={() => navigate(`${teamBase}/ai`)}
              >
                <ChatBubbleIcon className="mr-2 h-4 w-4" />
                AI Chat
                <CommandShortcut>Go</CommandShortcut>
              </CommandItem>
              <CommandItem
                value="nav-settings"
                onSelect={() => navigate(`${teamBase}/settings`)}
              >
                <GearIcon className="mr-2 h-4 w-4" />
                Settings
                <CommandShortcut>Go</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Search results (shown when searching) */}
        {isSearching && (
          <>
            {noteResults && noteResults.length > 0 && (
              <CommandGroup heading="Notes">
                {noteResults.map((note) => (
                  <CommandItem
                    key={note._id}
                    value={`search-note-${note.title}`}
                    onSelect={() => navigate(`${teamBase}/notes`)}
                  >
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    {note.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {memberResults && memberResults.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Members">
                  {memberResults.map((member) => (
                    <CommandItem
                      key={member._id}
                      value={`search-member-${member.name}-${member.email}`}
                      onSelect={() => navigate(`${teamBase}/settings/members`)}
                    >
                      <PersonIcon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{member.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
