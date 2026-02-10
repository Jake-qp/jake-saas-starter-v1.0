# Design System Reference

> Load this file when making aesthetic decisions for a new project.

## Step 1: Choose Aesthetic Direction

Pick ONE and commit. Uncommitted middle ground looks generic.

| Direction | Feel | Visual Traits | Example Apps |
|-----------|------|---------------|--------------|
| **Minimal** | Clean, focused, no decoration | Monochrome + one accent, system fonts, generous whitespace | Linear, Vercel, Raycast |
| **Refined** | Elegant, spacious, considered | Muted palette, subtle shadows, refined typography | Stripe, Notion, Mercury |
| **Soft** | Warm, friendly, inviting | Rounded corners, warm colors, approachable fonts | Slack, Figma, Loom |
| **Industrial** | Functional, dense, efficient | Tight spacing, utilitarian type, data-forward | AWS Console, Bloomberg |
| **Bold** | Strong, memorable, assertive | High contrast, distinctive typography, confident color | Superhuman, Linear, Vercel |

### Domain Matching

| Domain | Recommended Direction | Why |
|--------|----------------------|-----|
| Developer tools | Minimal or Bold | Developers hate fluff, respect efficiency |
| B2B SaaS | Refined | Professional trust, clean information |
| Consumer app | Soft or Bold | Emotional connection, personality |
| Admin/operations | Industrial | Data density, power user efficiency |
| Property management | Refined | Professional, trustworthy |
| Construction/trades | Industrial or Bold | No-nonsense, high visibility |
| Finance/banking | Refined | Trust signals, premium feel |
| Creative tools | Soft or Bold | Personality expected, expression |
| Healthcare | Refined or Soft | Calming, trustworthy, accessible |
| E-commerce | Refined or Soft | Product focus, approachable |

---

## Step 2: Choose Primary Color

### Color by Direction

| Direction | Good Primary Colors | Avoid |
|-----------|---------------------|-------|
| Minimal | Slate, zinc, neutral, one bold accent | Saturated primaries |
| Refined | Emerald, deep blue, slate, muted tones | Bright/neon |
| Soft | Teal, coral, warm tones, muted colors | Harsh primaries |
| Industrial | Slate, gray, amber, muted orange | Pastels, soft colors |
| Bold | Vibrant blue, orange, purple, cyan | Muted, desaturated |

### Never Use

- **Default Tailwind blue (#3b82f6)** — Screams "AI-generated" or "developer template"
- **Pure black (#000000)** — Too harsh, use slate-900 or similar
- **Pure white text on bright colors** — Check contrast

### Adjusting Colors

| Want | Do This |
|------|---------|
| More sophisticated | Desaturate slightly |
| More premium | Darken slightly |
| More approachable | Add warmth (shift toward yellow/orange) |
| More technical | Add coolness (shift toward blue) |

### Example Palettes

**Property Management (Refined):**
```
Primary: #059669 (emerald-600) - Professional, trustworthy
Secondary: #64748b (slate-500) - Neutral, readable
Status: Standard emerald/amber/red
```

**Developer Tool (Minimal):**
```
Primary: #334155 (slate-700) - Understated, professional
Secondary: #52525b (zinc-600) - Nearly invisible
Accent: #06b6d4 (cyan-500) - Pops when needed
```

**Construction App (Industrial):**
```
Primary: #d97706 (amber-600) - Bold, high visibility
Secondary: #475569 (slate-600) - Readable
Accent: #0891b2 (cyan-600) - Contrast for CTAs
```

**Consumer Finance (Refined):**
```
Primary: #4f46e5 (indigo-600) - Trust, stability
Secondary: #64748b (slate-500) - Professional
Accent: #059669 (emerald-600) - Positive actions
```

---

## Step 3: Choose Typography

### Font Pairing by Direction

| Direction | Display Font | Body Font | Notes |
|-----------|--------------|-----------|-------|
| Minimal | System or Inter | Same | Invisible, content-focused |
| Refined | Satoshi, Geist, DM Sans | Inter, system | Modern SaaS aesthetic |
| Soft | Plus Jakarta Sans, Nunito | Inter, system | Friendly, approachable |
| Industrial | Barlow, Archivo, JetBrains Mono | Inter, Roboto | Sturdy, functional |
| Bold | Cabinet Grotesk, Clash Display | Inter | Distinctive headings |

### Typography Rules

1. **Maximum two fonts** — One display (headings), one body
2. **Consider loading cost** — System fonts are free, Google fonts add weight
3. **Match the domain** — Construction app shouldn't use delicate scripts
4. **Test at all sizes** — Some fonts look great big but bad small

### Font Sources

| Source | Best For | Cost |
|--------|----------|------|
| System fonts | Zero load time | Free |
| Google Fonts | Easy setup | Free |
| Fontshare | Quality free fonts | Free |
| Adobe Fonts | Premium options | Paid |

### Adding Custom Fonts

In `tailwind.config.ts`:
```typescript
fontFamily: {
  display: ['Satoshi', 'system-ui', 'sans-serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
}
```

In `globals.css` or layout:
```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
```

---

## Step 4: Choose Space Strategy

Pick ONE. Don't mix generous and dense.

| Strategy | When | Token Values | Feel |
|----------|------|--------------|------|
| **Generous** | Consumer apps, premium products | component-base: 1.25rem, section-sm: 3rem | Breathing room, luxurious |
| **Standard** | Most SaaS, balanced approach | component-base: 1rem, section-sm: 2rem | Professional, clean |
| **Dense** | Data tools, power users, admin | component-base: 0.75rem, section-sm: 1.5rem | Information-rich, efficient |

### Config Adjustment

```typescript
// Generous
spacing: {
  'component-base': '1.25rem',
  'component-lg': '2rem',
  'section-sm': '3rem',
  'section-md': '4rem',
}

// Dense
spacing: {
  'component-base': '0.75rem',
  'component-lg': '1rem',
  'section-sm': '1.5rem',
  'section-md': '2rem',
}
```

---

## Step 5: Choose One Memorable Thing

Every interface should have ONE distinctive element. Not five. One.

| Element | Best For | Example |
|---------|----------|---------|
| **Typography** | Content-heavy apps | Distinctive heading font |
| **Color accent** | Dashboards, data apps | Unexpected highlight color |
| **Signature interaction** | Interactive tools | Unique hover/transition |
| **Empty states** | Consumer apps | Delightful illustrations |
| **Micro-copy** | Community apps | Personality in text |
| **Data visualization** | Analytics, dashboards | Distinctive charts |

### Decision Helper

- Dashboard → Make data visualization distinctive
- Form-heavy app → Make the flow feel effortless
- Content-heavy → Make typography memorable
- Action-heavy → Make interactions satisfying
- Consumer → Add personality through copy or illustration

**Then commit to ONE choice.** The rest supports it.

---

## Step 6: Choose Icon Library

| Library | Install | Icons | Best For |
|---------|---------|-------|----------|
| **Lucide** | `npm i lucide-react` | 1000+ | Default choice, comprehensive |
| **Heroicons** | `npm i @heroicons/react` | 300+ | Tailwind-native teams |
| **Phosphor** | `npm i @phosphor-icons/react` | 1000+ | Distinctive, bold aesthetic |

### Decision Helper

- Default to **Lucide** (most comprehensive, tree-shakeable)
- Use **Heroicons** if already using Tailwind UI components
- Use **Phosphor** for bold/distinctive direction

---

## Context-Specific Patterns

### Dashboard / Admin Tool
- Data density over decoration
- Typography does the heavy lifting
- Subtle status colors (not rainbow)
- Functional, utilitarian feel
- Memorable thing: Information hierarchy or data viz

### Consumer App
- Emotional connection matters
- Warm, approachable feel
- Delightful micro-interactions
- Mobile-first always
- Memorable thing: Personality or micro-interactions

### B2B / Enterprise SaaS
- Professional, trustworthy
- Efficient, organized
- Consistent patterns
- Minimal learning curve
- Memorable thing: Polish and attention to detail

### Creative / Portfolio
- More freedom for expression
- Can break conventions intentionally
- Personality is expected
- Memorable thing: Layout or typography

### E-commerce
- Product imagery is hero
- Trust signals prominent
- Clear CTAs, minimal friction
- Memorable thing: Product presentation

---

## Anti-AI Aesthetic Checklist

Before finalizing design decisions, verify:

| Check | Pass Criteria |
|-------|---------------|
| Primary color | NOT default Tailwind blue (#3b82f6) |
| Color palette | Restrained (primary + neutrals + status), not rainbow |
| Gradients | None, or single subtle gradient with purpose |
| Typography | Intentional choice, not "Inter everywhere" |
| Shadows | Used for elevation only, not decoration |
| Memorable element | Can point to one distinctive thing |
| Consistency | Every element follows the same rules |

**The screenshot test:** Would someone post this as "AI slop"? If yes, revisit decisions.

---

## Quick Decision Summary

After loading this file, you should decide:

1. **Direction:** _________________ (Minimal/Refined/Soft/Industrial/Bold)
2. **Primary Color:** _________________ (hex value)
3. **Typography:** _________________ (display + body fonts)
4. **Space Strategy:** _________________ (Generous/Standard/Dense)
5. **Memorable Thing:** _________________ (what will users remember?)
6. **Icon Library:** _________________ (Lucide/Heroicons/Phosphor)

Then load TEMPLATES.md to implement these decisions.

---

## Border Radius by Direction

| Direction | Radius Value | Tailwind Token |
|-----------|--------------|----------------|
| Minimal | 4px | `brand: '0.25rem'` |
| Refined | 6px | `brand: '0.375rem'` |
| Soft | 8-12px | `brand: '0.5rem'` or `'0.75rem'` |
| Industrial | 2-4px | `brand: '0.125rem'` or `'0.25rem'` |
| Bold | 8px or 0px | `brand: '0.5rem'` or `'0'` |

---

## Shadow Intensity by Direction

| Direction | Shadow Style |
|-----------|--------------|
| Minimal | Very subtle or none (`elevation-1` only) |
| Refined | Soft, diffuse shadows (`elevation-2`) |
| Soft | Warm, gentle shadows (`elevation-2`) |
| Industrial | Minimal shadows, borders instead |
| Bold | Pronounced shadows or none (high contrast instead) |

---

## Recommended Libraries (Token Savers)

Use battle-tested libraries instead of building from scratch:

### Core UI (Always Use)

| Library | Purpose | Token Savings | Install |
|---------|---------|---------------|---------|
| **shadcn/ui** | Component library | 90%+ | `npx shadcn@latest init` |
| **Lucide** | Icons (shadcn default) | Included | `npm i lucide-react` |

### Forms & Validation

| Library | Purpose | Token Savings | Install |
|---------|---------|---------------|---------|
| **React Hook Form** | Form state management | 80% | `npm i react-hook-form` |
| **Zod** | Schema validation | 70% | `npm i zod @hookform/resolvers` |

### Data Display

| Library | Purpose | Token Savings | Install |
|---------|---------|---------------|---------|
| **TanStack Table** | Data tables | 95% | `npm i @tanstack/react-table` |
| **Recharts** | Charts/graphs | 90% | `npm i recharts` |
| **TanStack Query** | Data fetching | 80% | `npm i @tanstack/react-query` |

### Animation & UX

| Library | Purpose | Token Savings | Install |
|---------|---------|---------------|---------|
| **Framer Motion** | Animations | 70% | `npm i framer-motion` |
| **Sonner** | Toast notifications | 90% | `npx shadcn add sonner` |

### Utilities

| Library | Purpose | Token Savings | Install |
|---------|---------|---------------|---------|
| **date-fns** | Date formatting | 80% | `npm i date-fns` |
| **clsx + tailwind-merge** | Class merging | Already in shadcn | Included |

### Decision Helper

| Building | Use These |
|----------|-----------|
| Forms | shadcn/ui + React Hook Form + Zod |
| Dashboard | shadcn/ui + Recharts + TanStack Table |
| Data-heavy app | shadcn/ui + TanStack Table + TanStack Query |
| Consumer app | shadcn/ui + Framer Motion |

**Rule:** If a library exists and is well-maintained, use it. Custom code = tokens spent.

---

## shadcn Ecosystem (2025)

Beyond core shadcn/ui, these specialized libraries extend the ecosystem:

### Pre-Built Blocks & Templates

| Resource | Purpose | When to Use |
|----------|---------|-------------|
| **[shadcn/blocks](https://ui.shadcn.com/blocks)** | Pre-built page sections (dashboards, auth, settings) | Rapid prototyping |
| **[shadcn/charts](https://ui.shadcn.com/charts)** | Chart components built on Recharts | Data visualization |
| **[shadcn/themes](https://ui.shadcn.com/themes)** | Pre-made color themes | Quick theming |

### Specialized Component Libraries

| Library | Purpose | Best For |
|---------|---------|----------|
| **Motion Primitives** | Animation components for shadcn | Polish phase, micro-interactions |
| **Cult UI** | AI-powered full-stack components | Complex features with AI assistance |
| **TanCN** | TanStack integrations for shadcn | Data-heavy applications |
| **FormCN** | Advanced form patterns | Complex multi-step forms |

### Usage Pattern

```bash
# Start with core shadcn
npx shadcn@latest init
npx shadcn@latest add button card input

# Add blocks for rapid prototyping
npx shadcn@latest add dashboard-01  # Pre-built dashboard layout
npx shadcn@latest add login-01      # Pre-built auth form

# Add charts when needed
npx shadcn@latest add chart
```

### When to Use Ecosystem vs Custom

| Situation | Approach |
|-----------|----------|
| Standard UI patterns | Use shadcn blocks |
| Data tables | TanStack Table + shadcn table |
| Charts/graphs | shadcn/charts (Recharts) |
| Animations | Motion Primitives or Framer Motion |
| Unique brand experience | Customize shadcn CSS variables |
| Novel interaction | Build custom (rare) |

**Principle:** Exhaust the ecosystem before writing custom code.
