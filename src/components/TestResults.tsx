'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
      <div className="h-full bg-surface-variant flex items-center gap-2 px-4 text-sm text-muted-foreground">
        <span className="inline-block w-3 h-3 rounded-full bg-muted animate-pulse" />
        Running…
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full bg-surface-variant flex items-center px-4 text-sm text-muted">
        Run your code to see results
      </div>
    )
  }

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <div className="bg-surface-variant text-sm flex flex-col">
      {/* Results header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b border-border shrink-0 border-l-2 ${allPassed ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
        <Badge className={allPassed ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20'}>
          {passed}/{total} passed
        </Badge>
        <Button variant="outline" size="sm" onClick={toggleMode}>
          {mode === 'verbose' ? 'Summary' : 'Verbose'}
        </Button>
      </div>

      {mode === 'verbose' && (
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border/60">
            {result.results.map((r, i) => (
              <div key={i} className={`px-4 py-2.5 ${r.passed ? '' : 'bg-red-500/5'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.passed ? '✓' : '✗'}
                  </span>
                  <span className={r.passed ? 'text-muted-foreground' : 'text-foreground'}>{r.description}</span>
                </div>
                {!r.passed && (
                  <div className="mt-1.5 ml-4 bg-background/60 rounded-md p-2.5 font-mono text-xs space-y-0.5">
                    {r.error ? (
                      <div className="text-red-400">Error: {r.error}</div>
                    ) : (
                      <>
                        <div className="text-muted">expected <span className="text-emerald-400">{JSON.stringify(r.expected)}</span></div>
                        <div className="text-muted">received <span className="text-red-400">{JSON.stringify(r.actual)}</span></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {result.consoleOutput.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <div className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Console</div>
              <div className="bg-background border border-border rounded-md p-2.5 space-y-0.5">
                {result.consoleOutput.map((line, i) => (
                  <div key={i} className="font-mono text-xs text-yellow-300">{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Complexity card */}
          {complexity && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Complexity</span>
                <Badge className={complexity.passesTarget ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20'}>
                  {complexity.passesTarget ? 'optimal' : 'suboptimal'}
                </Badge>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mb-1.5">
                <span>Time: <span className="text-foreground font-mono">{complexity.timeComplexity}</span></span>
                <span>Space: <span className="text-foreground font-mono">{complexity.spaceComplexity}</span></span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{complexity.explanation}</p>
              {complexity.hint && (
                <div className="mt-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary-foreground/80 leading-relaxed">
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
