'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const DIFF_COLOR: Record<Difficulty, { dot: string; text: string; chip: string }> = {
  easy:   { dot: 'bg-green-400',  text: 'text-green-400',  chip: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { dot: 'bg-yellow-400', text: 'text-yellow-400', chip: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  hard:   { dot: 'bg-red-400',    text: 'text-red-400',    chip: 'bg-red-500/10 text-red-400 border-red-500/20' },
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

  const selectClass = "bg-[#2a2a3a] text-gray-300 pl-3 pr-8 py-1.5 rounded-full text-sm border border-white/10 hover:border-indigo-500/50 focus:outline-none focus:border-indigo-500/70 transition-colors cursor-pointer appearance-none"
  const selectStyle = { backgroundImage: SELECT_CHEVRON, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

  return (
    <div>
      {/* Filter row */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mr-1 hidden sm:block">Filter</p>
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

      {/* Material card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(p => {
          const c = DIFF_COLOR[p.difficulty]
          const solved = solvedSlugs.has(p.slug)
          return (
            <Link
              key={p.slug}
              href={`/problems/${p.slug}`}
              className="group flex flex-col gap-4 bg-[#1e1e2e] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)')}
            >
              {/* Top row: title + solved */}
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-[15px] leading-snug text-gray-100 group-hover:text-white transition-colors">
                  {p.title}
                </span>
                {solved && (
                  <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 text-[10px] font-bold">✓</span>
                  </span>
                )}
              </div>

              {/* Bottom row: difficulty chip + topic */}
              <div className="flex items-center gap-2 mt-auto">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${c.chip}`}>
                  {p.difficulty}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">{p.topic}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
