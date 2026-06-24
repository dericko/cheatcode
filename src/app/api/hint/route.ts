import { NextRequest, NextResponse } from 'next/server'
import { getProblemBySlug } from '@/lib/problems'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  const { slug, code, messages } = await req.json()
  const problem = getProblemBySlug(slug)
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })

  const system = `You are a coding mentor helping someone prepare for technical interviews.

Problem the user is working on: "${problem.title}" (${problem.difficulty})
${problem.description}

The user's current code:
\`\`\`typescript
${code}
\`\`\`

Your rules:
- Never write code for the user or show a corrected version of their function.
- Never reveal the full solution or algorithm outright.
- Ask Socratic questions that guide them to discover the key insight themselves.
- You may reference concepts (e.g. "hash maps", "two pointers") but not implement them.
- Keep responses concise — 2-4 sentences max unless the user asks for more detail.
- Be encouraging and curious, not critical.
${problem.targetComplexity ? `- The optimal solution runs in ${problem.targetComplexity} time. Nudge toward that if relevant.` : ''}`

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system,
      messages,
    })
    return NextResponse.json({ text })
  } catch (err) {
    console.error('hint error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
