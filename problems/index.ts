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
import { problem as reverseList } from './linked-lists/reverse-linked-list'
import { problem as mergeTwoLists } from './linked-lists/merge-two-sorted-lists'
import { problem as hasCycle } from './linked-lists/linked-list-cycle'
import { problem as maxDepth } from './trees/maximum-depth-of-binary-tree'
import { problem as invertTree } from './trees/invert-binary-tree'
import { problem as isSymmetric } from './trees/symmetric-tree'
import { problem as hasPathSum } from './trees/path-sum'
import { problem as floodFill } from './graphs/flood-fill'
import { problem as climbStairs } from './dynamic-programming/climbing-stairs'
import { problem as rob } from './dynamic-programming/house-robber'
import { problem as isValid } from './misc/valid-parentheses'
import { problem as threeSum } from './arrays/3sum'
import { problem as maxArea } from './arrays/container-with-most-water'
import { problem as lengthOfLongestSubstring } from './strings/longest-substring-without-repeating-characters'
import { problem as groupAnagrams } from './strings/group-anagrams'
import { problem as removeNthFromEnd } from './linked-lists/remove-nth-node-from-end-of-list'
import { problem as levelOrder } from './trees/binary-tree-level-order-traversal'
import { problem as isValidBST } from './trees/validate-binary-search-tree'
import { problem as numIslands } from './graphs/number-of-islands'
import { problem as coinChange } from './dynamic-programming/coin-change'
import { problem as lengthOfLIS } from './dynamic-programming/longest-increasing-subsequence'

export const allProblems: Problem[] = [
  // Easy (20)
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
  isPalindrome, isAnagram, longestCommonPrefix, reverseWords,
  reverseList, mergeTwoLists, hasCycle,
  maxDepth, invertTree, isSymmetric, hasPathSum,
  floodFill, climbStairs, rob, isValid,
  // Medium (10)
  threeSum, maxArea,
  lengthOfLongestSubstring, groupAnagrams,
  removeNthFromEnd,
  levelOrder, isValidBST,
  numIslands,
  coinChange, lengthOfLIS,
]
