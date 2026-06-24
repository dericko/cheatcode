# Style Revamp Design
**Date:** 2026-06-24
**Status:** Approved

## Overview

Full visual overhaul of the Cheatcode coding-challenge app. Goal: a modern, portfolio-quality UI that uses shadcn's default zinc/slate design system as the foundation, with a light/dark toggle, smooth CSS transitions, and skeleton loading states for all async requests.

## Decisions

| Topic | Decision |
|---|---|
| Theme | Light/dark toggle via `next-themes`; shadcn defaults for both modes |
| Accent color | None — pure zinc/slate (no indigo or custom accent) |
| HintChat position | Moves from left to right side |
| Loading pattern | Skeleton screens (`shadcn/ui Skeleton`) |
| Font | Keep Geist (already loaded via `next/font/google`) |
| Tailwind config | CSS-first (Tailwind v4, no JS config file) |

---

## Section 1: Theme System

### globals.css reset

Replace the entire current `globals.css` with shadcn's canonical CSS variable output:

- `:root` block: light-mode zinc/slate values for all shadcn tokens
- `.dark` block: dark-mode zinc/slate values
- Variables: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius`
- Remove all custom tokens: `--surface`, `--surface-hover`, `--surface-variant`, `--primary-hover`, and the indigo palette

### ThemeProvider

- Install `next-themes`
- Wrap root layout in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`
- Add `ThemeToggle` component (sun/moon icon, top-right of header) using `useTheme()` hook
- Icon: lucide-react `Sun` / `Moon` icons, switches on click

### Font

- Keep `Geist` and `Geist_Mono` loaded via `next/font/google`
- Map to `font-sans` and `font-mono` in the `@theme` block in `globals.css`

---

## Section 2: Component Styles Reset

### shadcn UI components (`src/components/ui/`)

Replace all 7 files with fresh shadcn defaults regenerated against the new zinc/slate token system:

- `badge.tsx` — fresh defaults; keep custom `easy`/`medium`/`hard` variants rebased onto the new token structure
- `button.tsx` — fresh defaults
- `card.tsx` — fresh defaults
- `checkbox.tsx` — fresh defaults
- `input.tsx` — fresh defaults
- `select.tsx` — fresh defaults
- `separator.tsx` — fresh defaults
- **Add** `skeleton.tsx` — new component: `cn("animate-pulse rounded-md bg-muted", className)`

### Difficulty badge variants

Use Tailwind color utilities (not CSS variables):

- `easy` → `bg-green-100 text-green-800` / dark: `bg-green-900/30 text-green-400`
- `medium` → `bg-amber-100 text-amber-800` / dark: `bg-amber-900/30 text-amber-400`
- `hard` → `bg-red-100 text-red-800` / dark: `bg-red-900/30 text-red-400`

### Custom components audit

Remove all inline `boxShadow` styles and hardcoded hex colors from:

- `Editor.tsx`
- `HintChat.tsx`
- `ProblemList.tsx`
- `TestResults.tsx`
- `Timer.tsx`
- `ProblemClient.tsx`

Replace with shadcn token utilities: `bg-card`, `bg-muted`, `border`, `text-foreground`, `text-muted-foreground`, `shadow-sm`, `shadow-md`.

### Spacing and padding

- Header: `px-6 py-4` on all pages
- Problem list rows: minimum `px-4 py-3`
- All buttons: existing shadcn padding (do not reduce)
- Section gaps: `gap-4` or `gap-6` between major layout regions

---

## Section 3: Transitions and Panel

### HintChat panel

**Position:** Move from `fixed left-0` to `fixed right-0`.

**Toggle button:** Replace bottom-right FAB with a fixed vertical tab on the right edge of the screen — always visible, never overlapping content.

**Transition mechanism:** Panel always stays in the DOM. Open/close state drives a CSS class:

```css
/* closed */
transform: translateX(100%);

/* open */
transform: translateX(0);

transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Backdrop:** Semi-transparent overlay behind the panel when open:

- Light: `bg-black/40`
- Dark: `bg-black/60`
- Own transition: `opacity 200ms ease`
- Clicking backdrop closes panel

### Other transitions

| Element | Transition |
|---|---|
| Problem cards (home) | `transition-colors duration-150` on hover |
| Toast notification | `opacity` + `translateY` enter/exit |
| Progress bar | Keep existing `transition-all duration-500` |
| Timer color state | `transition-colors duration-300` |
| Theme toggle icon | `transition-transform duration-200` (slight rotate) |

---

## Section 4: Loading Skeletons and Indicators

### `Skeleton` component

Add `src/components/ui/skeleton.tsx`:

```tsx
export function Skeleton({ className, ...props }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}
```

### Test results skeleton

When `isRunning === true`, `TestResults` renders a skeleton in place of results:

- 3 placeholder rows, each with:
  - Small circle (status dot placeholder): `h-3 w-3 rounded-full`
  - Two lines: `h-3 w-32` and `h-3 w-48`
- Spaced with `gap-3`

### Complexity analysis skeleton

Below test results, while complexity fetch is in flight:

- Two lines: `h-3 w-24` ("O(n)") and `h-3 w-20`
- Appears/disappears independently (parallel fetch)

### HintChat response skeleton

When `isLoading === true` in `HintChat`, render a skeleton bubble in the message list:

- One bubble-shaped skeleton: `h-4 w-48` + `h-4 w-32`, stacked with `gap-2`
- Replaces the current three-bounce-dot animation
- Input remains enabled (non-blocking)

### Button loading state

"Run Code" button while `isRunning`:

- Replaces button icon with `<Loader2 className="animate-spin" />` (lucide-react)
- Button is `disabled`
- Complements the skeleton — immediate feedback before skeleton appears

---

## Files Changed

| File | Change |
|---|---|
| `src/app/globals.css` | Full reset to shadcn defaults; light + dark tokens; Geist font mapping |
| `src/app/layout.tsx` | Add `ThemeProvider`; add `ThemeToggle` to header |
| `src/app/page.tsx` | Update token references; add `ThemeToggle` placement |
| `src/components/ui/badge.tsx` | Fresh shadcn default; keep difficulty variants |
| `src/components/ui/button.tsx` | Fresh shadcn default |
| `src/components/ui/card.tsx` | Fresh shadcn default |
| `src/components/ui/checkbox.tsx` | Fresh shadcn default |
| `src/components/ui/input.tsx` | Fresh shadcn default |
| `src/components/ui/select.tsx` | Fresh shadcn default |
| `src/components/ui/separator.tsx` | Fresh shadcn default |
| `src/components/ui/skeleton.tsx` | **New** — shadcn Skeleton component |
| `src/components/HintChat.tsx` | Move to right; CSS transform transition; backdrop; skeleton loading |
| `src/components/ProblemList.tsx` | Token cleanup; spacing; transition-colors |
| `src/components/TestResults.tsx` | Skeleton for isRunning state |
| `src/components/Editor.tsx` | Token cleanup; remove inline boxShadow |
| `src/components/Timer.tsx` | Token cleanup; transition-colors for warning states |
| `src/app/problems/[slug]/ProblemClient.tsx` | Loader2 spinner on Run button; toast transition |

## Out of Scope

- Layout restructuring (panels, columns, breakpoints stay the same)
- New features or data model changes
- Font change (Geist stays)
- Accessibility audit (not part of this revamp)
