'use client'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import type { Problem } from '@/types/problem'
import type { RunResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  hard: 'bg-red-900 text-red-300',
}

export default function ProblemClient({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(problem.starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const elapsedRef = useRef(0)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code }),
      })
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
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-200 text-sm">← Problems</a>
          <h1 className="font-semibold text-sm">{problem.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded ${DIFF_BADGE[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-gray-500">{problem.topic}</span>
        </div>
        <div className="flex items-center gap-4">
          <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm font-medium transition-colors"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Description panel */}
        <div className="w-2/5 min-w-64 overflow-y-auto p-5 border-r border-gray-800 text-sm text-gray-300 leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">{problem.description.trim()}</pre>
        </div>

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor value={code} onChange={setCode} />
          </div>
          <div className="h-52 border-t border-gray-800 shrink-0 overflow-hidden">
            <TestResults result={result} isRunning={isRunning} />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 bg-gray-800 border border-gray-600 text-gray-100 px-4 py-2 rounded shadow-xl text-sm z-50"
          style={{ transition: 'opacity 0.3s' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
