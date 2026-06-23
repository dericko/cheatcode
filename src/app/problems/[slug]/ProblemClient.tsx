'use client'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import type { Problem } from '@/types/problem'
import type { RunResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const DIFF_CHIP: Record<string, string> = {
  easy:   'bg-green-500/10 text-green-400 border border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  hard:   'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default function ProblemClient({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(problem.starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    setIsRunning(true)
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
          <div className="flex-1 overflow-hidden">
            <Editor value={code} onChange={setCode} />
          </div>
          <div className="h-56 border-t border-white/5 shrink-0 overflow-hidden">
            <TestResults result={result} isRunning={isRunning} />
          </div>
        </div>
      </div>

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
