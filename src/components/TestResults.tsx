'use client'
import { useState, useEffect } from 'react'
import type { RunResult, ComplexityResult } from '@/types/runner'

interface TestResultsProps {
  result: RunResult | null
  isRunning: boolean
  complexity?: ComplexityResult | null
}

export default function TestResults({ result, isRunning, complexity }: TestResultsProps) {
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

  if (isRunning) {
    return (
      <div className="h-full bg-gray-900 flex items-center gap-2 px-4 text-sm text-gray-400">
        <span className="inline-block w-3 h-3 rounded-full bg-gray-600 animate-pulse" />
        Running…
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full bg-gray-900 flex items-center px-4 text-sm text-gray-600">
        Run your code to see results
      </div>
    )
  }

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <div className="bg-gray-900 text-sm flex flex-col">
      {/* Results header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0 border-l-2 ${allPassed ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${allPassed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {passed}/{total} passed
        </span>
        <button
          onClick={toggleMode}
          className="text-xs text-gray-500 hover:text-gray-300 px-2.5 py-0.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {mode === 'verbose' ? 'Summary' : 'Verbose'}
        </button>
      </div>

      {mode === 'verbose' && (
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-800/60">
            {result.results.map((r, i) => (
              <div key={i} className={`px-4 py-2.5 ${r.passed ? '' : 'bg-red-500/5'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.passed ? '✓' : '✗'}
                  </span>
                  <span className={r.passed ? 'text-gray-400' : 'text-gray-200'}>{r.description}</span>
                </div>
                {!r.passed && (
                  <div className="mt-1.5 ml-4 bg-gray-950/60 rounded-md p-2.5 font-mono text-xs space-y-0.5">
                    {r.error ? (
                      <div className="text-red-400">Error: {r.error}</div>
                    ) : (
                      <>
                        <div className="text-gray-500">expected <span className="text-emerald-400">{JSON.stringify(r.expected)}</span></div>
                        <div className="text-gray-500">received <span className="text-red-400">{JSON.stringify(r.actual)}</span></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {result.consoleOutput.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-800">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Console</div>
              <div className="bg-gray-950 border border-gray-800 rounded-md p-2.5 space-y-0.5">
                {result.consoleOutput.map((line, i) => (
                  <div key={i} className="font-mono text-xs text-yellow-300">{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Complexity card — appears when analysis resolves */}
          {complexity && (
            <div className="px-4 py-3 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Complexity</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${complexity.passesTarget ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {complexity.passesTarget ? 'optimal' : 'suboptimal'}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-gray-400 mb-1.5">
                <span>Time: <span className="text-gray-200 font-mono">{complexity.timeComplexity}</span></span>
                <span>Space: <span className="text-gray-200 font-mono">{complexity.spaceComplexity}</span></span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{complexity.explanation}</p>
              {complexity.hint && (
                <div className="mt-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 leading-relaxed">
                  {complexity.hint}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
