import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'merge-k-sorted-lists',
  title: 'Merge K Sorted Lists',
  difficulty: 'hard',
  topic: 'linked-lists',
  functionName: 'mergeKLists',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(mergeKLists(tc.input[0].map((arr: number[]) => arrayToList(arr))))',
  description: `Merge k sorted linked lists into one sorted list and return it.

Example:
  Input: lists = [[1,4,5],[1,3,4],[2,6]]
  Output: [1,1,2,3,4,4,5,6]`,
  starterCode: `function mergeKLists(lists: Array<ListNode | null>): ListNode | null {\n\n}`,
  targetComplexity: 'O(n log n)',
  testCases: [
    { input: [[[1,4,5],[1,3,4],[2,6]]], expected: [1,1,2,3,4,4,5,6], description: '3 lists' },
    { input: [[[]]], expected: [], description: 'one empty list' },
    { input: [[]], expected: [], description: 'no lists' },
  ],
}
