import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'product-of-array-except-self',
  title: 'Product of Array Except Self',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'productExceptSelf',
  description: `Given an integer array \`nums\`, return an array where each element is the product of all other elements. Solve in O(n) time without division.

Example:
  Input: nums = [1,2,3,4]
  Output: [24,12,8,6]`,
  starterCode: `function productExceptSelf(nums: number[]): number[] {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[1,2,3,4]], expected: [24,12,8,6], description: 'standard case' },
    { input: [[-1,1,0,-3,3]], expected: [0,0,9,0,0], description: 'contains zero' },
    { input: [[1,1]], expected: [1,1], description: 'two elements' },
  ],
  ruby: {
    methodName: 'product_except_self',
    starterCode: `def product_except_self(nums)\n\nend`,
  },
}
