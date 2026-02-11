"use client";

import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { PageHeader, EmptyState } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";

// --- MOCK DATA (Phase 2 only — replaced in Phase 4) ---
const MOCK_NOTES = [
  {
    _id: "note_1",
    title: "Q1 Product Roadmap",
    content:
      "Key priorities for Q1:\n1. Ship billing integration\n2. Launch command palette\n3. Improve onboarding flow\n\nTimeline: Jan 15 - Mar 31",
    createdBy: { fullName: "Sarah Chen", email: "sarah@example.com" },
    _creationTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    attachmentCount: 2,
  },
  {
    _id: "note_2",
    title: "Meeting Notes: Design Review",
    content:
      "Attendees: Sarah, Alex, Jamie\n\nDecisions:\n- Use semantic color tokens everywhere\n- PageHeader required for all pages\n- EmptyState component for zero states\n\nAction items:\n- Alex: update design system docs\n- Jamie: audit existing pages",
    createdBy: { fullName: "Alex Rivera", email: "alex@example.com" },
    _creationTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
    attachmentCount: 0,
  },
  {
    _id: "note_3",
    title: "Bug: File uploads failing on Safari",
    content:
      "Reported by customer. Steps to reproduce:\n1. Open Safari 17.2\n2. Navigate to file upload\n3. Select a .png file > 2MB\n4. Upload progress hangs at 80%\n\nWorkaround: Use Chrome for now.\nRoot cause: Safari blob handling differs.",
    createdBy: { fullName: "Jamie Nguyen", email: "jamie@example.com" },
    _creationTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
    attachmentCount: 1,
  },
  {
    _id: "note_4",
    title: "API Rate Limiting Strategy",
    content:
      "Proposed limits:\n- Free: 100 req/min\n- Pro: 1000 req/min\n- Enterprise: unlimited\n\nImplement using token bucket algorithm with Redis.",
    createdBy: { fullName: "Sarah Chen", email: "sarah@example.com" },
    _creationTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
    attachmentCount: 0,
  },
];
// --- END MOCK DATA ---

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function NotesPage() {
  const team = useCurrentTeam();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editNote, setEditNote] = useState<(typeof MOCK_NOTES)[0] | null>(null);
  const [deleteNote, setDeleteNote] = useState<(typeof MOCK_NOTES)[0] | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  if (!team) return null;

  const filteredNotes = MOCK_NOTES.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = () => {
    setTitle("");
    setContent("");
    setCreateOpen(true);
  };

  const handleEdit = (note: (typeof MOCK_NOTES)[0]) => {
    setTitle(note.title);
    setContent(note.content);
    setEditNote(note);
  };

  return (
    <main className="container py-6">
      <PageHeader
        title="Notes"
        description="Create and manage team notes"
        breadcrumbs={[
          { label: team.name, href: `/t/${team.slug}` },
          { label: "Notes" },
        ]}
        actions={
          <Button onClick={handleCreate} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Note
          </Button>
        }
      />

      {/* Search bar */}
      <div className="mt-6 flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Notes list */}
      {filteredNotes.length === 0 && !search ? (
        <EmptyState
          icon={<FileTextIcon className="h-12 w-12" />}
          title="No notes yet"
          description="Create your first note to start capturing ideas, meeting notes, and more."
          action={
            <Button onClick={handleCreate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          }
          className="mt-6"
        />
      ) : filteredNotes.length === 0 && search ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <MagnifyingGlassIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            No notes match &quot;{search}&quot;. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="group flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{note.title}</h3>
                  {note.attachmentCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileTextIcon className="h-3 w-3" />
                      {note.attachmentCount}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {note.content}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{note.createdBy.fullName}</span>
                  <span>&middot;</span>
                  <span>{formatRelativeTime(note._creationTime)}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <DotsHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(note)}>
                    <Pencil1Icon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteNote(note)}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Create Note Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                placeholder="Write your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Create Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={!!editNote} onOpenChange={() => setEditNote(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNote(null)}>
              Cancel
            </Button>
            <Button onClick={() => setEditNote(null)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteNote} onOpenChange={() => setDeleteNote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteNote?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setDeleteNote(null)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
