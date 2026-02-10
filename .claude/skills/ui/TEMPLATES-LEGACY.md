# Design System Templates

> Load this file when setting up a new project or creating new components.

## Setup Checklist

```bash
# 1. Install dependencies
npm install clsx tailwind-merge lucide-react

# 2. Create files in this order:
# - src/lib/utils.ts
# - tailwind.config.ts
# - src/components/ui/Icon.tsx
# - src/components/ui/Button.tsx
# - src/components/ui/Card.tsx
# - src/components/ui/Badge.tsx
# - src/components/ui/Input.tsx
# - DESIGN-SYSTEM.md
```

---

## Utility Function (Required First)

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Tailwind Config Template

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color
        // CHANGE THIS: Pick from REFERENCE.md based on your direction
        primary: {
          DEFAULT: '#059669',      // Main brand action
          hover: '#047857',        // Hover state
          light: '#d1fae5',        // Backgrounds, highlights
          dark: '#065f46',         // Text on light primary bg
        },

        // Secondary/neutral actions
        secondary: {
          DEFAULT: '#6b7280',
          hover: '#4b5563',
          light: '#f3f4f6',
        },

        // Text colors
        foreground: {
          DEFAULT: '#0f172a',      // Primary text
          muted: '#64748b',        // Secondary text
          inverted: '#ffffff',     // Text on dark backgrounds
        },

        // Backgrounds
        background: {
          DEFAULT: '#ffffff',
          subtle: '#f8fafc',       // Alternating sections
          muted: '#f1f5f9',        // Disabled, inactive
        },

        // Surfaces (cards, modals, popovers)
        surface: {
          DEFAULT: '#ffffff',
          raised: '#ffffff',
          overlay: '#ffffff',
        },

        // Borders
        border: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },

        // Status colors (semantic - rarely change with brand)
        status: {
          success: '#059669',
          'success-light': '#d1fae5',
          warning: '#d97706',
          'warning-light': '#fef3c7',
          error: '#dc2626',
          'error-light': '#fee2e2',
          info: '#2563eb',
          'info-light': '#dbeafe',
        },
      },

      // Spacing scale
      spacing: {
        // Component internal spacing
        'component-xs': '0.25rem',   // 4px
        'component-sm': '0.5rem',    // 8px
        'component-md': '0.75rem',   // 12px
        'component-base': '1rem',    // 16px
        'component-lg': '1.5rem',    // 24px
        'component-xl': '2rem',      // 32px

        // Section spacing
        'section-sm': '2rem',        // 32px
        'section-md': '3rem',        // 48px
        'section-lg': '4rem',        // 64px
        'section-xl': '6rem',        // 96px
      },

      // Border radius
      borderRadius: {
        'brand': '0.375rem',         // 6px - standard
        'brand-lg': '0.5rem',        // 8px - cards, modals
        'brand-xl': '0.75rem',       // 12px - large elements
        'brand-full': '9999px',      // Pills, avatars
      },

      // Shadows (elevation system)
      boxShadow: {
        'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'elevation-2': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'elevation-3': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'elevation-4': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },

      // Typography scale
      fontSize: {
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'title': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'heading': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
      },

      // Transitions
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Icon Component

Create `src/components/ui/Icon.tsx`:

```tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  xs: 'h-3 w-3',      // 12px - inline with caption text
  sm: 'h-4 w-4',      // 16px - inline with body text, buttons
  md: 'h-5 w-5',      // 20px - standalone small
  lg: 'h-6 w-6',      // 24px - standalone medium
  xl: 'h-8 w-8',      // 32px - feature icons, empty states
} as const

type IconSize = keyof typeof sizes

interface IconProps {
  icon: LucideIcon
  size?: IconSize
  className?: string
  /** For meaningful icons - sets aria-label. Decorative icons are hidden from screen readers. */
  label?: string
}

export function Icon({
  icon: IconComponent,
  size = 'md',
  className,
  label
}: IconProps) {
  return (
    <IconComponent
      className={cn(sizes[size], 'shrink-0', className)}
      aria-hidden={!label}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  )
}
```

### Icon Usage Examples

```tsx
import { Icon } from '@/components/ui/Icon'
import {
  Check, X, AlertTriangle, Info, Loader2,
  Plus, Pencil, Trash2, ChevronRight, ExternalLink,
  Search, Menu, User, Settings
} from 'lucide-react'

// In buttons
<Button>
  <Icon icon={Plus} size="sm" className="mr-2" />
  Add Item
</Button>

// Standalone with meaning
<button aria-label="Close dialog">
  <Icon icon={X} size="md" label="Close" />
</button>

// In badges
<Badge variant="success">
  <Icon icon={Check} size="xs" className="mr-1" />
  Complete
</Badge>

// Loading state
<Button disabled>
  <Icon icon={Loader2} size="sm" className="mr-2 animate-spin" />
  Saving...
</Button>

// Status indicator (decorative - icon + text)
<span className="flex items-center text-status-error">
  <Icon icon={AlertTriangle} size="sm" className="mr-1" />
  Error occurred
</span>
```

---

## Button Component

Create `src/components/ui/Button.tsx`:

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-foreground-inverted',
    'hover:bg-primary-hover',
    'focus-visible:ring-primary',
  ].join(' '),
  secondary: [
    'bg-secondary-light text-foreground',
    'hover:bg-secondary-light/80',
    'focus-visible:ring-secondary',
  ].join(' '),
  ghost: [
    'bg-transparent text-foreground',
    'hover:bg-background-muted',
    'focus-visible:ring-secondary',
  ].join(' '),
  danger: [
    'bg-status-error text-foreground-inverted',
    'hover:bg-status-error/90',
    'focus-visible:ring-status-error',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-component-sm text-small gap-1',
  md: 'h-10 px-component-base text-body gap-2',
  lg: 'h-12 px-component-lg text-body gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    disabled,
    children,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-medium',
          'rounded-brand transition-colors duration-fast',
          // Focus
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

---

## Card Component

Create `src/components/ui/Card.tsx`:

```tsx
import { cn } from '@/lib/utils'

type CardVariant = 'elevated' | 'outlined' | 'filled'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-surface shadow-elevation-2',
  outlined: 'bg-surface border border-border',
  filled: 'bg-background-subtle',
}

export function Card({
  className,
  variant = 'elevated',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-brand-lg p-component-lg',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-component-base', className)}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-heading text-foreground', className)}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-small text-foreground-muted', className)}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('text-body text-foreground', className)}
      {...props}
    />
  )
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-component-lg flex items-center gap-component-sm', className)}
      {...props}
    />
  )
}
```

---

## Badge Component

Create `src/components/ui/Badge.tsx`:

```tsx
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary-light text-foreground',
  success: 'bg-status-success-light text-status-success',
  warning: 'bg-status-warning-light text-status-warning',
  error: 'bg-status-error-light text-status-error',
  info: 'bg-status-info-light text-status-info',
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        'px-component-sm py-component-xs',
        'text-small font-medium',
        'rounded-brand-full',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
```

---

## Input Component

Create `src/components/ui/Input.tsx`:

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          // Base
          'w-full px-component-base py-component-sm',
          'text-body text-foreground',
          'placeholder:text-foreground-muted',
          'bg-surface border rounded-brand',
          // Transitions
          'transition-colors duration-fast',
          // Focus
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-background-muted',
          // Error state
          error
            ? 'border-status-error focus:ring-status-error focus:border-status-error'
            : 'border-border focus:ring-primary focus:border-primary',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
```

### Form Pattern with Label and Error

```tsx
interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({
  label,
  error,
  hint,
  required,
  children
}: FormFieldProps) {
  const id = useId()

  return (
    <div className="space-y-component-xs">
      <label
        htmlFor={id}
        className="text-small font-medium text-foreground"
      >
        {label}
        {required && <span className="text-status-error ml-1">*</span>}
      </label>

      {/* Clone child to add id and aria attributes */}
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
        'aria-invalid': !!error,
        error: !!error,
      })}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-caption text-foreground-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="text-caption text-status-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

---

## DESIGN-SYSTEM.md Template

Create `DESIGN-SYSTEM.md` in project root:

```markdown
# Design System

## Overview

This design system is defined in `tailwind.config.ts`. Components are in `src/components/ui/`.

**Aesthetic Direction:** [Minimal / Refined / Soft / Industrial / Bold]

**Primary Color:** [Color name and hex]

**Typography:** [Font choices]

## Colors

| Token | Usage | Class |
|-------|-------|-------|
| primary | Buttons, links, emphasis | `bg-primary`, `text-primary` |
| secondary | Secondary actions | `bg-secondary`, `text-secondary` |
| foreground | Text | `text-foreground`, `text-foreground-muted` |
| background | Page backgrounds | `bg-background`, `bg-background-subtle` |
| surface | Cards, modals | `bg-surface` |
| status-* | Success/warning/error | `text-status-success`, `bg-status-error-light` |

## Components

| Component | Location | Variants |
|-----------|----------|----------|
| Button | `@/components/ui/Button` | primary, secondary, ghost, danger |
| Card | `@/components/ui/Card` | elevated, outlined, filled |
| Badge | `@/components/ui/Badge` | default, success, warning, error, info |
| Input | `@/components/ui/Input` | default, error state |
| Icon | `@/components/ui/Icon` | xs, sm, md, lg, xl |

## Icons

Using: [lucide-react / @heroicons/react / @phosphor-icons/react]

Always use the `Icon` wrapper component for consistent sizing.

## Page Rules

1. Import components from `@/components/ui/*`
2. Use semantic spacing (`p-section-sm`, `gap-component-lg`)
3. Use layout utilities (`flex`, `grid`)
4. NEVER use raw color classes (`bg-emerald-600`)
5. NEVER use raw spacing (`p-4`, `m-2`)

## Making Changes

| Change | Edit |
|--------|------|
| Brand color | `tailwind.config.ts` → `colors.primary` |
| Spacing | `tailwind.config.ts` → `spacing` |
| Corner radius | `tailwind.config.ts` → `borderRadius.brand` |
| Component behavior | `src/components/ui/[Component].tsx` |
```

---

## Directory Structure After Setup

```
src/
├── lib/
│   └── utils.ts              # cn() helper
├── components/
│   └── ui/
│       ├── Icon.tsx          # Icon wrapper
│       ├── Button.tsx        # Button component
│       ├── Card.tsx          # Card + subcomponents
│       ├── Badge.tsx         # Badge component
│       └── Input.tsx         # Input component
├── app/
│   └── ...                   # Pages (consume components only)
├── tailwind.config.ts        # Semantic tokens
└── DESIGN-SYSTEM.md          # Documentation
```
