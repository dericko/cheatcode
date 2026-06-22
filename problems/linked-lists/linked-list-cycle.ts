import type { Problem } from '../../src/types/problem'
import { LINKED_LIST_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'linked-list-cycle',
  title: 'Linked List Cycle',
  difficulty: 'easy',
  topic: 'linked-lists',
  functionName: 'hasCycle',
  setupCode: LINKED_LIST_SETUP,
  testCallCode: 'hasCycle(buildCyclicList(tc.input[0], tc.input[1]))',
  description: `Determine if a linked list has a cycle. Return \`true\` if there is a cycle, \`false\` otherwise.

Input format: \`[values, pos]\` where \`pos\` is the tail's connection index (-1 = no cycle).

Example:
  Input: [3,2,0,-4], pos=1  →  Output: true`,
  starterCode: `function hasCycle(head: ListNode | null): boolean {\n\n}`,
  testCases: [
    { input: [[3,2,0,-4], 1], expected: true, description: 'cycle at index 1' },
    { input: [[1,2], 0], expected: true, description: 'cycle at head' },
    { input: [[1], -1], expected: false, description: 'no cycle' },
  ],
}
