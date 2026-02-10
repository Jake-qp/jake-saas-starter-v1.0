# Design System Templates (shadcn/ui)

> Load this file when customizing shadcn themes or setting up a new project.

## Setup Checklist

```bash
# 1. Initialize shadcn (interactive - choose style, color, CSS variables)
npx shadcn@latest init

# 2. Add core components
npx shadcn@latest add button card badge input label

# 3. Customize theme (see CSS Variables below)
# Edit: src/app/globals.css (or styles/globals.css)

# 4. Add more components as needed
npx shadcn@latest add dialog dropdown-menu avatar tabs toast form

# 5. Create DESIGN-SYSTEM.md
```

---

## CSS Variable Customization

shadcn uses CSS variables for theming. After `init`, customize these in your `globals.css`:

### Theme by Aesthetic Direction

#### Minimal (Linear, Vercel style)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 220 14% 28%;        /* Slate-700 - understated */
    --primary-foreground: 0 0% 100%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 220 14% 28%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --accent: 187 94% 43%;         /* Cyan accent for pop */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 14% 90%;
    --input: 220 14% 90%;
    --ring: 220 14% 28%;
    --radius: 0.25rem;             /* Sharp corners */
  }
}
```

#### Refined (Stripe, Notion style)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47% 11%;
    --primary: 160 84% 39%;        /* Emerald-600 - professional */
    --primary-foreground: 0 0% 100%;
    --secondary: 215 16% 47%;
    --secondary-foreground: 0 0% 100%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47% 11%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 160 84% 39%;
    --radius: 0.375rem;            /* Subtle rounding */
  }
}
```

#### Soft (Slack, Figma style)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71% 4%;
    --card: 0 0% 100%;
    --card-foreground: 224 71% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71% 4%;
    --primary: 173 80% 40%;        /* Teal - warm, friendly */
    --primary-foreground: 0 0% 100%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 224 71% 4%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --accent: 12 76% 61%;          /* Coral accent */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 173 80% 40%;
    --radius: 0.5rem;              /* Rounded corners */
  }
}
```

#### Industrial (Data tools, Admin)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71% 4%;
    --card: 0 0% 100%;
    --card-foreground: 224 71% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71% 4%;
    --primary: 37 91% 55%;         /* Amber - high visibility */
    --primary-foreground: 224 71% 4%;
    --secondary: 215 25% 27%;
    --secondary-foreground: 0 0% 100%;
    --muted: 220 14% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 199 89% 48%;         /* Cyan for contrast */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 87%;
    --input: 220 13% 87%;
    --ring: 37 91% 55%;
    --radius: 0.125rem;            /* Nearly square */
  }
}
```

#### Bold (Superhuman style)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71% 4%;
    --card: 0 0% 100%;
    --card-foreground: 224 71% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71% 4%;
    --primary: 239 84% 67%;        /* Indigo - bold, confident */
    --primary-foreground: 0 0% 100%;
    --secondary: 215 25% 27%;
    --secondary-foreground: 0 0% 100%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --accent: 24 95% 53%;          /* Orange accent */
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 239 84% 67%;
    --radius: 0.5rem;              /* or 0 for sharp */
  }
}
```

---

## Dark Mode Support

shadcn includes dark mode by default. Customize `.dark` class:

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 160 84% 39%;          /* Keep brand consistent */
  --primary-foreground: 0 0% 100%;
  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 63% 31%;
  --destructive-foreground: 210 40% 98%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
  --ring: 160 84% 39%;
}
```

---

## Color Conversion Helper

shadcn uses HSL format. Convert hex colors:

| Brand Color | Hex | HSL (for CSS var) |
|-------------|-----|-------------------|
| Emerald-600 | #059669 | `160 84% 39%` |
| Indigo-600 | #4f46e5 | `239 84% 67%` |
| Amber-600 | #d97706 | `37 91% 55%` |
| Cyan-500 | #06b6d4 | `187 94% 43%` |
| Slate-700 | #334155 | `220 14% 28%` |
| Rose-600 | #e11d48 | `347 77% 50%` |

**Quick conversion:** Use browser devtools or https://www.rapidtables.com/convert/color/hex-to-hsl.html

---

## Adding Custom Semantic Tokens

Extend shadcn's tokens for status colors:

```css
@layer base {
  :root {
    /* ... existing shadcn vars ... */

    /* Status colors */
    --success: 160 84% 39%;
    --success-foreground: 0 0% 100%;
    --warning: 37 91% 55%;
    --warning-foreground: 224 71% 4%;
    --info: 199 89% 48%;
    --info-foreground: 0 0% 100%;
  }
}
```

Then add to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      success: "hsl(var(--success))",
      "success-foreground": "hsl(var(--success-foreground))",
      warning: "hsl(var(--warning))",
      "warning-foreground": "hsl(var(--warning-foreground))",
      info: "hsl(var(--info))",
      "info-foreground": "hsl(var(--info-foreground))",
    },
  },
},
```

---

## Component Patterns

### Form with Validation (React Hook Form + Zod)

```bash
npx shadcn@latest add form input label
npm install react-hook-form @hookform/resolvers zod
```

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

export function MyForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Data Table

```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```

See shadcn docs: https://ui.shadcn.com/docs/components/data-table

### Toast Notifications

```bash
npx shadcn@latest add toast   # or 'sonner' for simpler API
```

```tsx
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { toast } = useToast()

  return (
    <Button onClick={() => toast({ title: "Success!", description: "Item saved." })}>
      Save
    </Button>
  )
}
```

---

## DESIGN-SYSTEM.md Template

Create in project root after setup:

```markdown
# Design System

## Overview

Built with [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS.

**Aesthetic Direction:** [Minimal / Refined / Soft / Industrial / Bold]
**Primary Color:** [Color name and HSL]
**Border Radius:** [--radius value]

## Theme Customization

Theme variables are in `src/app/globals.css`. Key customizations:

| Variable | Value | Purpose |
|----------|-------|---------|
| --primary | `160 84% 39%` | Brand actions |
| --radius | `0.375rem` | Corner rounding |
| --ring | `160 84% 39%` | Focus rings |

## Components

Installed via `npx shadcn@latest add [component]`:

| Component | Location | Usage |
|-----------|----------|-------|
| Button | `@/components/ui/button` | All actions |
| Card | `@/components/ui/card` | Content containers |
| Input | `@/components/ui/input` | Text entry |
| [etc.] | | |

## Icons

Using: lucide-react (shadcn default)

## Adding Components

```bash
npx shadcn@latest add [component-name]
```

## Customizing Components

Components are in `src/components/ui/`. Edit directly - you own the code.

## Page Rules

1. Import from `@/components/ui/*`
2. Use semantic colors (`bg-primary`, `text-muted-foreground`)
3. NO raw Tailwind colors (`bg-emerald-600`)
4. NO inline styles
```

---

## Recommended Libraries

| Need | Library | Install |
|------|---------|---------|
| Forms | React Hook Form + Zod | `npm i react-hook-form @hookform/resolvers zod` |
| Tables | TanStack Table | `npm i @tanstack/react-table` |
| Charts | Recharts | `npm i recharts` |
| Animations | Framer Motion | `npm i framer-motion` |
| Dates | date-fns | `npm i date-fns` |
| Icons | Lucide (default) | Already included |

---

## Quick Component Reference

| Need | Command |
|------|---------|
| Login form | `npx shadcn add button input label form` |
| Dashboard | `npx shadcn add card badge avatar dropdown-menu` |
| Settings | `npx shadcn add tabs switch select checkbox` |
| Data view | `npx shadcn add table badge skeleton` |
| Modals | `npx shadcn add dialog alert-dialog sheet` |
| Navigation | `npx shadcn add navigation-menu breadcrumb` |
| Feedback | `npx shadcn add toast progress skeleton` |
