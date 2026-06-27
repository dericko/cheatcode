import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'two-sum',
  title: 'Two Sum',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'twoSum',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers that add up to \`target\`.

Each input has exactly one solution. You may not use the same element twice. Return the answer in any order.

Example:
  Input: nums = [2,7,11,15], target = 9
  Output: [0,1]
  Explanation: nums[0] + nums[1] = 2 + 7 = 9`,
  starterCode: `function twoSum(nums: number[], target: number): number[] {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[2,7,11,15], 9], expected: [0,1], description: 'basic case' },
    { input: [[3,2,4], 6], expected: [1,2], description: 'non-sequential indices' },
    { input: [[3,3], 6], expected: [0,1], description: 'duplicate values' },
  ],
  ruby: {
    methodName: 'two_sum',
    starterCode: `def two_sum(nums, target)\n\nend`,
  },
}
