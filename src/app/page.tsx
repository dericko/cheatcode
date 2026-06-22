import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const problems = getAllProblems()
  const solvedProgress = await db.problemProgress.findMany({ where: { solved: true } })
  const solvedSlugs = new Set(solvedProgress.map(p => p.slug))

  const easy = problems.filter(p => p.difficulty === 'easy').length
  const medium = problems.filter(p => p.difficulty === 'medium').length
  const hard = problems.filter(p => p.difficulty === 'hard').length

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Cheatcode</h1>
          <p className="text-gray-400 text-sm">
            {solvedProgress.length}/{problems.length} solved
            &nbsp;·&nbsp;
            {easy} easy · {medium} medium · {hard} hard
          </p>
        </div>
        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </div>
    </main>
  )
}
