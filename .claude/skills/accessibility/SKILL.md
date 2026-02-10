---
name: accessibility
description: Use when building UI components, before launch, or when ensuring WCAG compliance. Making apps usable by everyone.
---

# Accessibility Skill

## Overview

Accessibility isn't a feature—it's a requirement. 15% of the world has a disability. If a screen reader user can't complete the task, you haven't built a product—you've built an exclusion. Every interactive element must be keyboard accessible. Every image needs context. Every form needs labels.

## How Accessibility Engineers Think

**"Can a blind user complete this task?"**
Turn off your monitor and try to use your app with a screen reader. If you can't, neither can they. Screen readers read what's in the DOM, not what's on screen. Semantic HTML matters more than visual appearance.

**"Can a keyboard-only user navigate this?"**
Some users can't use a mouse—motor disabilities, power users, or just preference. Tab through your entire app. Can you reach everything? Can you see where focus is? Can you escape every modal?

**"Does this fail for anyone?"**
Low vision users need contrast. Color blind users need more than color. Deaf users need captions. Cognitive disabilities need clear language. Design for the edges and the middle benefits too.

### What Separates Amateurs from Professionals

Amateurs add ARIA attributes and hope.
Professionals test with actual assistive technology.

The amateur thinks: "I added aria-label, it's accessible now."
The professional thinks: "Let me test this with VoiceOver/NVDA. What does a screen reader user actually hear?"

When catching yourself adding ARIA without testing with a screen reader—STOP. You might be making it worse.

## When to Use

- Building any UI component
- Before launch review
- After accessibility audit findings
- When adding interactive elements
- **ALWAYS** — accessibility isn't optional

## The WCAG Framework

### The Four Principles (POUR)

| Principle | Question | Key Checks |
|-----------|----------|------------|
| **Perceivable** | Can they sense it? | Alt text, contrast, captions |
| **Operable** | Can they use it? | Keyboard, no traps, enough time |
| **Understandable** | Can they comprehend it? | Labels, errors, consistent UI |
| **Robust** | Does it work with assistive tech? | Valid HTML, proper ARIA |

### WCAG Levels

| Level | Meaning | Target |
|-------|---------|--------|
| A | Minimum | Must have |
| AA | Standard | **Required for most apps** |
| AAA | Enhanced | Nice to have |

**Target AA compliance.** It's the legal standard in most jurisdictions.

## Perceivable

### Images Need Alt Text

```tsx
// ❌ Missing alt
<img src="chart.png" />

// ❌ Useless alt
<img src="chart.png" alt="image" />

// ✅ Descriptive alt
<img src="chart.png" alt="Sales increased 40% from Q1 to Q3 2024" />

// ✅ Decorative images (empty alt, not missing)
<img src="decorative-border.png" alt="" />
```

**Alt text rule:** If the image conveys information, describe that information. If it's decorative, use `alt=""`.

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+ or 14px bold) | 3:1 |
| UI components | 3:1 |

```css
/* ❌ Low contrast */
color: #999999;  /* on white: ~2.8:1 */

/* ✅ Sufficient contrast */
color: #595959;  /* on white: ~7:1 */
```

**Test:** Use browser DevTools → Rendering → Emulate vision deficiencies

### Don't Rely on Color Alone

```tsx
// ❌ Only color indicates error
<input style={{ borderColor: hasError ? 'red' : 'gray' }} />

// ✅ Color + icon + text
<input style={{ borderColor: hasError ? 'red' : 'gray' }} />
{hasError && (
  <span className="error">
    <ErrorIcon /> Email is required
  </span>
)}
```

## Operable

### Keyboard Navigation

**Everything must be keyboard accessible:**

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous element |
| Enter | Activate buttons, links |
| Space | Activate buttons, toggle checkboxes |
| Escape | Close modals, cancel |
| Arrow keys | Navigate within components (menus, tabs) |

```tsx
// ❌ Click-only interaction
<div onClick={handleClick}>Click me</div>

// ✅ Keyboard accessible
<button onClick={handleClick}>Click me</button>

// ✅ If you must use div, add keyboard support
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### Focus Management

```tsx
// ✅ Visible focus indicator (never remove!)
button:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

// ✅ Focus visible only for keyboard (not mouse)
button:focus-visible {
  outline: 2px solid #005fcc;
}

// ❌ NEVER do this
button:focus {
  outline: none;  /* Destroys keyboard accessibility */
}
```

### Focus Trapping in Modals

```tsx
// When modal opens:
// 1. Move focus to modal
// 2. Trap Tab within modal
// 3. Return focus when closed

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  const previousFocus = useRef();
  
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);
  
  // Trap focus within modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab') {
      // Keep focus within modal (implementation varies)
    }
  };
  
  return (
    <div 
      role="dialog"
      aria-modal="true"
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

### Skip Links

```tsx
// First element in body - lets keyboard users skip nav
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// CSS: Hidden until focused
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 10px;
  top: 10px;
}
```

## Understandable

### Form Labels

```tsx
// ❌ No label
<input type="email" placeholder="Email" />

// ❌ Placeholder is not a label (disappears on focus)
<input type="email" placeholder="Enter your email" />

// ✅ Explicit label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ With description and error
<label htmlFor="email">Email</label>
<input 
  id="email" 
  type="email"
  aria-describedby="email-hint email-error"
  aria-invalid={hasError}
/>
<p id="email-hint">We'll never share your email</p>
{hasError && <p id="email-error" role="alert">Please enter a valid email</p>}
```

### Error Messages

```tsx
// ❌ Vague error
<p className="error">Error</p>

// ✅ Specific, actionable error
<p role="alert" className="error">
  Password must be at least 8 characters with one number
</p>
```

## Robust (ARIA)

### ARIA Rules

1. **Don't use ARIA if HTML works:** `<button>` beats `<div role="button">`
2. **ARIA doesn't add behavior:** `role="button"` doesn't make it clickable
3. **Test with screen readers:** Wrong ARIA is worse than no ARIA

### Common ARIA Patterns

```tsx
// Live regions (announce changes)
<div aria-live="polite">  {/* Announces when content changes */}
  {statusMessage}
</div>

// Expanded/collapsed
<button aria-expanded={isOpen} aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden={!isOpen}>...</ul>

// Current page in navigation
<nav>
  <a href="/" aria-current="page">Home</a>
  <a href="/about">About</a>
</nav>

// Loading states
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

## Testing Checklist

### Keyboard Test (Do This First)

1. [ ] Unplug your mouse
2. [ ] Tab through entire page
3. [ ] Can reach every interactive element?
4. [ ] Focus indicator visible at all times?
5. [ ] Can activate all buttons/links with Enter/Space?
6. [ ] Can escape all modals with Escape?
7. [ ] No keyboard traps (can't Tab out)?

### Screen Reader Test

| Platform | Screen Reader | Shortcut |
|----------|---------------|----------|
| Mac | VoiceOver | Cmd + F5 |
| Windows | NVDA (free) | Download |
| Windows | Narrator | Win + Ctrl + Enter |

1. [ ] Turn on screen reader
2. [ ] Navigate with Tab and arrow keys
3. [ ] Are all elements announced correctly?
4. [ ] Do images have meaningful descriptions?
5. [ ] Are form fields labeled?
6. [ ] Are error messages announced?

### Automated Test

```bash
# Lighthouse in Chrome DevTools
# Or axe browser extension
# Or in tests:
npm install @axe-core/react

// In component tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Quick Reference

| Element | Requirement |
|---------|-------------|
| Images | Alt text (or alt="" if decorative) |
| Buttons | Keyboard accessible, visible focus |
| Forms | Labels, error messages, descriptions |
| Modals | Focus trap, Escape to close |
| Color | 4.5:1 contrast, not only indicator |
| Links | Descriptive text (not "click here") |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| `outline: none` | Visible focus styles | Keyboard users need to see focus |
| `<div onClick>` | `<button onClick>` | Divs aren't keyboard accessible |
| Placeholder as label | Actual `<label>` | Placeholder disappears |
| Color-only errors | Color + icon + text | Color blind users exist |
| "Click here" links | Descriptive link text | Screen readers list links |
| ARIA without testing | Test with screen reader | Wrong ARIA is worse |

## Exit Criteria

- [ ] Keyboard navigation complete (tested without mouse)
- [ ] Screen reader tested (VoiceOver, NVDA, or Narrator)
- [ ] All images have appropriate alt text
- [ ] Color contrast passes (4.5:1 for text)
- [ ] All forms have labels
- [ ] Error messages are clear and announced
- [ ] Focus is visible and managed properly
- [ ] Lighthouse accessibility score > 90
- [ ] No axe-core violations

**Done when:** A user who can't see the screen can complete every task, and a user who can't use a mouse can navigate everything.
