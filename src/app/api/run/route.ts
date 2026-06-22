import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { runCode } from '@/lib/runner'

export async function POST(req: NextRequest) {
  const { slug, code } = await req.json()

  const problem = getProblemBySlug(slug)
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  const result = await runCode({
    userCode: code,
    functionName: problem.functionName,
    testCases: problem.testCases,
    setupCode: problem.setupCode,
    testCallCode: problem.testCallCode,
  })

  return NextResponse.json(result)
}
