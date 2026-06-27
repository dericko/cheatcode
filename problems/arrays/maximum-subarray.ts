import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'maximum-subarray',
  title: 'Maximum Subarray',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'maxSubArray',
  description: `Given an integer array \`nums\`, find the contiguous subarray with the largest sum and return its sum.

Example:
  Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
  Output: 6
  Explanation: [4,-1,2,1] has the largest sum = 6`,
  starterCode: `function maxSubArray(nums: number[]): number {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6, description: 'classic Kadane' },
    { input: [[1]], expected: 1, description: 'single element' },
    { input: [[5,4,-1,7,8]], expected: 23, description: 'mostly positive' },
  ],
  ruby: {
    methodName: 'max_sub_array',
    starterCode: `def max_sub_array(nums)\n\nend`,
  },
}
