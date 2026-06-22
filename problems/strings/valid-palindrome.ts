import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'valid-palindrome',
  title: 'Valid Palindrome',
  difficulty: 'easy',
  topic: 'strings',
  functionName: 'isPalindrome',
  description: `A phrase is a palindrome if, after removing non-alphanumeric characters and lowercasing, it reads the same forward and backward.

Example:
  Input: s = "A man, a plan, a canal: Panama"
  Output: true`,
  starterCode: `function isPalindrome(s: string): boolean {\n\n}`,
  testCases: [
    { input: ['A man, a plan, a canal: Panama'], expected: true, description: 'classic with punctuation' },
    { input: ['race a car'], expected: false, description: 'not a palindrome' },
    { input: [' '], expected: true, description: 'empty after cleaning' },
  ],
}
