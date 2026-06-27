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
