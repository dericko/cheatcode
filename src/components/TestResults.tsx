'use client'
import { useState, useEffect } from 'react'
import type { RunResult } from '@/types/runner'

interface TestResultsProps {
  result: RunResult | null
  isRunning: boolean
}

export default function TestResults({ result, isRunning }: TestResultsProps) {
  const [mode, setMode] = useState<'verbose' | 'summary'>('verbose')

  useEffect(() => {
    const stored = localStorage.getItem('testResultsMode')
    if (stored === 'summary' || stored === 'verbose') setMode(stored)
  }, [])

  const toggleMode = () => {
    const next = mode === 'verbose' ? 'summary' : 'verbose'
    setMode(next)
    localStorage.setItem('testResultsMode', next)
  }

  if (isRunning) return <div className="p-4 text-gray-400 text-sm">Running...</div>
  if (!result) return <div className="p-4 text-gray-500 text-sm">Run your code to see results</div>

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className={`font-medium ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
          {passed}/{total} passed
        </span>
        <button onClick={toggleMode} className="text-xs text-gray-400 hover:text-gray-200 underline">
          {mode === 'verbose' ? 'Summary view' : 'Verbose view'}
        </button>
      </div>

      {mode === 'verbose' && (
        <>
          <div className="divide-y divide-gray-800">
            {result.results.map((r, i) => (
              <div key={i} className={`px-3 py-2 ${r.passed ? 'bg-green-950/30' : 'bg-red-950/30'}`}>
                <div className="flex items-center gap-2">
                  <span className={r.passed ? 'text-green-400' : 'text-red-400'}>{r.passed ? '✓' : '✗'}</span>
                  <span className="text-gray-300">{r.description}</span>
                </div>
                {!r.passed && (
                  <div className="mt-1.5 ml-5 space-y-0.5 font-mono text-xs">
                    {r.error ? (
                      <div className="text-red-400">Error: {r.error}</div>
                    ) : (
                      <>
                        <div className="text-gray-400">Expected: <span className="text-green-400">{JSON.stringify(r.expected)}</span></div>
                        <div className="text-gray-400">Got:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-red-400">{JSON.stringify(r.actual)}</span></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {result.consoleOutput.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-1">Console</div>
              {result.consoleOutput.map((line, i) => (
                <div key={i} className="font-mono text-xs text-yellow-300">{line}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
