---
name: ui
description: Use when creating visual interfaces. Uses shadcn/ui for 90%+ token savings.
---

# UI Skill

## Professional Mindset

Three questions before any design decision:

**"Where does the eye go first?"**
One element dominates each screen. Everything else supports it or gets removed. If everything is important, nothing is.

**"Would someone pay for this?"**
Free tools look free. Products people pay for feel crafted—considered spacing, intentional hierarchy, polish in details. If it looks like a hackathon project, it fails.

**"Build the rules, then follow them."**
Individual components don't matter—the system does. If your button can be any color, it will eventually be every color. Constraints prevent chaos.

### Amateur vs Professional

| Amateur | Professional |
|---------|--------------|
| Styles individual elements | Builds systems that enforce consistency |
| Adds until it looks complete | Removes until only essential remains |
| Adds decoration to fix problems | Fixes underlying hierarchy |
| Reinvents components every time | Uses battle-tested libraries |

---

## The Three-Layer Architecture

This is non-negotiable. Design consistency is **architecturally enforced**, not documented.

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: SOURCE OF TRUTH — tailwind.config.ts + CSS vars   │
│  Semantic tokens: colors, spacing, typography, radius       │
│  ONE change here → entire app updates                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: COMPONENTS — shadcn/ui + src/components/ui/*      │
│  Battle-tested, accessible, customizable                    │
│  Use shadcn CLI to add, customize via CSS variables         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: CONSUMPTION — Pages                               │
│  Import components ONLY                                     │
│  NO raw color classes, NO inline styles                     │
│  Layout utilities (flex, grid, gap) are OK                  │
└─────────────────────────────────────────────────────────────┘
```

**The test:** Can you change the brand color by editing ONE CSS variable? If not, architecture is wrong.

---

## Process

### For New React/Next.js Projects (Default)

```bash
# Step 1: Load reference for aesthetic decisions
cat .claude/skills/ui/REFERENCE.md

# Step 2: Make aesthetic decisions (BEFORE touching code)
# - Direction (Minimal/Refined/Soft/Industrial/Bold)
# - Primary color (NEVER default Tailwind blue)
# - Typography (max 2 fonts)
# - Space strategy (generous OR dense)

# Step 3: Initialize shadcn
npx shadcn@latest init

# Step 4: Add core components (ONE command)
npx shadcn@latest add button card badge input label

# Step 5: Customize semantic tokens
# Load templates for CSS variable customization
cat .claude/skills/ui/TEMPLATES.md

# Step 6: Add more components as needed
npx shadcn@latest add dialog dropdown-menu avatar tabs toast

# Step 7: Verify (see Exit Criteria)
```

### For Existing Projects

```bash
# Step 1: Check if shadcn is already configured
cat components.json 2>/dev/null

# Step 2: If configured, use existing patterns
npx shadcn@latest add [component-name]

# Step 3: If not configured, read existing system
cat tailwind.config.ts
ls src/components/ui/
```

### For Non-React Projects

```bash
# Fall back to manual component creation
# Load legacy templates
cat .claude/skills/ui/TEMPLATES-LEGACY.md
```

---

## shadcn/ui Quick Reference

### Core Commands

```bash
# Initialize (first time only)
npx shadcn@latest init

# Add single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button card badge input label dialog

# Add ALL components (rarely needed)
npx shadcn@latest add --all

# Overwrite existing component
npx shadcn@latest add button --overwrite
```

### Essential Components by Feature Type

| Feature | Components to Add |
|---------|-------------------|
| Forms | `button input label form select textarea checkbox radio-group switch` |
| Data display | `card badge table avatar separator` |
| Navigation | `navigation-menu tabs breadcrumb dropdown-menu` |
| Feedback | `dialog alert-dialog toast sonner progress skeleton` |
| Layout | `sheet accordion collapsible scroll-area` |
| Data entry | `calendar date-picker combobox command` |

### Component Quality

shadcn components are:
- **Accessible** (ARIA patterns, keyboard navigation)
- **Typed** (Full TypeScript support)
- **Customizable** (Source code in your project)
- **Unstyled base** (Built on Radix UI primitives)

---

## Icon System

### Rules (Non-Negotiable)

1. **Pick ONE library** — Lucide (default with shadcn), Heroicons, or Phosphor
2. **Use consistent sizing** — shadcn uses `h-4 w-4` as default
3. **NEVER inline SVG** — Always use library components
4. **NEVER mix libraries** — One library per project

### With shadcn (Lucide)

```tsx
import { Plus, Check, X, Loader2 } from "lucide-react"

// In buttons (shadcn pattern)
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Saving...
</Button>
```

---

## Page Rules

### Allowed in Pages

- Imported shadcn components (`<Button>`, `<Card>`, `<Input>`)
- Layout utilities (`flex`, `grid`, `w-full`, `gap-4`)
- Semantic colors via CSS variables (`bg-primary`, `text-muted-foreground`)

### Forbidden in Pages

- Raw Tailwind color classes (`bg-emerald-600`, `text-gray-500`)
- Inline styles (`style={{ color: '#059669' }}`)
- One-off styled elements that should be components
- Hardcoded SVG icons

### Example

```tsx
// ✅ CORRECT (shadcn pattern)
<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Item
    </Button>
  </CardContent>
</Card>

// ❌ WRONG
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
  <button className="bg-emerald-600 px-4 py-2">
    <svg>...</svg>
    Add Item
  </button>
</div>
```

---

## Anti-AI Aesthetic

Avoid these tells that scream "AI-generated":

| AI Cliche | Professional Choice |
|-----------|---------------------|
| Default shadcn zinc theme | Customize CSS variables to match brand |
| Using every component | Only add what you need |
| No color customization | Set primary color to brand |
| Generic gray everything | Intentional color choices |
| Shadows on everything | Shadows for elevation only |

**The test:** Would someone screenshot this and post "AI slop"? If yes, customize the theme.

---

## Exit Criteria

### Design System Complete When:

- [ ] `npx shadcn@latest init` completed successfully
- [ ] CSS variables customized in `globals.css` (primary color, radius, etc.)
- [ ] Core components added (button, card, input, label at minimum)
- [ ] Icon library confirmed (lucide-react is shadcn default)
- [ ] DESIGN-SYSTEM.md documents customizations
- [ ] No raw color classes in pages
- [ ] Passes "would I pay for this?" test
- [ ] Has one memorable design element (color, typography, etc.)

### Quick Verification

```bash
# Verify shadcn setup
cat components.json && echo "✓ shadcn configured"
ls components/ui/button.tsx && echo "✓ Components installed"
grep -q "primary:" globals.css && echo "✓ Theme customized"
ls DESIGN-SYSTEM.md && echo "✓ Docs exist"
```

---

## When to Load More

| Need | Action |
|------|--------|
| Choosing aesthetic direction | `cat .claude/skills/ui/REFERENCE.md` |
| Customizing shadcn theme | `cat .claude/skills/ui/TEMPLATES.md` |
| Non-React project | `cat .claude/skills/ui/TEMPLATES-LEGACY.md` |
| Color/typography decisions | `cat .claude/skills/ui/REFERENCE.md` |

---

## Token Savings

| Task | Old Approach | New Approach | Savings |
|------|--------------|--------------|---------|
| Add Button | Write 80 lines | `npx shadcn add button` | 95% |
| Add Card | Write 70 lines | `npx shadcn add card` | 95% |
| Add Form | Write 200+ lines | `npx shadcn add form input label` | 90% |
| Full setup | Write 500+ lines | Init + add 5 components | 90% |

**Focus tokens on business logic, not UI primitives.**
