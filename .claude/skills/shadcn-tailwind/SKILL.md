---
name: shadcn-tailwind
description: Use when building UI components, styling, forms, or theming. Before adding any new UI elements.
---

# shadcn/ui + Tailwind CSS

## Overview

This project uses shadcn/ui (New York style) with Tailwind CSS, HSL-based CSS variables, and a set of project-specific utilities. Every UI decision should look like it belongs in Linear or Vercel's dashboard: restrained, intentional, with impeccable spacing. If it looks like a hackathon project, something went wrong.

## How Senior UI Engineers Think

**"Where does the eye go first?"** Every screen has a visual hierarchy. Primary actions get `variant="default"`, secondary actions get `variant="outline"` or `variant="ghost"`. If everything screams for attention, nothing gets it. One primary action per visible context.

**"Does every pixel earn its place?"** Padding, borders, shadows, colors --- each must justify its existence. The default state is nothing. Add visual weight only when it communicates meaning. An extra `border` or `shadow-sm` that does not guide the user is noise.

**"Would I pay for software that looks like this?"** The bar is commercial-quality SaaS. Not a tutorial. Not a prototype. Alignment is pixel-perfect. Spacing is consistent. States (hover, focus, disabled, loading) are all handled. Empty states exist.

### What Separates Amateurs from Professionals

Amateurs add. Professionals remove. When catching yourself reaching for an extra color, an extra border, an extra animation --- STOP. Ask whether the UI communicates more clearly without it. Nine times out of ten, it does.

Amateurs style inline. Professionals use the system. This project has a complete design token system via CSS variables. Every color, radius, and spacing value is intentional. Hardcoding `#3b82f6` or `rounded-lg` instead of `bg-primary` or `rounded-lg` (the token) breaks dark mode, breaks consistency, breaks trust.

## Project Configuration

### shadcn Setup (components.json)

| Setting | Value |
|---------|-------|
| Style | `new-york` |
| RSC | `true` |
| Base Color | `slate` |
| CSS Variables | `true` (HSL-based) |
| Component alias | `@/components` |
| Utils alias | `@/lib/utils` |

### Installing New Components

```bash
npx shadcn-ui@latest add <component>
```

NEVER hand-edit files in `components/ui/`. They are managed by the shadcn CLI. Customization belongs in wrapper components or via `className` props.

### 38 Installed Components

**Form & Input:** Button, Input, Textarea, Checkbox, Radio Group, Switch, Label, Form
**Display:** Card, Badge, Avatar, Alert, Separator, Skeleton, Table
**Navigation:** Tabs, Select, Dropdown Menu, Navigation Menu, Menubar, Accordion, Breadcrumb
**Overlays:** Dialog, Sheet, Alert Dialog, Popover, Hover Card, Command, Context Menu
**Feedback:** Toast/Toaster (`use-toast.ts`), Progress, Slider
**Utilities:** Aspect Ratio, Scroll Area, Tooltip, Toggle, Collapsible, Calendar

Before running `npx shadcn-ui@latest add`, check this list. The component may already exist.

## Design Tokens (CSS Variables)

All colors use HSL values without the `hsl()` wrapper. Tailwind config wraps them: `hsl(var(--primary))`.

```
Light Mode                          Dark Mode
--background: 0 0% 100%            --background: 240 10% 3.9%
--foreground: 240 10% 3.9%         --foreground: 0 0% 98%
--primary: 240 5.9% 10%            --primary: 0 0% 98%
--secondary: 240 4.8% 95.9%        --secondary: 240 3.7% 15.9%
--muted: 240 4.8% 95.9%            --muted: 240 3.7% 15.9%
--destructive: 0 84.2% 60.2%       --destructive: 0 62.8% 30.6%
--border: 240 5.9% 90%             --border: 240 3.7% 15.9%
--ring: 240 10% 3.9%               --ring: 240 4.9% 83.9%
--radius: 0.5rem                   --radius: 0.5rem
```

Dark mode uses `@media (prefers-color-scheme: dark)`. Colors auto-switch via CSS variables. No `dark:` prefix needed for token-based colors.

### Border Radius Tokens

```
rounded-lg  = var(--radius)              = 0.5rem
rounded-md  = calc(var(--radius) - 2px)  = ~0.375rem
rounded-sm  = calc(var(--radius) - 4px)  = ~0.25rem
```

### Global Base Styles

```css
* { @apply border-border; }
body { @apply bg-background text-foreground min-h-full; }
```

Every element inherits `border-border` so bare `border` utilities get the correct color automatically.

## Core Utilities

### cn() --- Class Merging (MANDATORY)

```typescript
import { cn } from "@/lib/utils";
cn("px-4 py-2", isActive && "bg-primary", className)
```

ALWAYS use `cn()` for conditional or merged classes. Never concatenate strings. `cn()` uses `clsx` + `tailwind-merge`, so conflicting utilities resolve correctly: `cn("px-4", "px-6")` produces `px-6`, not `px-4 px-6`.

### se() --- Styled Element Factory

Creates pre-styled HTML elements. Use for layout primitives that appear repeatedly.

```typescript
import { se } from "@/lib/utils";

// Existing project examples:
export const StickyHeader = se("header",
  "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur");
export const StickyFooter = se("footer",
  "sticky bottom-0 z-50 w-full border-t bg-background/80 backdrop-blur");
export const Footer = se("footer", "border-t");
export const Paragraph = se("p", "leading-7 [&:not(:first-child)]:mt-6");
export const Code = se<HTMLElement>("code",
  "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold");
```

The `className` prop on the returned component merges with the base classes via `cn()`. Use `se()` instead of creating a full React component when you just need a styled HTML element.

### fr() --- Forward Ref Factory

```typescript
import { fr } from "@/lib/utils";
export const MyComponent = fr<HTMLDivElement, Props>(
  function MyComponent({ className, ...props }, ref) {
    return <div ref={ref} className={cn("base-classes", className)} {...props} />;
  }
);
```

Automatically sets `displayName` from the function name.

## Form Pattern (react-hook-form + Zod + shadcn Form)

This is the canonical form pattern. Every form in this project follows this structure.

```tsx
import { handleFailure } from "@/app/handleFailure";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
});

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleFailure(
          form.handleSubmit(async ({ email }) => {
            await someMutation({ email });
            form.reset();
            toast({ title: "Success." });
          })
        )}
        className="flex flex-col sm:flex-row gap-6 sm:items-end"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jane@doe.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Key Details

- **`handleFailure()`** wraps the submit handler. It catches errors (including `ConvexError`) and shows a destructive toast. Located at `@/app/handleFailure`.
- **Zod schema** is defined outside the component. Use `zid("tableName")` from `convex-helpers/server/zod` for Convex ID fields.
- **`form.reset()`** after successful mutation.
- **`toast()`** for success feedback. Import from `@/components/ui/use-toast`.

## Button Variants

```tsx
<Button variant="default">Primary Action</Button>      // Near-black bg, white text
<Button variant="destructive">Delete</Button>           // Red bg
<Button variant="outline">Cancel</Button>               // Border only, transparent bg
<Button variant="secondary">Secondary</Button>          // Light gray bg
<Button variant="ghost">Ghost</Button>                  // No bg, hover reveals
<Button variant="link">Link</Button>                    // Underline on hover

<Button size="sm">Small</Button>                        // h-8, text-xs
<Button size="default">Default</Button>                 // h-9
<Button size="lg">Large</Button>                        // h-10
<Button size="icon"><PlusIcon /></Button>                // h-9 w-9, square
```

**Conventions:**
- One primary button per visible context
- Destructive actions always get a confirmation dialog first
- Icon buttons use `size="icon"`, icons inside regular buttons get `className="mr-2 h-4 w-4"`

## Toast Pattern

```tsx
import { toast } from "@/components/ui/use-toast";

// Success
toast({ title: "Member invite created." });

// Error (typically handled by handleFailure, but manual usage:)
toast({ title: "Something went wrong.", variant: "destructive" });

// With description
toast({ title: "Saved", description: "Your changes have been saved." });
```

The `<Toaster />` component is mounted in the root layout. Do not mount it again.

## Dialog Pattern

```tsx
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create team</DialogTitle>
      <DialogDescription>Add a new team.</DialogDescription>
    </DialogHeader>
    <div className="flex flex-col gap-4 py-2">
      {/* form fields */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button type="submit">Continue</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Nesting overlays:** When a Dialog wraps a Popover (e.g., team switcher with "create new"), the Dialog must be the outer element. See the `useCreateTeamDialog` hook pattern in `app/t/CreateTeamDialog.tsx`.

## Card + Permission Pattern

Gated UI follows this pattern --- the entire card disables when the user lacks permission:

```tsx
const hasPermission = permissions.has("Manage Members");

<Card disabled={!hasPermission}>
  <CardHeader>
    <CardTitle>Add member</CardTitle>
    <CardDescription>Add a member to your team.</CardDescription>
  </CardHeader>
  <CardContent>
    <Input disabled={!hasPermission} {...field} />
    <Button disabled={!hasPermission} type="submit">Add</Button>
  </CardContent>
</Card>
```

Propagate `disabled` to every interactive child. Do not hide controls --- disable them so users understand what they cannot do.

## Icon Pattern

Use `@radix-ui/react-icons` exclusively. Do not introduce Lucide, Heroicons, or other icon libraries.

```tsx
import { PlusIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

// Inside a button
<Button><PlusIcon className="mr-2 h-4 w-4" /> Add</Button>

// Icon-only button
<Button size="icon" variant="ghost"><Cross2Icon className="h-4 w-4" /></Button>

// Conditional visibility
<CheckIcon className={cn("ml-auto h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
```

Standard icon sizes: `h-4 w-4` (default), `h-5 w-5` (emphasis).

## Responsive Patterns

```tsx
// Stack on mobile, row on desktop
className="flex flex-col sm:flex-row"

// Single column to grid
className="grid md:grid-cols-3 gap-6"

// Hide on mobile
className="hidden sm:block"

// Responsive widths
className="w-3/4 sm:max-w-sm"

// Responsive spacing
className="p-4 sm:p-6"

// Responsive alignment
className="gap-6 sm:items-end"
```

Mobile-first always. Start with the mobile layout, add breakpoints for larger screens.

## Accessibility Checklist

Every interactive component must:

```tsx
// Combobox pattern
role="combobox" aria-expanded={open} aria-label="Select a team"

// Screen reader text
<span className="sr-only">Close</span>

// Focus management
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring

// Disabled state (all three)
disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
```

shadcn components handle most accessibility out of the box. Do not strip `aria-*` attributes or `role` props when composing.

## Animation Patterns

The project uses `tailwindcss-animate` plugin. Defined keyframes: `accordion-down`, `accordion-up`, `fade-in`.

```tsx
// Radix state-driven animations (used by shadcn overlays)
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
data-[side=bottom]:slide-in-from-top-2
```

Do not add custom animations without a clear UX purpose. Gratuitous animation is worse than none.

## Quick Reference

### Common Component Combos

| Pattern | Components | Layout |
|---------|-----------|--------|
| Settings form | Card + Form + Input + Button | `flex flex-col gap-4` inside CardContent |
| Confirmation | AlertDialog + Button(destructive) | AlertDialogAction + AlertDialogCancel |
| Data table | Table + DropdownMenu (row actions) | Button(ghost, icon) trigger |
| Combobox | Popover + Command + CommandInput + CommandItem | `role="combobox"` on trigger |
| Team switcher | Dialog (outer) + Popover (inner) + Command | Dialog wraps Popover |
| Settings page | Tabs + Card per section | TabsContent holds Cards |
| Empty state | Card + centered text + Button(outline) | `flex flex-col items-center gap-4 py-8` |
| Loading state | Skeleton matching final layout shape | Same dimensions as real content |

### Spacing Scale (Most Used)

| Token | Value | Use For |
|-------|-------|---------|
| `gap-2` | 0.5rem | Tight: label to input, icon groups |
| `gap-4` | 1rem | Standard: form fields, card sections |
| `gap-6` | 1.5rem | Generous: card to card, major sections |
| `p-4` | 1rem | Card content, compact containers |
| `p-6` | 1.5rem | Page sections, spacious containers |
| `py-2` | 0.5rem | Vertical breathing room inside dialogs |

### Color Semantics

| Token | Meaning | Use For |
|-------|---------|---------|
| `primary` | Core brand action | Primary buttons, active states |
| `secondary` | Supporting action | Secondary buttons, subtle backgrounds |
| `destructive` | Danger / error | Delete buttons, error messages, error toasts |
| `muted` | De-emphasized | Descriptions, placeholder text, disabled bg |
| `accent` | Hover / active bg | Menu item hover, active tab background |
| `card` | Surface elevation | Card backgrounds |
| `popover` | Overlay surface | Dropdown, popover, dialog backgrounds |

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| Editing `components/ui/*.tsx` directly | Use `className` prop or wrapper component | shadcn CLI overwrites on update |
| `"px-4 " + (active ? "bg-primary" : "")` | `cn("px-4", active && "bg-primary")` | String concatenation breaks merge logic |
| `bg-blue-500` or `text-[#333]` | `bg-primary` or `text-foreground` | Hardcoded colors break dark mode and theming |
| `import { Plus } from "lucide-react"` | `import { PlusIcon } from "@radix-ui/react-icons"` | Project uses Radix icons exclusively |
| Adding `<Toaster />` in a page component | It is already in root layout | Duplicate toasters cause double notifications |
| `dark:bg-slate-900` on every element | Use semantic tokens (`bg-background`) | CSS variables handle dark mode automatically |
| Hiding controls when user lacks permission | Disable them with `disabled` prop | Users should see what exists, not wonder |
| Form without `handleFailure()` wrapper | Always wrap `form.handleSubmit` with `handleFailure()` | Unhandled Convex errors crash silently |
| Custom loading spinner component | `<Skeleton />` matching content shape | Skeletons prevent layout shift |
| Adding shadows for "depth" | Use borders (`border`, `border-b`) | New York style is flat; shadows are rare |

## Exit Criteria

- [ ] All colors use semantic tokens (`bg-primary`, `text-muted-foreground`), never raw values
- [ ] `cn()` used for all class merging, no string concatenation
- [ ] Forms follow the react-hook-form + Zod + handleFailure pattern
- [ ] Icons are from `@radix-ui/react-icons`, not Lucide or others
- [ ] Interactive elements handle all states: default, hover, focus-visible, disabled
- [ ] Responsive: works at `sm` (640px) and up, mobile-first classes
- [ ] No files in `components/ui/` were hand-edited
- [ ] Toast used for success/error feedback, not `alert()` or `console.log`
- [ ] Permission-gated UI disables (not hides) controls
- [ ] Dark mode works via CSS variables without `dark:` overrides on token colors

**Done when:** The UI is indistinguishable from a commercial SaaS product. Every component uses the design system. Every interaction has feedback. Every state is handled.
