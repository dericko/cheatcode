# Cheatcode — LeetCode Clone Design Spec

**Date:** 2026-06-22  
**Status:** Approved

---

## Overview

A personal, locally-hosted LeetCode clone built with Next.js. Designed for interview prep: 36 curated coding challenges (20 easy, 10 medium, 6 hard), a Monaco code editor, server-side TypeScript/JavaScript execution, a countdown timer, and SQLite-backed progress tracking. Runs locally, hosted on Vercel optionally, portable via git.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Code execution | Node.js child process via `tsx`, spawned from Next.js API route |
| Database | SQLite via Prisma |
| Styling | Tailwind CSS |
| Future | `vercel-ai` for a chat hints sidebar |

---

## Architecture

```
/problems
  /arrays/two-sum.ts
  /strings/valid-palindrome.ts
  /trees/...
  /graphs/...
  /linked-lists/...
  /dynamic-programming/...

/src
  /app
    page.tsx                        ← problem list / home
    /problems/[slug]/page.tsx       ← problem page
    /api/run/route.ts               ← code execution endpoint
    /api/progress/route.ts          ← save/load progress

  /components
    Editor.tsx                      ← Monaco wrapper
    TestResults.tsx                 ← pass/fail + console output panel
    Timer.tsx                       ← 45-min countdown
    ProblemList.tsx                 ← browse + filter by topic/difficulty

  /lib
    runner.ts                       ← child process execution logic
    problems.ts                     ← loads and indexes all problem files

/prisma
  schema.prisma
  migrations/
```

**Data flow:**
1. User opens a problem → Monaco loads with starter code, timer starts
2. User clicks "Run" → POST `/api/run` with `{ slug, code }`
3. API route loads the problem's test cases, generates a temp script, spawns `tsx`
4. Child process executes code, captures stdout + console output, returns JSON
5. Results rendered in `TestResults` (verbose or summary mode, toggled via localStorage)
6. On all-pass: progress saved to SQLite via `/api/progress`

---

## Problem File Shape

Each problem is a `.ts` file exporting a single typed object. The **narrative** (title, description) is cleanly separated from the **mechanics** (test cases, function signature) to allow easy rethinking — e.g., swapping in a bird-themed description without touching any logic.

```typescript
export const problem = {
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "easy" as const,        // "easy" | "medium" | "hard"
  topic: "arrays",                    // used for filtering

  // Swap this block for "Bird Edition", photo variants, etc.
  description: `
    Given an array of integers \`nums\` and an integer \`target\`,
    return the indices of the two numbers that add up to \`target\`.
    Each input has exactly one solution. You may not use the same element twice.
  `,

  starterCode: `function twoSum(nums: number[], target: number): number[] {\n  // your code here\n}`,

  testCases: [
    { input: [[2, 7, 11, 15], 9], expected: [0, 1], description: "basic case" },
    { input: [[3, 2, 4], 6],      expected: [1, 2], description: "non-zero start" },
    { input: [[3, 3], 6],         expected: [0, 1], description: "duplicate values" },
  ],
}
```

---

## Code Execution

**API route** (`/api/run`):
- Receives `{ slug, code: string }`
- Loads problem file to get test cases
- Generates a temp `.ts` script that injects user code + test harness
- Spawns `tsx` child process with 10-second timeout
- Captures stdout/stderr, parses JSON result, returns to client

**Generated test script shape:**
```typescript
// --- user code injected here ---

const __results: any[] = []
const __console: string[] = []
const __origLog = console.log
console.log = (...args: any[]) => {
  __console.push(args.map(String).join(' '))
  __origLog(...args)
}

const __testCases = [ /* injected from problem file */ ]

function __deepEqual(a: any, b: any): boolean { /* ... */ }

for (const tc of __testCases) {
  try {
    const actual = twoSum(...tc.input)
    __results.push({ passed: __deepEqual(actual, tc.expected), actual, ...tc })
  } catch (e: any) {
    __results.push({ passed: false, error: e.message, ...tc })
  }
}

process.stdout.write(JSON.stringify({ results: __results, consoleOutput: __console }))
```

**Response shape:**
```typescript
{
  results: Array<{
    passed: boolean
    description: string
    input: any[]
    expected: any
    actual?: any
    error?: string
  }>
  consoleOutput: string[]
}
```

---

## Test Results UI

Results panel below the editor. Toggle state stored in localStorage (`testResultsMode: "verbose" | "summary"`).

**Verbose mode:**
- Each test case: green ✓ or red ✗
- On failure: expected vs actual diff
- Console output block at the bottom

**Summary mode:**
- Single badge: "4 / 5 passed"
- No per-case breakdown

---

## Problem Set (36 total)

| Topic | Easy | Medium | Hard |
|---|---|---|---|
| **Arrays** | Two Sum, Best Time to Buy/Sell Stock, Contains Duplicate, Product Except Self, Maximum Subarray | 3Sum, Container With Most Water | Trapping Rain Water |
| **Strings** | Valid Palindrome, Valid Anagram, Longest Common Prefix, Reverse Words in a String | Longest Substring Without Repeating Characters, Group Anagrams | Minimum Window Substring |
| **Linked Lists** | Reverse Linked List, Merge Two Sorted Lists, Detect Cycle | Remove Nth Node From End | Merge K Sorted Lists |
| **Trees** | Maximum Depth of Binary Tree, Invert Binary Tree, Symmetric Tree, Path Sum | Binary Tree Level Order Traversal, Validate BST | Binary Tree Maximum Path Sum |
| **Graphs** | Flood Fill | Number of Islands | Word Ladder |
| **Dynamic Programming** | Climbing Stairs, House Robber | Coin Change, Longest Increasing Subsequence | Edit Distance |
| **Misc** | Valid Parentheses | — | — |

Each problem is scoped so the core implementation takes 20–35 minutes, fitting comfortably in a 45-minute coding window within a 1-hour interview.

---

## Timer

- 45-minute countdown (configurable via `TIMER_MINUTES` constant in `lib/config.ts`)
- Starts automatically when problem page loads
- At zero: non-blocking toast notification — "Time's up — keep going!"
- Timer continues counting (shows overtime in a different color)
- Elapsed time recorded with each attempt

---

## Progress Tracking (SQLite + Prisma)

```prisma
model Attempt {
  id          Int      @id @default(autoincrement())
  slug        String
  code        String
  passed      Boolean
  timeSpentMs Int
  createdAt   DateTime @default(now())
}

model ProblemProgress {
  slug       String   @id
  solved     Boolean  @default(false)
  bestTimeMs Int?
  updatedAt  DateTime @updatedAt
}
```

- Progress saved on every "all tests pass" run
- Problem list shows ✓ on solved problems
- Attempt history preserved for reviewing past solutions

---

## Portability

`.gitignore` includes:
```
*.db
*.db-journal
.env
```

Setup on a new machine:
```bash
git clone <repo>
npm install
npx prisma migrate dev
npm run dev
```

Problem files and schema are committed. Progress starts fresh on each machine (intentional — it's a practice tool).

---

## Future: AI Hints Sidebar

Placeholder for `vercel-ai` integration: a collapsible sidebar with a chat interface scoped to the current problem. Not in scope for v1.
