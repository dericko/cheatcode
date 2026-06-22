import { getProblemBySlug, getAllProblems } from '@/lib/problems'
import { notFound } from 'next/navigation'
import ProblemClient from './ProblemClient'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return getAllProblems().map(p => ({ slug: p.slug }))
}

export default function ProblemPage({ params }: Props) {
  const problem = getProblemBySlug(params.slug)
  if (!problem) notFound()
  return <ProblemClient problem={problem} />
}
