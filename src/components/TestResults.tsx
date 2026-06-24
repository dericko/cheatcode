'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { RunResult, ComplexityResult } from '@/types/runner'

interface TestResultsProps {
  result: RunResult | null
  isRunning: boolean
  complexity?: ComplexityResult | null
  isAnalyzing?: boolean
}

export default function TestResults({ result, isRunning, complexity, isAnalyzing }: TestResultsProps) {
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
      <div className="p-5 space-y-4">
        <Skeleton className="h-5 w-24" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-3 w-3 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center px-4 py-8 text-sm text-muted-foreground">
        Run your code to see results
      </div>
    )
  }

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <div className="text-sm flex flex-col">
      {/* Results header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 border-l-2 ${allPassed ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <Badge className={allPassed
          ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
          : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        }>
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
              <div key={i} className={`px-4 py-3 ${r.passed ? '' : 'bg-red-50 dark:bg-red-900/10'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${r.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {r.passed ? '✓' : '✗'}
                  </span>
                  <span className={r.passed ? 'text-muted-foreground' : 'text-foreground'}>{r.description}</span>
                </div>
                {!r.passed && (
                  <div className="mt-2 ml-4 bg-muted rounded-md p-2.5 font-mono text-xs space-y-1">
                    {r.error ? (
                      <div className="text-red-600 dark:text-red-400">Error: {r.error}</div>
                    ) : (
                      <>
                        <div className="text-muted-foreground">expected <span className="text-green-600 dark:text-green-400">{JSON.stringify(r.expected)}</span></div>
                        <div className="text-muted-foreground">received <span className="text-red-600 dark:text-red-400">{JSON.stringify(r.actual)}</span></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {result.consoleOutput.length > 0 && (
            <div className="px-4 py-3 border-t">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Console</div>
              <div className="bg-muted rounded-md p-2.5 space-y-0.5">
                {result.consoleOutput.map((line, i) => (
                  <div key={i} className="font-mono text-xs text-amber-600 dark:text-yellow-300">{line}</div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Complexity — shown regardless of verbose/summary mode */}
      {isAnalyzing && !complexity && (
        <div className="px-4 py-3 border-t space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      )}

      {complexity && (
        <div className="px-4 py-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complexity</span>
            <Badge className={complexity.passesTarget
              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
              : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
            }>
              {complexity.passesTarget ? 'optimal' : 'suboptimal'}
            </Badge>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground mb-1.5">
            <span>Time: <span className="text-foreground font-mono">{complexity.timeComplexity}</span></span>
            <span>Space: <span className="text-foreground font-mono">{complexity.spaceComplexity}</span></span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{complexity.explanation}</p>
          {complexity.hint && (
            <div className="mt-2 px-3 py-2 bg-muted rounded-lg text-xs text-muted-foreground leading-relaxed border">
              {complexity.hint}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
