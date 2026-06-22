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

const __results: any[] = []
const __console: string[] = []
console.log = (...args: any[]) => {
  const line = args.map(String).join(' ')
  __console.push(line)
  process.stderr.write(line + '\\n')
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
