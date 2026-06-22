import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'longest-common-prefix',
  title: 'Longest Common Prefix',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'longestCommonPrefix',
  description: `Find the longest common prefix string among an array of strings. Return \`""\` if there is none.

Example:
  Input: strs = ["flower","flow","flight"]
  Output: "fl"`,
  starterCode: `function longestCommonPrefix(strs: string[]): string {\n\n}`,
  testCases: [
    { input: [['flower','flow','flight']], expected: 'fl', description: 'standard case' },
    { input: [['dog','racecar','car']], expected: '', description: 'no common prefix' },
    { input: [['ab','a']], expected: 'a', description: 'prefix is one char' },
  ],
}
