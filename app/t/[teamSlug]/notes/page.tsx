"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
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
import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useToast } from "@/components/ui/use-toast";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

type NoteListItem = {
  _id: Id<"notes">;
  title: string;
  content: string;
  createdBy: { _id: Id<"users">; fullName: string; email: string };
  attachmentStorageIds: Id<"_storage">[];
  _creationTime: number;
};

export default function NotesPage() {
  const team = useCurrentTeam();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editNote, setEditNote] = useState<NoteListItem | null>(null);
  const [deleteNote, setDeleteNote] = useState<NoteListItem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Convex queries
  const notes = useQuery(
    api.notes.list,
    team
      ? {
          teamId: team._id,
          search: debouncedSearch || undefined,
        }
      : "skip",
  );

  const canManageContent = useQuery(
    api.notes.canManageContent,
    team ? { teamId: team._id } : "skip",
  );

  const viewer = useQuery(api.users.viewer);

  // Convex mutations
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const removeNote = useMutation(api.notes.remove);

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    // Simple debounce via setTimeout
    const timeout = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timeout);
  }, []);

  if (!team) return null;

  const handleCreate = () => {
    setTitle("");
    setContent("");
    setCreateOpen(true);
  };

  const handleEdit = (note: NoteListItem) => {
    setTitle(note.title);
    setContent(note.content);
    setEditNote(note);
  };

  const handleCreateSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createNote({
        teamId: team._id,
        title: title.trim(),
        content: content.trim(),
      });
      setCreateOpen(false);
      toast({ title: "Note created" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create note";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editNote || !title.trim()) return;
    setSaving(true);
    try {
      await updateNote({
        noteId: editNote._id,
        title: title.trim(),
        content: content.trim(),
      });
      setEditNote(null);
      toast({ title: "Note updated" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update note";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteNote) return;
    try {
      await removeNote({ noteId: deleteNote._id });
      setDeleteNote(null);
      toast({ title: "Note deleted" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete note";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const canDeleteNote = (note: NoteListItem) => {
    if (!viewer) return false;
    // Creator can always delete their own notes
    if (note.createdBy._id === viewer._id) return true;
    // "Manage Content" holders can delete any note
    return canManageContent === true;
  };

  const canEditNote = (note: NoteListItem) => {
    if (!viewer) return false;
    if (note.createdBy._id === viewer._id) return true;
    return canManageContent === true;
  };

  const notesList = notes ?? [];

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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Notes list */}
      {notes === undefined ? (
        <div className="mt-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border p-4"
            >
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : notesList.length === 0 && !search ? (
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
      ) : notesList.length === 0 && search ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <MagnifyingGlassIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            No notes match &quot;{search}&quot;. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notesList.map((note) => (
            <div
              key={note._id}
              className="group flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{note.title}</h3>
                  {note.attachmentStorageIds.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileTextIcon className="h-3 w-3" />
                      {note.attachmentStorageIds.length}
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
              {(canEditNote(note) || canDeleteNote(note)) && (
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
                    {canEditNote(note) && (
                      <DropdownMenuItem onClick={() => handleEdit(note)}>
                        <Pencil1Icon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDeleteNote(note) && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteNote(note)}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreateSubmit()}
              disabled={saving || !title.trim()}
            >
              {saving ? "Creating..." : "Create Note"}
            </Button>
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
            <Button
              variant="outline"
              onClick={() => setEditNote(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleEditSubmit()}
              disabled={saving || !title.trim()}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
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
              onClick={() => void handleDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
