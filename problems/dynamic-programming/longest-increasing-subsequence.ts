import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence',
  difficulty: 'medium',
  topic: 'dynamic-programming',
  functionName: 'lengthOfLIS',
  description: `Return the length of the longest strictly increasing subsequence of \`nums\`.

Example:
  Input: nums = [10,9,2,5,3,7,101,18]
  Output: 4  ([2,3,7,101])`,
  starterCode: `function lengthOfLIS(nums: number[]): number {\n\n}`,
  targetComplexity: 'O(n log n)',
  testCases: [
    { input: [[10,9,2,5,3,7,101,18]], expected: 4, description: '[2,3,7,101]' },
    { input: [[0,1,0,3,2,3]], expected: 4, description: '[0,1,2,3]' },
    { input: [[7,7,7,7,7,7,7]], expected: 1, description: 'all same — LIS of 1' },
  ],
  ruby: {
    methodName: 'length_of_lis',
    starterCode: `def length_of_lis(nums)\n\nend`,
  },
}
