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

  const colorClass = overtime
    ? 'text-orange-500'
    : nearEnd
    ? 'text-amber-500'
    : 'text-muted-foreground'

  const dotClass = overtime
    ? 'bg-orange-500 animate-pulse'
    : nearEnd
    ? 'bg-amber-500'
    : 'bg-muted-foreground/40'

  return (
    <div className={`flex items-center gap-1.5 font-mono text-sm tabular-nums transition-colors duration-300 ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${dotClass}`} />
      {overtime ? '+' : ''}{mins}:{String(secs).padStart(2, '0')}
    </div>
  )
}
