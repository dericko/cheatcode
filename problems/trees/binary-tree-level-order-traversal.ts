import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'binary-tree-level-order-traversal',
  title: 'Binary Tree Level Order Traversal',
  difficulty: 'medium',
  topic: 'trees',
  functionName: 'levelOrder',
  setupCode: TREE_SETUP,
  testCallCode: 'levelOrder(arrayToTree(tc.input[0]))',
  description: `Return the level-order traversal of a binary tree's values (left to right, level by level).

Example:
  Input: [3,9,20,null,null,15,7]
  Output: [[3],[9,20],[15,7]]`,
  starterCode: `function levelOrder(root: TreeNode | null): number[][] {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[3,9,20,null,null,15,7]], expected: [[3],[9,20],[15,7]], description: 'standard BFS' },
    { input: [[1]], expected: [[1]], description: 'single node' },
    { input: [[]], expected: [], description: 'empty tree' },
  ],
}
