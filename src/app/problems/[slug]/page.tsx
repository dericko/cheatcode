import { getProblemBySlug, getAllProblems } from '@/lib/problems'
import { notFound } from 'next/navigation'
import ProblemClient from './ProblemClient'

export function generateStaticParams() {
  return getAllProblems().map(p => ({ slug: p.slug }))
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const problem = getProblemBySlug(slug)
  if (!problem) notFound()
  return <ProblemClient problem={problem} />
}
