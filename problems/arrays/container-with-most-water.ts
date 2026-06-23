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
