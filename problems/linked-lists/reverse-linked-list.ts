import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'
import { RUBY_LINKED_LIST_SETUP } from '../shared_ruby'

export const problem: Problem = {
  slug: 'reverse-linked-list',
  title: 'Reverse Linked List',
  difficulty: 'easy',
  topic: 'linked-lists',
  functionName: 'reverseList',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'listToArray(reverseList(arrayToList(tc.input[0])))',
  description: `Reverse a singly linked list and return the head of the reversed list.

Input is given as an array; your function receives a ListNode.

Example:
  Input: head = [1,2,3,4,5]
  Output: [5,4,3,2,1]`,
  starterCode: `function reverseList(head: ListNode | null): ListNode | null {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[1,2,3,4,5]], expected: [5,4,3,2,1], description: '5-node list' },
    { input: [[1,2]], expected: [2,1], description: '2-node list' },
    { input: [[1]], expected: [1], description: 'single node' },
  ],
  ruby: {
    methodName: 'reverse_list',
    starterCode: `def reverse_list(head)\n\nend`,
    setupCode: RUBY_LINKED_LIST_SETUP,
    testCallCode: `list_to_array(reverse_list(array_to_list(tc['input'][0])))`,
  },
}
