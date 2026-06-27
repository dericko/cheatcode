import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Language } from '@/types/problem'

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')

  if (slug) {
    const [progress, attempts] = await Promise.all([
      db.problemProgress.findMany({ where: { slug } }),
      db.attempt.findMany({ where: { slug }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ])
    return NextResponse.json({ progress, attempts })
  }

  const allProgress = await db.problemProgress.findMany()
  return NextResponse.json({ progress: allProgress })
}

export async function POST(req: NextRequest) {
  const { slug, code, passed, timeSpentMs, language = 'typescript' } = await req.json() as {
    slug: string
    code: string
    passed: boolean
    timeSpentMs: number
    language?: Language
  }

  await db.attempt.create({ data: { slug, code, passed, timeSpentMs } })

  if (passed) {
    const existing = await db.problemProgress.findUnique({ where: { slug_language: { slug, language } } })
    const betterTime = existing?.bestTimeMs == null || timeSpentMs < existing.bestTimeMs

    await db.problemProgress.upsert({
      where: { slug_language: { slug, language } },
      create: { slug, language, solved: true, bestTimeMs: timeSpentMs },
      update: { solved: true, ...(betterTime && { bestTimeMs: timeSpentMs }) },
    })
  }

  return NextResponse.json({ ok: true })
}
