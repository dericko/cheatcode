import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'

export const problem: Problem = {
  slug: 'path-sum',
  title: 'Path Sum',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'hasPathSum',
  setupCode: TREE_SETUP,
  testCallCode: 'hasPathSum(arrayToTree(tc.input[0]), tc.input[1])',
  description: `Return \`true\` if the tree has a root-to-leaf path where the sum of node values equals \`targetSum\`.

Example:
  Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
  Output: true`,
  starterCode: `function hasPathSum(root: TreeNode | null, targetSum: number): boolean {\n\n}`,
  testCases: [
    { input: [[5,4,8,11,null,13,4,7,2,null,null,null,1], 22], expected: true, description: 'path exists' },
    { input: [[1,2,3], 5], expected: false, description: 'no matching path' },
    { input: [[], 0], expected: false, description: 'empty tree' },
  ],
}
