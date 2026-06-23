import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'flood-fill',
  title: 'Flood Fill',
  difficulty: 'easy',
  topic: 'graphs',
  functionName: 'floodFill',
  description: `Perform a flood fill on an image grid starting from pixel (sr, sc), replacing all connected pixels of the same color with \`color\`. Connected means 4-directionally adjacent.

Example:
  Input: image = [[1,1,1],[1,1,0],[1,0,1]], sr=1, sc=1, color=2
  Output: [[2,2,2],[2,2,0],[2,0,1]]`,
  starterCode: `function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {\n\n}`,
  testCases: [
    { input: [[[1,1,1],[1,1,0],[1,0,1]], 1, 1, 2], expected: [[2,2,2],[2,2,0],[2,0,1]], description: 'standard fill' },
    { input: [[[0,0,0],[0,0,0]], 0, 0, 0], expected: [[0,0,0],[0,0,0]], description: 'same color — no change' },
    { input: [[[1,2,1],[1,2,0],[1,0,1]], 1, 1, 3], expected: [[1,3,1],[1,3,0],[1,0,1]], description: 'fills only connected' },
  ],
}
