import { spawn } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { RunRequest, RunResult } from '@/types/runner'
import type { Language } from '@/types/problem'

// RUNNER_TSX_BIN is injected by next.config.ts at build time using the real
// process.cwd() from the config process, bypassing Turbopack's path virtualization.
const TSX_BIN = process.env.RUNNER_TSX_BIN!

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

    proc.on('error', (err) => {
      try { unlinkSync(tmpFile) } catch {}
      console.error('[runner] spawn error', { bin, args, code: (err as any).code, message: err.message })
      resolve({
        results: [{ passed: false, description: 'execution', error: `Failed to spawn runner: ${err.message}` }],
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
