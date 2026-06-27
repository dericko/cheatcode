import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { runCode } from '@/lib/runner'
import type { Language } from '@/types/problem'

export async function POST(req: NextRequest) {
  const { slug, code, language = 'typescript' } = await req.json() as {
    slug: string
    code: string
    language?: Language
  }

  const problem = getProblemBySlug(slug)
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  if (language === 'ruby') {
    const rubyConfig = problem.ruby
    if (!rubyConfig) {
      return NextResponse.json({ error: 'Ruby not supported for this problem' }, { status: 400 })
    }
    const result = await runCode({
      userCode: code,
      functionName: rubyConfig.methodName,
      testCases: problem.testCases,
      setupCode: rubyConfig.setupCode,
      testCallCode: rubyConfig.testCallCode,
    }, 'ruby')
    return NextResponse.json(result)
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
