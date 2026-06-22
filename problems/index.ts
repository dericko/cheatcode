import type { Problem } from '../src/types/problem'
import { problem as twoSum } from './arrays/two-sum'
import { problem as bestTime } from './arrays/best-time-to-buy-and-sell-stock'
import { problem as containsDuplicate } from './arrays/contains-duplicate'
import { problem as productExceptSelf } from './arrays/product-of-array-except-self'
import { problem as maxSubArray } from './arrays/maximum-subarray'

export const allProblems: Problem[] = [
  twoSum, bestTime, containsDuplicate, productExceptSelf, maxSubArray,
]
