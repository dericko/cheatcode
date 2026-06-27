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
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[1,2,3,1]], expected: true, description: 'has duplicate' },
    { input: [[1,2,3,4]], expected: false, description: 'all unique' },
    { input: [[1,1,1,3,3,4,3,2,4,2]], expected: true, description: 'many duplicates' },
  ],
  ruby: {
    methodName: 'contains_duplicate',
    starterCode: `def contains_duplicate(nums)\n\nend`,
  },
}
