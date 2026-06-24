import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'longest-substring-without-repeating-characters',
  title: 'Longest Substring Without Repeating Characters',
  difficulty: 'medium',
  topic: 'strings',
  functionName: 'lengthOfLongestSubstring',
  description: `Find the length of the longest substring without repeating characters.

Example:
  Input: s = "abcabcbb"
  Output: 3  ("abc")`,
  starterCode: `function lengthOfLongestSubstring(s: string): number {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: ['abcabcbb'], expected: 3, description: '"abc"' },
    { input: ['bbbbb'], expected: 1, description: 'all same' },
    { input: ['pwwkew'], expected: 3, description: '"wke"' },
  ],
}
