'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

interface ProblemListProps {
  problems: Problem[]
  solvedSlugs: string[]
}

function ProblemRow({ p, solved }: { p: Problem; solved: boolean }) {
  return (
    <Link href={`/problems/${p.slug}`} className="no-underline">
      <div className="flex items-center py-2.5 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors duration-100 group px-1">
        <span className="flex-1 text-sm font-medium text-foreground truncate pr-6 group-hover:text-foreground">
          {p.title}
        </span>
        <span className="w-36 text-xs text-muted-foreground shrink-0 hidden md:block">{p.topic}</span>
        <div className="w-20 shrink-0">
          <Badge variant={p.difficulty as Difficulty}>{p.difficulty}</Badge>
        </div>
        <span className="w-5 text-right text-primary text-xs font-semibold shrink-0">
          {solved ? '✓' : ''}
        </span>
      </div>
    </Link>
  )
}

export default function ProblemList({ problems, solvedSlugs: solvedSlugsArr }: ProblemListProps) {
  const solvedSlugs = new Set(solvedSlugsArr)
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all')
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all')

  const filtered = problems.filter(p =>
    (topicFilter === 'all' || p.topic === topicFilter) &&
    (diffFilter === 'all' || p.difficulty === diffFilter)
  )

  const grouped = TOPICS.map(topic => ({
    topic,
    items: filtered.filter(p => p.topic === topic),
  })).filter(g => g.items.length > 0)

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 items-center">
        <Select value={topicFilter} onValueChange={(v) => setTopicFilter(v as Topic | 'all')}>
          <SelectTrigger className="w-[152px]">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={diffFilter} onValueChange={(v) => setDiffFilter(v as Difficulty | 'all')}>
          <SelectTrigger className="w-[152px]">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{filtered.length} problems</span>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-1 pb-2 mb-1 border-b border-border">
        <span className="flex-1 text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Problem</span>
        <span className="w-36 text-[11px] uppercase tracking-widest text-muted-foreground font-medium hidden md:block">Topic</span>
        <span className="w-20 text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Difficulty</span>
        <span className="w-5" />
      </div>

      {/* Grouped list */}
      {topicFilter === 'all' ? (
        grouped.map(({ topic, items }) => (
          <div key={topic} className="mb-6">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1 px-1">
              {topic} <span className="opacity-50">({items.length})</span>
            </p>
            {items.map(p => (
              <ProblemRow key={p.slug} p={p} solved={solvedSlugs.has(p.slug)} />
            ))}
          </div>
        ))
      ) : (
        filtered.map(p => (
          <ProblemRow key={p.slug} p={p} solved={solvedSlugs.has(p.slug)} />
        ))
      )}
    </div>
  )
}
