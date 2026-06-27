import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'
import { RUBY_LINKED_LIST_SETUP } from '../shared_ruby'

export const problem: Problem = {
  slug: 'remove-nth-node-from-end-of-list',
  title: 'Remove Nth Node From End of List',
  difficulty: 'medium',
  topic: 'linked-lists',
  functionName: 'removeNthFromEnd',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(removeNthFromEnd(arrayToList(tc.input[0]), tc.input[1]))',
  description: `Remove the n-th node from the end of a linked list and return its head.

Example:
  Input: head = [1,2,3,4,5], n = 2
  Output: [1,2,3,5]`,
  starterCode: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[1,2,3,4,5], 2], expected: [1,2,3,5], description: 'remove 2nd from end' },
    { input: [[1], 1], expected: [], description: 'remove only node' },
    { input: [[1,2], 1], expected: [1], description: 'remove last' },
  ],
  ruby: {
    methodName: 'remove_nth_from_end',
    starterCode: `def remove_nth_from_end(head, n)\n\nend`,
    setupCode: RUBY_LINKED_LIST_SETUP,
    testCallCode: `list_to_array(remove_nth_from_end(array_to_list(tc['input'][0]), tc['input'][1]))`,
  },
}
