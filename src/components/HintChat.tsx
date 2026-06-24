'use client'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface HintChatProps {
  slug: string
  code: string
}

export default function HintChat({ slug, code }: HintChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    const updated: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(updated)
    setIsLoading(true)
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, code, messages: updated }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error ?? 'Something went wrong.'}` }])
      } else if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${String(err)}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Left-side panel */}
      {open && (
        <div
          className="fixed left-0 z-30 flex flex-col bg-surface border-r border-border"
          style={{ top: '3.5rem', width: '22rem', height: 'calc(100vh - 3.5rem)', boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground">Hints</span>
            <Badge variant="default" className="text-[11px] bg-primary/10 text-primary border-primary/20">
              AI · no spoilers
            </Badge>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-muted text-xs leading-relaxed">
                Ask for a nudge. The AI won't write code for you — it'll ask questions to help you find the insight yourself.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-surface-variant text-foreground rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-variant px-3 py-2 rounded-xl rounded-bl-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask for a hint…"
              autoFocus
              className="flex-1 bg-surface-variant border-border text-foreground placeholder:text-muted text-xs"
            />
            <Button
              onClick={send}
              disabled={isLoading || !input.trim()}
              variant="default"
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      )}

      {/* FAB */}
      <Button
        onClick={() => setOpen(o => !o)}
        size="lg"
        className="fixed bottom-6 right-6 z-40 rounded-full px-4 py-2.5 bg-primary hover:bg-primary-hover"
        style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
      >
        {open ? '✕ Close hints' : '💡 Hints'}
      </Button>
    </>
  )
}
