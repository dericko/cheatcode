'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import HintChat from '@/components/HintChat'
import type { Problem } from '@/types/problem'
import type { RunResult, ComplexityResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const DIFF_CHIP: Record<string, string> = {
  easy:   'bg-green-500/10 text-green-400 border border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  hard:   'bg-red-500/10 text-red-400 border border-red-500/20',
}

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(problem.slug), code)
  }, [code, problem.slug])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [code])

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setComplexity(null)
    try {
      // Run tests and complexity analysis in parallel
      const [res] = await Promise.all([
        fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code }),
        }),
        // Fire-and-forget complexity analysis; updates state when done
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code }),
        }).then(r => r.ok ? r.json() : null).then(data => {
          if (data) setComplexity(data)
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
    } catch (e) {
      showToast('Error connecting to runner')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#121212] text-gray-100 overflow-hidden">
      {/* Material app bar */}
      <header
        className="flex items-center justify-between px-5 py-0 bg-[#1e1e2e] shrink-0 h-14 gap-2 flex-wrap"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/"
            className="text-gray-400 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0 font-medium"
          >
            ← Back
          </a>
          <span className="text-white/20 shrink-0">|</span>
          <h1 className="font-medium text-sm text-gray-200 truncate">{problem.title}</h1>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${DIFF_CHIP[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-gray-600 hidden sm:block shrink-0">{problem.topic}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            style={{ boxShadow: isRunning ? 'none' : '0 2px 8px rgba(99,102,241,0.4)' }}
          >
            {isRunning ? 'Running…' : 'Run'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Description panel */}
        <div className="md:w-2/5 md:min-w-64 overflow-y-auto p-6 border-r border-white/5 text-[15px] text-gray-300 leading-7 max-h-48 md:max-h-none">
          <pre className="whitespace-pre-wrap font-sans">{problem.description.trim()}</pre>
        </div>

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden min-h-0">
            <Editor value={code} onChange={setCode} onRun={handleRun} />
          </div>
          <div className="border-t border-white/5 shrink-0 overflow-y-auto" style={{ height: '42%', minHeight: '200px' }}>
            <TestResults result={result} isRunning={isRunning} complexity={complexity} />
          </div>
        </div>
      </div>

      <HintChat slug={problem.slug} code={code} />

      {/* Material snackbar-style toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#323248] text-gray-100 px-5 py-3 rounded-full text-sm z-50 font-medium"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
