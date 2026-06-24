import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists',
  difficulty: 'easy',
  topic: 'linked-lists',
  functionName: 'mergeTwoLists',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(mergeTwoLists(arrayToList(tc.input[0]), arrayToList(tc.input[1])))',
  description: `Merge two sorted linked lists and return the merged list.

Example:
  Input: list1 = [1,2,4], list2 = [1,3,4]
  Output: [1,1,2,3,4,4]`,
  starterCode: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[1,2,4],[1,3,4]], expected: [1,1,2,3,4,4], description: 'standard merge' },
    { input: [[],[]], expected: [], description: 'both empty' },
    { input: [[],[0]], expected: [0], description: 'one empty' },
  ],
}
