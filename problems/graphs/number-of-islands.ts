import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'number-of-islands',
  title: 'Number of Islands',
  difficulty: 'medium',
  topic: 'graphs',
  functionName: 'numIslands',
  description: `Given a 2D grid of \`'1'\` (land) and \`'0'\` (water), count the number of islands. An island is formed by connecting adjacent land cells horizontally or vertically.

Example:
  Input: [["1","1","0"],["0","1","0"],["0","0","1"]]
  Output: 2`,
  starterCode: `function numIslands(grid: string[][]): number {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: [[['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]], expected: 1, description: 'one large island' },
    { input: [[['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]], expected: 3, description: 'three islands' },
    { input: [[['0']]], expected: 0, description: 'all water' },
  ],
  ruby: {
    methodName: 'num_islands',
    starterCode: `def num_islands(grid)\n\nend`,
  },
}
