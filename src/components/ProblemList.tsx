'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

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
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <Select value={topicFilter} onValueChange={(v) => setTopicFilter(v as Topic | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={diffFilter} onValueChange={(v) => setDiffFilter(v as Difficulty | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{filtered.length} problems</span>
      </div>

      {/* Card grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {filtered.map(p => (
          <Link key={p.slug} href={`/problems/${p.slug}`} className="no-underline">
            <Card className="hover:bg-accent/50 transition-colors duration-150 cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <p className="text-sm font-semibold text-foreground flex-1 mb-4 leading-snug">
                  {p.title}
                </p>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <Badge variant={p.difficulty}>{p.difficulty}</Badge>
                  <span className="text-muted-foreground text-xs truncate">{p.topic}</span>
                  {solvedSlugs.has(p.slug)
                    ? <span className="shrink-0 text-green-500 text-xs font-bold">✓</span>
                    : <span className="shrink-0 w-3" />
                  }
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
