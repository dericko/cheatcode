# Ruby Language Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ruby as a second executable language in the cheatcode interview-prep app, with per-problem language switching, isolated localStorage state, and language-aware AI feedback.

**Architecture:** Extend the `Problem` type with an optional `ruby` config block (Option A from the design); add a `runRubyCode` path in `src/lib/runner.ts` that spawns a temp `.rb` file via the system `ruby` binary; add a language dropdown in `ProblemClient` that scopes all state (code, progress) to the selected language.

**Tech Stack:** TypeScript/Next.js 16, Prisma 7/SQLite, MUI v9, Monaco Editor, Vitest 4, Ruby 3.3.3 (system)

## Global Constraints

- Ruby binary invoked as `ruby` (rbenv shim is in PATH)
- All Ruby method names use `snake_case`; TS function names remain `camelCase`
- `Language` is `'typescript' | 'ruby'` — no other values
- localStorage keys: `lang:<slug>` (language preference), `code:<slug>:<language>` (code per language)
- A problem is "solved" on the list if ANY language's `ProblemProgress.solved` is `true`
- `Attempt` table is NOT modified — it stays language-unaware
- No new npm packages required
- Follow existing MUI v9 component patterns throughout
- Read `node_modules/next/dist/docs/` before writing any Next.js-specific code if unsure

---

## File Map

| Status | Path | Role |
|--------|------|------|
| Modify | `src/types/problem.ts` | Add `Language`, `LanguageConfig` types; extend `Problem` |
| Create | `problems/shared_ruby.ts` | Ruby `ListNode`/`TreeNode` helpers as embedded strings |
| Modify | `src/lib/runner.ts` | Add `runRubyCode`; make `runCode` dispatch by language |
| Modify | `src/types/runner.ts` | No change — `RunRequest.functionName` doubles as `methodName` |
| Modify | `problems/arrays/*.ts` (8 files) | Add `ruby` config |
| Modify | `problems/strings/*.ts` (7 files) | Add `ruby` config |
| Modify | `problems/graphs/*.ts` (3 files) | Add `ruby` config |
| Modify | `problems/dynamic-programming/*.ts` (5 files) | Add `ruby` config |
| Modify | `problems/misc/valid-parentheses.ts` | Add `ruby` config |
| Modify | `problems/linked-lists/*.ts` (5 files) | Add `ruby` config with `RUBY_LINKED_LIST_SETUP` |
| Modify | `problems/trees/*.ts` (7 files) | Add `ruby` config with `RUBY_TREE_SETUP` |
| Modify | `src/app/api/run/route.ts` | Accept `language`, dispatch to correct runner |
| Modify | `src/app/api/analyze/route.ts` | Language-aware prompt |
| Modify | `src/app/api/hint/route.ts` | Language-aware system prompt |
| Modify | `prisma/schema.prisma` | `ProblemProgress` composite PK `(slug, language)` |
| Modify | `src/app/api/progress/route.ts` | Accept/use `language`; deduplicate slugs on GET |
| Modify | `src/app/page.tsx` | Deduplicate solved slugs for list checkmarks |
| Modify | `src/app/problems/[slug]/ProblemClient.tsx` | Language state, dropdown, scoped localStorage |
| Modify | `src/components/Editor.tsx` | Accept `language` prop for Monaco |
| Modify | `__tests__/runner.test.ts` | Add Ruby runner tests |

---

## Task 1: Add Language types to `src/types/problem.ts`

**Files:**
- Modify: `src/types/problem.ts`

**Interfaces:**
- Produces: `Language`, `LanguageConfig` — used by Tasks 3–10

- [ ] **Step 1: Update `src/types/problem.ts`**

Replace the entire file with:

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

export type Language = 'typescript' | 'ruby'

export interface LanguageConfig {
  methodName: string
  starterCode: string
  setupCode?: string
  testCallCode?: string
}

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
  targetComplexity?: string
  ruby?: LanguageConfig
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (existing code is unaffected — `ruby` is optional).

- [ ] **Step 3: Commit**

```bash
git add src/types/problem.ts
git commit -m "feat: add Language and LanguageConfig types to Problem"
```

---

## Task 2: Create `problems/shared_ruby.ts`

**Files:**
- Create: `problems/shared_ruby.ts`

**Interfaces:**
- Produces: `RUBY_LINKED_LIST_SETUP`, `RUBY_TREE_SETUP` — used by Tasks 5 and 6

- [ ] **Step 1: Create `problems/shared_ruby.ts`**

```typescript
export const RUBY_LINKED_LIST_SETUP = `
class ListNode
  attr_accessor :val, :next
  def initialize(val = 0, nxt = nil)
    @val = val
    @next = nxt
  end
end

def array_to_list(arr)
  return nil if arr.empty?
  head = ListNode.new(arr[0])
  curr = head
  arr[1..].each do |v|
    curr.next = ListNode.new(v)
    curr = curr.next
  end
  head
end

def list_to_array(head)
  result = []
  while head
    result << head.val
    head = head.next
  end
  result
end

def build_cyclic_list(vals, pos)
  return nil if vals.empty?
  nodes = vals.map { |v| ListNode.new(v) }
  (0...nodes.length - 1).each { |i| nodes[i].next = nodes[i + 1] }
  nodes.last.next = nodes[pos] if pos >= 0
  nodes.first
end
`

export const RUBY_TREE_SETUP = `
class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def array_to_tree(arr)
  return nil if arr.empty? || arr[0].nil?
  root = TreeNode.new(arr[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < arr.length
    node = queue.shift
    if i < arr.length && !arr[i].nil?
      node.left = TreeNode.new(arr[i])
      queue << node.left
    end
    i += 1
    if i < arr.length && !arr[i].nil?
      node.right = TreeNode.new(arr[i])
      queue << node.right
    end
    i += 1
  end
  root
end

def tree_to_array(root)
  return [] unless root
  result = []
  queue = [root]
  while !queue.empty?
    node = queue.shift
    if node
      result << node.val
      queue << node.left
      queue << node.right
    else
      result << nil
    end
  end
  result.pop while result.last.nil?
  result
end
`
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add problems/shared_ruby.ts
git commit -m "feat: add Ruby linked-list and tree helper strings"
```

---

## Task 3: Add Ruby runner to `src/lib/runner.ts` + tests

**Files:**
- Modify: `src/lib/runner.ts`
- Modify: `__tests__/runner.test.ts`

**Interfaces:**
- Consumes: `Language` from `src/types/problem.ts`; `RunRequest`, `RunResult` from `src/types/runner.ts`
- Produces: `runCode(req, language?)` — signature unchanged for existing callers; new `'ruby'` dispatch

- [ ] **Step 1: Write failing Ruby runner tests**

Append to `__tests__/runner.test.ts`:

```typescript
describe('runCode (Ruby)', () => {
  it('passes for correct Ruby code', async () => {
    const result = await runCode({
      userCode: 'def add(a, b)\n  a + b\nend',
      functionName: 'add',
      testCases: [
        { input: [1, 2], expected: 3, description: 'basic' },
        { input: [0, 0], expected: 0, description: 'zeros' },
      ],
    }, 'ruby')
    expect(result.results).toHaveLength(2)
    expect(result.results[0].passed).toBe(true)
    expect(result.results[1].passed).toBe(true)
  })

  it('fails for incorrect Ruby code', async () => {
    const result = await runCode({
      userCode: 'def add(a, b)\n  a - b\nend',
      functionName: 'add',
      testCases: [{ input: [1, 2], expected: 3, description: 'basic' }],
    }, 'ruby')
    expect(result.results[0].passed).toBe(false)
    expect(result.results[0].actual).toBe(-1)
  })

  it('captures Ruby puts output', async () => {
    const result = await runCode({
      userCode: "def dbg(n)\n  puts \"val: #{n}\"\n  n\nend",
      functionName: 'dbg',
      testCases: [{ input: [42], expected: 42, description: 'debug' }],
    }, 'ruby')
    expect(result.consoleOutput).toContain('val: 42')
    expect(result.results[0].passed).toBe(true)
  })

  it('handles Ruby runtime errors gracefully', async () => {
    const result = await runCode({
      userCode: 'def boom\n  raise "oops"\nend',
      functionName: 'boom',
      testCases: [{ input: [], expected: 1, description: 'error case' }],
    }, 'ruby')
    expect(result.results[0].passed).toBe(false)
    expect(result.results[0].error).toBe('oops')
  })

  it('uses Ruby testCallCode when provided', async () => {
    const result = await runCode({
      userCode: 'def double(n)\n  n * 2\nend',
      functionName: 'double',
      testCallCode: "double(tc['input'][0]) + 1",
      testCases: [{ input: [5], expected: 11, description: 'double+1' }],
    }, 'ruby')
    expect(result.results[0].passed).toBe(true)
  })

  it('deep-equals Ruby arrays', async () => {
    const result = await runCode({
      userCode: 'def wrap(n)\n  [n, n + 1]\nend',
      functionName: 'wrap',
      testCases: [{ input: [3], expected: [3, 4], description: 'array result' }],
    }, 'ruby')
    expect(result.results[0].passed).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run __tests__/runner.test.ts
```

Expected: the 6 new Ruby tests fail with "runCode called with unsupported language" or similar; the 5 existing TS tests still pass.

- [ ] **Step 3: Implement Ruby runner in `src/lib/runner.ts`**

Replace the entire file with:

```typescript
import { spawn } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { RunRequest, RunResult } from '@/types/runner'
import type { Language } from '@/types/problem'

const TSX_BIN = join(process.cwd(), 'node_modules', '.bin', 'tsx')

function generateTypeScriptScript(req: RunRequest): string {
  const testCasesJson = JSON.stringify(req.testCases)
  const callExpr = req.testCallCode ?? `${req.functionName}(...tc.input)`

  return `
${req.setupCode ?? ''}

const __results: any[] = []
const __console: string[] = []
console.log = (...args: any[]) => {
  const line = args.map(String).join(' ')
  __console.push(line)
  process.stderr.write(line + '\\n')
}
const __origStdoutWrite = process.stdout.write.bind(process.stdout)
process.stdout.write = (chunk: any, ...args: any[]) => {
  __console.push(String(chunk))
  return process.stderr.write(chunk, ...args)
}

${req.userCode}


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

__origStdoutWrite(JSON.stringify({ results: __results, consoleOutput: __console }))
`
}

function generateRubyScript(req: RunRequest): string {
  const testCasesB64 = Buffer.from(JSON.stringify(req.testCases)).toString('base64')
  const callExpr = req.testCallCode ?? `send(:${req.functionName}, *tc['input'])`

  return `require 'json'
require 'base64'
require 'stringio'

$__real_stdout = STDOUT.dup
$__captured_io = StringIO.new
$stdout = $__captured_io

${req.setupCode ?? ''}

${req.userCode}

def __deep_equal(a, b)
  if a.is_a?(Array) && b.is_a?(Array)
    return false unless a.length == b.length
    a.each_with_index.all? { |v, i| __deep_equal(v, b[i]) }
  elsif a.is_a?(Hash) && b.is_a?(Hash)
    a_keys = a.keys.map(&:to_s).sort
    b_keys = b.keys.map(&:to_s).sort
    return false unless a_keys == b_keys
    a_keys.all? { |k| __deep_equal(a[k] || a[k.to_sym], b[k] || b[k.to_sym]) }
  else
    a == b
  end
end

__test_cases = JSON.parse(Base64.decode64('${testCasesB64}'))
__results = []

__test_cases.each do |tc|
  begin
    actual = ${callExpr}
    __results << {
      'passed' => __deep_equal(actual, tc['expected']),
      'actual' => actual,
      'expected' => tc['expected'],
      'description' => tc['description']
    }
  rescue => e
    __results << { 'passed' => false, 'error' => e.message, 'description' => tc['description'] }
  end
end

__console_lines = $__captured_io.string.lines.map(&:chomp).reject(&:empty?)
$__real_stdout.write(JSON.generate({ 'results' => __results, 'consoleOutput' => __console_lines }))
`
}

async function spawnRunner(bin: string, args: string[], tmpFile: string, script: string): Promise<RunResult> {
  writeFileSync(tmpFile, script, 'utf-8')

  return new Promise((resolve) => {
    const proc = spawn(bin, args, { timeout: 10_000 })

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

export async function runCode(req: RunRequest, language: Language = 'typescript'): Promise<RunResult> {
  if (language === 'ruby') {
    const script = generateRubyScript(req)
    const tmpFile = join(tmpdir(), `cheatcode-${randomUUID()}.rb`)
    return spawnRunner('ruby', [tmpFile], tmpFile, script)
  }

  const script = generateTypeScriptScript(req)
  const tmpFile = join(tmpdir(), `cheatcode-${randomUUID()}.ts`)
  return spawnRunner(TSX_BIN, [tmpFile], tmpFile, script)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run __tests__/runner.test.ts
```

Expected: all 11 tests pass (5 original TS + 6 new Ruby).

- [ ] **Step 5: Commit**

```bash
git add src/lib/runner.ts __tests__/runner.test.ts
git commit -m "feat: add Ruby code runner with test coverage"
```

---

## Task 4: Add `ruby` config to simple problem files (24 problems)

These problems need no linked-list or tree helpers. Add a `ruby` key to each. The default `testCallCode` (`send(:method_name, *tc['input'])`) works for all except `three_sum` and `group_anagrams` which need custom sorting.

**Files:**
- Modify: `problems/arrays/two-sum.ts`
- Modify: `problems/arrays/best-time-to-buy-and-sell-stock.ts`
- Modify: `problems/arrays/contains-duplicate.ts`
- Modify: `problems/arrays/product-of-array-except-self.ts`
- Modify: `problems/arrays/maximum-subarray.ts`
- Modify: `problems/arrays/3sum.ts`
- Modify: `problems/arrays/container-with-most-water.ts`
- Modify: `problems/arrays/trapping-rain-water.ts`
- Modify: `problems/strings/valid-palindrome.ts`
- Modify: `problems/strings/valid-anagram.ts`
- Modify: `problems/strings/longest-common-prefix.ts`
- Modify: `problems/strings/reverse-words-in-a-string.ts`
- Modify: `problems/strings/longest-substring-without-repeating-characters.ts`
- Modify: `problems/strings/group-anagrams.ts`
- Modify: `problems/strings/minimum-window-substring.ts`
- Modify: `problems/graphs/flood-fill.ts`
- Modify: `problems/graphs/number-of-islands.ts`
- Modify: `problems/graphs/word-ladder.ts`
- Modify: `problems/misc/valid-parentheses.ts`
- Modify: `problems/dynamic-programming/climbing-stairs.ts`
- Modify: `problems/dynamic-programming/house-robber.ts`
- Modify: `problems/dynamic-programming/coin-change.ts`
- Modify: `problems/dynamic-programming/longest-increasing-subsequence.ts`
- Modify: `problems/dynamic-programming/edit-distance.ts`

**Interfaces:**
- Consumes: `LanguageConfig` from Task 1

- [ ] **Step 1: Add `ruby` to `problems/arrays/two-sum.ts`**

Add after `testCases: [...]`:

```typescript
  ruby: {
    methodName: 'two_sum',
    starterCode: `def two_sum(nums, target)\n\nend`,
  },
```

- [ ] **Step 2: Add `ruby` to `problems/arrays/best-time-to-buy-and-sell-stock.ts`**

```typescript
  ruby: {
    methodName: 'max_profit',
    starterCode: `def max_profit(prices)\n\nend`,
  },
```

- [ ] **Step 3: Add `ruby` to `problems/arrays/contains-duplicate.ts`**

```typescript
  ruby: {
    methodName: 'contains_duplicate',
    starterCode: `def contains_duplicate(nums)\n\nend`,
  },
```

- [ ] **Step 4: Add `ruby` to `problems/arrays/product-of-array-except-self.ts`**

```typescript
  ruby: {
    methodName: 'product_except_self',
    starterCode: `def product_except_self(nums)\n\nend`,
  },
```

- [ ] **Step 5: Add `ruby` to `problems/arrays/maximum-subarray.ts`**

```typescript
  ruby: {
    methodName: 'max_sub_array',
    starterCode: `def max_sub_array(nums)\n\nend`,
  },
```

- [ ] **Step 6: Add `ruby` to `problems/arrays/3sum.ts`**

This needs a custom `testCallCode` to normalize sort order (mirrors the existing TS `testCallCode`):

```typescript
  ruby: {
    methodName: 'three_sum',
    starterCode: `def three_sum(nums)\n\nend`,
    testCallCode: `three_sum(tc['input'][0]).map { |t| t.sort }.sort_by { |t| [t[0], t[1]] }`,
  },
```

- [ ] **Step 7: Add `ruby` to `problems/arrays/container-with-most-water.ts`**

```typescript
  ruby: {
    methodName: 'max_area',
    starterCode: `def max_area(height)\n\nend`,
  },
```

- [ ] **Step 8: Add `ruby` to `problems/arrays/trapping-rain-water.ts`**

```typescript
  ruby: {
    methodName: 'trap',
    starterCode: `def trap(height)\n\nend`,
  },
```

- [ ] **Step 9: Add `ruby` to `problems/strings/valid-palindrome.ts`**

```typescript
  ruby: {
    methodName: 'is_palindrome',
    starterCode: `def is_palindrome(s)\n\nend`,
  },
```

- [ ] **Step 10: Add `ruby` to `problems/strings/valid-anagram.ts`**

```typescript
  ruby: {
    methodName: 'is_anagram',
    starterCode: `def is_anagram(s, t)\n\nend`,
  },
```

- [ ] **Step 11: Add `ruby` to `problems/strings/longest-common-prefix.ts`**

```typescript
  ruby: {
    methodName: 'longest_common_prefix',
    starterCode: `def longest_common_prefix(strs)\n\nend`,
  },
```

- [ ] **Step 12: Add `ruby` to `problems/strings/reverse-words-in-a-string.ts`**

```typescript
  ruby: {
    methodName: 'reverse_words',
    starterCode: `def reverse_words(s)\n\nend`,
  },
```

- [ ] **Step 13: Add `ruby` to `problems/strings/longest-substring-without-repeating-characters.ts`**

```typescript
  ruby: {
    methodName: 'length_of_longest_substring',
    starterCode: `def length_of_longest_substring(s)\n\nend`,
  },
```

- [ ] **Step 14: Add `ruby` to `problems/strings/group-anagrams.ts`**

Custom `testCallCode` mirrors the TS sort normalization:

```typescript
  ruby: {
    methodName: 'group_anagrams',
    starterCode: `def group_anagrams(strs)\n\nend`,
    testCallCode: `group_anagrams(tc['input'][0]).map { |g| g.sort }.sort_by { |g| g[0] }`,
  },
```

- [ ] **Step 15: Add `ruby` to `problems/strings/minimum-window-substring.ts`**

```typescript
  ruby: {
    methodName: 'min_window',
    starterCode: `def min_window(s, t)\n\nend`,
  },
```

- [ ] **Step 16: Add `ruby` to `problems/graphs/flood-fill.ts`**

```typescript
  ruby: {
    methodName: 'flood_fill',
    starterCode: `def flood_fill(image, sr, sc, color)\n\nend`,
  },
```

- [ ] **Step 17: Add `ruby` to `problems/graphs/number-of-islands.ts`**

```typescript
  ruby: {
    methodName: 'num_islands',
    starterCode: `def num_islands(grid)\n\nend`,
  },
```

- [ ] **Step 18: Add `ruby` to `problems/graphs/word-ladder.ts`**

```typescript
  ruby: {
    methodName: 'ladder_length',
    starterCode: `def ladder_length(begin_word, end_word, word_list)\n\nend`,
  },
```

- [ ] **Step 19: Add `ruby` to `problems/misc/valid-parentheses.ts`**

```typescript
  ruby: {
    methodName: 'is_valid',
    starterCode: `def is_valid(s)\n\nend`,
  },
```

- [ ] **Step 20: Add `ruby` to `problems/dynamic-programming/climbing-stairs.ts`**

```typescript
  ruby: {
    methodName: 'climb_stairs',
    starterCode: `def climb_stairs(n)\n\nend`,
  },
```

- [ ] **Step 21: Add `ruby` to `problems/dynamic-programming/house-robber.ts`**

```typescript
  ruby: {
    methodName: 'rob',
    starterCode: `def rob(nums)\n\nend`,
  },
```

- [ ] **Step 22: Add `ruby` to `problems/dynamic-programming/coin-change.ts`**

```typescript
  ruby: {
    methodName: 'coin_change',
    starterCode: `def coin_change(coins, amount)\n\nend`,
  },
```

- [ ] **Step 23: Add `ruby` to `problems/dynamic-programming/longest-increasing-subsequence.ts`**

```typescript
  ruby: {
    methodName: 'length_of_lis',
    starterCode: `def length_of_lis(nums)\n\nend`,
  },
```

- [ ] **Step 24: Add `ruby` to `problems/dynamic-programming/edit-distance.ts`**

```typescript
  ruby: {
    methodName: 'min_distance',
    starterCode: `def min_distance(word1, word2)\n\nend`,
  },
```

- [ ] **Step 25: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 26: Commit**

```bash
git add problems/
git commit -m "feat: add Ruby config to 24 simple problems"
```

---

## Task 5: Add `ruby` config to linked-list problem files (5 problems)

These use `RUBY_LINKED_LIST_SETUP` from `problems/shared_ruby.ts`.

**Files:**
- Modify: `problems/linked-lists/reverse-linked-list.ts`
- Modify: `problems/linked-lists/merge-two-sorted-lists.ts`
- Modify: `problems/linked-lists/linked-list-cycle.ts`
- Modify: `problems/linked-lists/remove-nth-node-from-end-of-list.ts`
- Modify: `problems/linked-lists/merge-k-sorted-lists.ts`

**Interfaces:**
- Consumes: `RUBY_LINKED_LIST_SETUP` from Task 2

- [ ] **Step 1: Update `problems/linked-lists/reverse-linked-list.ts`**

Add import at the top:

```typescript
import { RUBY_LINKED_LIST_SETUP } from '../shared_ruby'
```

Add `ruby` key after `testCases`:

```typescript
  ruby: {
    methodName: 'reverse_list',
    starterCode: `def reverse_list(head)\n\nend`,
    setupCode: RUBY_LINKED_LIST_SETUP,
    testCallCode: `list_to_array(reverse_list(array_to_list(tc['input'][0])))`,
  },
```

- [ ] **Step 2: Update `problems/linked-lists/merge-two-sorted-lists.ts`**

Add import:

```typescript
import { RUBY_LINKED_LIST_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'merge_two_lists',
    starterCode: `def merge_two_lists(list1, list2)\n\nend`,
    setupCode: RUBY_LINKED_LIST_SETUP,
    testCallCode: `list_to_array(merge_two_lists(array_to_list(tc['input'][0]), array_to_list(tc['input'][1])))`,
  },
```

- [ ] **Step 3: Update `problems/linked-lists/linked-list-cycle.ts`**

Add import:

```typescript
import { RUBY_LINKED_LIST_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'has_cycle',
    starterCode: `def has_cycle(head)\n\nend`,
    setupCode: RUBY_LINKED_LIST_SETUP,
    testCallCode: `has_cycle(build_cyclic_list(tc['input'][0], tc['input'][1]))`,
  },
```

- [ ] **Step 4: Update `problems/linked-lists/remove-nth-node-from-end-of-list.ts`**

Add import:

```typescript
import { RUBY_LINKED_LIST_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'remove_nth_from_end',
    starterCode: `def remove_nth_from_end(head, n)\n\nend`,
    setupCode: RUBY_LINKED_LIST_SETUP,
    testCallCode: `list_to_array(remove_nth_from_end(array_to_list(tc['input'][0]), tc['input'][1]))`,
  },
```

- [ ] **Step 5: Update `problems/linked-lists/merge-k-sorted-lists.ts`**

Add import:

```typescript
import { RUBY_LINKED_LIST_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'merge_k_lists',
    starterCode: `def merge_k_lists(lists)\n\nend`,
    setupCode: RUBY_LINKED_LIST_SETUP,
    testCallCode: `list_to_array(merge_k_lists(tc['input'][0].map { |arr| array_to_list(arr) }))`,
  },
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add problems/linked-lists/
git commit -m "feat: add Ruby config to linked-list problems"
```

---

## Task 6: Add `ruby` config to tree problem files (7 problems)

These use `RUBY_TREE_SETUP` from `problems/shared_ruby.ts`.

**Files:**
- Modify: `problems/trees/maximum-depth-of-binary-tree.ts`
- Modify: `problems/trees/invert-binary-tree.ts`
- Modify: `problems/trees/symmetric-tree.ts`
- Modify: `problems/trees/path-sum.ts`
- Modify: `problems/trees/binary-tree-level-order-traversal.ts`
- Modify: `problems/trees/validate-binary-search-tree.ts`
- Modify: `problems/trees/binary-tree-maximum-path-sum.ts`

**Interfaces:**
- Consumes: `RUBY_TREE_SETUP` from Task 2

- [ ] **Step 1: Update `problems/trees/maximum-depth-of-binary-tree.ts`**

Add import:

```typescript
import { RUBY_TREE_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'max_depth',
    starterCode: `def max_depth(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `max_depth(array_to_tree(tc['input'][0]))`,
  },
```

- [ ] **Step 2: Update `problems/trees/invert-binary-tree.ts`**

Add import:

```typescript
import { RUBY_TREE_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'invert_tree',
    starterCode: `def invert_tree(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `tree_to_array(invert_tree(array_to_tree(tc['input'][0])))`,
  },
```

- [ ] **Step 3: Update `problems/trees/symmetric-tree.ts`**

Add import:

```typescript
import { RUBY_TREE_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'is_symmetric',
    starterCode: `def is_symmetric(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `is_symmetric(array_to_tree(tc['input'][0]))`,
  },
```

- [ ] **Step 4: Update `problems/trees/path-sum.ts`**

Add import:

```typescript
import { RUBY_TREE_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'has_path_sum',
    starterCode: `def has_path_sum(root, target_sum)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `has_path_sum(array_to_tree(tc['input'][0]), tc['input'][1])`,
  },
```

- [ ] **Step 5: Update `problems/trees/binary-tree-level-order-traversal.ts`**

Add import:

```typescript
import { RUBY_TREE_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'level_order',
    starterCode: `def level_order(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `level_order(array_to_tree(tc['input'][0]))`,
  },
```

- [ ] **Step 6: Update `problems/trees/validate-binary-search-tree.ts`**

Add import:

```typescript
import { RUBY_TREE_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'is_valid_bst',
    starterCode: `def is_valid_bst(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `is_valid_bst(array_to_tree(tc['input'][0]))`,
  },
```

- [ ] **Step 7: Update `problems/trees/binary-tree-maximum-path-sum.ts`**

Add import:

```typescript
import { RUBY_TREE_SETUP } from '../shared_ruby'
```

Add `ruby` key:

```typescript
  ruby: {
    methodName: 'max_path_sum',
    starterCode: `def max_path_sum(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `max_path_sum(array_to_tree(tc['input'][0]))`,
  },
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add problems/trees/
git commit -m "feat: add Ruby config to tree problems"
```

---

## Task 7: Update `/api/run` to dispatch by language

**Files:**
- Modify: `src/app/api/run/route.ts`

**Interfaces:**
- Consumes: `Language` from Task 1; `runCode(req, language)` from Task 3; `problem.ruby` from Tasks 4–6

- [ ] **Step 1: Replace `src/app/api/run/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { runCode } from '@/lib/runner'
import type { Language } from '@/types/problem'

export async function POST(req: NextRequest) {
  const { slug, code, language = 'typescript' } = await req.json() as {
    slug: string
    code: string
    language?: Language
  }

  const problem = getProblemBySlug(slug)
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  if (language === 'ruby') {
    const rubyConfig = problem.ruby
    if (!rubyConfig) {
      return NextResponse.json({ error: 'Ruby not supported for this problem' }, { status: 400 })
    }
    const result = await runCode({
      userCode: code,
      functionName: rubyConfig.methodName,
      testCases: problem.testCases,
      setupCode: rubyConfig.setupCode,
      testCallCode: rubyConfig.testCallCode,
    }, 'ruby')
    return NextResponse.json(result)
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/run/route.ts
git commit -m "feat: /api/run dispatches to Ruby or TypeScript runner by language"
```

---

## Task 8: Make `/api/analyze` and `/api/hint` language-aware

**Files:**
- Modify: `src/app/api/analyze/route.ts`
- Modify: `src/app/api/hint/route.ts`

**Interfaces:**
- Consumes: `Language` from Task 1

- [ ] **Step 1: Replace `src/app/api/analyze/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { Language } from '@/types/problem'

const schema = z.object({
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  explanation: z.string(),
  passesTarget: z.boolean(),
  hint: z.string().nullable(),
})

export async function POST(req: NextRequest) {
  const { slug, code, language = 'typescript' } = await req.json() as {
    slug: string
    code: string
    language?: Language
  }
  const problem = getProblemBySlug(slug)
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })

  const langLabel = language === 'ruby' ? 'Ruby' : 'TypeScript'
  const entryPoint = language === 'ruby' ? (problem.ruby?.methodName ?? problem.functionName) : problem.functionName
  const targetLine = problem.targetComplexity
    ? `The optimal target time complexity for this problem is ${problem.targetComplexity}.`
    : 'There is no specific target complexity — just analyze what the code does.'

  const prompt = `You are a senior software engineer reviewing a coding interview solution.

Problem: ${problem.title}
${problem.description}

${targetLine}

User's solution (${langLabel}, method: ${entryPoint}):
\`\`\`${language}
${code}
\`\`\`

Analyze the solution and respond with:
- timeComplexity: the Big-O time complexity (e.g. "O(n)", "O(n²)", "O(n log n)")
- spaceComplexity: the Big-O space complexity
- explanation: 1-2 sentences explaining WHY the solution has this complexity (reference specific code structures like loops, maps, recursion)
- passesTarget: true if the time complexity matches or beats the target, false if it's worse
- hint: if passesTarget is false, a one-sentence Socratic nudge toward the optimal approach without giving away the solution; otherwise null`

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema,
      prompt,
    })
    return NextResponse.json(object)
  } catch (err) {
    console.error('analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Replace `src/app/api/hint/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import type { Language } from '@/types/problem'

export async function POST(req: NextRequest) {
  const { slug, code, messages, language = 'typescript' } = await req.json() as {
    slug: string
    code: string
    messages: any[]
    language?: Language
  }
  const problem = getProblemBySlug(slug)
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })

  const langLabel = language === 'ruby' ? 'Ruby' : 'TypeScript'
  const entryPoint = language === 'ruby' ? (problem.ruby?.methodName ?? problem.functionName) : problem.functionName

  const system = `You are a coding mentor helping someone prepare for technical interviews.

Problem the user is working on: "${problem.title}" (${problem.difficulty})
${problem.description}

The user's current ${langLabel} code (method: ${entryPoint}):
\`\`\`${language}
${code}
\`\`\`

Your rules:
- Never write code for the user or show a corrected version of their function.
- Never reveal the full solution or algorithm outright.
- Ask Socratic questions that guide them to discover the key insight themselves.
- You may reference concepts (e.g. "hash maps", "two pointers") but not implement them.
- Keep responses concise — 2-4 sentences max unless the user asks for more detail.
- Be encouraging and curious, not critical.
- Give examples and hints using ${langLabel} idioms where relevant.
${problem.targetComplexity ? `- The optimal solution runs in ${problem.targetComplexity} time. Nudge toward that if relevant.` : ''}`

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system,
      messages,
    })
    return NextResponse.json({ text })
  } catch (err) {
    console.error('hint error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/analyze/route.ts src/app/api/hint/route.ts
git commit -m "feat: language-aware analyze and hint prompts"
```

---

## Task 9: DB migration + update `/api/progress`

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/app/api/progress/route.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Language` from Task 1

- [ ] **Step 1: Update `prisma/schema.prisma`**

Replace the `ProblemProgress` model:

```prisma
model ProblemProgress {
  slug       String
  language   String   @default("typescript")
  solved     Boolean  @default(false)
  bestTimeMs Int?
  updatedAt  DateTime @updatedAt

  @@id([slug, language])
}
```

Leave `Attempt` model unchanged.

- [ ] **Step 2: Run the Prisma migration**

```bash
npx prisma migrate dev --name add_language_to_progress
```

Expected output includes: `✔  Generated Prisma Client` and a new migration file in `prisma/migrations/`.

- [ ] **Step 3: Replace `src/app/api/progress/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Language } from '@/types/problem'

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')

  if (slug) {
    const [progress, attempts] = await Promise.all([
      db.problemProgress.findMany({ where: { slug } }),
      db.attempt.findMany({ where: { slug }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ])
    return NextResponse.json({ progress, attempts })
  }

  const allProgress = await db.problemProgress.findMany()
  return NextResponse.json({ progress: allProgress })
}

export async function POST(req: NextRequest) {
  const { slug, code, passed, timeSpentMs, language = 'typescript' } = await req.json() as {
    slug: string
    code: string
    passed: boolean
    timeSpentMs: number
    language?: Language
  }

  await db.attempt.create({ data: { slug, code, passed, timeSpentMs } })

  if (passed) {
    const existing = await db.problemProgress.findUnique({ where: { slug_language: { slug, language } } })
    const betterTime = existing?.bestTimeMs == null || timeSpentMs < existing.bestTimeMs

    await db.problemProgress.upsert({
      where: { slug_language: { slug, language } },
      create: { slug, language, solved: true, bestTimeMs: timeSpentMs },
      update: { solved: true, ...(betterTime && { bestTimeMs: timeSpentMs }) },
    })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Update `src/app/page.tsx` to deduplicate solved slugs**

Find these two lines in `page.tsx`:

```typescript
  const solvedProgress = await db.problemProgress.findMany({ where: { solved: true } })
  const solvedSlugs = solvedProgress.map(p => p.slug)
```

Replace with:

```typescript
  const solvedProgress = await db.problemProgress.findMany({ where: { solved: true } })
  const solvedSlugs = [...new Set(solvedProgress.map(p => p.slug))]
```

Also update `solvedCount` (it's currently `solvedProgress.length`):

```typescript
  const solvedCount = solvedSlugs.length
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. Prisma will have regenerated the client with the new composite key.

- [ ] **Step 6: Commit**

```bash
git add prisma/ src/app/api/progress/route.ts src/app/page.tsx
git commit -m "feat: progress tracks language; deduplicate solved slugs on homepage"
```

---

## Task 10: Frontend — language dropdown in `ProblemClient` + `Editor` language prop

**Files:**
- Modify: `src/app/problems/[slug]/ProblemClient.tsx`
- Modify: `src/components/Editor.tsx`

**Interfaces:**
- Consumes: `Language` from Task 1; `problem.ruby` from Tasks 4–6

- [ ] **Step 1: Update `src/components/Editor.tsx`**

Replace the entire file:

```typescript
'use client'
import { useRef } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import { KeyMod, KeyCode } from 'monaco-editor'
import type { Language } from '@/types/problem'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onRun?: () => void
  theme?: string
  language?: Language
}

export default function Editor({ value, onChange, onRun, theme = 'vs-dark', language = 'typescript' }: EditorProps) {
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
      language={language}
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

- [ ] **Step 2: Replace `src/app/problems/[slug]/ProblemClient.tsx`**

Replace the entire file:

```typescript
'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useColorScheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Drawer from '@mui/material/Drawer'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ForumIcon from '@mui/icons-material/Forum'
import { LoadingButton } from '@mui/lab'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import HintChat from '@/components/HintChat'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Problem, Language } from '@/types/problem'
import type { RunResult, ComplexityResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const LANG_KEY = (slug: string) => `lang:${slug}`
const CODE_KEY = (slug: string, lang: Language) => `code:${slug}:${lang}`

const DIFFICULTY_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
}

function starterForLanguage(problem: Problem, lang: Language): string {
  return lang === 'ruby' ? (problem.ruby?.starterCode ?? problem.starterCode) : problem.starterCode
}

export default function ProblemClient({ problem }: { problem: Problem }) {
  const { colorScheme } = useColorScheme()

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'typescript'
    return (localStorage.getItem(LANG_KEY(problem.slug)) ?? 'typescript') as Language
  })

  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return problem.starterCode
    const lang = (localStorage.getItem(LANG_KEY(problem.slug)) ?? 'typescript') as Language
    return localStorage.getItem(CODE_KEY(problem.slug, lang)) ?? starterForLanguage(problem, lang)
  })

  const [result, setResult] = useState<RunResult | null>(null)
  const [complexity, setComplexity] = useState<ComplexityResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [skipAnalysis, setSkipAnalysis] = useState(false)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)
  const runIdRef = useRef(0)

  useEffect(() => {
    localStorage.setItem(CODE_KEY(problem.slug, language), code)
  }, [code, problem.slug, language])

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem(LANG_KEY(problem.slug), newLang)
    setLanguage(newLang)
    const saved = localStorage.getItem(CODE_KEY(problem.slug, newLang))
    setCode(saved ?? starterForLanguage(problem, newLang))
    setResult(null)
    setComplexity(null)
  }

  // Keyboard shortcut: Cmd+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [code, isRunning, skipAnalysis, problem.slug, language])

  const showToast = (msg: string, severity: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message: msg, severity })
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setIsAnalyzing(true)
    setComplexity(null)
    const runId = ++runIdRef.current

    if (!skipAnalysis) {
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code, language }),
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (data && runIdRef.current === runId) setComplexity(data)
      }).catch(() => { }).finally(() => setIsAnalyzing(false))
    } else {
      setIsAnalyzing(false)
    }

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code, language }),
      })

      if (!res.ok) {
        showToast('Error connecting to runner', 'error')
        return
      }
      const data: RunResult = await res.json()
      setResult(data)

      if (data.results.every(r => r.passed)) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code, passed: true, timeSpentMs: elapsedRef.current, language }),
        })
        showToast('All tests passed!')
      }
    } catch {
      showToast('Error connecting to runner', 'error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar
        elevation={0}
        position="static"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        color="default"
      >
        <Toolbar variant="dense" sx={{ gap: 1, minHeight: 64 }}>
          {/* Back button */}
          <IconButton
            component={Link}
            href="/"
            size="small"
            edge="start"
            aria-label="Back to problem list"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>

          {/* Center: title + difficulty */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }} noWrap>
              {problem.title}
            </Typography>
            <Chip
              label={problem.difficulty}
              size="small"
              color={DIFFICULTY_COLOR[problem.difficulty] ?? 'default'}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>

          {/* Right controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Language selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="ruby" disabled={!problem.ruby}>Ruby</MenuItem>
              </Select>
            </FormControl>

            <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />

            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={!skipAnalysis}
                  onChange={e => {
                    setSkipAnalysis(!e.target.checked)
                    if (!e.target.checked) setComplexity(null)
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Feedback
                </Typography>
              }
              sx={{ mr: 0 }}
            />

            <LoadingButton
              onClick={handleRun}
              loading={isRunning}
              variant="contained"
              size="small"
              sx={{ px: 2 }}
            >
              Run
            </LoadingButton>

            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', display: { xs: 'none', lg: 'block' } }}
            >
              ⌘↵
            </Typography>

            <IconButton
              size="small"
              onClick={() => setHintsOpen(o => !o)}
              color={hintsOpen ? 'primary' : 'default'}
              aria-label="Toggle hints"
            >
              <ForumIcon fontSize="small" />
            </IconButton>

            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Top row: description + editor */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Description panel */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
              overflow: 'auto',
              p: 2,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              component="pre"
              sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}
            >
              {problem.description.trim()}
            </Typography>
          </Box>

          {/* Editor */}
          <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <Editor
              value={code}
              onChange={setCode}
              onRun={handleRun}
              theme={colorScheme === 'dark' ? 'vs-dark' : 'vs'}
              language={language}
            />
          </Box>
        </Box>

        {/* Bottom: test results */}
        <Box
          sx={{
            height: 280,
            borderTop: 1,
            borderColor: 'divider',
            overflow: 'auto',
            flexShrink: 0,
          }}
        >
          <TestResults
            result={result}
            isRunning={isRunning}
            complexity={complexity}
            isAnalyzing={isAnalyzing}
          />
        </Box>
      </Box>

      {/* Hints Drawer */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={hintsOpen}
        onClose={() => setHintsOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              top: '64px',
              height: 'calc(100vh - 64px)',
            },
          },
        }}
      >
        <HintChat slug={problem.slug} code={code} open={hintsOpen} onClose={() => setHintsOpen(false)} language={language} />
      </Drawer>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
```

- [ ] **Step 3: Update `HintChat` to accept `language` prop**

`HintChat` is called with `language={language}` above but its interface needs the prop. Open `src/components/HintChat.tsx` and add `language?: Language` to its props interface, then pass it through to the `/api/hint` POST body:

In `HintChat.tsx`, find the props interface (it will have `slug`, `code`, `open`, `onClose`) and add:

```typescript
import type { Language } from '@/types/problem'

// In the props interface:
language?: Language
```

Then in the fetch call to `/api/hint`, add `language` to the request body:

```typescript
body: JSON.stringify({ slug, code, messages, language: language ?? 'typescript' }),
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all 11 runner tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Editor.tsx src/app/problems/[slug]/ProblemClient.tsx src/components/HintChat.tsx
git commit -m "feat: language dropdown in editor with per-language scoped localStorage"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ `Language` / `LanguageConfig` types — Task 1
- ✅ `RUBY_LINKED_LIST_SETUP` / `RUBY_TREE_SETUP` — Task 2
- ✅ Ruby runner (`runRubyCode` / `runCode` dispatch) — Task 3
- ✅ All 36 problem files — Tasks 4, 5, 6
- ✅ `/api/run` language dispatch — Task 7
- ✅ `/api/analyze` language-aware — Task 8
- ✅ `/api/hint` language-aware — Task 8
- ✅ Prisma migration — Task 9
- ✅ `/api/progress` stores language — Task 9
- ✅ Homepage deduplicates solved slugs — Task 9
- ✅ Language dropdown in editor — Task 10
- ✅ Per-problem scoped localStorage — Task 10
- ✅ Editor `language` prop for Monaco — Task 10
- ✅ `HintChat` passes `language` — Task 10

**Type consistency check:**
- `Language` defined in Task 1, consumed identically in Tasks 3, 7, 8, 9, 10
- `LanguageConfig.methodName` used as `functionName` in `RunRequest` throughout Tasks 7, 3
- `CODE_KEY(slug, lang)` and `LANG_KEY(slug)` defined and used only in Task 10
- Prisma unique identifier `slug_language` matches the `@@id([slug, language])` composite key

**No placeholders:** All steps contain complete code.
