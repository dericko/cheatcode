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
