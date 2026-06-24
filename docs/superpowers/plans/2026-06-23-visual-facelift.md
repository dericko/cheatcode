# Visual Facelift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ad-hoc Tailwind hex values and hand-rolled component styles across all screens with a CSS token system and shadcn/ui primitives, producing a polished Material You–inspired dark UI.

**Architecture:** All design tokens live as CSS custom properties in `globals.css`, exposed to Tailwind v4 via `@theme` mapping. shadcn/ui components are copied into `src/components/ui/` (not imported from npm) so they can be customized — the Badge component gets `easy`/`medium`/`hard` variants added. Screens are updated one at a time, each ending with a type-clean build.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4 (`@tailwindcss/postcss`), shadcn/ui (copied), `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `lucide-react`

## Global Constraints

- Dark-only theme — `color-scheme: dark` on `:root`, no light-mode variants
- Accent color: indigo-500 `#6366f1`; hover: indigo-400 `#818cf8`
- Fonts unchanged: Geist Sans + Geist Mono via `--font-geist-sans` / `--font-geist-mono`
- Monaco editor, Timer component, all API routes, Prisma layer: **do not touch**
- shadcn style: `"default"`, base color: `"neutral"`, CSS variables: `true`
- All token names used in component code must match exactly what is defined in `globals.css`

---

### Task 1: Token System in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS custom properties and `@theme` mappings consumed by all subsequent tasks — exact token names used downstream are `--background`, `--surface`, `--surface-hover`, `--surface-variant`, `--border`, `--primary`, `--primary-hover`, `--primary-foreground`, `--foreground`, `--muted-foreground`, `--muted`; Tailwind utility classes `bg-background`, `bg-surface`, `bg-surface-hover`, `bg-surface-variant`, `text-foreground`, `text-muted-foreground`, `text-primary`, `bg-primary`, `border-border`

- [ ] **Step 1: Write the full new `globals.css`**

Replace the entire file contents:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Design tokens ─────────────────────────────────────── */
:root {
  color-scheme: dark;

  /* Core palette */
  --background:         #0f0f13;
  --surface:            #1a1a27;
  --surface-hover:      #22223a;
  --surface-variant:    #1e1e30;
  --border:             rgba(255, 255, 255, 0.07);
  --primary:            #6366f1;
  --primary-hover:      #818cf8;
  --primary-foreground: #ffffff;
  --foreground:         #e8e8f0;
  --muted-foreground:   #8b8ba7;
  --muted:              #52526b;

  /* shadcn variable aliases (components reference these names) */
  --card:                  var(--surface);
  --card-foreground:       var(--foreground);
  --popover:               var(--surface);
  --popover-foreground:    var(--foreground);
  --secondary:             var(--surface-variant);
  --secondary-foreground:  var(--foreground);
  --accent:                var(--surface-hover);
  --accent-foreground:     var(--foreground);
  --destructive:           #ef4444;
  --destructive-foreground: #ffffff;
  --input:                 var(--surface-variant);
  --ring:                  var(--primary);
  --radius:                0.5rem;
}

/* ─── Tailwind v4 theme mapping ─────────────────────────── */
/* Maps CSS vars into utility classes: bg-background, text-foreground, etc. */
@theme {
  --color-background:          var(--background);
  --color-surface:             var(--surface);
  --color-surface-hover:       var(--surface-hover);
  --color-surface-variant:     var(--surface-variant);
  --color-border:              var(--border);
  --color-primary:             var(--primary);
  --color-primary-hover:       var(--primary-hover);
  --color-primary-foreground:  var(--primary-foreground);
  --color-foreground:          var(--foreground);
  --color-muted-foreground:    var(--muted-foreground);
  --color-muted:               var(--muted);
  --color-card:                var(--card);
  --color-card-foreground:     var(--card-foreground);
  --color-ring:                var(--ring);
}

/* ─── Base styles ────────────────────────────────────────── */
@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
  }
  a {
    text-decoration: none;
  }
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--muted);
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--muted-foreground);
  }
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd /Users/detc/prog/cheatcode && npm run build
```

Expected: `✓ Compiled successfully` — no TypeScript or CSS errors.

- [ ] **Step 3: Run existing tests to confirm no regressions**

```bash
npm test
```

Expected: all tests pass (problems + runner suites).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add CSS token system and Tailwind v4 @theme mapping"
```

---

### Task 2: shadcn Setup and Component Install

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/badge.tsx` (with custom difficulty variants added)
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/separator.tsx`

**Interfaces:**
- Produces (for all subsequent tasks):
  - `Button` from `@/components/ui/button` — props: `variant?: "default"|"ghost"|"outline"`, `size?: "default"|"sm"|"lg"`, `asChild?: boolean`, plus all HTML button props
  - `Badge` from `@/components/ui/badge` — props: `variant?: "default"|"secondary"|"destructive"|"outline"|"easy"|"medium"|"hard"`, plus all HTML div props
  - `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card` — standard HTML div wrappers with shadow/border styling
  - `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select` — Radix-based select
  - `Input` from `@/components/ui/input` — styled text input, all HTML input props
  - `Separator` from `@/components/ui/separator` — horizontal/vertical divider
  - `cn` from `@/lib/utils` — `(...inputs: ClassValue[]) => string` merges Tailwind class names

- [ ] **Step 1: Create `components.json`**

Create `/Users/detc/prog/cheatcode/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 2: Install peer dependencies**

```bash
cd /Users/detc/prog/cheatcode && npm install clsx tailwind-merge class-variance-authority @radix-ui/react-select @radix-ui/react-separator lucide-react
```

Expected: packages added to `node_modules`, no peer dependency errors.

- [ ] **Step 3: Create `src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Install shadcn components via CLI**

```bash
npx shadcn@latest add button badge card select input separator --overwrite
```

When prompted, accept defaults. This creates files in `src/components/ui/`. If the CLI is non-interactive, use `--yes`:

```bash
npx shadcn@latest add button badge card select input separator --overwrite --yes 2>/dev/null || true
```

- [ ] **Step 5: Add difficulty variants to Badge**

Open `src/components/ui/badge.tsx`. Find the `cva(...)` call and add `easy`, `medium`, `hard` to the `variant` variants object. The file will look like:

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        easy:   "border-green-500/20  bg-green-500/15  text-green-400",
        medium: "border-yellow-500/20 bg-yellow-500/15 text-yellow-400",
        hard:   "border-red-500/20   bg-red-500/15    text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

Replace whatever cva definition the CLI generated with this exact content — it adds `easy`, `medium`, `hard` variants while preserving all defaults.

- [ ] **Step 6: Verify the build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. If shadcn's generated files use import paths that don't exist yet (e.g., `@radix-ui/react-slot`), install the missing package:

```bash
npm install @radix-ui/react-slot
```

Then re-run `npm run build` until clean.

- [ ] **Step 7: Commit**

```bash
git add components.json src/lib/utils.ts src/components/ui/ package.json package-lock.json
git commit -m "feat: add shadcn/ui components with difficulty Badge variants"
```

---

### Task 3: Home Page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/ProblemList.tsx`

**Interfaces:**
- Consumes: `Badge` (variants `easy`, `medium`, `hard`, `default`) from `@/components/ui/badge`; `Card`, `CardContent` from `@/components/ui/card`; `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`; all token utility classes from Task 1

- [ ] **Step 1: Rewrite `src/app/page.tsx`**

```typescript
import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const problems = getAllProblems()
  const solvedProgress = await db.problemProgress.findMany({ where: { solved: true } })
  const solvedSlugs = solvedProgress.map(p => p.slug)

  const easy = problems.filter(p => p.difficulty === 'easy').length
  const medium = problems.filter(p => p.difficulty === 'medium').length
  const hard = problems.filter(p => p.difficulty === 'hard').length
  const solvedCount = solvedProgress.length
  const pct = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* App bar */}
      <header className="bg-surface sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-medium text-base text-foreground tracking-wide">Cheatcode</span>
          <span className="text-xs tracking-widest uppercase text-primary/70 hidden sm:block font-medium">Interview Prep</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Progress hero */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted font-medium mb-2">Progress</p>
          <div className="flex items-end justify-between mb-4">
            <h1 className="text-3xl font-light text-foreground">
              {solvedCount} <span className="text-muted text-xl">/ {problems.length}</span>
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="easy">{easy} easy</Badge>
              <Badge variant="medium">{medium} medium</Badge>
              <Badge variant="hard">{hard} hard</Badge>
            </div>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `src/components/ProblemList.tsx`**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

interface ProblemListProps {
  problems: Problem[]
  solvedSlugs: string[]
}

export default function ProblemList({ problems, solvedSlugs: solvedSlugsArr }: ProblemListProps) {
  const solvedSlugs = new Set(solvedSlugsArr)
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all')
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all')

  const filtered = problems.filter(p =>
    (topicFilter === 'all' || p.topic === topicFilter) &&
    (diffFilter === 'all' || p.difficulty === diffFilter)
  )

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <Select value={topicFilter} onValueChange={(v) => setTopicFilter(v as Topic | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={diffFilter} onValueChange={(v) => setDiffFilter(v as Difficulty | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted tabular-nums">{filtered.length} problems</span>
      </div>

      {/* Card grid */}
      <div
        className="grid grid-cols-1"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}
      >
        {filtered.map(p => (
          <Link key={p.slug} href={`/problems/${p.slug}`} className="no-underline">
            <Card className="bg-surface border-border hover:bg-surface-hover transition-colors cursor-pointer h-full shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
              <CardContent className="p-6 flex flex-col h-full">
                <p className="text-base font-semibold text-foreground flex-1 mb-4">
                  {p.title}
                </p>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <Badge variant={p.difficulty}>{p.difficulty}</Badge>
                  <span className="text-muted-foreground text-xs truncate">{p.topic}</span>
                  {solvedSlugs.has(p.slug)
                    ? <span className="shrink-0 text-green-400 text-xs font-bold">✓</span>
                    : <span className="shrink-0 w-3" />
                  }
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify the build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Visual check — start dev server and open home page**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- App bar is `--surface` color, not black
- Progress hero shows Badge chips for easy/medium/hard counts with correct green/yellow/red coloring
- Problem cards use the Card component, hover slightly lighter
- Filter dropdowns are shadcn Select (no custom SVG chevron hack)
- Problem count right-aligned in muted text

Stop the dev server when done.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/ProblemList.tsx
git commit -m "style: home page — Badge hero, Card grid, shadcn Select filters"
```

---

### Task 4: Problem Page

**Files:**
- Modify: `src/app/problems/[slug]/ProblemClient.tsx`

**Interfaces:**
- Consumes: `Button` (variants `default`, `ghost`; sizes `sm`) from `@/components/ui/button`; `Badge` (variants `easy`, `medium`, `hard`) from `@/components/ui/badge`; `Link` from `next/link`; all token utility classes from Task 1

- [ ] **Step 1: Rewrite `src/app/problems/[slug]/ProblemClient.tsx`**

Replace the entire file:

```typescript
'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import HintChat from '@/components/HintChat'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Problem } from '@/types/problem'
import type { RunResult, ComplexityResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const STORAGE_KEY = (slug: string) => `code:${slug}`

export default function ProblemClient({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return problem.starterCode
    return localStorage.getItem(STORAGE_KEY(problem.slug)) ?? problem.starterCode
  })
  const [result, setResult] = useState<RunResult | null>(null)
  const [complexity, setComplexity] = useState<ComplexityResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)
  const runIdRef = useRef(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(problem.slug), code)
  }, [code, problem.slug])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [code])

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setComplexity(null)
    const runId = ++runIdRef.current
    try {
      const [res] = await Promise.all([
        fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code }),
        }).then(r => r.ok ? r.json() : null).then(data => {
          if (data && runIdRef.current === runId) setComplexity(data)
        }).catch(() => {}),
      ])

      if (!res.ok) {
        showToast('Error connecting to runner')
        return
      }
      const data: RunResult = await res.json()
      setResult(data)

      if (data.results.every(r => r.passed)) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code, passed: true, timeSpentMs: elapsedRef.current }),
        })
        showToast('All tests passed! 🎉')
      }
    } catch {
      showToast('Error connecting to runner')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* App bar */}
      <header
        className="flex items-center justify-between px-5 bg-surface shrink-0 h-14 gap-2 border-b border-border"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/">← Back</Link>
          </Button>
          <span className="text-foreground/20 shrink-0">|</span>
          <h1 className="text-sm font-medium text-foreground truncate">{problem.title}</h1>
          <Badge variant={problem.difficulty as 'easy' | 'medium' | 'hard'} className="shrink-0">
            {problem.difficulty}
          </Badge>
          <span className="text-xs text-muted hidden sm:block shrink-0">{problem.topic}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              variant="default"
              style={{ boxShadow: isRunning ? 'none' : '0 2px 8px rgba(99,102,241,0.4)' }}
            >
              {isRunning ? 'Running…' : 'Run'}
            </Button>
            <span className="text-xs text-muted hidden sm:block">⌘↵</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Description panel */}
        <div className="md:w-2/5 md:min-w-64 overflow-y-auto p-6 border-r border-border bg-surface-variant text-sm text-muted-foreground leading-7 max-h-48 md:max-h-none">
          <pre className="whitespace-pre-wrap font-sans">{problem.description.trim()}</pre>
        </div>

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden min-h-0">
            <Editor value={code} onChange={setCode} onRun={handleRun} />
          </div>
          <div className="border-t border-border shrink-0 overflow-y-auto" style={{ height: '42%', minHeight: '200px' }}>
            <TestResults result={result} isRunning={isRunning} complexity={complexity} />
          </div>
        </div>
      </div>

      <HintChat slug={problem.slug} code={code} />

      {/* Snackbar toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface text-foreground px-5 py-3 rounded-full text-sm z-50 font-medium"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
```

Note: The `py-16` bug on the old line 114 is eliminated — the new code uses `<Badge>` which has correct padding built in.

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. Fix any TypeScript errors before continuing.

- [ ] **Step 3: Visual check — open a problem page**

```bash
npm run dev
```

Open `http://localhost:3000`, click any problem card. Verify:
- App bar background is `--surface` color
- "← Back" renders as a ghost button (no fill, hover shows faint bg)
- Difficulty badge is correct color (no huge padding like the old `py-16` bug)
- "Run" is an indigo-filled button
- "⌘↵" hint shows to the right of Run on wide screens
- Description panel is slightly darker (`--surface-variant`)

Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/app/problems/[slug]/ProblemClient.tsx
git commit -m "style: problem page — Button/Badge, fix py-16 badge bug, token classes"
```

---

### Task 5: Test Results

**Files:**
- Modify: `src/components/TestResults.tsx`

**Interfaces:**
- Consumes: `Badge` (variants `default`, `easy`/`medium`/`hard` not needed here — use className for green/red pass counts) from `@/components/ui/badge`; `Button` (variant `outline`, size `sm`) from `@/components/ui/button`; token utility classes from Task 1

- [ ] **Step 1: Rewrite `src/components/TestResults.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RunResult, ComplexityResult } from '@/types/runner'

interface TestResultsProps {
  result: RunResult | null
  isRunning: boolean
  complexity?: ComplexityResult | null
}

export default function TestResults({ result, isRunning, complexity }: TestResultsProps) {
  const [mode, setMode] = useState<'verbose' | 'summary'>('verbose')

  useEffect(() => {
    const stored = localStorage.getItem('testResultsMode')
    if (stored === 'summary' || stored === 'verbose') setMode(stored)
  }, [])

  const toggleMode = () => {
    const next = mode === 'verbose' ? 'summary' : 'verbose'
    setMode(next)
    localStorage.setItem('testResultsMode', next)
  }

  if (isRunning) {
    return (
      <div className="h-full bg-surface-variant flex items-center gap-2 px-4 text-sm text-muted-foreground">
        <span className="inline-block w-3 h-3 rounded-full bg-muted animate-pulse" />
        Running…
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full bg-surface-variant flex items-center px-4 text-sm text-muted">
        Run your code to see results
      </div>
    )
  }

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <div className="bg-surface-variant text-sm flex flex-col">
      {/* Results header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b border-border shrink-0 border-l-2 ${allPassed ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
        <Badge className={allPassed ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20'}>
          {passed}/{total} passed
        </Badge>
        <Button variant="outline" size="sm" onClick={toggleMode}>
          {mode === 'verbose' ? 'Summary' : 'Verbose'}
        </Button>
      </div>

      {mode === 'verbose' && (
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border/60">
            {result.results.map((r, i) => (
              <div key={i} className={`px-4 py-2.5 ${r.passed ? '' : 'bg-red-500/5'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.passed ? '✓' : '✗'}
                  </span>
                  <span className={r.passed ? 'text-muted-foreground' : 'text-foreground'}>{r.description}</span>
                </div>
                {!r.passed && (
                  <div className="mt-1.5 ml-4 bg-background/60 rounded-md p-2.5 font-mono text-xs space-y-0.5">
                    {r.error ? (
                      <div className="text-red-400">Error: {r.error}</div>
                    ) : (
                      <>
                        <div className="text-muted">expected <span className="text-emerald-400">{JSON.stringify(r.expected)}</span></div>
                        <div className="text-muted">received <span className="text-red-400">{JSON.stringify(r.actual)}</span></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {result.consoleOutput.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <div className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Console</div>
              <div className="bg-background border border-border rounded-md p-2.5 space-y-0.5">
                {result.consoleOutput.map((line, i) => (
                  <div key={i} className="font-mono text-xs text-yellow-300">{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Complexity card */}
          {complexity && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Complexity</span>
                <Badge className={complexity.passesTarget ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20'}>
                  {complexity.passesTarget ? 'optimal' : 'suboptimal'}
                </Badge>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mb-1.5">
                <span>Time: <span className="text-foreground font-mono">{complexity.timeComplexity}</span></span>
                <span>Space: <span className="text-foreground font-mono">{complexity.spaceComplexity}</span></span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{complexity.explanation}</p>
              {complexity.hint && (
                <div className="mt-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary-foreground/80 leading-relaxed">
                  {complexity.hint}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Visual check — run code on a problem**

```bash
npm run dev
```

Open a problem, write some code, click Run. Verify:
- "Running…" state shows pulse dot in `--surface-variant` panel
- Pass/fail badge shows correct green/red coloring
- Verbose/Summary toggle is a shadcn outline Button
- Complexity badge shows "optimal" / "suboptimal" in matching color
- Failed test rows show expected/received in correct colors

Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/components/TestResults.tsx
git commit -m "style: TestResults — Badge for counts, Button toggle, token classes"
```

---

### Task 6: Hint Chat

**Files:**
- Modify: `src/components/HintChat.tsx`

**Interfaces:**
- Consumes: `Input` from `@/components/ui/input`; `Button` (variant `default`, sizes `sm` and `lg`) from `@/components/ui/button`; `Badge` from `@/components/ui/badge`; token utility classes from Task 1

- [ ] **Step 1: Rewrite `src/components/HintChat.tsx`**

```typescript
'use client'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface HintChatProps {
  slug: string
  code: string
}

export default function HintChat({ slug, code }: HintChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    const updated: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(updated)
    setIsLoading(true)
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, code, messages: updated }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error ?? 'Something went wrong.'}` }])
      } else if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${String(err)}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Left-side panel */}
      {open && (
        <div
          className="fixed left-0 z-30 flex flex-col bg-surface border-r border-border"
          style={{ top: '3.5rem', width: '22rem', height: 'calc(100vh - 3.5rem)', boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground">Hints</span>
            <Badge variant="default" className="text-[11px] bg-primary/10 text-primary border-primary/20">
              AI · no spoilers
            </Badge>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-muted text-xs leading-relaxed">
                Ask for a nudge. The AI won't write code for you — it'll ask questions to help you find the insight yourself.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-surface-variant text-foreground rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-variant px-3 py-2 rounded-xl rounded-bl-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask for a hint…"
              autoFocus
              className="flex-1 bg-surface-variant border-border text-foreground placeholder:text-muted text-xs"
            />
            <Button
              onClick={send}
              disabled={isLoading || !input.trim()}
              variant="default"
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      )}

      {/* FAB */}
      <Button
        onClick={() => setOpen(o => !o)}
        size="lg"
        className="fixed bottom-6 right-6 z-40 rounded-full px-4 py-2.5 bg-primary hover:bg-primary-hover"
        style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
      >
        {open ? '✕ Close hints' : '💡 Hints'}
      </Button>
    </>
  )
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Visual check — full end-to-end walkthrough**

```bash
npm run dev
```

Walk through the full flow:
1. Home page: app bar correct color, Badge chips in hero, Card grid, Select dropdowns work
2. Click a problem card: problem page loads, no huge-padded badge, Back button styled, Run button indigo
3. Click Run: TestResults shows pass/fail Badge, Verbose/Summary Button works
4. Open hints FAB: panel slides in with correct dark surface, Input + Send Button work, user bubble is indigo, AI bubble is surface-variant

Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/components/HintChat.tsx
git commit -m "style: HintChat — shadcn Input/Button/Badge, token classes, indigo FAB"
```

---

## Completion Checklist

After all tasks are done, do a final pass:

- [ ] `npm run build` passes cleanly
- [ ] `npm test` passes (all 36+ problem tests, runner tests)
- [ ] No hardcoded hex values remain in the 6 modified source files (check with `grep -r '#[0-9a-f]\{3,6\}' src/app/page.tsx src/components/ProblemList.tsx src/app/problems src/components/TestResults.tsx src/components/HintChat.tsx`)
- [ ] `src/components/ui/` contains: `button.tsx`, `badge.tsx`, `card.tsx`, `select.tsx`, `input.tsx`, `separator.tsx`
- [ ] `src/lib/utils.ts` exists with `cn` function
- [ ] Monaco editor, Timer component, all API routes untouched
