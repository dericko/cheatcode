import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'house-robber',
  title: 'House Robber',
  difficulty: 'easy',
  topic: 'dynamic-programming',
  functionName: 'rob',
  description: `You are a robber. Adjacent houses cannot both be robbed. Given \`nums[i]\` as the money in house i, return the maximum amount you can rob without triggering the alarm.

Example:
  Input: nums = [1,2,3,1]
  Output: 4  (rob house 0 + house 2)`,
  starterCode: `function rob(nums: number[]): number {\n\n}`,
  testCases: [
    { input: [[1,2,3,1]], expected: 4, description: 'alternating' },
    { input: [[2,7,9,3,1]], expected: 12, description: '2+9+1=12' },
    { input: [[1]], expected: 1, description: 'single house' },
  ],
}
