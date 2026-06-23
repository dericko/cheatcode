import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'binary-tree-maximum-path-sum',
  title: 'Binary Tree Maximum Path Sum',
  difficulty: 'hard',
  topic: 'trees',
  functionName: 'maxPathSum',
  setupCode: TREE_SETUP,
  testCallCode: 'maxPathSum(arrayToTree(tc.input[0]))',
  description: `A path in a binary tree is any sequence of nodes connected by edges. Return the maximum sum of any non-empty path (the path need not pass through the root).

Example:
  Input: [-10,9,20,null,null,15,7]
  Output: 42  (15 → 20 → 7)`,
  starterCode: `function maxPathSum(root: TreeNode | null): number {\n\n}`,
  testCases: [
    { input: [[1,2,3]], expected: 6, description: '2+1+3' },
    { input: [[-10,9,20,null,null,15,7]], expected: 42, description: '15+20+7' },
    { input: [[-3]], expected: -3, description: 'single negative node' },
  ],
}
