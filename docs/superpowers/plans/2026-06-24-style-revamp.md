# Cheatcode Style Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full visual overhaul — shadcn zinc/slate defaults, light/dark toggle, 3-panel problem layout, smooth transitions, and skeleton loading states.

**Architecture:** Reset globals.css to shadcn canonical zinc/slate tokens; wrap app in next-themes ThemeProvider; restructure the problem page into a 3-column layout (description | editor | results); add CSS-transform-based HintChat panel on the right; add Skeleton component for all async loading states.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 (CSS-first, no JS config), shadcn/ui components, next-themes, lucide-react (already installed), Radix UI primitives (already installed via shadcn)

## Global Constraints

- Tailwind v4 — no `tailwind.config.ts`; all theme tokens live in `globals.css` via `@theme {}`
- CSS-first theme: `:root` for light tokens, `.dark` for dark tokens; `@theme` maps them to Tailwind utilities
- No new pages, routes, or API changes
- Keep Geist/Geist_Mono fonts (loaded via `next/font/google`, variables `--font-geist-sans` and `--font-geist-mono`)
- `lucide-react` is already installed (`^1.21.0`); import icons from it directly
- All shadcn component files live at `src/components/ui/`
- `cn()` utility is at `src/lib/utils.ts`
- Dev server: `npm run dev` (port 3000 by default)

---

### Task 1: Theme Foundation

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS custom properties `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius` available in `:root` and `.dark`
- Produces: `ThemeToggle` component at `src/components/ThemeToggle.tsx` — no props, renders a ghost icon button

- [ ] **Step 1: Install next-themes**

```bash
npm install next-themes
```

Expected: `next-themes` added to `package.json` dependencies. No errors.

- [ ] **Step 2: Replace globals.css with shadcn zinc/slate defaults**

Replace the entire file at `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Light mode tokens (shadcn zinc defaults) ─────────────── */
:root {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --card-foreground: #09090b;
  --popover: #ffffff;
  --popover-foreground: #09090b;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --destructive: #ef4444;
  --destructive-foreground: #fafafa;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #18181b;
  --radius: 0.5rem;
}

/* ── Dark mode tokens (shadcn zinc defaults) ──────────────── */
.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #09090b;
  --card-foreground: #fafafa;
  --popover: #09090b;
  --popover-foreground: #fafafa;
  --primary: #fafafa;
  --primary-foreground: #18181b;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #27272a;
  --accent-foreground: #fafafa;
  --destructive: #7f1d1d;
  --destructive-foreground: #fafafa;
  --border: #27272a;
  --input: #27272a;
  --ring: #d4d4d8;
}

/* ── Tailwind v4 theme mapping ────────────────────────────── */
@theme {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

/* ── Base styles ──────────────────────────────────────────── */
@layer base {
  * {
    border-color: var(--border);
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
  }
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--muted-foreground);
  }
}
```

- [ ] **Step 3: Create ThemeToggle component**

Create `src/components/ThemeToggle.tsx`:

```tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

- [ ] **Step 4: Update layout.tsx to add ThemeProvider**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cheatcode",
  description: "Interview prep coding challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Note: `suppressHydrationWarning` is required on `<html>` — next-themes injects the `class` attribute client-side, which would otherwise cause a hydration mismatch warning.

- [ ] **Step 5: Verify the dev server starts without errors**

```bash
npm run dev
```

Expected: Server starts on port 3000. Browser shows the home page — light background, dark text, no console errors. Theme toggle button is not yet visible (it'll be added in Task 3).

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/ThemeToggle.tsx src/app/layout.tsx package.json package-lock.json
git commit -m "feat: reset to shadcn zinc/slate theme with light/dark toggle foundation"
```

---

### Task 2: shadcn UI Component Reset

**Files:**
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/checkbox.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/separator.tsx`
- Create: `src/components/ui/skeleton.tsx`

**Interfaces:**
- Consumes: CSS tokens from Task 1 (`--primary`, `--muted`, `--border`, `--ring`, etc.)
- Produces: `Skeleton` component with signature `({ className, ...props }: React.HTMLAttributes<HTMLDivElement>)`
- Produces: `Badge` with difficulty variants: `variant="easy" | "medium" | "hard"`

- [ ] **Step 1: Replace badge.tsx**

```tsx
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
        easy:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        medium:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        hard:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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

- [ ] **Step 2: Replace button.tsx**

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 3: Replace card.tsx**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

- [ ] **Step 4: Replace checkbox.tsx**

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

- [ ] **Step 5: Replace input.tsx**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 6: Replace select.tsx**

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```

- [ ] **Step 7: Replace separator.tsx**

```tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```

- [ ] **Step 8: Create skeleton.tsx**

Create `src/components/ui/skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

- [ ] **Step 9: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds (no TypeScript errors, no missing imports). If there are errors about removed tokens (e.g., `bg-surface`, `text-muted` — note: `text-muted` was the old token; the new one is `text-muted-foreground`), those will be fixed in later tasks.

- [ ] **Step 10: Commit**

```bash
git add src/components/ui/
git commit -m "feat: reset shadcn UI components to zinc/slate defaults, add Skeleton"
```

---

### Task 3: Home Page Redesign

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/ProblemList.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` from `src/components/ThemeToggle.tsx`
- Consumes: `Badge` variants `easy`, `medium`, `hard` from Task 2

- [ ] **Step 1: Replace page.tsx**

```tsx
import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'

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
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight">Cheatcode</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">Interview Prep</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Progress hero */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Progress</p>
          <div className="flex items-end justify-between mb-3">
            <h1 className="text-2xl font-semibold tabular-nums">
              {solvedCount}
              <span className="text-muted-foreground font-normal text-lg"> / {problems.length}</span>
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="easy">{easy} easy</Badge>
              <Badge variant="medium">{medium} medium</Badge>
              <Badge variant="hard">{hard} hard</Badge>
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-500"
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

- [ ] **Step 2: Replace ProblemList.tsx**

```tsx
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

        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{filtered.length} problems</span>
      </div>

      {/* Card grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {filtered.map(p => (
          <Link key={p.slug} href={`/problems/${p.slug}`} className="no-underline">
            <Card className="hover:bg-accent/50 transition-colors duration-150 cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <p className="text-sm font-semibold text-foreground flex-1 mb-4 leading-snug">
                  {p.title}
                </p>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <Badge variant={p.difficulty}>{p.difficulty}</Badge>
                  <span className="text-muted-foreground text-xs truncate">{p.topic}</span>
                  {solvedSlugs.has(p.slug)
                    ? <span className="shrink-0 text-green-500 text-xs font-bold">✓</span>
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

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Check:
- Header shows "Cheatcode" logo left, "Interview Prep" + theme toggle right
- Theme toggle switches between light and dark modes
- Progress bar fills correctly
- Problem cards show with hover highlight (`bg-accent/50`)
- Difficulty badges show correct colors (green/amber/red)

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/ProblemList.tsx
git commit -m "feat: redesign home page with sticky header and theme toggle"
```

---

### Task 4: TestResults Skeleton

**Files:**
- Modify: `src/components/TestResults.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `src/components/ui/skeleton.tsx` (Task 2)
- Produces: Updated prop interface — `isAnalyzing?: boolean` added
- Produces: `TestResultsProps` = `{ result: RunResult | null, isRunning: boolean, complexity?: ComplexityResult | null, isAnalyzing?: boolean }`

- [ ] **Step 1: Replace TestResults.tsx**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { RunResult, ComplexityResult } from '@/types/runner'

interface TestResultsProps {
  result: RunResult | null
  isRunning: boolean
  complexity?: ComplexityResult | null
  isAnalyzing?: boolean
}

export default function TestResults({ result, isRunning, complexity, isAnalyzing }: TestResultsProps) {
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
      <div className="p-5 space-y-4">
        <Skeleton className="h-5 w-24" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-3 w-3 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center px-4 py-8 text-sm text-muted-foreground">
        Run your code to see results
      </div>
    )
  }

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <div className="text-sm flex flex-col">
      {/* Results header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 border-l-2 ${allPassed ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <Badge className={allPassed
          ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
          : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        }>
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
              <div key={i} className={`px-4 py-3 ${r.passed ? '' : 'bg-red-50 dark:bg-red-900/10'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${r.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {r.passed ? '✓' : '✗'}
                  </span>
                  <span className={r.passed ? 'text-muted-foreground' : 'text-foreground'}>{r.description}</span>
                </div>
                {!r.passed && (
                  <div className="mt-2 ml-4 bg-muted rounded-md p-2.5 font-mono text-xs space-y-1">
                    {r.error ? (
                      <div className="text-red-600 dark:text-red-400">Error: {r.error}</div>
                    ) : (
                      <>
                        <div className="text-muted-foreground">expected <span className="text-green-600 dark:text-green-400">{JSON.stringify(r.expected)}</span></div>
                        <div className="text-muted-foreground">received <span className="text-red-600 dark:text-red-400">{JSON.stringify(r.actual)}</span></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {result.consoleOutput.length > 0 && (
            <div className="px-4 py-3 border-t">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Console</div>
              <div className="bg-muted rounded-md p-2.5 space-y-0.5">
                {result.consoleOutput.map((line, i) => (
                  <div key={i} className="font-mono text-xs text-amber-600 dark:text-yellow-300">{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Complexity section */}
          {isAnalyzing && !complexity && (
            <div className="px-4 py-3 border-t space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          )}

          {complexity && (
            <div className="px-4 py-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complexity</span>
                <Badge className={complexity.passesTarget
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                  : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }>
                  {complexity.passesTarget ? 'optimal' : 'suboptimal'}
                </Badge>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mb-1.5">
                <span>Time: <span className="text-foreground font-mono">{complexity.timeComplexity}</span></span>
                <span>Space: <span className="text-foreground font-mono">{complexity.spaceComplexity}</span></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{complexity.explanation}</p>
              {complexity.hint && (
                <div className="mt-2 px-3 py-2 bg-muted rounded-lg text-xs text-muted-foreground leading-relaxed border">
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

- [ ] **Step 2: Commit**

```bash
git add src/components/TestResults.tsx
git commit -m "feat: add skeleton loading states to TestResults"
```

---

### Task 5: Problem Page 3-Panel Layout

**Files:**
- Modify: `src/app/problems/[slug]/ProblemClient.tsx`
- Modify: `src/components/Editor.tsx`

**Interfaces:**
- Consumes: `TestResultsProps.isAnalyzing?: boolean` from Task 4
- Consumes: `ThemeToggle` from `src/components/ThemeToggle.tsx`
- Produces: `EditorProps` adds `theme?: string` — `'vs-dark' | 'vs'`, defaults to `'vs-dark'`

- [ ] **Step 1: Update Editor.tsx to accept theme prop**

```tsx
'use client'
import { useRef } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import { KeyMod, KeyCode } from 'monaco-editor'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onRun?: () => void
  theme?: string
}

export default function Editor({ value, onChange, onRun, theme = 'vs-dark' }: EditorProps) {
  const onRunRef = useRef(onRun)
  onRunRef.current = onRun

  const handleMount: OnMount = (editor) => {
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => {
      onRunRef.current?.()
    })
  }

  return (
    <MonacoEditor
      height="100%"
      language="typescript"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme={theme}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
    />
  )
}
```

- [ ] **Step 2: Replace ProblemClient.tsx**

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import HintChat from '@/components/HintChat'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Problem } from '@/types/problem'
import type { RunResult, ComplexityResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const STORAGE_KEY = (slug: string) => `code:${slug}`

export default function ProblemClient({ problem }: { problem: Problem }) {
  const { resolvedTheme } = useTheme()
  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return problem.starterCode
    return localStorage.getItem(STORAGE_KEY(problem.slug)) ?? problem.starterCode
  })
  const [result, setResult] = useState<RunResult | null>(null)
  const [complexity, setComplexity] = useState<ComplexityResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)
  const runIdRef = useRef(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(problem.slug), code)
  }, [code, problem.slug])

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setIsAnalyzing(true)
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
        }).catch(() => {}).finally(() => setIsAnalyzing(false)),
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
        showToast('All tests passed!')
      }
    } catch {
      showToast('Error connecting to runner')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm shrink-0 h-14 gap-2 border-b">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/">← Back</Link>
          </Button>
          <span className="text-foreground/30 shrink-0">|</span>
          <h1 className="text-sm font-medium truncate">{problem.title}</h1>
          <Badge variant={problem.difficulty as 'easy' | 'medium' | 'hard'} className="shrink-0">
            {problem.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:block shrink-0">{problem.topic}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <Button
            onClick={handleRun}
            disabled={isRunning}
            size="sm"
          >
            {isRunning
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running</>
              : 'Run'
            }
          </Button>
          <span className="text-xs text-muted-foreground hidden sm:block">⌘↵</span>
          <ThemeToggle />
        </div>
      </header>

      {/* 3-panel body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Description — left column */}
        <div className="md:w-72 lg:w-80 shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-border p-6 bg-muted/20 max-h-48 md:max-h-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">{problem.description.trim()}</pre>
        </div>

        {/* Editor — center column, fills remaining space */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Editor
            value={code}
            onChange={setCode}
            onRun={handleRun}
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          />
        </div>

        {/* Results — right column */}
        <div className="md:w-80 lg:w-96 shrink-0 border-t md:border-t-0 md:border-l border-border overflow-y-auto">
          <TestResults
            result={result}
            isRunning={isRunning}
            complexity={complexity}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>

      <HintChat slug={problem.slug} code={code} />

      {/* Toast — always in DOM, CSS opacity transition */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border shadow-lg text-foreground px-5 py-3 rounded-full text-sm z-50 font-medium transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {toast}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify 3-panel layout in browser**

```bash
npm run dev
```

Open a problem page (e.g., http://localhost:3000/problems/two-sum). Check:
- Header has Back button, title, difficulty badge, timer, Run button with correct disabled state, theme toggle
- On desktop (≥768px): description left column, editor center, results right column — all three visible simultaneously
- On mobile (<768px): description collapses to max-h-48, editor below, results below editor
- Clicking Run shows `Loader2` spinner in button and skeleton in the results panel
- Monaco editor theme matches light/dark toggle state

- [ ] **Step 4: Commit**

```bash
git add src/app/problems/[slug]/ProblemClient.tsx src/components/Editor.tsx
git commit -m "feat: 3-panel problem layout, Loader2 run button, animated toast, Monaco theme toggle"
```

---

### Task 6: HintChat Revamp

**Files:**
- Modify: `src/components/HintChat.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `src/components/ui/skeleton.tsx`
- Consumes: `Input`, `Button` from `src/components/ui/` (Task 2 resets)

- [ ] **Step 1: Replace HintChat.tsx**

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Panel — always in DOM, slides via transform */}
      <div
        className="fixed right-0 z-30 flex flex-col bg-card border-l border-border w-80 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          top: '3.5rem',
          height: 'calc(100vh - 3.5rem)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Hints</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">AI · no spoilers</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Ask for a nudge. The AI won't write code for you — it'll ask questions to help you find the insight yourself.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-3 rounded-2xl rounded-bl-sm space-y-1.5">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-t shrink-0">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask for a hint…"
            autoFocus={open}
            className="flex-1 text-xs"
          />
          <Button
            onClick={send}
            disabled={!input.trim()}
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Fixed tab — right edge, always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed right-0 top-1/2 z-40 bg-card border border-r-0 border-border rounded-l-lg shadow-sm px-2 py-4 flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        style={{ transform: 'translateY(-50%)' }}
        aria-label={open ? 'Close hints' : 'Open hints'}
      >
        <MessageSquare className="h-4 w-4" />
        <span
          className="text-[10px] font-medium"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Hints
        </span>
      </button>
    </>
  )
}
```

- [ ] **Step 2: Verify HintChat in browser**

Open a problem page. Check:
- The "Hints" tab is visible on the right edge of the screen at all times
- Clicking the tab opens the panel from the right with a smooth 300ms slide
- The backdrop appears behind the panel
- Clicking the backdrop closes the panel
- The panel slides out smoothly on close
- The loading state shows two skeleton lines instead of bouncing dots
- The input field works; Enter sends a message

- [ ] **Step 3: Commit**

```bash
git add src/components/HintChat.tsx
git commit -m "feat: revamp HintChat — right-side slide panel, backdrop, skeleton loading"
```

---

### Task 7: Timer Cleanup

**Files:**
- Modify: `src/components/Timer.tsx`

**Interfaces:**
- No interface changes — same props `{ onTimeUp: () => void, elapsedRef: React.MutableRefObject<number> }`

- [ ] **Step 1: Update Timer.tsx**

Replace `src/components/Timer.tsx`:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { TIMER_MINUTES } from '@/lib/config'

interface TimerProps {
  onTimeUp: () => void
  elapsedRef: React.MutableRefObject<number>
}

export default function Timer({ onTimeUp, elapsedRef }: TimerProps) {
  const [remaining, setRemaining] = useState(TIMER_MINUTES * 60 * 1000)
  const notifiedRef = useRef(false)
  const startRef = useRef(Date.now())
  const onTimeUpRef = useRef(onTimeUp)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    const total = TIMER_MINUTES * 60 * 1000
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      elapsedRef.current = elapsed
      const r = total - elapsed
      setRemaining(r)
      if (r <= 0 && !notifiedRef.current) {
        notifiedRef.current = true
        onTimeUpRef.current()
      }
    }, 500)
    return () => clearInterval(tick)
  }, [])

  const overtime = remaining < 0
  const nearEnd = !overtime && remaining < 300_000
  const display = Math.abs(remaining)
  const mins = Math.floor(display / 60_000)
  const secs = Math.floor((display % 60_000) / 1000)

  const colorClass = overtime
    ? 'text-orange-500'
    : nearEnd
    ? 'text-amber-500'
    : 'text-muted-foreground'

  const dotClass = overtime
    ? 'bg-orange-500 animate-pulse'
    : nearEnd
    ? 'bg-amber-500'
    : 'bg-muted-foreground/40'

  return (
    <div className={`flex items-center gap-1.5 font-mono text-sm tabular-nums transition-colors duration-300 ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${dotClass}`} />
      {overtime ? '+' : ''}{mins}:{String(secs).padStart(2, '0')}
    </div>
  )
}
```

- [ ] **Step 2: Final browser check**

```bash
npm run dev
```

Run through the full user flow:
1. Home page loads — light/dark toggle works, progress bar renders
2. Click a problem — 3-panel layout visible
3. Click Run — button shows spinner, results panel shows skeleton, then results appear
4. Open hints tab — panel slides in from right, backdrop appears
5. Send a hint message — skeleton loading state appears in chat
6. Toggle theme — Monaco editor and all UI switch cleanly
7. Toggle theme back

- [ ] **Step 3: Commit**

```bash
git add src/components/Timer.tsx
git commit -m "feat: add transition-colors to Timer warning states"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Reset globals.css to shadcn zinc/slate defaults | Task 1 |
| Light/dark toggle via next-themes | Task 1 |
| ThemeProvider in layout.tsx | Task 1 |
| Fresh shadcn UI components (all 7) | Task 2 |
| Add Skeleton component | Task 2 |
| Difficulty badge variants (green/amber/red) | Task 2 |
| Home page sticky header + ThemeToggle | Task 3 |
| Problem card hover transition | Task 3 |
| TestResults skeleton when isRunning | Task 4 |
| Complexity skeleton when isAnalyzing | Task 4 |
| 3-panel layout (description / editor / results) | Task 5 |
| Remove all inline boxShadow styles | Task 5 |
| Loader2 spinner on Run button | Task 5 |
| Toast CSS opacity transition (no abrupt mount) | Task 5 |
| Monaco editor theme follows light/dark | Task 5 |
| HintChat moves to right side | Task 6 |
| CSS transform transition on panel | Task 6 |
| Backdrop with opacity transition | Task 6 |
| Skeleton loading in HintChat | Task 6 |
| Fixed tab toggle (replaces FAB) | Task 6 |
| Timer transition-colors | Task 7 |

All spec requirements covered. No TBDs or gaps.
