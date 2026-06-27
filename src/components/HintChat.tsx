'use client'
import { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import CloseIcon from '@mui/icons-material/Close'
import type { Language } from '@/types/problem'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface HintChatProps {
  slug: string
  code: string
  open: boolean
  onClose: () => void
  language?: Language
}

export default function HintChat({ slug, code, open, onClose, language }: HintChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

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
        body: JSON.stringify({ slug, code, messages: updated, language: language ?? 'typescript' }),
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Panel header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, height: 40, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
          AI · no spoilers
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ mr: -0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Ask for a nudge. The AI won&apos;t write code for you — it&apos;ll ask questions to help you find the insight yourself.
          </Typography>
        )}
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'user' ? (
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  maxWidth: '85%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="caption" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </Typography>
              </Paper>
            ) : (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 1, maxWidth: '85%' }}
              >
                <Typography variant="caption" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </Typography>
              </Paper>
            )}
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
              <Skeleton variant="text" width={144} height={12} />
              <Skeleton variant="text" width={96} height={12} />
            </Paper>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Footer input row */}
      <Box sx={{ display: 'flex', gap: 1, p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
        <TextField
          inputRef={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask for a hint…"
          size="small"
          fullWidth
        />
        <Button
          onClick={send}
          disabled={!input.trim()}
          size="small"
          variant="contained"
        >
          Send
        </Button>
      </Box>
    </Box>
  )
}
