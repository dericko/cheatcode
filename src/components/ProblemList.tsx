'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const DIFF_CHIP: Record<Difficulty, string> = {
  easy:   'bg-green-500/15 text-green-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  hard:   'bg-red-500/15 text-red-400',
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

  const selectClass = "bg-[#1e1e2e] text-gray-300 pl-3 pr-8 py-1.5 rounded-lg text-sm border border-white/10 hover:border-white/25 focus:outline-none focus:border-indigo-500/60 transition-colors cursor-pointer appearance-none"
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

      {/* Card grid: 1 col → 2 → 3 → 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(p => (
          <Link
            key={p.slug}
            href={`/problems/${p.slug}`}
            className="flex flex-col bg-[#1e1e2e] rounded-xl p-4 hover:bg-[#252538] transition-colors cursor-pointer"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            {/* Title */}
            <p className="text-sm font-medium text-gray-100 leading-snug mb-3">
              {p.title}
            </p>

            {/* Footer: difficulty + topic + solved */}
            <div className="flex items-center gap-2 mt-auto flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${DIFF_CHIP[p.difficulty]}`}>
                {p.difficulty}
              </span>
              <span className="text-[11px] text-gray-500 truncate">{p.topic}</span>
              {solvedSlugs.has(p.slug) && (
                <span className="ml-auto text-green-400 text-xs font-bold">✓</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
