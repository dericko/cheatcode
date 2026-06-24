import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'invert-binary-tree',
  title: 'Invert Binary Tree',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'invertTree',
  setupCode: TREE_SETUP,
  testCallCode: 'treeToArray(invertTree(arrayToTree(tc.input[0])))',
  description: `Invert a binary tree (mirror it) and return the root.

Example:
  Input: [4,2,7,1,3,6,9]
  Output: [4,7,2,9,6,3,1]`,
  starterCode: `function invertTree(root: TreeNode | null): TreeNode | null {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[4,2,7,1,3,6,9]], expected: [4,7,2,9,6,3,1], description: 'full tree' },
    { input: [[2,1,3]], expected: [2,3,1], description: '3-node tree' },
    { input: [[]], expected: [], description: 'empty tree' },
  ],
}
