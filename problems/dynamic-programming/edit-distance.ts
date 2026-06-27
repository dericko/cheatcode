import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'edit-distance',
  title: 'Edit Distance',
  difficulty: 'hard',
  topic: 'dynamic-programming',
  functionName: 'minDistance',
  description: `Return the minimum number of operations (insert, delete, replace) to convert \`word1\` to \`word2\`.

Example:
  Input: word1 = "horse", word2 = "ros"
  Output: 3  (horse→rorse→rose→ros)`,
  starterCode: `function minDistance(word1: string, word2: string): number {\n\n}`,
  targetComplexity: 'O(n²)',
  testCases: [
    { input: ['horse', 'ros'], expected: 3, description: 'horse → ros' },
    { input: ['intention', 'execution'], expected: 5, description: 'intention → execution' },
    { input: ['', 'a'], expected: 1, description: 'empty to single char' },
  ],
  ruby: {
    methodName: 'min_distance',
    starterCode: `def min_distance(word1, word2)\n\nend`,
  },
}
