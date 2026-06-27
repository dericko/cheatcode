import type { Problem } from '../../src/types/problem'
import { TREE_SETUP } from '../shared'
import { RUBY_TREE_SETUP } from '../shared_ruby'

export const problem: Problem = {
  slug: 'validate-binary-search-tree',
  title: 'Validate Binary Search Tree',
  difficulty: 'medium',
  topic: 'trees',
  functionName: 'isValidBST',
  setupCode: TREE_SETUP,
  testCallCode: 'isValidBST(arrayToTree(tc.input[0]))',
  description: `Determine if a binary tree is a valid BST. Every left subtree node < current node < every right subtree node, recursively.

Example:
  Input: [2,1,3]  →  Output: true
  Input: [5,1,4,null,null,3,6]  →  Output: false`,
  starterCode: `function isValidBST(root: TreeNode | null): boolean {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[2,1,3]], expected: true, description: 'valid BST' },
    { input: [[5,1,4,null,null,3,6]], expected: false, description: 'invalid — right subtree has 4 < 5' },
    { input: [[2,2,2]], expected: false, description: 'equal values not allowed' },
  ],
  ruby: {
    methodName: 'is_valid_bst',
    starterCode: `def is_valid_bst(root)\n\nend`,
    setupCode: RUBY_TREE_SETUP,
    testCallCode: `is_valid_bst(array_to_tree(tc['input'][0]))`,
  },
}
