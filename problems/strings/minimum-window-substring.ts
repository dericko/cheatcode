import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'minimum-window-substring',
  title: 'Minimum Window Substring',
  difficulty: 'hard',
  topic: 'strings',
  functionName: 'minWindow',
  description: `Given strings \`s\` and \`t\`, return the minimum window substring of \`s\` that contains every character in \`t\` (including duplicates). Return \`""\` if impossible.

Example:
  Input: s = "ADOBECODEBANC", t = "ABC"
  Output: "BANC"`,
  starterCode: `function minWindow(s: string, t: string): string {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: ['ADOBECODEBANC', 'ABC'], expected: 'BANC', description: 'standard case' },
    { input: ['a', 'a'], expected: 'a', description: 'exact match' },
    { input: ['a', 'aa'], expected: '', description: 'impossible' },
  ],
}
