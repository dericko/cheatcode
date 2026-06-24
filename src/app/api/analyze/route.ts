import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const schema = z.object({
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  explanation: z.string(),
  passesTarget: z.boolean(),
  hint: z.string().nullable(),
})

export async function POST(req: NextRequest) {
  const { slug, code } = await req.json()
  const problem = getProblemBySlug(slug)
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })

  const targetLine = problem.targetComplexity
    ? `The optimal target time complexity for this problem is ${problem.targetComplexity}.`
    : 'There is no specific target complexity — just analyze what the code does.'

  const prompt = `You are a senior software engineer reviewing a coding interview solution.

Problem: ${problem.title}
${problem.description}

${targetLine}

User's solution:
\`\`\`typescript
${code}
\`\`\`

Analyze the solution and respond with:
- timeComplexity: the Big-O time complexity (e.g. "O(n)", "O(n²)", "O(n log n)")
- spaceComplexity: the Big-O space complexity
- explanation: 1-2 sentences explaining WHY the solution has this complexity (reference specific code structures like loops, maps, recursion)
- passesTarget: true if the time complexity matches or beats the target, false if it's worse
- hint: if passesTarget is false, a one-sentence Socratic nudge toward the optimal approach without giving away the solution; otherwise null`

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema,
      prompt,
    })
    return NextResponse.json(object)
  } catch (err) {
    console.error('analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
