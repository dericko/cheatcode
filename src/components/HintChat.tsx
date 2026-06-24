'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Panel — always in DOM, slides via transform */}
      <div
        className="fixed right-0 z-30 flex flex-col bg-card border-l border-border w-80 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          top: '3.5rem',
          height: 'calc(100vh - 3.5rem)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Hints</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">AI · no spoilers</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Ask for a nudge. The AI won't write code for you — it'll ask questions to help you find the insight yourself.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-3 rounded-2xl rounded-bl-sm space-y-1.5">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-t shrink-0">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask for a hint…"
            autoFocus={open}
            className="flex-1 text-xs"
          />
          <Button
            onClick={send}
            disabled={!input.trim()}
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Fixed tab — right edge, always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed right-0 top-1/2 z-40 bg-card border border-r-0 border-border rounded-l-lg shadow-sm px-2 py-4 flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        style={{ transform: 'translateY(-50%)' }}
        aria-label={open ? 'Close hints' : 'Open hints'}
      >
        <MessageSquare className="h-4 w-4" />
        <span
          className="text-[10px] font-medium"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Hints
        </span>
      </button>
    </>
  )
}
