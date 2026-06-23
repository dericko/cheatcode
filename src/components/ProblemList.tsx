'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const DIFF_DOT: Record<Difficulty, string> = {
  easy: 'bg-green-400',
  medium: 'bg-yellow-400',
  hard: 'bg-red-400',
}

const DIFF_TEXT: Record<Difficulty, string> = {
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
      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <select
          value={topicFilter}
          onChange={e => setTopicFilter(e.target.value as Topic | 'all')}
          className="bg-gray-900 text-gray-300 pl-3 pr-7 py-1.5 rounded-full text-sm border border-gray-700 hover:border-gray-500 focus:outline-none focus:border-gray-500 transition-colors cursor-pointer appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="all">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={diffFilter}
          onChange={e => setDiffFilter(e.target.value as Difficulty | 'all')}
          className="bg-gray-900 text-gray-300 pl-3 pr-7 py-1.5 rounded-full text-sm border border-gray-700 hover:border-gray-500 focus:outline-none focus:border-gray-500 transition-colors cursor-pointer appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="all">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-600">{filtered.length} problems</span>
      </div>

      {/* List */}
      <div className="space-y-1">
        {filtered.map((p, i) => (
          <Link
            key={p.slug}
            href={`/problems/${p.slug}`}
            className="flex items-center gap-3 px-4 py-3.5 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 hover:border-gray-700 transition-all group"
          >
            <span className="text-gray-600 w-6 text-right text-xs tabular-nums font-mono shrink-0">{i + 1}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DIFF_DOT[p.difficulty]}`} />
            <span className="flex-1 text-gray-200 group-hover:text-white text-sm font-medium">{p.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700 hidden sm:block">{p.topic}</span>
            <span className={`text-xs font-medium w-14 text-right ${DIFF_TEXT[p.difficulty]}`}>{p.difficulty}</span>
            {solvedSlugs.has(p.slug)
              ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">✓</span>
              : <span className="w-[26px]" />
            }
          </Link>
        ))}
      </div>
    </div>
  )
}
