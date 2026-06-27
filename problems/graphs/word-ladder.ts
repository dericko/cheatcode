import type { Problem } from '../../src/types/problem'

export const problem: Problem = {
  slug: 'word-ladder',
  title: 'Word Ladder',
  difficulty: 'hard',
  topic: 'graphs',
  functionName: 'ladderLength',
  description: `Find the shortest transformation sequence from \`beginWord\` to \`endWord\`, where each step changes exactly one letter and every intermediate word must be in \`wordList\`. Return the sequence length (0 if impossible).

Example:
  Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
  Output: 5  (hit→hot→dot→dog→cog)`,
  starterCode: `function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {\n\n}`,
  targetComplexity: 'O(n)',
  testCases: [
    { input: ['hit', 'cog', ['hot','dot','dog','lot','log','cog']], expected: 5, description: 'hit→hot→dot→dog→cog' },
    { input: ['hit', 'cog', ['hot','dot','dog','lot','log']], expected: 0, description: 'endWord not in list' },
    { input: ['a', 'c', ['a','b','c']], expected: 2, description: 'direct one-step transform' },
  ],
  ruby: {
    methodName: 'ladder_length',
    starterCode: `def ladder_length(begin_word, end_word, word_list)\n\nend`,
  },
}
