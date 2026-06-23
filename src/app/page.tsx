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
    <div className="min-h-screen bg-[#121212] text-gray-100 flex flex-col">
      {/* Material top app bar */}
      <header className="bg-[#1e1e2e] sticky top-0 z-10" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-medium text-base text-white tracking-wide">Cheatcode</span>
          <span className="text-xs tracking-widest uppercase text-indigo-400/70 hidden sm:block font-medium">Interview Prep</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Hero */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Progress</p>
          <div className="flex items-end justify-between mb-4">
            <h1 className="text-3xl font-light text-white">
              {solvedCount} <span className="text-gray-500 text-xl">/ {problems.length}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium border border-green-500/20">{easy} easy</span>
              <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-medium border border-yellow-500/20">{medium} medium</span>
              <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-medium border border-red-500/20">{hard} hard</span>
            </div>
          </div>
          {/* Material linear progress */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </main>
    </div>
  )
}
