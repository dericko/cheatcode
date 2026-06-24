# Visual Facelift — Design Spec

**Date:** 2026-06-23  
**Status:** Approved

## Goal

Give Cheatcode a polished, cohesive Material You–inspired dark UI. Replace ad-hoc Tailwind hex values and hand-rolled component styles with a proper design token system and shadcn/ui primitives.

## Design Decisions

- **Component library:** shadcn/ui (components copied into repo, fully customizable)
- **Accent color:** Indigo (indigo-500 / `#6366f1`)
- **Font:** Keep Geist Sans + Geist Mono (already loaded)
- **Theme:** Dark only (`color-scheme: dark`)

---

## Section 1: Token System (`src/app/globals.css`)

Replace all scattered hardcoded hex values with CSS custom properties. Tailwind v4's `@theme` block maps these into utility classes automatically.

```
--background:        #0f0f13   (page background)
--surface:           #1a1a27   (cards, panels, app bar)
--surface-hover:     #22223a   (card hover, menu items)
--surface-variant:   #1e1e30   (inset sections, code areas)
--border:            rgba(255,255,255,0.07)
--primary:           #6366f1   (indigo-500)
--primary-hover:     #818cf8   (indigo-400)
--primary-foreground: #ffffff
--foreground:        #e8e8f0   (primary text)
--muted-foreground:  #8b8ba7   (secondary text)
--muted:             #52526b   (placeholder, labels)
```

Difficulty color tokens:
```
--easy:   green-400 / green-500/15 bg
--medium: yellow-400 / yellow-500/15 bg
--hard:   red-400 / red-500/15 bg
```

shadcn maps its own variables (`--primary`, `--background`, `--card`, etc.) to these tokens in `globals.css` so all components inherit the dark theme without per-component overrides.

---

## Section 2: shadcn Components to Install

| Component  | Used in |
|------------|---------|
| `button`   | Run, Send, Back, Verbose/Summary toggle, Hint FAB |
| `badge`    | Difficulty chips, pass/fail count, "optimal" label |
| `card`     | Problem cards on home page |
| `select`   | Topic and Difficulty filter dropdowns |
| `input`    | Hint chat text input |
| `separator`| Panel dividers |

Install via: `npx shadcn@latest add button badge card select input separator`

---

## Section 3: Screen-by-Screen Changes

### Home page (`src/app/page.tsx` + `src/components/ProblemList.tsx`)

- Progress hero: solved count in large light-weight type, difficulty counts as `Badge` components, indigo progress bar using `--primary` token
- Problem cards: `Card` component with `--surface` background, hover shifts to `--surface-hover`, consistent 20px gap
- Title: `text-lg font-semibold`, truncate disabled (allow wrapping), min-height removed in favor of natural flow
- Difficulty badge: bottom-left of card, using `Badge` with `easy`/`medium`/`hard` variant classes
- Filter row: shadcn `Select` replaces the custom `<select>` + SVG chevron hack
- Problem count: keep as muted text, right-aligned

### Problem page (`src/app/problems/[slug]/ProblemClient.tsx`)

- **Bug fix:** Line 114 `py-16` → `py-0.5` on the difficulty Badge
- App bar: uses `--surface` token, `h-14`, consistent horizontal padding
- "← Back": `Button variant="ghost" size="sm"`
- Problem title: `text-sm font-medium text-foreground truncate`
- Difficulty chip: `Badge` component
- Timer: no changes (works fine)
- Run button: `Button variant="default"` (indigo fill), adds `⌘↵` keyboard hint label in muted text next to it
- Description panel: `--surface-variant` background, `text-sm leading-7 text-muted-foreground`

### Test results (`src/components/TestResults.tsx`)

- Running state: subtle pulse indicator, same as current but using tokens
- Pass/fail count: `Badge variant` (green or red)
- Verbose/Summary toggle: `Button variant="outline" size="sm"`
- Failed test rows: `--surface-variant` inset background
- Complexity card: clean inset block, `Badge` for optimal/suboptimal

### Hint chat (`src/components/HintChat.tsx`)

- Panel: `--surface` background, `border-r border-border`
- Header: "Hints" title + "AI · no spoilers" as a small `Badge`
- Messages: user bubble uses `--primary`, AI bubble uses `--surface-variant`
- Input row: shadcn `Input` + `Button variant="default" size="sm"`
- FAB: `Button size="lg"` with `rounded-full`, indigo fill, shadow via `--primary/40`

---

## Files Touched

```
src/app/globals.css              — token system + shadcn theme variables
src/app/layout.tsx               — minor: body class cleanup
src/app/page.tsx                 — home hero, Badge usage
src/components/ProblemList.tsx   — Card, Badge, Select
src/app/problems/[slug]/ProblemClient.tsx — Button, Badge, bug fix
src/components/TestResults.tsx   — Badge, Button
src/components/HintChat.tsx      — Input, Button
src/components/ui/               — shadcn generated components (new dir)
components.json                  — shadcn config (new file)
```

---

## What Does NOT Change

- Monaco editor (unchanged — it has its own theming)
- Timer component (works fine, no visual issues)
- All API routes and business logic
- Database / Prisma layer
- Test suite
