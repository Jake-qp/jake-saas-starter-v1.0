---
name: nextjs
description: Use when building pages, layouts, routes, or any Next.js App Router frontend code. Before creating new routes or components.
---

# Next.js App Router for SaaS

## Overview

This project uses Next.js 14 App Router with Convex as the realtime backend. Every route decision, every component boundary, every provider nesting order has a reason. Violating these patterns breaks auth, breaks realtime, or breaks the team-scoped data model. Learn the patterns before writing a line of code.

## How Next.js SaaS Engineers Think

**"Where does this route live in the hierarchy?"**
Route placement is identity. A page under `app/t/[teamSlug]/` gets team context for free. A page under `app/(marketing)/` is public and server-rendered. Put a client component in the wrong route group and you get auth failures, hydration mismatches, or missing team context. Always know your route group before you start coding.

**"Is this a server component or a client component?"**
Default to server. Only add `"use client"` when you need hooks, event handlers, or browser APIs. Server components handle redirects, fetch data at the edge, and never ship JS to the browser. The moment you add `"use client"`, you lose server-side rendering for that subtree. Think hard before crossing that boundary.

**"What does the user see at every stage of data loading?"**
With Convex, queries return `undefined` before data arrives. Every component that reads data needs a null guard. Not optional -- required. Show a Skeleton, show nothing, but never let the component crash because `team` is `undefined`.

### What Separates Amateurs from Professionals

Amateurs scatter `"use client"` everywhere and wonder why their bundle is huge. Professionals push the client boundary down to the smallest possible component. Amateurs pass teamSlug as a prop through five layers. Professionals use `useCurrentTeam()` and let the hook handle slug resolution. Amateurs write one-off error handling in every form. Professionals wrap everything in `handleFailure()` and get consistent toast-based error reporting.

When you catch yourself adding `"use client"` to a layout or copying error handling logic -- STOP.

## When to Use

- Creating a new page or route
- Adding a layout or nested layout
- Building route-level components (pages, layouts, navigation)
- Wiring up Convex data fetching in components
- Setting up provider nesting or context
- Adding team-scoped features
- **NOT** for Convex backend logic (use backend skill)
- **NOT** for shadcn component customization (use ui skill)

## Project Directory Structure

```
app/
  layout.tsx                # Root layout: html, body, fonts, metadata
  page.tsx                  # Landing page (server component)
  globals.css               # Tailwind + CSS variables (light/dark)
  handleFailure.ts          # Error-to-toast wrapper for mutations
  constants.ts              # App-wide constants (e.g., INVITE_PARAM)
  ConvexClientProvider.tsx  # Clerk + Convex provider (client component)
  ErrorBoundary.tsx         # Catches Clerk config errors

  (marketing)/              # Public pages (route group, no layout segment)
  auth/                     # Auth pages (V2: sign-in, sign-up, forgot-password)
  blog/                     # Blog routes (MDX content)
  admin/                    # Super admin panel

  t/                        # Team-scoped app (all authenticated routes)
    layout.tsx              # Dashboard shell: providers, header, nav, toaster
    page.tsx                # SERVER component: redirect to /t/[teamSlug]
    TeamSwitcher.tsx        # Team dropdown with search, avatars
    TeamMenu.tsx            # Top-level nav tabs (Projects, Settings)
    AcceptInviteDialog.tsx  # Global invite acceptance dialog
    CreateTeamDialog.tsx    # Dialog hook pattern for team creation
    Notifications.tsx       # Invite notification bell

    [teamSlug]/             # Dynamic team segment
      layout.tsx            # Team-specific layout (currently passes through)
      page.tsx              # Team dashboard (client: uses useCurrentTeam)
      hooks.ts              # useCurrentTeam, useViewerPermissions, useStaleValue
      ProfileButton.tsx     # Clerk UserButton with loading skeleton
      MessageBoard.tsx      # Example: paginated realtime messages

      settings/             # Settings sub-routes
        layout.tsx          # Sidebar + main content grid
        page.tsx            # General settings (delete team)
        SettingsMenu.tsx    # Settings sidebar nav
        members/            # Member management
          page.tsx          # Members page with role-based redirects
          AddMember.tsx     # Invite form (permission-gated)
          MemberList.tsx    # Paginated members + invites tabs
          SelectRole.tsx    # Role selector component

  api/                      # API routes (AI streaming in V2)
```

## Core Patterns

### 1. Root Layout (Minimal on Purpose)

The root layout is deliberately thin. It sets `<html>` and `<body>` only:

```tsx
// app/layout.tsx -- SERVER component, no "use client"
import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

Providers live in `app/t/layout.tsx`, NOT the root. This keeps marketing pages fast and provider-free.

### 2. Provider Nesting (Dashboard Layout)

The `app/t/layout.tsx` is the real application shell. Order matters:

```tsx
// app/t/layout.tsx -- SERVER component wrapping client providers
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ConvexClientProvider>
        <StickyHeader className="px-4 py-2 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <TeamSwitcher />
            <div className="flex items-center gap-4">
              <Notifications />
              <ProfileButton />
            </div>
          </div>
          <TeamMenu />
        </StickyHeader>
        {children}
        <AcceptInviteDialog />
        <Toaster />
      </ConvexClientProvider>
    </Suspense>
  );
}
```

Key decisions:
- `<Suspense>` wraps everything for `useSearchParams()` compatibility
- `<ConvexClientProvider>` provides Clerk auth + Convex client
- `<AcceptInviteDialog>` is global (reads URL search params)
- `<Toaster>` is last (renders above everything)

### 3. ConvexClientProvider (Auth + Realtime)

`app/ConvexClientProvider.tsx` is a `"use client"` component that nests: `ErrorBoundary` > `ClerkProvider` > `ConvexProviderWithClerk`. Inside it, an `<Authenticated>` wrapper runs `<StoreUserInDatabase />` to sync Clerk user data to Convex on every auth change.

V2 migration: Clerk will be replaced by Convex Auth (`ConvexAuthNextjsServerProvider` + `ConvexAuthNextjsProvider`). See CLAUDE.md for roadmap.

### 4. Server Component Redirect Pattern

`app/t/page.tsx` is the only server component that calls Convex directly. It uses `fetchMutation` with an auth token to get the user's default team slug, then calls `redirect()`. This keeps the redirect server-side and instant. All other team-scoped data flows through client-side `useQuery`.

### 5. Team Context Hooks

Every team-scoped page depends on these hooks from `app/t/[teamSlug]/hooks.ts`:

```tsx
// Gets current team from URL slug, auto-redirects if slug is invalid
export function useCurrentTeam() {
  const { teamSlug } = useParams();
  const teams = useQuery(api.users.teams.list);
  const currentTeam = teams?.find((team) => team.slug === teamSlug) ?? teams?.[0];
  // Auto-redirect if slug mismatch
  useEffect(() => {
    if (currentTeam !== undefined && currentTeam.slug !== teamSlug) {
      router.push(`/t/${currentTeam.slug}/${pathname.split("/").slice(3).join("/")}`);
    }
  }, [currentTeam, pathname, router, teamSlug]);
  return currentTeam;
}

// Returns Set<Permission> for the current viewer, or null while loading
export function useViewerPermissions() {
  const team = useCurrentTeam();
  const permissions = useQuery(api.users.teams.members.viewerPermissions, {
    teamId: team?._id,
  });
  return permissions == null ? null : new Set(permissions);
}
```

Usage in every team-scoped page:

```tsx
const team = useCurrentTeam();
const permissions = useViewerPermissions();
if (team == null || permissions == null) return null;  // Loading guard
```

### 6. Null Guard Pattern (Non-Negotiable)

Convex queries return `undefined` during loading. Every component that uses query data MUST guard:

```tsx
// Simple guard -- return nothing while loading
const teams = useQuery(api.users.teams.list);
const selectedTeam = useCurrentTeam();
if (teams == null || selectedTeam == null) {
  return <Skeleton className="w-40 h-9" />;
}

// Cascading guard -- check multiple data dependencies
const team = useCurrentTeam();
const permissions = useViewerPermissions();
const invites = useQuery(api.users.teams.members.invites.list, { teamId: team?._id });
if (team == null || permissions == null || invites == null) {
  return null;
}
```

Never use optional chaining to skip the guard. If the data is needed for rendering, guard explicitly.

### 7. handleFailure Error Wrapper

`app/handleFailure.ts` wraps any async callback, catches errors, and shows a destructive toast. If the error is a `ConvexError`, it displays `error.data`; otherwise, a generic message. Use it everywhere:

```tsx
// On forms (wraps react-hook-form's handleSubmit):
<form onSubmit={handleFailure(form.handleSubmit(async ({ name }) => {
  const slug = await createTeam({ name });
  router.push(`/t/${slug}`);
}))}>

// On button clicks:
<Button onClick={handleFailure(async () => {
  const teamSlug = await acceptInvite({ inviteId: invite._id });
  router.push(`/t/${teamSlug}`);
})}>
```

Never write try/catch inline. Always use `handleFailure()`.

### 8. Convex Data Fetching

```tsx
"use client";
import { useQuery, useMutation, useAction, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Basic query
const teams = useQuery(api.users.teams.list);

// Conditional query (skip when data not ready)
const invite = useQuery(api.invites.get, inviteId === null ? "skip" : { inviteId });

// Mutation (returns value)
const createTeam = useMutation(api.users.teams.create);
const slug = await createTeam({ name: "My Team" });

// Action (for side effects like sending email)
const sendInvite = useAction(api.users.teams.members.invites.send);

// Paginated query
const { results, status, loadMore, isLoading } = usePaginatedQuery(
  api.users.teams.messages.list,
  team == null ? "skip" : { teamId: team._id },
  { initialNumItems: 10 }
);
```

### 9. Navigation Patterns

Team-scoped navigation uses relative href construction:

```tsx
// NavLink pattern used in TeamMenu and SettingsMenu
function NavLink({ relativeHref, children }: { relativeHref: string; children: ReactNode }) {
  const currentPath = usePathname();
  const { teamSlug } = useParams();
  const linkPath = `/t/${teamSlug as string}${relativeHref}`;
  const active = relativeHref === ""
    ? currentPath === linkPath           // Exact match for root
    : currentPath.startsWith(linkPath);  // Prefix match for sub-routes
  return (
    <Link href={linkPath} className={cn("...", active ? "text-foreground" : "text-foreground/60")}>
      {children}
    </Link>
  );
}
```

Team switching preserves the current sub-path:

```tsx
// In TeamSwitcher -- keeps /settings/members when switching teams
href={{ pathname: `/t/${team.slug}/${pathname.split("/").slice(3).join("/")}` }}
```

### 10. Dialog Hook Pattern

When a Dialog must wrap a Popover (shadcn/ui constraint), use a hook:

```tsx
export function useCreateTeamDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "" },
  });
  const handleShowDialog = (state: boolean) => { form.reset(); setShowDialog(state); };
  const content = (<DialogContent>...</DialogContent>);
  return [showDialog, handleShowDialog, content] as const;
}

// Usage in parent:
const [showDialog, handleShowDialog, dialogContent] = useCreateTeamDialog();
<Dialog open={showDialog} onOpenChange={handleShowDialog}>
  {/* PopoverTrigger and content here */}
  {dialogContent}
</Dialog>
```

### 11. Forms with Zod + react-hook-form

Every form follows the same structure: Zod schema, `useForm` with `zodResolver`, `handleFailure` wrapper on submit, shadcn Form components for fields. Key pattern:

```tsx
const formSchema = z.object({ name: z.string().min(4) });

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  const doThing = useMutation(api.some.mutation);

  return (
    <Form {...form}>
      <form onSubmit={handleFailure(form.handleSubmit(async ({ name }) => {
        await doThing({ name });
        form.reset();
      }))}>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
```

### 12. Layout Utility Components

`lib/utils.tsx` exports `se()` (styled element factory) and `fr()` (forward ref factory). Use `se()` to create typed layout primitives from HTML elements with default Tailwind classes:

```tsx
export const StickyHeader = se("header", "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur");
// Supports className merging: <StickyHeader className="px-4 py-2">...</StickyHeader>
```

### 13. Permission-Gated UI

Disable or hide UI based on permissions. Never rely on frontend checks alone -- backend enforces too.

```tsx
const permissions = useViewerPermissions();
if (permissions == null) return null;

<Card disabled={!permissions.has("Delete Team")}>
  <Button
    disabled={!permissions.has("Delete Team")}
    onClick={openDeleteTeamDialog}
    variant="destructive"
  >
    Delete Team
  </Button>
</Card>
```

### 14. Stale Data Pattern

For paginated queries, avoid flicker during refetch:

```tsx
const members = usePaginatedQuery(api.users.teams.members.list, ...);
const { value: { results, isLoading, status }, stale } = useStalePaginationValue(members);

<TableBody className={stale ? "animate-pulse" : ""}>
  {results.map(member => <TableRow key={member._id}>...</TableRow>)}
</TableBody>
```

### 15. Path Aliases

Always use `@/*` imports. Never use relative paths that traverse more than one level:

```tsx
import { api } from "@/convex/_generated/api";     // Convex generated API
import { Button } from "@/components/ui/button";    // shadcn components
import { cn } from "@/lib/utils";                   // Utility functions
import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks"; // App hooks
import { handleFailure } from "@/app/handleFailure"; // Error wrapper
```

## Quick Reference

| Task | Pattern |
|------|---------|
| New public page | `app/(marketing)/my-page/page.tsx` -- server component |
| New team-scoped page | `app/t/[teamSlug]/my-feature/page.tsx` -- client component with `useCurrentTeam()` |
| New settings sub-page | `app/t/[teamSlug]/settings/my-setting/page.tsx` + add NavLink in `SettingsMenu.tsx` |
| Add admin page | `app/admin/my-page/page.tsx` |
| Read team data | `useQuery(api.whatever, team == null ? "skip" : { teamId: team._id })` |
| Mutate with error handling | Wrap in `handleFailure()`, show toast on ConvexError |
| Check permissions | `useViewerPermissions()` returns `Set<Permission>` or null |
| Create a dialog | Hook pattern: `useMyDialog()` returns `[open, setOpen, content]` |
| Navigate after mutation | `router.push(\`/t/${teamSlug}/destination\`)` |
| Add nav link | Use the `NavLink` pattern with `relativeHref` and active detection |
| Show loading state | Null guard with `<Skeleton>` or return null |
| Add form | Zod schema + `useForm` + `zodResolver` + `handleFailure` wrapper |

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| Adding `"use client"` to a layout | Keep layouts as server components; push client boundary to child components | Layouts render the subtree; marking them client ships unnecessary JS |
| Putting providers in root layout | Providers go in `app/t/layout.tsx` only | Marketing pages should not load Clerk/Convex JS |
| Accessing `useQuery` data without null guard | Always check `== null` before rendering | Convex queries return `undefined` during loading |
| Writing try/catch in every form handler | Use `handleFailure()` wrapper | Consistent error-to-toast behavior, less boilerplate |
| Building team routes without `useCurrentTeam()` | Always use the hook, never parse params manually | The hook handles slug resolution, redirect on mismatch |
| Using `useEffect` for derived state | Compute it inline or with `useMemo` | Effects cause unnecessary re-renders |
| Navigating with hardcoded team slug | Always use `teamSlug` from `useParams()` or `useCurrentTeam()` | Slug changes when teams switch |
| Creating a Dialog component when it wraps a Popover | Use the dialog hook pattern | shadcn requires Dialog to wrap Popover, not be inside it |
| Fetching on the server in team-scoped pages | Use Convex client hooks (`useQuery`, `useMutation`) | Server fetches bypass the realtime subscription model |
| Relative imports traversing many levels | Use `@/` path aliases | Keeps imports clean, survives file moves |

## Exit Criteria

- [ ] Route is in the correct route group (`(marketing)`, `t/[teamSlug]`, `admin`, `auth`, `api`)
- [ ] `"use client"` is only added when hooks, events, or browser APIs are used
- [ ] All Convex query data has null guards before rendering
- [ ] Mutations are wrapped in `handleFailure()` or handle errors with toast
- [ ] Team-scoped pages use `useCurrentTeam()` for team context
- [ ] Permission-sensitive UI checks `useViewerPermissions()`
- [ ] Forms use Zod + react-hook-form + `handleFailure` pattern
- [ ] Navigation uses `@/` imports exclusively
- [ ] Loading states show Skeleton or return null (never crash on undefined)
- [ ] New settings pages are registered in the appropriate menu component

**Done when:** The page renders correctly during loading, with data, and with errors -- and team switching preserves the expected route.
