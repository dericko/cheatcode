'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const DIFF_COLORS: Record<Difficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
}

interface ProblemListProps {
  problems: Problem[]
  solvedSlugs: string[]
}

export default function ProblemList({ problems, solvedSlugs: solvedSlugsArr }: ProblemListProps) {
  const solvedSlugs = new Set(solvedSlugsArr)
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all')
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all')

  const filtered = problems.filter(p =>
    (topicFilter === 'all' || p.topic === topicFilter) &&
    (diffFilter === 'all' || p.difficulty === diffFilter)
  )

  return (
    <div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={topicFilter}
          onChange={e => setTopicFilter(e.target.value as Topic | 'all')}
          className="bg-gray-800 text-gray-200 px-3 py-1.5 rounded text-sm border border-gray-700 focus:outline-none"
        >
          <option value="all">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={diffFilter}
          onChange={e => setDiffFilter(e.target.value as Difficulty | 'all')}
          className="bg-gray-800 text-gray-200 px-3 py-1.5 rounded text-sm border border-gray-700 focus:outline-none"
        >
          <option value="all">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="self-center text-xs text-gray-500 ml-auto">{filtered.length} problems</span>
      </div>

      <div className="space-y-1.5">
        {filtered.map((p, i) => (
          <Link key={p.slug} href={`/problems/${p.slug}`}
            className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 hover:border-gray-500 transition-colors group">
            <span className="text-gray-500 w-5 text-right text-xs tabular-nums">{i + 1}</span>
            <span className="flex-1 text-gray-100 group-hover:text-white">{p.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400 hidden sm:block">{p.topic}</span>
            <span className={`text-sm font-medium ${DIFF_COLORS[p.difficulty]}`}>{p.difficulty}</span>
            {solvedSlugs.has(p.slug) && <span className="text-green-400 text-xs">✓</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
