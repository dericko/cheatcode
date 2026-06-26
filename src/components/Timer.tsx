'use client'
import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { TIMER_MINUTES } from '@/lib/config'

interface TimerProps {
  onTimeUp: () => void
  elapsedRef: React.MutableRefObject<number>
}

export default function Timer({ onTimeUp, elapsedRef }: TimerProps) {
  const [remaining, setRemaining] = useState(TIMER_MINUTES * 60 * 1000)
  const notifiedRef = useRef(false)
  const startRef = useRef(Date.now())
  const onTimeUpRef = useRef(onTimeUp)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    const total = TIMER_MINUTES * 60 * 1000
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      elapsedRef.current = elapsed
      const r = total - elapsed
      setRemaining(r)
      if (r <= 0 && !notifiedRef.current) {
        notifiedRef.current = true
        onTimeUpRef.current()
      }
    }, 500)
    return () => clearInterval(tick)
  }, [])

  const overtime = remaining < 0
  const nearEnd = !overtime && remaining < 300_000
  const display = Math.abs(remaining)
  const mins = Math.floor(display / 60_000)
  const secs = Math.floor((display % 60_000) / 1000)

  const textColor = overtime
    ? 'warning.main'
    : nearEnd
    ? 'warning.light'
    : 'text.secondary'

  const dotBgColor = overtime
    ? 'warning.main'
    : nearEnd
    ? 'warning.light'
    : 'action.disabled'

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'monospace', fontSize: '0.875rem', fontFeatureSettings: '"tnum"' }}>
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          flexShrink: 0,
          bgcolor: dotBgColor,
          ...(overtime && {
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }),
        }}
      />
      <Typography component="span" sx={{ color: textColor, fontFamily: 'monospace', fontSize: '0.875rem', fontFeatureSettings: '"tnum"' }}>
        {overtime ? '+' : ''}{mins}:{String(secs).padStart(2, '0')}
      </Typography>
    </Box>
  )
}
