# Cheatcode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Next.js LeetCode clone with Monaco editor, server-side TypeScript execution, SQLite progress tracking, and 36 curated interview problems.

**Architecture:** Next.js 14 App Router. Problem data lives as static TypeScript files in `/problems`, indexed by `problems/index.ts`. A server-side runner spawns `tsx` child processes to execute user code against injected test cases. Prisma+SQLite tracks progress. The problem page splits into a server component (data fetch) and a client component (Monaco, timer, test results).

**Tech Stack:** Next.js 14, TypeScript strict, Monaco Editor (`@monaco-editor/react`), Prisma + SQLite (`@prisma/client`), Tailwind CSS, `tsx` for code execution, Vitest for tests.

## Global Constraints

- Next.js 14 App Router only — no Pages Router patterns
- TypeScript strict mode throughout
- No external UI component libraries — Tailwind only
- User code runs in a `tsx` child process — no imports allowed, standard TypeScript only
- Problem files committed to git; `*.db` and `*.db-journal` gitignored
- `TIMER_MINUTES = 45` in `src/lib/config.ts`
- Runner timeout: 10 seconds per execution
- Results mode toggle stored in localStorage key `testResultsMode`

---

## File Map

```
problems/
  shared.ts                          ← LINKED_LIST_SETUP, TREE_SETUP constants
  index.ts                           ← re-exports all 36 problems as allProblems[]
  arrays/
    two-sum.ts, best-time-to-buy-and-sell-stock.ts, contains-duplicate.ts,
    product-of-array-except-self.ts, maximum-subarray.ts,
    3sum.ts, container-with-most-water.ts, trapping-rain-water.ts
  strings/
    valid-palindrome.ts, valid-anagram.ts, longest-common-prefix.ts,
    reverse-words-in-a-string.ts, longest-substring-without-repeating-characters.ts,
    group-anagrams.ts, minimum-window-substring.ts
  linked-lists/
    reverse-linked-list.ts, merge-two-sorted-lists.ts, linked-list-cycle.ts,
    remove-nth-node-from-end-of-list.ts, merge-k-sorted-lists.ts
  trees/
    maximum-depth-of-binary-tree.ts, invert-binary-tree.ts, symmetric-tree.ts,
    path-sum.ts, binary-tree-level-order-traversal.ts,
    validate-binary-search-tree.ts, binary-tree-maximum-path-sum.ts
  graphs/
    flood-fill.ts, number-of-islands.ts, word-ladder.ts
  dynamic-programming/
    climbing-stairs.ts, house-robber.ts, coin-change.ts,
    longest-increasing-subsequence.ts, edit-distance.ts
  misc/
    valid-parentheses.ts

src/
  types/
    problem.ts                       ← Problem, TestCase, Difficulty, Topic
    runner.ts                        ← RunRequest, RunResult, TestCaseResult
  lib/
    config.ts                        ← TIMER_MINUTES constant
    problems.ts                      ← getAllProblems, getProblemBySlug
    runner.ts                        ← runCode() — spawns tsx child process
    db.ts                            ← Prisma singleton
  components/
    Editor.tsx                       ← Monaco wrapper ('use client')
    TestResults.tsx                  ← pass/fail + console output ('use client')
    Timer.tsx                        ← 45-min countdown ('use client')
    ProblemList.tsx                  ← filterable list ('use client')
  app/
    page.tsx                         ← home (server component)
    problems/[slug]/
      page.tsx                       ← server component — fetches problem
      ProblemClient.tsx              ← client component — editor + run logic
    api/run/route.ts                 ← POST: execute code
    api/progress/route.ts           ← GET/POST: load/save progress

prisma/schema.prisma
.env                                 ← DATABASE_URL (gitignored)
__tests__/runner.test.ts
__tests__/problems.test.ts
```

---

### Task 1: Project Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.gitignore`, `vitest.config.ts`

**Interfaces:**
- Produces: running dev server, working test runner

- [ ] **Step 1: Scaffold Next.js**

```bash
cd /Users/detc/prog/cheatcode
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @monaco-editor/react @prisma/client
npm install --save-dev prisma tsx vitest @vitest/ui
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json` `"scripts"` section, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

- [ ] **Step 5: Update .gitignore**

Add to `.gitignore`:
```
*.db
*.db-journal
.env
```

- [ ] **Step 6: Create .env**

```
DATABASE_URL="file:./prisma/dev.db"
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: Next.js running at http://localhost:3000

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js app with dependencies"
```

---

### Task 2: Shared Types + Config

**Files:**
- Create: `src/types/problem.ts`, `src/types/runner.ts`, `src/lib/config.ts`

**Interfaces:**
- Produces: `Problem`, `TestCase`, `Difficulty`, `Topic`, `RunRequest`, `RunResult`, `TestCaseResult`, `TIMER_MINUTES`

- [ ] **Step 1: Create src/types/problem.ts**

```typescript
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Topic =
  | 'arrays'
  | 'strings'
  | 'linked-lists'
  | 'trees'
  | 'graphs'
  | 'dynamic-programming'
  | 'misc'

export interface TestCase {
  input: any[]
  expected: any
  description: string
}

export interface Problem {
  slug: string
  title: string
  difficulty: Difficulty
  topic: Topic
  description: string
  functionName: string
  starterCode: string
  setupCode?: string
  testCallCode?: string
  testCases: TestCase[]
}
```

- [ ] **Step 2: Create src/types/runner.ts**

```typescript
export interface RunRequest {
  userCode: string
  functionName: string
  testCases: Array<{ input: any[]; expected: any; description: string }>
  setupCode?: string
  testCallCode?: string
}

export interface TestCaseResult {
  passed: boolean
  description: string
  input?: any[]
  expected?: any
  actual?: any
  error?: string
}

export interface RunResult {
  results: TestCaseResult[]
  consoleOutput: string[]
}
```

- [ ] **Step 3: Create src/lib/config.ts**

```typescript
export const TIMER_MINUTES = 45
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add shared types and config"
```

---

### Task 3: Problem Infrastructure

**Files:**
- Create: `problems/shared.ts`, `problems/index.ts` (empty registry), `src/lib/problems.ts`

**Interfaces:**
- Produces: `LINKED_LIST_SETUP`, `TREE_SETUP`, `getAllProblems()`, `getProblemBySlug(slug)`
- Consumed by: runner (Task 5), API routes (Task 6), pages (Tasks 8–9)

- [ ] **Step 1: Write failing test**

Create `__tests__/problems.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getAllProblems, getProblemBySlug } from '../src/lib/problems'

describe('problems', () => {
  it('loads all 36 problems', () => {
    expect(getAllProblems()).toHaveLength(36)
  })

  it('each problem has required fields', () => {
    for (const p of getAllProblems()) {
      expect(p.slug, `${p.slug} slug`).toBeTruthy()
      expect(p.title, `${p.slug} title`).toBeTruthy()
      expect(['easy', 'medium', 'hard'], `${p.slug} difficulty`).toContain(p.difficulty)
      expect(p.functionName, `${p.slug} functionName`).toBeTruthy()
      expect(p.testCases.length, `${p.slug} testCases`).toBeGreaterThanOrEqual(2)
      expect(p.starterCode, `${p.slug} starterCode`).toBeTruthy()
    }
  })

  it('slugs are unique', () => {
    const slugs = getAllProblems().map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('looks up problem by slug', () => {
    const p = getProblemBySlug('two-sum')
    expect(p).not.toBeNull()
    expect(p!.title).toBe('Two Sum')
  })

  it('returns null for unknown slug', () => {
    expect(getProblemBySlug('does-not-exist')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- problems
```
Expected: FAIL (modules not found)

- [ ] **Step 3: Create problems/shared.ts**

```typescript
export const LINKED_LIST_SETUP = `
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
function arrayToList(arr: number[]): ListNode | null {
  if (!arr.length) return null
  const head = new ListNode(arr[0])
  let curr = head
  for (let i = 1; i < arr.length; i++) { curr.next = new ListNode(arr[i]); curr = curr.next! }
  return head
}
function listToArray(head: ListNode | null): number[] {
  const r: number[] = []
  while (head) { r.push(head.val); head = head.next }
  return r
}
function buildCyclicList(vals: number[], pos: number): ListNode | null {
  if (!vals.length) return null
  const nodes = vals.map(v => new ListNode(v))
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1]
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos]
  return nodes[0]
}
`

export const TREE_SETUP = `
class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val
    this.left = left === undefined ? null : left
    this.right = right === undefined ? null : right
  }
}
function arrayToTree(arr: (number | null)[]): TreeNode | null {
  if (!arr.length || arr[0] === null) return null
  const root = new TreeNode(arr[0])
  const queue: TreeNode[] = [root]
  let i = 1
  while (queue.length && i < arr.length) {
    const node = queue.shift()!
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i] as number); queue.push(node.left) }
    i++
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i] as number); queue.push(node.right) }
    i++
  }
  return root
}
function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return []
  const result: (number | null)[] = []
  const queue: (TreeNode | null)[] = [root]
  while (queue.length) {
    const node = queue.shift()!
    if (node) { result.push(node.val); queue.push(node.left); queue.push(node.right) }
    else result.push(null)
  }
  while (result[result.length - 1] === null) result.pop()
  return result
}
`
```

- [ ] **Step 4: Create problems/index.ts (stub — will grow as problems are added)**

```typescript
import type { Problem } from '../src/types/problem'

export const allProblems: Problem[] = []
```

- [ ] **Step 5: Create src/lib/problems.ts**

```typescript
import { allProblems } from '../../problems/index'
import type { Problem, Difficulty, Topic } from '@/types/problem'

export function getAllProblems(): Problem[] {
  return allProblems
}

export function getProblemBySlug(slug: string): Problem | null {
  return allProblems.find(p => p.slug === slug) ?? null
}

export function getProblemsByTopic(topic: Topic): Problem[] {
  return allProblems.filter(p => p.topic === topic)
}

export function getProblemsByDifficulty(difficulty: Difficulty): Problem[] {
  return allProblems.filter(p => p.difficulty === difficulty)
}
```

- [ ] **Step 6: Run test — expect partial pass**

```bash
npm test -- problems
```
Expected: "loads all 36 problems" FAILS (0 problems), others pass

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: problem infrastructure scaffold"
```

---

### Task 4: Prisma + SQLite

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`

**Interfaces:**
- Produces: `db` — Prisma client singleton with `attempt` and `problemProgress` tables
- Consumed by: `/api/progress/route.ts`, `app/page.tsx`

- [ ] **Step 1: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

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

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name init
```
Expected: Creates `prisma/migrations/`, generates `@prisma/client`

- [ ] **Step 3: Create src/lib/db.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Prisma + SQLite schema and client"
```

---

### Task 5: Code Runner

**Files:**
- Create: `src/lib/runner.ts`
- Test: `__tests__/runner.test.ts`

**Interfaces:**
- Produces: `runCode(req: RunRequest): Promise<RunResult>`
- Consumed by: `/api/run/route.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/runner.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { runCode } from '../src/lib/runner'

describe('runCode', () => {
  it('passes for correct code', async () => {
    const result = await runCode({
      userCode: 'function add(a: number, b: number): number { return a + b }',
      functionName: 'add',
      testCases: [
        { input: [1, 2], expected: 3, description: 'basic' },
        { input: [0, 0], expected: 0, description: 'zeros' },
      ],
    })
    expect(result.results).toHaveLength(2)
    expect(result.results[0].passed).toBe(true)
    expect(result.results[1].passed).toBe(true)
  })

  it('fails for incorrect code', async () => {
    const result = await runCode({
      userCode: 'function add(a: number, b: number): number { return a - b }',
      functionName: 'add',
      testCases: [{ input: [1, 2], expected: 3, description: 'basic' }],
    })
    expect(result.results[0].passed).toBe(false)
    expect(result.results[0].actual).toBe(-1)
  })

  it('captures console.log output', async () => {
    const result = await runCode({
      userCode: 'function dbg(n: number): number { console.log("val:", n); return n }',
      functionName: 'dbg',
      testCases: [{ input: [42], expected: 42, description: 'debug' }],
    })
    expect(result.consoleOutput).toContain('val: 42')
    expect(result.results[0].passed).toBe(true)
  })

  it('handles runtime errors gracefully', async () => {
    const result = await runCode({
      userCode: 'function boom(): number { throw new Error("oops") }',
      functionName: 'boom',
      testCases: [{ input: [], expected: 1, description: 'error case' }],
    })
    expect(result.results[0].passed).toBe(false)
    expect(result.results[0].error).toBe('oops')
  })

  it('uses testCallCode when provided', async () => {
    const result = await runCode({
      userCode: 'function double(n: number): number { return n * 2 }',
      functionName: 'double',
      testCallCode: 'double(tc.input[0]) + 1',
      testCases: [{ input: [5], expected: 11, description: 'double+1' }],
    })
    expect(result.results[0].passed).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- runner
```
Expected: FAIL (runner.ts not found)

- [ ] **Step 3: Create src/lib/runner.ts**

```typescript
import { spawn } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { RunRequest, RunResult } from '@/types/runner'

const TSX_BIN = join(process.cwd(), 'node_modules', '.bin', 'tsx')

function generateScript(req: RunRequest): string {
  const testCasesJson = JSON.stringify(req.testCases)
  const callExpr = req.testCallCode ?? `${req.functionName}(...tc.input)`

  return `
${req.setupCode ?? ''}

${req.userCode}

const __results: any[] = []
const __console: string[] = []
const __origLog = console.log
console.log = (...args: any[]) => {
  __console.push(args.map(String).join(' '))
  __origLog(...args)
}

function __deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    return a.every((v: any, i: number) => __deepEqual(v, b[i]))
  }
  const ka = Object.keys(a), kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every((k: string) => __deepEqual(a[k], b[k]))
}

const __testCases = ${testCasesJson}

for (const tc of __testCases) {
  try {
    const actual = ${callExpr}
    __results.push({ passed: __deepEqual(actual, tc.expected), actual, expected: tc.expected, description: tc.description })
  } catch (e: any) {
    __results.push({ passed: false, error: e.message, description: tc.description })
  }
}

process.stdout.write(JSON.stringify({ results: __results, consoleOutput: __console }))
`
}

export async function runCode(req: RunRequest): Promise<RunResult> {
  const script = generateScript(req)
  const tmpFile = join(tmpdir(), `cheatcode-${randomUUID()}.ts`)
  writeFileSync(tmpFile, script, 'utf-8')

  return new Promise((resolve) => {
    const proc = spawn(TSX_BIN, [tmpFile], { timeout: 10_000 })

    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })

    proc.on('close', () => {
      try { unlinkSync(tmpFile) } catch {}

      if (!stdout) {
        resolve({
          results: [{ passed: false, description: 'execution', error: stderr || 'No output' }],
          consoleOutput: [],
        })
        return
      }

      try {
        resolve(JSON.parse(stdout) as RunResult)
      } catch {
        resolve({
          results: [{ passed: false, description: 'execution', error: `Parse error: ${stdout}\n${stderr}` }],
          consoleOutput: [],
        })
      }
    })

    proc.on('error', () => {
      try { unlinkSync(tmpFile) } catch {}
      resolve({
        results: [{ passed: false, description: 'execution', error: 'Failed to spawn runner' }],
        consoleOutput: [],
      })
    })
  })
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- runner
```
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: code runner with tsx child process"
```

---

### Task 6: API Routes

**Files:**
- Create: `src/app/api/run/route.ts`, `src/app/api/progress/route.ts`

**Interfaces:**
- `POST /api/run` — body: `{ slug, code }` → `RunResult`
- `GET /api/progress` — query: `?slug=x` → `{ progress, attempts }` or all progress
- `POST /api/progress` — body: `{ slug, code, passed, timeSpentMs }` → `{ ok: true }`

- [ ] **Step 1: Create src/app/api/run/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { runCode } from '@/lib/runner'

export async function POST(req: NextRequest) {
  const { slug, code } = await req.json()

  const problem = getProblemBySlug(slug)
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  const result = await runCode({
    userCode: code,
    functionName: problem.functionName,
    testCases: problem.testCases,
    setupCode: problem.setupCode,
    testCallCode: problem.testCallCode,
  })

  return NextResponse.json(result)
}
```

- [ ] **Step 2: Create src/app/api/progress/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')

  if (slug) {
    const [progress, attempts] = await Promise.all([
      db.problemProgress.findUnique({ where: { slug } }),
      db.attempt.findMany({ where: { slug }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ])
    return NextResponse.json({ progress, attempts })
  }

  const allProgress = await db.problemProgress.findMany()
  return NextResponse.json({ progress: allProgress })
}

export async function POST(req: NextRequest) {
  const { slug, code, passed, timeSpentMs } = await req.json()

  await db.attempt.create({ data: { slug, code, passed, timeSpentMs } })

  if (passed) {
    const existing = await db.problemProgress.findUnique({ where: { slug } })
    const betterTime = !existing?.bestTimeMs || timeSpentMs < existing.bestTimeMs

    await db.problemProgress.upsert({
      where: { slug },
      create: { slug, solved: true, bestTimeMs: timeSpentMs },
      update: { solved: true, ...(betterTime && { bestTimeMs: timeSpentMs }) },
    })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Verify routes respond (dev server must be running)**

```bash
curl -s -X POST http://localhost:3000/api/run \
  -H "Content-Type: application/json" \
  -d '{"slug":"two-sum","code":"function twoSum(n,t){return [0,1]}"}'
```
Expected: JSON with results array (will fail test cases but should not 404 — problem not yet added, expect `{"error":"Problem not found"}` until Task 10)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: API routes for run and progress"
```

---

### Task 7: UI Components

**Files:**
- Create: `src/components/Editor.tsx`, `src/components/TestResults.tsx`, `src/components/Timer.tsx`, `src/components/ProblemList.tsx`

**Interfaces:**
- `Editor` props: `{ value: string, onChange: (v: string) => void }`
- `TestResults` props: `{ result: RunResult | null, isRunning: boolean }`
- `Timer` props: `{ onTimeUp: () => void, elapsedRef: React.MutableRefObject<number> }`
- `ProblemList` props: `{ problems: Problem[], solvedSlugs: Set<string> }`

- [ ] **Step 1: Create src/components/Editor.tsx**

```typescript
'use client'
import MonacoEditor from '@monaco-editor/react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language="typescript"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="vs-dark"
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

- [ ] **Step 2: Create src/components/TestResults.tsx**

```typescript
'use client'
import { useState, useEffect } from 'react'
import type { RunResult } from '@/types/runner'

interface TestResultsProps {
  result: RunResult | null
  isRunning: boolean
}

export default function TestResults({ result, isRunning }: TestResultsProps) {
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

  if (isRunning) return <div className="p-4 text-gray-400 text-sm">Running...</div>
  if (!result) return <div className="p-4 text-gray-500 text-sm">Run your code to see results</div>

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className={`font-medium ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
          {passed}/{total} passed
        </span>
        <button onClick={toggleMode} className="text-xs text-gray-400 hover:text-gray-200 underline">
          {mode === 'verbose' ? 'Summary view' : 'Verbose view'}
        </button>
      </div>

      {mode === 'verbose' && (
        <>
          <div className="divide-y divide-gray-800">
            {result.results.map((r, i) => (
              <div key={i} className={`px-3 py-2 ${r.passed ? 'bg-green-950/30' : 'bg-red-950/30'}`}>
                <div className="flex items-center gap-2">
                  <span className={r.passed ? 'text-green-400' : 'text-red-400'}>{r.passed ? '✓' : '✗'}</span>
                  <span className="text-gray-300">{r.description}</span>
                </div>
                {!r.passed && (
                  <div className="mt-1.5 ml-5 space-y-0.5 font-mono text-xs">
                    {r.error ? (
                      <div className="text-red-400">Error: {r.error}</div>
                    ) : (
                      <>
                        <div className="text-gray-400">Expected: <span className="text-green-400">{JSON.stringify(r.expected)}</span></div>
                        <div className="text-gray-400">Got:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-red-400">{JSON.stringify(r.actual)}</span></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {result.consoleOutput.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-1">Console</div>
              {result.consoleOutput.map((line, i) => (
                <div key={i} className="font-mono text-xs text-yellow-300">{line}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/Timer.tsx**

```typescript
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

  useEffect(() => {
    const total = TIMER_MINUTES * 60 * 1000
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      elapsedRef.current = elapsed
      const r = total - elapsed
      setRemaining(r)
      if (r <= 0 && !notifiedRef.current) {
        notifiedRef.current = true
        onTimeUp()
      }
    }, 500)
    return () => clearInterval(tick)
  }, [])

  const overtime = remaining < 0
  const display = Math.abs(remaining)
  const mins = Math.floor(display / 60_000)
  const secs = Math.floor((display % 60_000) / 1000)

  return (
    <span className={`font-mono text-sm tabular-nums ${
      overtime ? 'text-orange-400' : remaining < 300_000 ? 'text-yellow-400' : 'text-gray-300'
    }`}>
      {overtime ? '+' : ''}{mins}:{String(secs).padStart(2, '0')}
    </span>
  )
}
```

- [ ] **Step 4: Create src/components/ProblemList.tsx**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const DIFF_COLORS: Record<Difficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
}

interface ProblemListProps {
  problems: Problem[]
  solvedSlugs: Set<string>
}

export default function ProblemList({ problems, solvedSlugs }: ProblemListProps) {
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all')
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all')

  const filtered = problems.filter(p =>
    (topicFilter === 'all' || p.topic === topicFilter) &&
    (diffFilter === 'all' || p.difficulty === diffFilter)
  )

  return (
    <div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={topicFilter}
          onChange={e => setTopicFilter(e.target.value as Topic | 'all')}
          className="bg-gray-800 text-gray-200 px-3 py-1.5 rounded text-sm border border-gray-700 focus:outline-none"
        >
          <option value="all">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={diffFilter}
          onChange={e => setDiffFilter(e.target.value as Difficulty | 'all')}
          className="bg-gray-800 text-gray-200 px-3 py-1.5 rounded text-sm border border-gray-700 focus:outline-none"
        >
          <option value="all">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="self-center text-xs text-gray-500 ml-auto">{filtered.length} problems</span>
      </div>

      <div className="space-y-1.5">
        {filtered.map((p, i) => (
          <Link key={p.slug} href={`/problems/${p.slug}`}
            className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 rounded border border-gray-700 hover:border-gray-500 transition-colors group">
            <span className="text-gray-500 w-5 text-right text-xs tabular-nums">{i + 1}</span>
            <span className="flex-1 text-gray-100 group-hover:text-white">{p.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400 hidden sm:block">{p.topic}</span>
            <span className={`text-sm font-medium ${DIFF_COLORS[p.difficulty]}`}>{p.difficulty}</span>
            {solvedSlugs.has(p.slug) && <span className="text-green-400 text-xs">✓</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: UI components — Editor, TestResults, Timer, ProblemList"
```

---

### Task 8: Problem Page

**Files:**
- Create: `src/app/problems/[slug]/page.tsx`, `src/app/problems/[slug]/ProblemClient.tsx`

**Interfaces:**
- Consumes: `getProblemBySlug`, `Editor`, `TestResults`, `Timer`, `RunResult`

- [ ] **Step 1: Create src/app/problems/[slug]/page.tsx**

```typescript
import { getProblemBySlug, getAllProblems } from '@/lib/problems'
import { notFound } from 'next/navigation'
import ProblemClient from './ProblemClient'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return getAllProblems().map(p => ({ slug: p.slug }))
}

export default function ProblemPage({ params }: Props) {
  const problem = getProblemBySlug(params.slug)
  if (!problem) notFound()
  return <ProblemClient problem={problem} />
}
```

- [ ] **Step 2: Create src/app/problems/[slug]/ProblemClient.tsx**

```typescript
'use client'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import type { Problem } from '@/types/problem'
import type { RunResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  hard: 'bg-red-900 text-red-300',
}

export default function ProblemClient({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(problem.starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const elapsedRef = useRef(0)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code }),
      })
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
    } catch (e) {
      showToast('Error connecting to runner')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-200 text-sm">← Problems</a>
          <h1 className="font-semibold text-sm">{problem.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded ${DIFF_BADGE[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-gray-500">{problem.topic}</span>
        </div>
        <div className="flex items-center gap-4">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm font-medium transition-colors"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Description panel */}
        <div className="w-2/5 min-w-64 overflow-y-auto p-5 border-r border-gray-800 text-sm text-gray-300 leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">{problem.description.trim()}</pre>
        </div>

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor value={code} onChange={setCode} />
          </div>
          <div className="h-52 border-t border-gray-800 shrink-0 overflow-hidden">
            <TestResults result={result} isRunning={isRunning} />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-gray-800 border border-gray-600 text-gray-100 px-4 py-2 rounded shadow-xl text-sm z-50 animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify problem page loads (after at least one problem is added in Task 10)**

Visit http://localhost:3000/problems/two-sum

Expected: Monaco editor loads with starter code, timer starts counting down

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: problem page with editor, timer, and test results"
```

---

### Task 9: Home Page

**Files:**
- Modify: `src/app/page.tsx` (replace default scaffold)
- Modify: `src/app/globals.css` (clean up scaffold styles)

- [ ] **Step 1: Replace src/app/page.tsx**

```typescript
import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const problems = getAllProblems()
  const solvedProgress = await db.problemProgress.findMany({ where: { solved: true } })
  const solvedSlugs = new Set(solvedProgress.map(p => p.slug))

  const easy = problems.filter(p => p.difficulty === 'easy').length
  const medium = problems.filter(p => p.difficulty === 'medium').length
  const hard = problems.filter(p => p.difficulty === 'hard').length

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Cheatcode</h1>
          <p className="text-gray-400 text-sm">
            {solvedProgress.length}/{problems.length} solved
            &nbsp;·&nbsp;
            {easy} easy · {medium} medium · {hard} hard
          </p>
        </div>
        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Update src/app/globals.css — remove scaffold content, keep Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Verify home page loads**

Visit http://localhost:3000 — Expected: problem list with filter dropdowns (empty until problems added)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: home page with problem list and progress summary"
```

---

### Task 10: Easy Array Problems

**Files:**
- Create: 5 files in `problems/arrays/`
- Modify: `problems/index.ts` to register them

- [ ] **Step 1: Create problems/arrays/two-sum.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'two-sum',
  title: 'Two Sum',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'twoSum',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers that add up to \`target\`.

Each input has exactly one solution. You may not use the same element twice. Return the answer in any order.

Example:
  Input: nums = [2,7,11,15], target = 9
  Output: [0,1]
  Explanation: nums[0] + nums[1] = 2 + 7 = 9`,
  starterCode: `function twoSum(nums: number[], target: number): number[] {\n\n}`,
  testCases: [
    { input: [[2,7,11,15], 9], expected: [0,1], description: 'basic case' },
    { input: [[3,2,4], 6], expected: [1,2], description: 'non-sequential indices' },
    { input: [[3,3], 6], expected: [0,1], description: 'duplicate values' },
  ],
}
```

- [ ] **Step 2: Create problems/arrays/best-time-to-buy-and-sell-stock.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'best-time-to-buy-and-sell-stock',
  title: 'Best Time to Buy and Sell Stock',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'maxProfit',
  description: `Given an array \`prices\` where \`prices[i]\` is the stock price on day i, return the maximum profit from a single buy-then-sell transaction. Return 0 if no profit is possible.

Example:
  Input: prices = [7,1,5,3,6,4]
  Output: 5
  Explanation: Buy day 2 (price=1), sell day 5 (price=6), profit = 5`,
  starterCode: `function maxProfit(prices: number[]): number {\n\n}`,
  testCases: [
    { input: [[7,1,5,3,6,4]], expected: 5, description: 'standard case' },
    { input: [[7,6,4,3,1]], expected: 0, description: 'declining prices — no profit' },
    { input: [[1,2]], expected: 1, description: 'two-day window' },
  ],
}
```

- [ ] **Step 3: Create problems/arrays/contains-duplicate.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'contains-duplicate',
  title: 'Contains Duplicate',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'containsDuplicate',
  description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice, or \`false\` if all elements are distinct.

Example:
  Input: nums = [1,2,3,1]
  Output: true`,
  starterCode: `function containsDuplicate(nums: number[]): boolean {\n\n}`,
  testCases: [
    { input: [[1,2,3,1]], expected: true, description: 'has duplicate' },
    { input: [[1,2,3,4]], expected: false, description: 'all unique' },
    { input: [[1,1,1,3,3,4,3,2,4,2]], expected: true, description: 'many duplicates' },
  ],
}
```

- [ ] **Step 4: Create problems/arrays/product-of-array-except-self.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'product-of-array-except-self',
  title: 'Product of Array Except Self',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'productExceptSelf',
  description: `Given an integer array \`nums\`, return an array where each element is the product of all other elements. Solve in O(n) time without division.

Example:
  Input: nums = [1,2,3,4]
  Output: [24,12,8,6]`,
  starterCode: `function productExceptSelf(nums: number[]): number[] {\n\n}`,
  testCases: [
    { input: [[1,2,3,4]], expected: [24,12,8,6], description: 'standard case' },
    { input: [[-1,1,0,-3,3]], expected: [0,0,9,0,0], description: 'contains zero' },
    { input: [[1,1]], expected: [1,1], description: 'two elements' },
  ],
}
```

- [ ] **Step 5: Create problems/arrays/maximum-subarray.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'maximum-subarray',
  title: 'Maximum Subarray',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'maxSubArray',
  description: `Given an integer array \`nums\`, find the contiguous subarray with the largest sum and return its sum.

Example:
  Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
  Output: 6
  Explanation: [4,-1,2,1] has the largest sum = 6`,
  starterCode: `function maxSubArray(nums: number[]): number {\n\n}`,
  testCases: [
    { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6, description: 'classic Kadane' },
    { input: [[1]], expected: 1, description: 'single element' },
    { input: [[5,4,-1,7,8]], expected: 23, description: 'mostly positive' },
  ],
}
```

- [ ] **Step 6: Update problems/index.ts**

```typescript
import type { Problem } from '../src/types/problem'
import { problem as twoSum } from './arrays/two-sum'
import { problem as bestTime } from './arrays/best-time-to-buy-and-sell-stock'
import { problem as containsDuplicate } from './arrays/contains-duplicate'
import { problem as productExceptSelf } from './arrays/product-of-array-except-self'
import { problem as maxSubArray } from './arrays/maximum-subarray'

export const allProblems: Problem[] = [
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
]
```

- [ ] **Step 7: Verify two-sum loads in browser**

Visit http://localhost:3000/problems/two-sum — Expected: problem description shown, Monaco editor with starter code

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: easy array problems (5)"
```

---

### Task 11: Easy String Problems

**Files:**
- Create: 4 files in `problems/strings/`
- Modify: `problems/index.ts`

- [ ] **Step 1: Create problems/strings/valid-palindrome.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'valid-palindrome',
  title: 'Valid Palindrome',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'isPalindrome',
  description: `A phrase is a palindrome if, after removing non-alphanumeric characters and lowercasing, it reads the same forward and backward.

Example:
  Input: s = "A man, a plan, a canal: Panama"
  Output: true`,
  starterCode: `function isPalindrome(s: string): boolean {\n\n}`,
  testCases: [
    { input: ['A man, a plan, a canal: Panama'], expected: true, description: 'classic with punctuation' },
    { input: ['race a car'], expected: false, description: 'not a palindrome' },
    { input: [' '], expected: true, description: 'empty after cleaning' },
  ],
}
```

- [ ] **Step 2: Create problems/strings/valid-anagram.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'valid-anagram',
  title: 'Valid Anagram',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'isAnagram',
  description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`.

Example:
  Input: s = "anagram", t = "nagaram"
  Output: true`,
  starterCode: `function isAnagram(s: string, t: string): boolean {\n\n}`,
  testCases: [
    { input: ['anagram', 'nagaram'], expected: true, description: 'valid anagram' },
    { input: ['rat', 'car'], expected: false, description: 'not an anagram' },
    { input: ['a', 'ab'], expected: false, description: 'different lengths' },
  ],
}
```

- [ ] **Step 3: Create problems/strings/longest-common-prefix.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'longest-common-prefix',
  title: 'Longest Common Prefix',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'longestCommonPrefix',
  description: `Find the longest common prefix string among an array of strings. Return \`""\` if there is none.

Example:
  Input: strs = ["flower","flow","flight"]
  Output: "fl"`,
  starterCode: `function longestCommonPrefix(strs: string[]): string {\n\n}`,
  testCases: [
    { input: [['flower','flow','flight']], expected: 'fl', description: 'standard case' },
    { input: [['dog','racecar','car']], expected: '', description: 'no common prefix' },
    { input: [['ab','a']], expected: 'a', description: 'prefix is one char' },
  ],
}
```

- [ ] **Step 4: Create problems/strings/reverse-words-in-a-string.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'reverse-words-in-a-string',
  title: 'Reverse Words in a String',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'reverseWords',
  description: `Given a string \`s\`, reverse the order of words. Words are separated by spaces; the result must have single spaces only (no leading/trailing spaces).

Example:
  Input: s = "the sky is blue"
  Output: "blue is sky the"`,
  starterCode: `function reverseWords(s: string): string {\n\n}`,
  testCases: [
    { input: ['the sky is blue'], expected: 'blue is sky the', description: 'standard case' },
    { input: ['  hello world  '], expected: 'world hello', description: 'trim spaces' },
    { input: ['a good   example'], expected: 'example good a', description: 'multiple spaces' },
  ],
}
```

- [ ] **Step 5: Update problems/index.ts**

```typescript
import type { Problem } from '../src/types/problem'
import { problem as twoSum } from './arrays/two-sum'
import { problem as bestTime } from './arrays/best-time-to-buy-and-sell-stock'
import { problem as containsDuplicate } from './arrays/contains-duplicate'
import { problem as productExceptSelf } from './arrays/product-of-array-except-self'
import { problem as maxSubArray } from './arrays/maximum-subarray'
import { problem as isPalindrome } from './strings/valid-palindrome'
import { problem as isAnagram } from './strings/valid-anagram'
import { problem as longestCommonPrefix } from './strings/longest-common-prefix'
import { problem as reverseWords } from './strings/reverse-words-in-a-string'

export const allProblems: Problem[] = [
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
  isPalindrome, isAnagram, longestCommonPrefix, reverseWords,
]
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: easy string problems (4)"
```

---

### Task 12: Easy Linked List + Tree + Misc Problems

**Files:**
- Create: 3 files in `problems/linked-lists/`, 4 in `problems/trees/`, 1 in `problems/misc/`
- Modify: `problems/index.ts`

- [ ] **Step 1: Create problems/linked-lists/reverse-linked-list.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'reverse-linked-list',
  title: 'Reverse Linked List',
  difficulty: 'easy',
  topic: 'linked-lists',
  functionName: 'reverseList',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(reverseList(arrayToList(tc.input[0])))',
  description: `Reverse a singly linked list and return the head of the reversed list.

Input is given as an array; your function receives a ListNode.

Example:
  Input: head = [1,2,3,4,5]
  Output: [5,4,3,2,1]`,
  starterCode: `function reverseList(head: ListNode | null): ListNode | null {\n\n}`,
  testCases: [
    { input: [[1,2,3,4,5]], expected: [5,4,3,2,1], description: '5-node list' },
    { input: [[1,2]], expected: [2,1], description: '2-node list' },
    { input: [[1]], expected: [1], description: 'single node' },
  ],
}
```

- [ ] **Step 2: Create problems/linked-lists/merge-two-sorted-lists.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists',
  difficulty: 'easy',
  topic: 'linked-lists',
  functionName: 'mergeTwoLists',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(mergeTwoLists(arrayToList(tc.input[0]), arrayToList(tc.input[1])))',
  description: `Merge two sorted linked lists and return the merged list.

Example:
  Input: list1 = [1,2,4], list2 = [1,3,4]
  Output: [1,1,2,3,4,4]`,
  starterCode: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n\n}`,
  testCases: [
    { input: [[1,2,4],[1,3,4]], expected: [1,1,2,3,4,4], description: 'standard merge' },
    { input: [[],[]], expected: [], description: 'both empty' },
    { input: [[],[0]], expected: [0], description: 'one empty' },
  ],
}
```

- [ ] **Step 3: Create problems/linked-lists/linked-list-cycle.ts**

Input format: `[values, pos]` where `pos` is the index the tail points to (-1 = no cycle).

```typescript
import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'linked-list-cycle',
  title: 'Linked List Cycle',
  difficulty: 'easy',
  topic: 'linked-lists',
  functionName: 'hasCycle',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'hasCycle(buildCyclicList(tc.input[0], tc.input[1]))',
  description: `Determine if a linked list has a cycle. Return \`true\` if there is a cycle, \`false\` otherwise.

Input format: \`[values, pos]\` where \`pos\` is the tail's connection index (-1 = no cycle).

Example:
  Input: [3,2,0,-4], pos=1  →  Output: true`,
  starterCode: `function hasCycle(head: ListNode | null): boolean {\n\n}`,
  testCases: [
    { input: [[3,2,0,-4], 1], expected: true, description: 'cycle at index 1' },
    { input: [[1,2], 0], expected: true, description: 'cycle at head' },
    { input: [[1], -1], expected: false, description: 'no cycle' },
  ],
}
```

- [ ] **Step 4: Create problems/trees/maximum-depth-of-binary-tree.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'maximum-depth-of-binary-tree',
  title: 'Maximum Depth of Binary Tree',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'maxDepth',
  setupCode: TREE_SETUP,
  testCallCode: 'maxDepth(arrayToTree(tc.input[0]))',
  description: `Return the maximum depth (number of nodes along the longest root-to-leaf path) of a binary tree.

Tree input uses BFS-level array format: \`[3,9,20,null,null,15,7]\`.

Example:
  Input: [3,9,20,null,null,15,7]
  Output: 3`,
  starterCode: `function maxDepth(root: TreeNode | null): number {\n\n}`,
  testCases: [
    { input: [[3,9,20,null,null,15,7]], expected: 3, description: 'depth-3 tree' },
    { input: [[1,null,2]], expected: 2, description: 'right-skewed' },
    { input: [[]], expected: 0, description: 'empty tree' },
  ],
}
```

- [ ] **Step 5: Create problems/trees/invert-binary-tree.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'invert-binary-tree',
  title: 'Invert Binary Tree',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'invertTree',
  setupCode: TREE_SETUP,
  testCallCode: 'treeToArray(invertTree(arrayToTree(tc.input[0])))',
  description: `Invert a binary tree (mirror it) and return the root.

Example:
  Input: [4,2,7,1,3,6,9]
  Output: [4,7,2,9,6,3,1]`,
  starterCode: `function invertTree(root: TreeNode | null): TreeNode | null {\n\n}`,
  testCases: [
    { input: [[4,2,7,1,3,6,9]], expected: [4,7,2,9,6,3,1], description: 'full tree' },
    { input: [[2,1,3]], expected: [2,3,1], description: '3-node tree' },
    { input: [[]], expected: [], description: 'empty tree' },
  ],
}
```

- [ ] **Step 6: Create problems/trees/symmetric-tree.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'symmetric-tree',
  title: 'Symmetric Tree',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'isSymmetric',
  setupCode: TREE_SETUP,
  testCallCode: 'isSymmetric(arrayToTree(tc.input[0]))',
  description: `Check whether a binary tree is a mirror of itself (symmetric around its center).

Example:
  Input: [1,2,2,3,4,4,3]
  Output: true`,
  starterCode: `function isSymmetric(root: TreeNode | null): boolean {\n\n}`,
  testCases: [
    { input: [[1,2,2,3,4,4,3]], expected: true, description: 'symmetric' },
    { input: [[1,2,2,null,3,null,3]], expected: false, description: 'not symmetric' },
    { input: [[1]], expected: true, description: 'single node' },
  ],
}
```

- [ ] **Step 7: Create problems/trees/path-sum.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'path-sum',
  title: 'Path Sum',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'hasPathSum',
  setupCode: TREE_SETUP,
  testCallCode: 'hasPathSum(arrayToTree(tc.input[0]), tc.input[1])',
  description: `Return \`true\` if the tree has a root-to-leaf path where the sum of node values equals \`targetSum\`.

Example:
  Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
  Output: true`,
  starterCode: `function hasPathSum(root: TreeNode | null, targetSum: number): boolean {\n\n}`,
  testCases: [
    { input: [[5,4,8,11,null,13,4,7,2,null,null,null,1], 22], expected: true, description: 'path exists' },
    { input: [[1,2,3], 5], expected: false, description: 'no matching path' },
    { input: [[], 0], expected: false, description: 'empty tree' },
  ],
}
```

- [ ] **Step 8: Create problems/misc/valid-parentheses.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'valid-parentheses',
  title: 'Valid Parentheses',
  difficulty: 'easy',
  topic: 'misc',
  functionName: 'isValid',
  description: `Given a string of \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, determine if the input is valid. Brackets must close in the correct order.

Example:
  Input: s = "()[]{}"
  Output: true`,
  starterCode: `function isValid(s: string): boolean {\n\n}`,
  testCases: [
    { input: ['()'], expected: true, description: 'simple pair' },
    { input: ['()[]{}'], expected: true, description: 'multiple pairs' },
    { input: ['(]'], expected: false, description: 'mismatched' },
    { input: ['([)]'], expected: false, description: 'wrong order' },
  ],
}
```

- [ ] **Step 9: Update problems/index.ts**

```typescript
import type { Problem } from '../src/types/problem'
import { problem as twoSum } from './arrays/two-sum'
import { problem as bestTime } from './arrays/best-time-to-buy-and-sell-stock'
import { problem as containsDuplicate } from './arrays/contains-duplicate'
import { problem as productExceptSelf } from './arrays/product-of-array-except-self'
import { problem as maxSubArray } from './arrays/maximum-subarray'
import { problem as isPalindrome } from './strings/valid-palindrome'
import { problem as isAnagram } from './strings/valid-anagram'
import { problem as longestCommonPrefix } from './strings/longest-common-prefix'
import { problem as reverseWords } from './strings/reverse-words-in-a-string'
import { problem as reverseList } from './linked-lists/reverse-linked-list'
import { problem as mergeTwoLists } from './linked-lists/merge-two-sorted-lists'
import { problem as hasCycle } from './linked-lists/linked-list-cycle'
import { problem as maxDepth } from './trees/maximum-depth-of-binary-tree'
import { problem as invertTree } from './trees/invert-binary-tree'
import { problem as isSymmetric } from './trees/symmetric-tree'
import { problem as hasPathSum } from './trees/path-sum'
import { problem as isValid } from './misc/valid-parentheses'

export const allProblems: Problem[] = [
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
  isPalindrome, isAnagram, longestCommonPrefix, reverseWords,
  reverseList, mergeTwoLists, hasCycle,
  maxDepth, invertTree, isSymmetric, hasPathSum,
  isValid,
]
```

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: easy linked list, tree, and misc problems (8)"
```

---

### Task 13: Easy Graph + DP Problems

**Files:**
- Create: 1 file in `problems/graphs/`, 2 in `problems/dynamic-programming/`
- Modify: `problems/index.ts`

- [ ] **Step 1: Create problems/graphs/flood-fill.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'flood-fill',
  title: 'Flood Fill',
  difficulty: 'easy',
  topic: 'graphs',
  functionName: 'floodFill',
  description: `Perform a flood fill on an image grid starting from pixel (sr, sc), replacing all connected pixels of the same color with \`color\`. Connected means 4-directionally adjacent.

Example:
  Input: image = [[1,1,1],[1,1,0],[1,0,1]], sr=1, sc=1, color=2
  Output: [[2,2,2],[2,2,0],[2,0,1]]`,
  starterCode: `function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {\n\n}`,
  testCases: [
    { input: [[[1,1,1],[1,1,0],[1,0,1]], 1, 1, 2], expected: [[2,2,2],[2,2,0],[2,0,1]], description: 'standard fill' },
    { input: [[[0,0,0],[0,0,0]], 0, 0, 0], expected: [[0,0,0],[0,0,0]], description: 'same color — no change' },
    { input: [[[1,2,1],[1,2,0],[1,0,1]], 1, 1, 3], expected: [[1,3,1],[1,3,0],[1,0,1]], description: 'fills only connected' },
  ],
}
```

- [ ] **Step 2: Create problems/dynamic-programming/climbing-stairs.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'climbing-stairs',
  title: 'Climbing Stairs',
  difficulty: 'easy',
  topic: 'dynamic-programming',
  functionName: 'climbStairs',
  description: `You are climbing n stairs. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?

Example:
  Input: n = 3
  Output: 3  (1+1+1, 1+2, 2+1)`,
  starterCode: `function climbStairs(n: number): number {\n\n}`,
  testCases: [
    { input: [2], expected: 2, description: '2 stairs — 2 ways' },
    { input: [3], expected: 3, description: '3 stairs — 3 ways' },
    { input: [5], expected: 8, description: '5 stairs — 8 ways' },
  ],
}
```

- [ ] **Step 3: Create problems/dynamic-programming/house-robber.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'house-robber',
  title: 'House Robber',
  difficulty: 'easy',
  topic: 'dynamic-programming',
  functionName: 'rob',
  description: `You are a robber. Adjacent houses cannot both be robbed. Given \`nums[i]\` as the money in house i, return the maximum amount you can rob without triggering the alarm.

Example:
  Input: nums = [1,2,3,1]
  Output: 4  (rob house 0 + house 2)`,
  starterCode: `function rob(nums: number[]): number {\n\n}`,
  testCases: [
    { input: [[1,2,3,1]], expected: 4, description: 'alternating' },
    { input: [[2,7,9,3,1]], expected: 12, description: '2+9+1=12' },
    { input: [[1]], expected: 1, description: 'single house' },
  ],
}
```

- [ ] **Step 4: Update problems/index.ts — add 3 new imports and array entries**

Add imports:
```typescript
import { problem as floodFill } from './graphs/flood-fill'
import { problem as climbStairs } from './dynamic-programming/climbing-stairs'
import { problem as rob } from './dynamic-programming/house-robber'
```

Update `allProblems` array to include `floodFill, climbStairs, rob` (now 20 easy problems total).

- [ ] **Step 5: Run problems test — expect 20 easy, still fail on total count**

```bash
npm test -- problems
```
Expected: "loads all 36 problems" still FAILS (20 loaded), others pass

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: easy graph and DP problems (3) — 20 easy complete"
```

---

### Task 14: Medium Problems

**Files:**
- Create: 10 files across `problems/arrays/`, `strings/`, `linked-lists/`, `trees/`, `graphs/`, `dynamic-programming/`
- Modify: `problems/index.ts`

- [ ] **Step 1: Create problems/arrays/3sum.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: '3sum',
  title: '3Sum',
  difficulty: 'medium',
  topic: 'arrays',
  functionName: 'threeSum',
  testCallCode: 'threeSum(tc.input[0]).map((t: number[]) => [...t].sort((a,b)=>a-b)).sort((a:number[],b:number[])=>a[0]-b[0]||a[1]-b[1])',
  description: `Find all unique triplets in \`nums\` that sum to zero. No duplicate triplets.

Example:
  Input: nums = [-1,0,1,2,-1,-4]
  Output: [[-1,-1,2],[-1,0,1]]`,
  starterCode: `function threeSum(nums: number[]): number[][] {\n\n}`,
  testCases: [
    { input: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]], description: 'standard case' },
    { input: [[0,1,1]], expected: [], description: 'no triplets' },
    { input: [[0,0,0]], expected: [[0,0,0]], description: 'all zeros' },
  ],
}
```

- [ ] **Step 2: Create problems/arrays/container-with-most-water.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'container-with-most-water',
  title: 'Container With Most Water',
  difficulty: 'medium',
  topic: 'arrays',
  functionName: 'maxArea',
  description: `Given heights of vertical lines, find two lines that form a container holding the most water. Return the maximum water volume.

Example:
  Input: height = [1,8,6,2,5,4,8,3,7]
  Output: 49`,
  starterCode: `function maxArea(height: number[]): number {\n\n}`,
  testCases: [
    { input: [[1,8,6,2,5,4,8,3,7]], expected: 49, description: 'standard case' },
    { input: [[1,1]], expected: 1, description: 'two equal heights' },
    { input: [[4,3,2,1,4]], expected: 16, description: 'equal edges' },
  ],
}
```

- [ ] **Step 3: Create problems/strings/longest-substring-without-repeating-characters.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'longest-substring-without-repeating-characters',
  title: 'Longest Substring Without Repeating Characters',
  difficulty: 'medium',
  topic: 'strings',
  functionName: 'lengthOfLongestSubstring',
  description: `Find the length of the longest substring without repeating characters.

Example:
  Input: s = "abcabcbb"
  Output: 3  ("abc")`,
  starterCode: `function lengthOfLongestSubstring(s: string): number {\n\n}`,
  testCases: [
    { input: ['abcabcbb'], expected: 3, description: '"abc"' },
    { input: ['bbbbb'], expected: 1, description: 'all same' },
    { input: ['pwwkew'], expected: 3, description: '"wke"' },
  ],
}
```

- [ ] **Step 4: Create problems/strings/group-anagrams.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'group-anagrams',
  title: 'Group Anagrams',
  difficulty: 'medium',
  topic: 'strings',
  functionName: 'groupAnagrams',
  testCallCode: 'groupAnagrams(tc.input[0]).map((g: string[]) => [...g].sort()).sort((a: string[], b: string[]) => a[0] < b[0] ? -1 : 1)',
  description: `Group strings that are anagrams of each other. Return in any order.

Example:
  Input: strs = ["eat","tea","tan","ate","nat","bat"]
  Output: [["bat"],["nat","tan"],["ate","eat","tea"]]`,
  starterCode: `function groupAnagrams(strs: string[]): string[][] {\n\n}`,
  testCases: [
    { input: [['eat','tea','tan','ate','nat','bat']], expected: [['ate','eat','tea'],['bat'],['nat','tan']], description: 'standard grouping' },
    { input: [['']], expected: [['']], description: 'empty string' },
    { input: [['a']], expected: [['a']], description: 'single string' },
  ],
}
```

- [ ] **Step 5: Create problems/linked-lists/remove-nth-node-from-end-of-list.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'remove-nth-node-from-end-of-list',
  title: 'Remove Nth Node From End of List',
  difficulty: 'medium',
  topic: 'linked-lists',
  functionName: 'removeNthFromEnd',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(removeNthFromEnd(arrayToList(tc.input[0]), tc.input[1]))',
  description: `Remove the n-th node from the end of a linked list and return its head.

Example:
  Input: head = [1,2,3,4,5], n = 2
  Output: [1,2,3,5]`,
  starterCode: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n\n}`,
  testCases: [
    { input: [[1,2,3,4,5], 2], expected: [1,2,3,5], description: 'remove 2nd from end' },
    { input: [[1], 1], expected: [], description: 'remove only node' },
    { input: [[1,2], 1], expected: [1], description: 'remove last' },
  ],
}
```

- [ ] **Step 6: Create problems/trees/binary-tree-level-order-traversal.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'binary-tree-level-order-traversal',
  title: 'Binary Tree Level Order Traversal',
  difficulty: 'medium',
  topic: 'trees',
  functionName: 'levelOrder',
  setupCode: TREE_SETUP,
  testCallCode: 'levelOrder(arrayToTree(tc.input[0]))',
  description: `Return the level-order traversal of a binary tree's values (left to right, level by level).

Example:
  Input: [3,9,20,null,null,15,7]
  Output: [[3],[9,20],[15,7]]`,
  starterCode: `function levelOrder(root: TreeNode | null): number[][] {\n\n}`,
  testCases: [
    { input: [[3,9,20,null,null,15,7]], expected: [[3],[9,20],[15,7]], description: 'standard BFS' },
    { input: [[1]], expected: [[1]], description: 'single node' },
    { input: [[]], expected: [], description: 'empty tree' },
  ],
}
```

- [ ] **Step 7: Create problems/trees/validate-binary-search-tree.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'validate-binary-search-tree',
  title: 'Validate Binary Search Tree',
  difficulty: 'medium',
  topic: 'trees',
  functionName: 'isValidBST',
  setupCode: TREE_SETUP,
  testCallCode: 'isValidBST(arrayToTree(tc.input[0]))',
  description: `Determine if a binary tree is a valid BST. Every left subtree node < current node < every right subtree node, recursively.

Example:
  Input: [2,1,3]  →  Output: true
  Input: [5,1,4,null,null,3,6]  →  Output: false`,
  starterCode: `function isValidBST(root: TreeNode | null): boolean {\n\n}`,
  testCases: [
    { input: [[2,1,3]], expected: true, description: 'valid BST' },
    { input: [[5,1,4,null,null,3,6]], expected: false, description: 'invalid — right subtree has 4 < 5' },
    { input: [[2,2,2]], expected: false, description: 'equal values not allowed' },
  ],
}
```

- [ ] **Step 8: Create problems/graphs/number-of-islands.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'number-of-islands',
  title: 'Number of Islands',
  difficulty: 'medium',
  topic: 'graphs',
  functionName: 'numIslands',
  description: `Given a 2D grid of \`'1'\` (land) and \`'0'\` (water), count the number of islands. An island is formed by connecting adjacent land cells horizontally or vertically.

Example:
  Input: [["1","1","0"],["0","1","0"],["0","0","1"]]
  Output: 2`,
  starterCode: `function numIslands(grid: string[][]): number {\n\n}`,
  testCases: [
    { input: [[['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]], expected: 1, description: 'one large island' },
    { input: [[['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]], expected: 3, description: 'three islands' },
    { input: [[['0']]], expected: 0, description: 'all water' },
  ],
}
```

- [ ] **Step 9: Create problems/dynamic-programming/coin-change.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'coin-change',
  title: 'Coin Change',
  difficulty: 'medium',
  topic: 'dynamic-programming',
  functionName: 'coinChange',
  description: `Given coin denominations and a target amount, return the fewest number of coins needed. Return -1 if impossible.

Example:
  Input: coins = [1,2,5], amount = 11
  Output: 3  (5+5+1)`,
  starterCode: `function coinChange(coins: number[], amount: number): number {\n\n}`,
  testCases: [
    { input: [[1,2,5], 11], expected: 3, description: '5+5+1' },
    { input: [[2], 3], expected: -1, description: 'impossible' },
    { input: [[1,5,11], 11], expected: 1, description: 'exact coin available' },
  ],
}
```

- [ ] **Step 10: Create problems/dynamic-programming/longest-increasing-subsequence.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence',
  difficulty: 'medium',
  topic: 'dynamic-programming',
  functionName: 'lengthOfLIS',
  description: `Return the length of the longest strictly increasing subsequence of \`nums\`.

Example:
  Input: nums = [10,9,2,5,3,7,101,18]
  Output: 4  ([2,3,7,101])`,
  starterCode: `function lengthOfLIS(nums: number[]): number {\n\n}`,
  testCases: [
    { input: [[10,9,2,5,3,7,101,18]], expected: 4, description: '[2,3,7,101]' },
    { input: [[0,1,0,3,2,3]], expected: 4, description: '[0,1,2,3]' },
    { input: [[7,7,7,7,7,7,7]], expected: 1, description: 'all same — LIS of 1' },
  ],
}
```

- [ ] **Step 11: Update problems/index.ts — full registry with all 30 problems**

```typescript
import type { Problem } from '../src/types/problem'
import { problem as twoSum } from './arrays/two-sum'
import { problem as bestTime } from './arrays/best-time-to-buy-and-sell-stock'
import { problem as containsDuplicate } from './arrays/contains-duplicate'
import { problem as productExceptSelf } from './arrays/product-of-array-except-self'
import { problem as maxSubArray } from './arrays/maximum-subarray'
import { problem as isPalindrome } from './strings/valid-palindrome'
import { problem as isAnagram } from './strings/valid-anagram'
import { problem as longestCommonPrefix } from './strings/longest-common-prefix'
import { problem as reverseWords } from './strings/reverse-words-in-a-string'
import { problem as reverseList } from './linked-lists/reverse-linked-list'
import { problem as mergeTwoLists } from './linked-lists/merge-two-sorted-lists'
import { problem as hasCycle } from './linked-lists/linked-list-cycle'
import { problem as maxDepth } from './trees/maximum-depth-of-binary-tree'
import { problem as invertTree } from './trees/invert-binary-tree'
import { problem as isSymmetric } from './trees/symmetric-tree'
import { problem as hasPathSum } from './trees/path-sum'
import { problem as floodFill } from './graphs/flood-fill'
import { problem as climbStairs } from './dynamic-programming/climbing-stairs'
import { problem as rob } from './dynamic-programming/house-robber'
import { problem as isValid } from './misc/valid-parentheses'
import { problem as threeSum } from './arrays/3sum'
import { problem as maxArea } from './arrays/container-with-most-water'
import { problem as lengthOfLongestSubstring } from './strings/longest-substring-without-repeating-characters'
import { problem as groupAnagrams } from './strings/group-anagrams'
import { problem as removeNthFromEnd } from './linked-lists/remove-nth-node-from-end-of-list'
import { problem as levelOrder } from './trees/binary-tree-level-order-traversal'
import { problem as isValidBST } from './trees/validate-binary-search-tree'
import { problem as numIslands } from './graphs/number-of-islands'
import { problem as coinChange } from './dynamic-programming/coin-change'
import { problem as lengthOfLIS } from './dynamic-programming/longest-increasing-subsequence'

export const allProblems: Problem[] = [
  // Easy (20)
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
  isPalindrome, isAnagram, longestCommonPrefix, reverseWords,
  reverseList, mergeTwoLists, hasCycle,
  maxDepth, invertTree, isSymmetric, hasPathSum,
  floodFill, climbStairs, rob, isValid,
  // Medium (10)
  threeSum, maxArea,
  lengthOfLongestSubstring, groupAnagrams,
  removeNthFromEnd,
  levelOrder, isValidBST,
  numIslands,
  coinChange, lengthOfLIS,
]
```

- [ ] **Step 12: Commit**

```bash
git add -A && git commit -m "feat: medium problems (10) — 30 problems total"
```

---

### Task 15: Hard Problems

**Files:**
- Create: 6 files across hard topics
- Modify: `problems/index.ts` to final state

- [ ] **Step 1: Create problems/arrays/trapping-rain-water.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'trapping-rain-water',
  title: 'Trapping Rain Water',
  difficulty: 'hard',
  topic: 'arrays',
  functionName: 'trap',
  description: `Given n non-negative integers representing an elevation map with bar-width 1, compute how much water it can trap after raining.

Example:
  Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
  Output: 6`,
  starterCode: `function trap(height: number[]): number {\n\n}`,
  testCases: [
    { input: [[0,1,0,2,1,0,1,3,2,1,2,1]], expected: 6, description: 'classic example' },
    { input: [[4,2,0,3,2,5]], expected: 9, description: 'valley shape' },
    { input: [[1,0,1]], expected: 1, description: 'simple valley' },
  ],
}
```

- [ ] **Step 2: Create problems/strings/minimum-window-substring.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'minimum-window-substring',
  title: 'Minimum Window Substring',
  difficulty: 'hard',
  topic: 'strings',
  functionName: 'minWindow',
  description: `Given strings \`s\` and \`t\`, return the minimum window substring of \`s\` that contains every character in \`t\` (including duplicates). Return \`""\` if impossible.

Example:
  Input: s = "ADOBECODEBANC", t = "ABC"
  Output: "BANC"`,
  starterCode: `function minWindow(s: string, t: string): string {\n\n}`,
  testCases: [
    { input: ['ADOBECODEBANC', 'ABC'], expected: 'BANC', description: 'standard case' },
    { input: ['a', 'a'], expected: 'a', description: 'exact match' },
    { input: ['a', 'aa'], expected: '', description: 'impossible' },
  ],
}
```

- [ ] **Step 3: Create problems/linked-lists/merge-k-sorted-lists.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'merge-k-sorted-lists',
  title: 'Merge K Sorted Lists',
  difficulty: 'hard',
  topic: 'linked-lists',
  functionName: 'mergeKLists',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(mergeKLists(tc.input[0].map((arr: number[]) => arrayToList(arr))))',
  description: `Merge k sorted linked lists into one sorted list and return it.

Example:
  Input: lists = [[1,4,5],[1,3,4],[2,6]]
  Output: [1,1,2,3,4,4,5,6]`,
  starterCode: `function mergeKLists(lists: Array<ListNode | null>): ListNode | null {\n\n}`,
  testCases: [
    { input: [[[1,4,5],[1,3,4],[2,6]]], expected: [1,1,2,3,4,4,5,6], description: '3 lists' },
    { input: [[[]]], expected: [], description: 'one empty list' },
    { input: [[]], expected: [], description: 'no lists' },
  ],
}
```

- [ ] **Step 4: Create problems/trees/binary-tree-maximum-path-sum.ts**

```typescript
import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'binary-tree-maximum-path-sum',
  title: 'Binary Tree Maximum Path Sum',
  difficulty: 'hard',
  topic: 'trees',
  functionName: 'maxPathSum',
  setupCode: TREE_SETUP,
  testCallCode: 'maxPathSum(arrayToTree(tc.input[0]))',
  description: `A path in a binary tree is any sequence of nodes connected by edges. Return the maximum sum of any non-empty path (the path need not pass through the root).

Example:
  Input: [-10,9,20,null,null,15,7]
  Output: 42  (15 → 20 → 7)`,
  starterCode: `function maxPathSum(root: TreeNode | null): number {\n\n}`,
  testCases: [
    { input: [[1,2,3]], expected: 6, description: '2+1+3' },
    { input: [[-10,9,20,null,null,15,7]], expected: 42, description: '15+20+7' },
    { input: [[-3]], expected: -3, description: 'single negative node' },
  ],
}
```

- [ ] **Step 5: Create problems/graphs/word-ladder.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'word-ladder',
  title: 'Word Ladder',
  difficulty: 'hard',
  topic: 'graphs',
  functionName: 'ladderLength',
  description: `Find the shortest transformation sequence from \`beginWord\` to \`endWord\`, where each step changes exactly one letter and every intermediate word must be in \`wordList\`. Return the sequence length (0 if impossible).

Example:
  Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
  Output: 5  (hit→hot→dot→dog→cog)`,
  starterCode: `function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {\n\n}`,
  testCases: [
    { input: ['hit', 'cog', ['hot','dot','dog','lot','log','cog']], expected: 5, description: 'hit→hot→dot→dog→cog' },
    { input: ['hit', 'cog', ['hot','dot','dog','lot','log']], expected: 0, description: 'endWord not in list' },
    { input: ['a', 'c', ['a','b','c']], expected: 2, description: 'direct one-step transform' },
  ],
}
```

- [ ] **Step 6: Create problems/dynamic-programming/edit-distance.ts**

```typescript
import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'edit-distance',
  title: 'Edit Distance',
  difficulty: 'hard',
  topic: 'dynamic-programming',
  functionName: 'minDistance',
  description: `Return the minimum number of operations (insert, delete, replace) to convert \`word1\` to \`word2\`.

Example:
  Input: word1 = "horse", word2 = "ros"
  Output: 3  (horse→rorse→rose→ros)`,
  starterCode: `function minDistance(word1: string, word2: string): number {\n\n}`,
  testCases: [
    { input: ['horse', 'ros'], expected: 3, description: 'horse → ros' },
    { input: ['intention', 'execution'], expected: 5, description: 'intention → execution' },
    { input: ['', 'a'], expected: 1, description: 'empty to single char' },
  ],
}
```

- [ ] **Step 7: Update problems/index.ts to final state with all 36 problems**

```typescript
import type { Problem } from '../src/types/problem'
import { problem as twoSum } from './arrays/two-sum'
import { problem as bestTime } from './arrays/best-time-to-buy-and-sell-stock'
import { problem as containsDuplicate } from './arrays/contains-duplicate'
import { problem as productExceptSelf } from './arrays/product-of-array-except-self'
import { problem as maxSubArray } from './arrays/maximum-subarray'
import { problem as isPalindrome } from './strings/valid-palindrome'
import { problem as isAnagram } from './strings/valid-anagram'
import { problem as longestCommonPrefix } from './strings/longest-common-prefix'
import { problem as reverseWords } from './strings/reverse-words-in-a-string'
import { problem as reverseList } from './linked-lists/reverse-linked-list'
import { problem as mergeTwoLists } from './linked-lists/merge-two-sorted-lists'
import { problem as hasCycle } from './linked-lists/linked-list-cycle'
import { problem as maxDepth } from './trees/maximum-depth-of-binary-tree'
import { problem as invertTree } from './trees/invert-binary-tree'
import { problem as isSymmetric } from './trees/symmetric-tree'
import { problem as hasPathSum } from './trees/path-sum'
import { problem as floodFill } from './graphs/flood-fill'
import { problem as climbStairs } from './dynamic-programming/climbing-stairs'
import { problem as rob } from './dynamic-programming/house-robber'
import { problem as isValid } from './misc/valid-parentheses'
import { problem as threeSum } from './arrays/3sum'
import { problem as maxArea } from './arrays/container-with-most-water'
import { problem as lengthOfLongestSubstring } from './strings/longest-substring-without-repeating-characters'
import { problem as groupAnagrams } from './strings/group-anagrams'
import { problem as removeNthFromEnd } from './linked-lists/remove-nth-node-from-end-of-list'
import { problem as levelOrder } from './trees/binary-tree-level-order-traversal'
import { problem as isValidBST } from './trees/validate-binary-search-tree'
import { problem as numIslands } from './graphs/number-of-islands'
import { problem as coinChange } from './dynamic-programming/coin-change'
import { problem as lengthOfLIS } from './dynamic-programming/longest-increasing-subsequence'
import { problem as trap } from './arrays/trapping-rain-water'
import { problem as minWindow } from './strings/minimum-window-substring'
import { problem as mergeKLists } from './linked-lists/merge-k-sorted-lists'
import { problem as maxPathSum } from './trees/binary-tree-maximum-path-sum'
import { problem as ladderLength } from './graphs/word-ladder'
import { problem as minDistance } from './dynamic-programming/edit-distance'

export const allProblems: Problem[] = [
  // Easy (20)
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
  isPalindrome, isAnagram, longestCommonPrefix, reverseWords,
  reverseList, mergeTwoLists, hasCycle,
  maxDepth, invertTree, isSymmetric, hasPathSum,
  floodFill, climbStairs, rob, isValid,
  // Medium (10)
  threeSum, maxArea,
  lengthOfLongestSubstring, groupAnagrams,
  removeNthFromEnd,
  levelOrder, isValidBST,
  numIslands,
  coinChange, lengthOfLIS,
  // Hard (6)
  trap, minWindow, mergeKLists, maxPathSum, ladderLength, minDistance,
]
```

- [ ] **Step 8: Run full test suite — expect all pass**

```bash
npm test
```
Expected: All tests PASS including "loads all 36 problems"

- [ ] **Step 9: End-to-end smoke test**

1. Visit http://localhost:3000 — 36 problems listed, filters work
2. Click "Two Sum" — editor loads with starter code, timer starts
3. Paste correct solution, click Run — tests pass, toast shows
4. Visit http://localhost:3000 — Two Sum shows ✓

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: hard problems (6) — all 36 problems complete"
```

---

## Verification

```bash
# All unit tests pass
npm test

# Dev server starts cleanly
npm run dev

# TypeScript compiles without errors
npx tsc --noEmit

# Problem count is correct
npm test -- problems 2>&1 | grep "loads all 36"
```

Visit http://localhost:3000 and confirm:
- 36 problems listed, filterable by topic and difficulty
- Clicking a problem loads Monaco editor with starter code
- Timer counts down from 45:00, turns yellow below 5 min, orange + overtime after zero
- Running code shows pass/fail per test case with console output
- Verbose/summary toggle persists across page loads (localStorage)
- Solving a problem marks it ✓ on the home page
