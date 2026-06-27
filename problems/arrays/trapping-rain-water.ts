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
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[0,1,0,2,1,0,1,3,2,1,2,1]], expected: 6, description: 'classic example' },
    { input: [[4,2,0,3,2,5]], expected: 9, description: 'valley shape' },
    { input: [[1,0,1]], expected: 1, description: 'simple valley' },
  ],
  ruby: {
    methodName: 'trap',
    starterCode: `def trap(height)\n\nend`,
  },
}
