import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'coin-change',
  title: 'Coin Change',
  difficulty: 'medium',
  topic: 'dynamic-programming',
  functionName: 'coinChange',
  description: `Given coin denominations and a target amount, return the fewest number of coins needed. Return -1 if impossible.

Example:
  Input: coins = [1,2,5], amount = 11
  Output: 3  (5+5+1)`,
  starterCode: `function coinChange(coins: number[], amount: number): number {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[1,2,5], 11], expected: 3, description: '5+5+1' },
    { input: [[2], 3], expected: -1, description: 'impossible' },
    { input: [[1,5,11], 11], expected: 1, description: 'exact coin available' },
  ],
}
