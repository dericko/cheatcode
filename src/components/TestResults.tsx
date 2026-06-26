'use client'
import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
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
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="text" width={96} height={20} />
        {[1, 2, 3].map(i => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Skeleton variant="circular" width={12} height={12} sx={{ mt: 0.25, flexShrink: 0 }} />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Skeleton variant="text" width={128} height={12} />
              <Skeleton variant="text" width={192} height={12} />
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  if (!result) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Run your code to see results
        </Typography>
      </Box>
    )
  }

  const passed = result.results.filter(r => r.passed).length
  const total = result.results.length
  const allPassed = passed === total

  return (
    <Box sx={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column' }}>
      {/* Results header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
        borderLeft: 3,
        borderLeftColor: allPassed ? 'success.main' : 'error.main',
      }}>
        <Chip
          label={`${passed}/${total} passed`}
          size="small"
          color={allPassed ? 'success' : 'error'}
        />
        <Button variant="outlined" size="small" onClick={toggleMode}>
          {mode === 'verbose' ? 'Summary' : 'Verbose'}
        </Button>
      </Box>

      {mode === 'verbose' && (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box>
            {result.results.map((r, i) => (
              <Box key={i}>
                {i > 0 && <Divider sx={{ opacity: 0.6 }} />}
                <Box sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: r.passed ? 'transparent' : 'error.main',
                  '&': r.passed ? {} : { bgcolor: 'rgba(211,47,47,0.05)' },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {r.passed
                      ? <CheckCircleIcon sx={{ fontSize: '0.875rem', color: 'success.main', flexShrink: 0 }} />
                      : <CancelIcon sx={{ fontSize: '0.875rem', color: 'error.main', flexShrink: 0 }} />
                    }
                    <Typography variant="body2" color={r.passed ? 'text.secondary' : 'text.primary'}>
                      {r.description}
                    </Typography>
                  </Box>
                  {!r.passed && (
                    <Box sx={{
                      mt: 1,
                      ml: 2.5,
                      bgcolor: 'action.hover',
                      p: 1.25,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}>
                      {r.error ? (
                        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'error.main' }}>
                          Error: {r.error}
                        </Typography>
                      ) : (
                        <>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                            expected{' '}
                            <Box component="span" sx={{ color: 'success.main' }}>{JSON.stringify(r.expected)}</Box>
                          </Typography>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                            received{' '}
                            <Box component="span" sx={{ color: 'error.main' }}>{JSON.stringify(r.actual)}</Box>
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {result.consoleOutput.length > 0 && (
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, display: 'block', mb: 1 }}>
                Console
              </Typography>
              <Box sx={{ bgcolor: 'action.hover', p: 1.25, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {result.consoleOutput.map((line, i) => (
                  <Typography key={i} sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'warning.main' }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Complexity — shown regardless of verbose/summary mode */}
      {isAnalyzing && !complexity && (
        <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Skeleton variant="text" width={80} height={12} />
            <Skeleton variant="rounded" width={64} height={20} sx={{ borderRadius: 9999 }} />
          </Box>
          <Skeleton variant="text" width={112} height={12} />
          <Skeleton variant="text" width={96} height={12} />
        </Box>
      )}

      {complexity && (
        <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
              Complexity
            </Typography>
            <Chip
              label={complexity.passesTarget ? 'optimal' : 'suboptimal'}
              size="small"
              color={complexity.passesTarget ? 'success' : 'error'}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              Time:{' '}
              <Box component="span" sx={{ color: 'text.primary', fontFamily: 'monospace' }}>{complexity.timeComplexity}</Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Space:{' '}
              <Box component="span" sx={{ color: 'text.primary', fontFamily: 'monospace' }}>{complexity.spaceComplexity}</Box>
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
            {complexity.explanation}
          </Typography>
          {complexity.hint && (
            <Box sx={{ mt: 1, px: 1.5, py: 1, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                {complexity.hint}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
