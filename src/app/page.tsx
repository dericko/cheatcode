import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'

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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-gray-100">⚡ Cheatcode</span>
          <span className="text-xs text-gray-500 hidden sm:block">interview prep</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-100 mb-0.5">Problems</h1>
              <p className="text-sm text-gray-500">{solvedCount} of {problems.length} solved</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 font-medium">{easy} easy</span>
              <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">{medium} medium</span>
              <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 font-medium">{hard} hard</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </main>
    </div>
  )
}
