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

export interface ComplexityResult {
  timeComplexity: string
  spaceComplexity: string
  explanation: string
  passesTarget: boolean
  hint: string | null
}

export interface RunResult {
  results: TestCaseResult[]
  consoleOutput: string[]
}
