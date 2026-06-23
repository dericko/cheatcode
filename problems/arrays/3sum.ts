import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: '3sum',
  title: '3Sum',
  difficulty: 'medium',
  topic: 'arrays',
  functionName: 'threeSum',
  testCallCode: 'threeSum(tc.input[0]).map((t: number[]) => [...t].sort((a,b)=>a-b)).sort((a:number[],b:number[])=>a[0]-b[0]||a[1]-b[1])',
  description: `Find all unique triplets in \`nums\` that sum to zero. No duplicate triplets.

Example:
  Input: nums = [-1,0,1,2,-1,-4]
  Output: [[-1,-1,2],[-1,0,1]]`,
  starterCode: `function threeSum(nums: number[]): number[][] {\n\n}`,
  testCases: [
    { input: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]], description: 'standard case' },
    { input: [[0,1,1]], expected: [], description: 'no triplets' },
    { input: [[0,0,0]], expected: [[0,0,0]], description: 'all zeros' },
  ],
}
