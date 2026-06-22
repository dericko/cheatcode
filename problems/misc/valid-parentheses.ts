import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'valid-parentheses',
  title: 'Valid Parentheses',
  difficulty: 'easy',
  topic: 'misc',
  functionName: 'isValid',
  description: `Given a string of \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, determine if the input is valid. Brackets must close in the correct order.

Example:
  Input: s = "()[]{}"
  Output: true`,
  starterCode: `function isValid(s: string): boolean {\n\n}`,
  testCases: [
    { input: ['()'], expected: true, description: 'simple pair' },
    { input: ['()[]{}'], expected: true, description: 'multiple pairs' },
    { input: ['(]'], expected: false, description: 'mismatched' },
    { input: ['([)]'], expected: false, description: 'wrong order' },
  ],
}
