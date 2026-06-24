'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import HintChat from '@/components/HintChat'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Problem } from '@/types/problem'
import type { RunResult, ComplexityResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const STORAGE_KEY = (slug: string) => `code:${slug}`

export default function ProblemClient({ problem }: { problem: Problem }) {
  const { resolvedTheme } = useTheme()
  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return problem.starterCode
    return localStorage.getItem(STORAGE_KEY(problem.slug)) ?? problem.starterCode
  })
  const [result, setResult] = useState<RunResult | null>(null)
  const [complexity, setComplexity] = useState<ComplexityResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [skipAnalysis, setSkipAnalysis] = useState(false)
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
    if (isRunning) return
    setIsRunning(true)
    setIsAnalyzing(true)
    setComplexity(null)
    const runId = ++runIdRef.current

    // fire-and-forget: don't block test results on LLM analysis
    if (!skipAnalysis) {
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code }),
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (data && runIdRef.current === runId) setComplexity(data)
      }).catch(() => {}).finally(() => setIsAnalyzing(false))
    } else {
      setIsAnalyzing(false)
    }

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code }),
      })

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
        showToast('All tests passed!')
      }
    } catch {
      showToast('Error connecting to runner')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 bg-background/90 backdrop-blur-sm shrink-0 h-12 gap-2 border-b">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button variant="ghost" size="sm" asChild className="shrink-0 text-muted-foreground hover:text-foreground px-0">
            <Link href="/">← Back</Link>
          </Button>
          <span className="text-border shrink-0">|</span>
          <h1 className="text-sm font-medium truncate">{problem.title}</h1>
          <Badge variant={problem.difficulty as 'easy' | 'medium' | 'hard'} className="shrink-0">
            {problem.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <Checkbox
              id="feedback-toggle"
              checked={!skipAnalysis}
              onCheckedChange={checked => {
                setSkipAnalysis(!checked)
                if (!checked) setComplexity(null)
              }}
            />
            <span className="text-xs text-muted-foreground hidden sm:block">feedback</span>
          </label>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              size="sm"
              className="px-5 font-medium"
            >
              {isRunning
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running</>
                : 'Run'
              }
            </Button>
            <span className="text-[11px] text-muted-foreground/50 hidden lg:block">⌘↵</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* 3-panel body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Description — left column */}
        <div className="md:w-64 lg:w-72 shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-border p-5 max-h-48 md:max-h-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">{problem.description.trim()}</pre>
        </div>

        {/* Editor — center column */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Editor
            value={code}
            onChange={setCode}
            onRun={handleRun}
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          />
        </div>

        {/* Results — right column */}
        <div className="md:w-72 lg:w-80 shrink-0 border-t md:border-t-0 md:border-l border-border overflow-y-auto">
          <TestResults
            result={result}
            isRunning={isRunning}
            complexity={complexity}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>

      <HintChat slug={problem.slug} code={code} />

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 text-xs font-medium z-50 transition-all duration-200 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5 pointer-events-none'
        }`}
        style={{ borderRadius: 'var(--radius)' }}
      >
        {toast}
      </div>
    </div>
  )
}
