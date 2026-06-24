'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import HintChat from '@/components/HintChat'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Problem } from '@/types/problem'
import type { RunResult, ComplexityResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const STORAGE_KEY = (slug: string) => `code:${slug}`

export default function ProblemClient({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return problem.starterCode
    return localStorage.getItem(STORAGE_KEY(problem.slug)) ?? problem.starterCode
  })
  const [result, setResult] = useState<RunResult | null>(null)
  const [complexity, setComplexity] = useState<ComplexityResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)
  const runIdRef = useRef(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(problem.slug), code)
  }, [code, problem.slug])

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setComplexity(null)
    const runId = ++runIdRef.current
    try {
      const [res] = await Promise.all([
        fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code }),
        }).then(r => r.ok ? r.json() : null).then(data => {
          if (data && runIdRef.current === runId) setComplexity(data)
        }).catch(() => {}),
      ])

      if (!res.ok) {
        showToast('Error connecting to runner')
        return
      }
      const data: RunResult = await res.json()
      setResult(data)

      if (data.results.every(r => r.passed)) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code, passed: true, timeSpentMs: elapsedRef.current }),
        })
        showToast('All tests passed! 🎉')
      }
    } catch {
      showToast('Error connecting to runner')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* App bar */}
      <header
        className="flex items-center justify-between px-5 bg-surface shrink-0 h-14 gap-2 border-b border-border"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/">← Back</Link>
          </Button>
          <span className="text-foreground/20 shrink-0">|</span>
          <h1 className="text-sm font-medium text-foreground truncate">{problem.title}</h1>
          <Badge variant={problem.difficulty as 'easy' | 'medium' | 'hard'} className="shrink-0">
            {problem.difficulty}
          </Badge>
          <span className="text-xs text-muted hidden sm:block shrink-0">{problem.topic}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              variant="default"
              style={{ boxShadow: isRunning ? 'none' : '0 2px 8px rgba(99,102,241,0.4)' }}
            >
              {isRunning ? 'Running…' : 'Run'}
            </Button>
            <span className="text-xs text-muted hidden sm:block">⌘↵</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Description panel */}
        <div className="md:w-2/5 md:min-w-64 overflow-y-auto p-6 border-r border-border bg-surface-variant text-sm text-muted-foreground leading-7 max-h-48 md:max-h-none">
          <pre className="whitespace-pre-wrap font-sans">{problem.description.trim()}</pre>
        </div>

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden min-h-0">
            <Editor value={code} onChange={setCode} onRun={handleRun} />
          </div>
          <div className="border-t border-border shrink-0 overflow-y-auto" style={{ height: '42%', minHeight: '200px' }}>
            <TestResults result={result} isRunning={isRunning} complexity={complexity} />
          </div>
        </div>
      </div>

      <HintChat slug={problem.slug} code={code} />

      {/* Snackbar toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface text-foreground px-5 py-3 rounded-full text-sm z-50 font-medium"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
