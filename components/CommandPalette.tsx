"use client";

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

// --- MOCK DATA (Phase 2 only — replaced in Phase 4) ---
const MOCK_RECENT_NOTES = [
  { _id: "note_1", title: "Q1 Product Roadmap" },
  { _id: "note_3", title: "Bug: File uploads failing on Safari" },
];

const MOCK_SEARCH_NOTES = [
  { _id: "note_1", title: "Q1 Product Roadmap" },
  { _id: "note_2", title: "Meeting Notes: Design Review" },
  { _id: "note_3", title: "Bug: File uploads failing on Safari" },
  { _id: "note_4", title: "API Rate Limiting Strategy" },
];

const MOCK_TEAMS = [{ _id: "team_1", name: "Acme Corp", slug: "acme-corp" }];

const MOCK_MEMBERS = [
  { _id: "member_1", name: "Sarah Chen", email: "sarah@example.com" },
  { _id: "member_2", name: "Alex Rivera", email: "alex@example.com" },
  { _id: "member_3", name: "Jamie Nguyen", email: "jamie@example.com" },
];
// --- END MOCK DATA ---

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { teamSlug } = useParams();

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
            <CommandGroup heading="Recent Notes">
              {MOCK_RECENT_NOTES.map((note) => (
                <CommandItem
                  key={note._id}
                  onSelect={() => navigate(`${teamBase}/notes`)}
                >
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  {note.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => navigate(teamBase)}>
                <HomeIcon className="mr-2 h-4 w-4" />
                Dashboard
                <CommandShortcut>Go</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate(`${teamBase}/notes`)}>
                <FileTextIcon className="mr-2 h-4 w-4" />
                Notes
                <CommandShortcut>Go</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate(`${teamBase}/ai`)}>
                <ChatBubbleIcon className="mr-2 h-4 w-4" />
                AI Chat
                <CommandShortcut>Go</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigate(`${teamBase}/settings`)}>
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
            <CommandGroup heading="Notes">
              {MOCK_SEARCH_NOTES.filter((n) =>
                n.title.toLowerCase().includes(search.toLowerCase()),
              ).map((note) => (
                <CommandItem
                  key={note._id}
                  onSelect={() => navigate(`${teamBase}/notes`)}
                >
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  {note.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Teams">
              {MOCK_TEAMS.filter((t) =>
                t.name.toLowerCase().includes(search.toLowerCase()),
              ).map((team) => (
                <CommandItem
                  key={team._id}
                  onSelect={() => navigate(`/t/${team.slug}`)}
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  {team.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Members">
              {MOCK_MEMBERS.filter(
                (m) =>
                  m.name.toLowerCase().includes(search.toLowerCase()) ||
                  m.email.toLowerCase().includes(search.toLowerCase()),
              ).map((member) => (
                <CommandItem
                  key={member._id}
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
      </CommandList>
    </CommandDialog>
  );
}
