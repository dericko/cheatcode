import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'best-time-to-buy-and-sell-stock',
  title: 'Best Time to Buy and Sell Stock',
  difficulty: 'easy',
  topic: 'arrays',
  functionName: 'maxProfit',
  description: `Given an array \`prices\` where \`prices[i]\` is the stock price on day i, return the maximum profit from a single buy-then-sell transaction. Return 0 if no profit is possible.

Example:
  Input: prices = [7,1,5,3,6,4]
  Output: 5
  Explanation: Buy day 2 (price=1), sell day 5 (price=6), profit = 5`,
  starterCode: `function maxProfit(prices: number[]): number {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[7,1,5,3,6,4]], expected: 5, description: 'standard case' },
    { input: [[7,6,4,3,1]], expected: 0, description: 'declining prices — no profit' },
    { input: [[1,2]], expected: 1, description: 'two-day window' },
  ],
  ruby: {
    methodName: 'max_profit',
    starterCode: `def max_profit(prices)\n\nend`,
  },
}
