import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'
import { RUBY_TREE_SETUP } from '../shared_ruby'

export const problem: Problem = {
  slug: 'maximum-depth-of-binary-tree',
  title: 'Maximum Depth of Binary Tree',
  difficulty: 'easy',
  topic: 'trees',
  functionName: 'maxDepth',
  setupCode: TREE_SETUP,
  testCallCode: 'maxDepth(arrayToTree(tc.input[0]))',
  description: `Return the maximum depth (number of nodes along the longest root-to-leaf path) of a binary tree.

Tree input uses BFS-level array format: \`[3,9,20,null,null,15,7]\`.

Example:
  Input: [3,9,20,null,null,15,7]
  Output: 3`,
  starterCode: `function maxDepth(root: TreeNode | null): number {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[3,9,20,null,null,15,7]], expected: 3, description: 'depth-3 tree' },
    { input: [[1,null,2]], expected: 2, description: 'right-skewed' },
    { input: [[]], expected: 0, description: 'empty tree' },
  ],
  ruby: {
    methodName: 'max_depth',
    starterCode: `def max_depth(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `max_depth(array_to_tree(tc['input'][0]))`,
  },
}
