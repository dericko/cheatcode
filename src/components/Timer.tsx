'use client'
import { useState, useEffect, useRef } from 'react'
import { TIMER_MINUTES } from '@/lib/config'

interface TimerProps {
  onTimeUp: () => void
  elapsedRef: React.MutableRefObject<number>
}

export default function Timer({ onTimeUp, elapsedRef }: TimerProps) {
  const [remaining, setRemaining] = useState(TIMER_MINUTES * 60 * 1000)
  const notifiedRef = useRef(false)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const total = TIMER_MINUTES * 60 * 1000
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      elapsedRef.current = elapsed
      const r = total - elapsed
      setRemaining(r)
      if (r <= 0 && !notifiedRef.current) {
        notifiedRef.current = true
        onTimeUp()
      }
    }, 500)
    return () => clearInterval(tick)
  }, [])

  const overtime = remaining < 0
  const display = Math.abs(remaining)
  const mins = Math.floor(display / 60_000)
  const secs = Math.floor((display % 60_000) / 1000)

  return (
    <span className={`font-mono text-sm tabular-nums ${
      overtime ? 'text-orange-400' : remaining < 300_000 ? 'text-yellow-400' : 'text-gray-300'
    }`}>
      {overtime ? '+' : ''}{mins}:{String(secs).padStart(2, '0')}
    </span>
  )
}
