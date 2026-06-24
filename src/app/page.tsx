import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'

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
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight">Cheatcode</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">Interview Prep</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Progress hero */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Progress</p>
          <div className="flex items-end justify-between mb-3">
            <h1 className="text-2xl font-semibold tabular-nums">
              {solvedCount}
              <span className="text-muted-foreground font-normal text-lg"> / {problems.length}</span>
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="easy">{easy} easy</Badge>
              <Badge variant="medium">{medium} medium</Badge>
              <Badge variant="hard">{hard} hard</Badge>
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </main>
    </div>
  )
}
