# Feature: Example App — Notes CRUD (F001-011)

## User Context
- **Who:** Team members in a SaaS app — owners, admins, and regular members
- **Context:** Desktop-first, within team workspace (app/t/[teamSlug]/notes)
- **Goals:**
  1. Create, read, update, and delete notes with real-time updates
  2. Find notes quickly via search and a global command palette (Cmd+K)
  3. Attach files to notes and manage attachments
- **Mental Model:** Notes belong to a team. My notes vs others' notes. Quick-find via search.
- **Glance Questions:** What notes exist? Who wrote them? What's inside?

## Feature Outline (Approved — from PRD)

### Screens
1. **Notes List** (`/t/[teamSlug]/notes`) — Team notes with search, create, pagination
2. **Note Detail/Edit** — Inline or page view for reading/editing a single note
3. **Command Palette** — Global Cmd+K dialog for searching notes, teams, members

### Key Flows
1. **Create note:** User clicks "New Note" → fills title/content → optionally attaches files → saves → note appears in list
2. **Edit note:** User clicks note → edits title/content → saves → real-time update
3. **Delete note:** Owner deletes own note; "Manage Content" holders can delete others' notes → soft delete
4. **Search notes:** User types in search bar → results filter across titles and content
5. **Command palette:** User presses Cmd+K → types query → sees notes/teams/members → selects result → navigates
6. **Attach files:** User adds file via FileUploader on note → attachment stored and displayed

### Out of Scope
- Rich text / Markdown editor (plain text content only)
- Note sharing / public links
- Note templates
- Note categories / tags
- Note export (PDF, CSV)
- Collaborative editing

## Acceptance Criteria (from PRD)
- [x] AC1: Notes CRUD works with real-time updates
- [x] AC2: Permission-gated — Contribute can create, Manage Content can delete others'
- [x] AC3: Search works across note titles and content
- [x] AC4: Entitlement gating limits notes per tier (Free: 50, Pro: unlimited, Enterprise: unlimited)
- [x] AC5: Notes support file attachments (upload via `<FileUploader>`, stored as `attachmentStorageIds`)
- [x] AC6: Command palette (Cmd+K) opens `<CommandPalette>` dialog
- [x] AC7: Command palette searches notes, teams, and members via Convex search indexes
- [x] AC8: Command palette shows recent items and navigation shortcuts
- [x] AC9: Selecting a search result navigates to the appropriate page

## Edge Cases
- **Empty state:** No notes yet → EmptyState with CTA to create first note
- **Entitlement limit hit:** Free tier at 50 notes → error with upgrade prompt
- **Delete own vs others':** Members can only delete own notes; Manage Content can delete anyone's
- **Long content:** Notes with very long titles or content render properly
- **No search results:** Command palette shows "No results found"
- **File attachment on unsaved note:** Must save note first before attaching

## CRUD Operations

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Note | ✅ Contribute | ✅ Team member | ✅ Owner or Manage Content | ✅ Soft delete (owner or Manage Content) | Real-time via Convex |

## Success Definition
We'll know this works when: A team member can create a note with attachments, search for it via the notes page or Cmd+K command palette, edit it, and delete it — all with proper permission and entitlement enforcement and real-time updates.
