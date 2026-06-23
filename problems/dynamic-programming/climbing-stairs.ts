import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'climbing-stairs',
  title: 'Climbing Stairs',
  difficulty: 'easy',
  topic: 'dynamic-programming',
  functionName: 'climbStairs',
  description: `You are climbing n stairs. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?

Example:
  Input: n = 3
  Output: 3  (1+1+1, 1+2, 2+1)`,
  starterCode: `function climbStairs(n: number): number {\n\n}`,
  testCases: [
    { input: [2], expected: 2, description: '2 stairs — 2 ways' },
    { input: [3], expected: 3, description: '3 stairs — 3 ways' },
    { input: [5], expected: 8, description: '5 stairs — 8 ways' },
  ],
}
