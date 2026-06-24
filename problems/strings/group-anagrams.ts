import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'group-anagrams',
  title: 'Group Anagrams',
  difficulty: 'medium',
  topic: 'strings',
  functionName: 'groupAnagrams',
  testCallCode: 'groupAnagrams(tc.input[0]).map((g: string[]) => [...g].sort()).sort((a: string[], b: string[]) => a[0] < b[0] ? -1 : 1)',
  description: `Group strings that are anagrams of each other. Return in any order.

Example:
  Input: strs = ["eat","tea","tan","ate","nat","bat"]
  Output: [["bat"],["nat","tan"],["ate","eat","tea"]]`,
  starterCode: `function groupAnagrams(strs: string[]): string[][] {\n\n}`,
  targetComplexity: 'O(n log n)',
  testCases: [
    { input: [['eat','tea','tan','ate','nat','bat']], expected: [['ate','eat','tea'],['bat'],['nat','tan']], description: 'standard grouping' },
    { input: [['']], expected: [['']], description: 'empty string' },
    { input: [['a']], expected: [['a']], description: 'single string' },
  ],
}
