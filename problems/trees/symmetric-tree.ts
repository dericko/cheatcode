import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'symmetric-tree',
  title: 'Symmetric Tree',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'isSymmetric',
  setupCode: TREE_SETUP,
  testCallCode: 'isSymmetric(arrayToTree(tc.input[0]))',
  description: `Check whether a binary tree is a mirror of itself (symmetric around its center).

Example:
  Input: [1,2,2,3,4,4,3]
  Output: true`,
  starterCode: `function isSymmetric(root: TreeNode | null): boolean {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[1,2,2,3,4,4,3]], expected: true, description: 'symmetric' },
    { input: [[1,2,2,null,3,null,3]], expected: false, description: 'not symmetric' },
    { input: [[1]], expected: true, description: 'single node' },
  ],
}
