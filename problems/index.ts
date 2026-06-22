import type { Problem } from '../src/types/problem'
import { problem as twoSum } from './arrays/two-sum'
import { problem as bestTime } from './arrays/best-time-to-buy-and-sell-stock'
import { problem as containsDuplicate } from './arrays/contains-duplicate'
import { problem as productExceptSelf } from './arrays/product-of-array-except-self'
import { problem as maxSubArray } from './arrays/maximum-subarray'
import { problem as isPalindrome } from './strings/valid-palindrome'
import { problem as isAnagram } from './strings/valid-anagram'
import { problem as longestCommonPrefix } from './strings/longest-common-prefix'
import { problem as reverseWords } from './strings/reverse-words-in-a-string'

export const allProblems: Problem[] = [
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
  isPalindrome, isAnagram, longestCommonPrefix, reverseWords,
]
