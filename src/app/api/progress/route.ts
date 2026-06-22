import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')

  if (slug) {
    const [progress, attempts] = await Promise.all([
      db.problemProgress.findUnique({ where: { slug } }),
      db.attempt.findMany({ where: { slug }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ])
    return NextResponse.json({ progress, attempts })
  }

  const allProgress = await db.problemProgress.findMany()
  return NextResponse.json({ progress: allProgress })
}

export async function POST(req: NextRequest) {
  const { slug, code, passed, timeSpentMs } = await req.json()

  await db.attempt.create({ data: { slug, code, passed, timeSpentMs } })

  if (passed) {
    const existing = await db.problemProgress.findUnique({ where: { slug } })
    const betterTime = !existing?.bestTimeMs || timeSpentMs < existing.bestTimeMs

    await db.problemProgress.upsert({
      where: { slug },
      create: { slug, solved: true, bestTimeMs: timeSpentMs },
      update: { solved: true, ...(betterTime && { bestTimeMs: timeSpentMs }) },
    })
  }

  return NextResponse.json({ ok: true })
}
