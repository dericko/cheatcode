import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const problems = getAllProblems()
  const solvedProgress = await db.problemProgress.findMany({ where: { solved: true } })
  const solvedSlugs = solvedProgress.map(p => p.slug)

  const easy = problems.filter(p => p.difficulty === 'easy').length
  const medium = problems.filter(p => p.difficulty === 'medium').length
  const hard = problems.filter(p => p.difficulty === 'hard').length
  const solvedCount = solvedProgress.length
  const pct = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* App bar */}
      <header className="bg-surface sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-medium text-base text-foreground tracking-wide">Cheatcode</span>
          <span className="text-xs tracking-widest uppercase text-primary/70 hidden sm:block font-medium">Interview Prep</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Progress hero */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted font-medium mb-2">Progress</p>
          <div className="flex items-end justify-between mb-4">
            <h1 className="text-3xl font-light text-foreground">
              {solvedCount} <span className="text-muted text-xl">/ {problems.length}</span>
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="easy">{easy} easy</Badge>
              <Badge variant="medium">{medium} medium</Badge>
              <Badge variant="hard">{hard} hard</Badge>
            </div>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </main>
    </div>
  )
}
