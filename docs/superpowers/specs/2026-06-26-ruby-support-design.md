# Ruby Language Support — Design Spec

**Date:** 2026-06-26  
**Status:** Approved

## Overview

Add Ruby as a second language option alongside TypeScript in the cheatcode app. All 36 existing problems gain a `ruby` config block. The runner executes Ruby code server-side. The editor shows a language dropdown (per-problem, persisted in localStorage). Progress is tracked per language; a problem shows as solved on the list if either language is completed.

---

## Data Model

### `src/types/problem.ts`

Add `Language` type and `LanguageConfig` interface. Extend `Problem` with optional `ruby` field.

```typescript
export type Language = 'typescript' | 'ruby'

export interface LanguageConfig {
  methodName: string      // snake_case, e.g. "two_sum"
  starterCode: string
  setupCode?: string
  testCallCode?: string
}

export interface Problem {
  // ...all existing fields unchanged...
  ruby?: LanguageConfig
}
```

The existing top-level `functionName`, `starterCode`, `setupCode`, `testCallCode` remain the TypeScript config.

### `problems/shared_ruby.ts`

New file exporting Ruby helper strings:
- `RUBY_LINKED_LIST_SETUP` — defines `ListNode` class, `array_to_list`, `list_to_array`, `build_cyclic_list`
- `RUBY_TREE_SETUP` — defines `TreeNode` class, `array_to_tree`, `tree_to_array`

### Problem files (all 36)

Each `.ts` problem file gains a `ruby` key. For problems that don't need linked-list/tree helpers, `ruby.setupCode` is omitted. For linked-list/tree problems, `ruby.setupCode` uses the shared Ruby helpers.

Example (two-sum):
```typescript
ruby: {
  methodName: 'two_sum',
  starterCode: `def two_sum(nums, target)\n\nend`,
}
```

Example (reverse-linked-list):
```typescript
ruby: {
  methodName: 'reverse_list',
  starterCode: `def reverse_list(head)\n\nend`,
  setupCode: RUBY_LINKED_LIST_SETUP,
  testCallCode: 'list_to_array(reverse_list(array_to_list(tc["input"][0])))',
}
```

### Prisma schema

`ProblemProgress` currently has `slug String @id`. Add a `language` column and change the PK to a composite `@@id([slug, language])`.

```prisma
model ProblemProgress {
  slug      String
  language  String   @default("typescript")
  solved    Boolean  @default(false)
  bestTimeMs Int?
  updatedAt DateTime @updatedAt

  @@id([slug, language])
}
```

This is a breaking migration — existing progress rows get `language = 'typescript'` by default.

---

## Backend

### `src/lib/runner.ts`

Add `runRubyCode(req: RunRequest): Promise<RunResult>`.

- Generates a `.rb` temp file with:
  1. `req.setupCode` (Ruby helper classes)
  2. `req.userCode`
  3. A test harness: iterates test cases, calls the method via `req.testCallCode` or `method(req.methodName, *tc['input'])`, deep-compares with expected, serializes results to JSON, prints to stdout
- Spawns `ruby <tmpfile>` with 10s timeout
- Parses stdout as `RunResult` (same shape as TS runner)
- Deep-equal in Ruby uses recursive comparison (no gems)

`runCode` signature gains a `language` param:

```typescript
export async function runCode(req: RunRequest, language: Language = 'typescript'): Promise<RunResult>
```

### `src/app/api/run/route.ts`

Accept `language?: Language` in request body. Pass to `runCode`.

For Ruby: build `RunRequest` from `problem.ruby` fields (`methodName`, `starterCode`, `setupCode`, `testCallCode`) plus the user's code and `problem.testCases`.

### `src/app/api/analyze/route.ts`

- Accept `language?: Language`
- Replace hardcoded `` ```typescript `` with `` ```${language} ``
- Use `problem.ruby?.methodName` for Ruby, `problem.functionName` for TypeScript
- Prompt language label: "TypeScript" vs "Ruby"

### `src/app/api/hint/route.ts`

- Accept `language?: Language`
- Replace hardcoded `` ```typescript `` fence with the actual language
- Mention the language in the system prompt

### `src/app/api/progress/route.ts`

- POST: accept `language?: Language`, store it
- GET: deduplicate by slug when returning solved slugs (so the list checkmark fires if either language is solved)

---

## Frontend

### `src/app/problems/[slug]/ProblemClient.tsx`

- Add `language` state: `useState<Language>(() => localStorage.getItem('lang:${slug}') ?? 'typescript')`
- localStorage code key: `code:${slug}:${language}` (was `code:${slug}`)
- On language change: save current code under old key, load saved code for new language (fallback to `starterCode` for that language)
- Language selector: MUI `Select` in the toolbar, between difficulty chip and Timer. Options: "TypeScript", "Ruby" (Ruby disabled if `problem.ruby` is undefined)
- All fetch bodies include `language`
- Pass `language` to `Editor` and `HintChat`

### `src/components/Editor.tsx`

- Accept `language: Language` prop
- Pass `language === 'ruby' ? 'ruby' : 'typescript'` to Monaco `language` prop

### `src/components/ProblemList.tsx`

No changes to UI. The `solvedSlugs` prop continues to be a flat string array — the page.tsx query deduplicates across languages before passing it down.

### `src/app/page.tsx` (or wherever progress is fetched)

Ensure the GET `/api/progress` response deduplicates slugs across languages before passing to `ProblemList`.

---

## AI Prompt Correctness for Ruby

Both `/api/analyze` and `/api/hint` will:
- Use the correct language label in the prompt
- Use the correct code fence language tag
- Reference the Ruby method name (snake_case) instead of the TypeScript function name
- The hint system prompt will say "Ruby" not "TypeScript" so the mentor doesn't suggest TypeScript-specific patterns

No new prompt templates needed — the existing prompts generalize cleanly to Ruby with parameterized language substitution.

---

## Out of Scope

- No other languages (Python, Go, etc.) — just TypeScript and Ruby
- No per-language leaderboard or statistics
- No language-specific difficulty ratings
- The main problem list has no language column or filter
