import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'reverse-words-in-a-string',
  title: 'Reverse Words in a String',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'reverseWords',
  description: `Given a string \`s\`, reverse the order of words. Words are separated by spaces; the result must have single spaces only (no leading/trailing spaces).

Example:
  Input: s = "the sky is blue"
  Output: "blue is sky the"`,
  starterCode: `function reverseWords(s: string): string {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: ['the sky is blue'], expected: 'blue is sky the', description: 'standard case' },
    { input: ['  hello world  '], expected: 'world hello', description: 'trim spaces' },
    { input: ['a good   example'], expected: 'example good a', description: 'multiple spaces' },
  ],
}
