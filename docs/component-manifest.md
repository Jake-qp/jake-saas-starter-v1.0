# Component Manifest

Machine-readable reference for all UI components. AI agents: consult this when choosing components.

## shadcn/ui Primitives (`@/components/ui/`)

DO NOT edit these files directly. Add new ones via `npx shadcn@latest add <component>`.

| Component | File | Key Variants | Notes |
|-----------|------|-------------|-------|
| Accordion | `accordion.tsx` | — | Collapsible content sections |
| Alert | `alert.tsx` | `default`, `destructive` | Status messages |
| AlertDialog | `alert-dialog.tsx` | — | Confirmation dialogs |
| AspectRatio | `aspect-ratio.tsx` | — | Constrained media containers |
| Avatar | `avatar.tsx` | — | User/team profile images |
| Badge | `badge.tsx` | `default`, `secondary`, `destructive`, `outline` | Labels and tags |
| Breadcrumb | `breadcrumb.tsx` | — | Navigation breadcrumbs |
| Button | `button.tsx` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` / `default`, `sm`, `lg`, `icon` | All interactive actions |
| Calendar | `calendar.tsx` | — | Date picker calendar |
| Card | `card.tsx` | — | Content containers (Header, Title, Description, Content, Footer) |
| Carousel | `carousel.tsx` | — | Horizontal content slider |
| Checkbox | `checkbox.tsx` | — | Boolean inputs |
| Collapsible | `collapsible.tsx` | — | Show/hide content |
| Command | `command.tsx` | — | Command palette / search |
| ContextMenu | `context-menu.tsx` | — | Right-click menus |
| Dialog | `dialog.tsx` | — | Modal dialogs |
| Drawer | `drawer.tsx` | — | Mobile-friendly bottom sheets |
| DropdownMenu | `dropdown-menu.tsx` | — | Action menus |
| Form | `form.tsx` | — | react-hook-form + zod integration |
| HoverCard | `hover-card.tsx` | — | Hover-triggered popups |
| Input | `input.tsx` | — | Text inputs |
| InputOTP | `input-otp.tsx` | — | OTP/verification code inputs |
| Label | `label.tsx` | — | Form labels |
| Menubar | `menubar.tsx` | — | Application menu bars |
| NavigationMenu | `navigation-menu.tsx` | — | Top-level navigation |
| Pagination | `pagination.tsx` | — | Page navigation controls |
| Popover | `popover.tsx` | — | Click-triggered popups |
| Progress | `progress.tsx` | — | Progress bars |
| RadioGroup | `radio-group.tsx` | — | Single-select options |
| Resizable | `resizable.tsx` | — | Resizable panel layouts |
| ScrollArea | `scroll-area.tsx` | — | Custom scrollbars |
| Select | `select.tsx` | — | Dropdown selects |
| Separator | `separator.tsx` | — | Visual dividers |
| Sheet | `sheet.tsx` | `top`, `right`, `bottom`, `left` | Slide-out panels |
| Skeleton | `skeleton.tsx` | — | Loading placeholders |
| Slider | `slider.tsx` | — | Range inputs |
| Sonner | `sonner.tsx` | — | Modern toast notifications |
| Switch | `switch.tsx` | — | Toggle switches |
| Table | `table.tsx` | — | Raw table primitives (prefer DataTable) |
| Tabs | `tabs.tsx` | — | Tabbed content |
| Textarea | `textarea.tsx` | — | Multiline text inputs |
| Toast | `toast.tsx` | — | Legacy toast (prefer Sonner) |
| Toggle | `toggle.tsx` | `default`, `outline` / `default`, `sm`, `lg` | Toggle buttons |
| ToggleGroup | `toggle-group.tsx` | `default`, `outline` / `default`, `sm`, `lg` | Grouped toggles |
| Tooltip | `tooltip.tsx` | — | Hover tips |

## App-Level Components (`@/components/`)

These are project-specific compositions. Edit freely. Import via barrel: `import { X } from "@/components"`.

### ThemeToggle

- **File:** `components/ThemeToggle.tsx`
- **Client component:** Yes
- **Props:** `className?`
- **Composes:** DropdownMenu, Button, useTheme()
- **Usage:** Dark/light/system theme switcher. Renders skeleton during SSR.

### PageHeader

- **File:** `components/PageHeader.tsx`
- **Client component:** No (server)
- **Props:** `title`, `description?`, `breadcrumbs?: { label, href? }[]`, `actions?: ReactNode`, `className?`
- **Composes:** Breadcrumb
- **Usage:** All page-level headers. Never use inline `<h1>`.

### DataTable

- **File:** `components/DataTable.tsx`
- **Client component:** Yes
- **Props:** `columns: ColumnDef[]`, `data: TData[]`, `searchKey?`, `searchPlaceholder?`, `pagination?`, `pageSize?`, `className?`
- **Composes:** @tanstack/react-table, Table, Input, Button
- **Usage:** All tabular data with sort/filter/paginate. Generic `<TData, TValue>`.

### EmptyState

- **File:** `components/EmptyState.tsx`
- **Client component:** No (server)
- **Props:** `icon?: ReactNode`, `title`, `description?`, `action?: ReactNode`, `className?`
- **Composes:** None (semantic HTML)
- **Usage:** All empty/zero states. Centered layout with dashed border.

### StatusBadge

- **File:** `components/StatusBadge.tsx`
- **Client component:** No (server)
- **Props:** `status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive' | 'pending'`, `label?`, `className?`
- **Composes:** Badge, CVA
- **Usage:** Subscription and general status indicators. Maps to semantic color tokens.

### PricingCard

- **File:** `components/PricingCard.tsx`
- **Client component:** No (server)
- **Props:** `name`, `price`, `description?`, `features: string[]`, `highlighted?`, `cta?: ReactNode`, `className?`
- **Composes:** Card, CheckIcon
- **Usage:** Plan comparison sections. Use `highlighted` for recommended plan.

### UsageMeter

- **File:** `components/UsageMeter.tsx`
- **Client component:** Yes
- **Props:** `current`, `limit`, `label?`, `unit?`, `className?`
- **Composes:** Progress
- **Usage:** Usage/quota displays. Color thresholds: green (<70%), yellow (70-90%), red (>90%).

### StepWizard

- **File:** `components/StepWizard.tsx`
- **Client component:** Yes
- **Props:** `steps: { label, description? }[]`, `currentStep`, `onStepChange?`, `children`, `className?`
- **Composes:** CheckIcon
- **Usage:** Multi-step flows. 0-indexed steps. Completed steps are clickable.

## Layout Components (`@/components/layout/`)

| Component | File | Notes |
|-----------|------|-------|
| StickyHeader | `layout/sticky-header.tsx` | Sticky top header with blur backdrop |
