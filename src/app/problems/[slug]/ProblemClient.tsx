'use client'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import type { Problem } from '@/types/problem'
import type { RunResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/20',
  medium: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/20',
  hard: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20',
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
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900/95 backdrop-blur shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <a
            href="/"
            className="text-gray-500 hover:text-gray-300 text-sm px-2 py-1 rounded-md hover:bg-gray-800 transition-colors shrink-0"
          >
            ← Back
          </a>
          <span className="text-gray-700 shrink-0">/</span>
          <h1 className="font-medium text-sm text-gray-200 truncate">{problem.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${DIFF_BADGE[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-gray-600 hidden sm:block shrink-0">{problem.topic}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {isRunning ? 'Running…' : 'Run'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Description panel */}
        <div className="md:w-2/5 md:min-w-64 overflow-y-auto p-5 border-b md:border-b-0 md:border-r border-gray-800 text-[15px] text-gray-300 leading-7 max-h-48 md:max-h-none">
          <pre className="whitespace-pre-wrap font-sans">{problem.description.trim()}</pre>
        </div>

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden">
            <Editor value={code} onChange={setCode} />
          </div>
          <div className="h-56 border-t border-gray-800 shrink-0 overflow-hidden">
            <TestResults result={result} isRunning={isRunning} />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2.5 rounded-lg shadow-2xl text-sm z-50 flex items-center gap-2">
          {toast}
        </div>
      )}
    </div>
  )
}
