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

const SELECT_CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`

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

  const selectClass = "bg-gray-900 text-gray-300 pl-3 pr-8 py-1.5 rounded-full text-sm border border-gray-700 hover:border-gray-500 focus:outline-none focus:border-gray-500 transition-colors cursor-pointer appearance-none"
  const selectStyle = { backgroundImage: SELECT_CHEVRON, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <select value={topicFilter} onChange={e => setTopicFilter(e.target.value as Topic | 'all')} className={selectClass} style={selectStyle}>
          <option value="all">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={diffFilter} onChange={e => setDiffFilter(e.target.value as Difficulty | 'all')} className={selectClass} style={selectStyle}>
          <option value="all">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-600 tabular-nums">{filtered.length} problems</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filtered.map(p => (
          <Link
            key={p.slug}
            href={`/problems/${p.slug}`}
            className="group flex flex-col gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/60 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-gray-100 group-hover:text-white leading-snug text-[15px]">
                {p.title}
              </span>
              {solvedSlugs.has(p.slug) && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-semibold shrink-0 mt-0.5">✓</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DIFF_DOT[p.difficulty]}`} />
              <span className={`text-xs font-medium ${DIFF_TEXT[p.difficulty]}`}>{p.difficulty}</span>
              <span className="text-gray-700 text-xs mx-0.5">·</span>
              <span className="text-xs text-gray-500">{p.topic}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
