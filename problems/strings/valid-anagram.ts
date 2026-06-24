import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'valid-anagram',
  title: 'Valid Anagram',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'isAnagram',
  description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`.

Example:
  Input: s = "anagram", t = "nagaram"
  Output: true`,
  starterCode: `function isAnagram(s: string, t: string): boolean {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: ['anagram', 'nagaram'], expected: true, description: 'valid anagram' },
    { input: ['rat', 'car'], expected: false, description: 'not an anagram' },
    { input: ['a', 'ab'], expected: false, description: 'different lengths' },
  ],
}
