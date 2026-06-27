'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useColorScheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Drawer from '@mui/material/Drawer'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ForumIcon from '@mui/icons-material/Forum'
import { LoadingButton } from '@mui/lab'
import Timer from '@/components/Timer'
import TestResults from '@/components/TestResults'
import HintChat from '@/components/HintChat'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Problem, Language } from '@/types/problem'
import type { RunResult, ComplexityResult } from '@/types/runner'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const LANG_KEY = (slug: string) => `lang:${slug}`
const CODE_KEY = (slug: string, lang: Language) => `code:${slug}:${lang}`

const DIFFICULTY_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
}

function starterForLanguage(problem: Problem, lang: Language): string {
  return lang === 'ruby' ? (problem.ruby?.starterCode ?? problem.starterCode) : problem.starterCode
}

export default function ProblemClient({ problem }: { problem: Problem }) {
  const { colorScheme } = useColorScheme()

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'typescript'
    return (localStorage.getItem(LANG_KEY(problem.slug)) ?? 'typescript') as Language
  })

  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return problem.starterCode
    const lang = (localStorage.getItem(LANG_KEY(problem.slug)) ?? 'typescript') as Language
    return localStorage.getItem(CODE_KEY(problem.slug, lang)) ?? starterForLanguage(problem, lang)
  })

  const [result, setResult] = useState<RunResult | null>(null)
  const [complexity, setComplexity] = useState<ComplexityResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [skipAnalysis, setSkipAnalysis] = useState(false)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)
  const runIdRef = useRef(0)

  useEffect(() => {
    localStorage.setItem(CODE_KEY(problem.slug, language), code)
  }, [code, problem.slug, language])

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem(LANG_KEY(problem.slug), newLang)
    setLanguage(newLang)
    const saved = localStorage.getItem(CODE_KEY(problem.slug, newLang))
    setCode(saved ?? starterForLanguage(problem, newLang))
    setResult(null)
    setComplexity(null)
  }

  // Keyboard shortcut: Cmd+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [code, isRunning, skipAnalysis, problem.slug, language])

  const showToast = (msg: string, severity: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message: msg, severity })
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setIsAnalyzing(true)
    setComplexity(null)
    const runId = ++runIdRef.current

    if (!skipAnalysis) {
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code, language }),
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (data && runIdRef.current === runId) setComplexity(data)
      }).catch(() => { }).finally(() => setIsAnalyzing(false))
    } else {
      setIsAnalyzing(false)
    }

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: problem.slug, code, language }),
      })

      if (!res.ok) {
        showToast('Error connecting to runner', 'error')
        return
      }
      const data: RunResult = await res.json()
      setResult(data)

      if (data.results.every(r => r.passed)) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: problem.slug, code, passed: true, timeSpentMs: elapsedRef.current, language }),
        })
        showToast('All tests passed!')
      }
    } catch {
      showToast('Error connecting to runner', 'error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar
        elevation={0}
        position="static"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        color="default"
      >
        <Toolbar variant="dense" sx={{ gap: 1, minHeight: 64 }}>
          {/* Back button */}
          <IconButton
            component={Link}
            href="/"
            size="small"
            edge="start"
            aria-label="Back to problem list"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>

          {/* Center: title + difficulty */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }} noWrap>
              {problem.title}
            </Typography>
            <Chip
              label={problem.difficulty}
              size="small"
              color={DIFFICULTY_COLOR[problem.difficulty] ?? 'default'}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>

          {/* Right controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Language selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="ruby" disabled={!problem.ruby}>Ruby</MenuItem>
              </Select>
            </FormControl>

            <Timer onTimeUp={() => showToast("Time's up — keep going!")} elapsedRef={elapsedRef} />

            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={!skipAnalysis}
                  onChange={e => {
                    setSkipAnalysis(!e.target.checked)
                    if (!e.target.checked) setComplexity(null)
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Feedback
                </Typography>
              }
              sx={{ mr: 0 }}
            />

            <LoadingButton
              onClick={handleRun}
              loading={isRunning}
              variant="contained"
              size="small"
              sx={{ px: 2 }}
            >
              Run
            </LoadingButton>

            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', display: { xs: 'none', lg: 'block' } }}
            >
              ⌘↵
            </Typography>

            <IconButton
              size="small"
              onClick={() => setHintsOpen(o => !o)}
              color={hintsOpen ? 'primary' : 'default'}
              aria-label="Toggle hints"
            >
              <ForumIcon fontSize="small" />
            </IconButton>

            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Top row: description + editor */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Description panel */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
              overflow: 'auto',
              p: 2,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              component="pre"
              sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}
            >
              {problem.description.trim()}
            </Typography>
          </Box>

          {/* Editor */}
          <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <Editor
              value={code}
              onChange={setCode}
              onRun={handleRun}
              theme={colorScheme === 'dark' ? 'vs-dark' : 'vs'}
              language={language}
            />
          </Box>
        </Box>

        {/* Bottom: test results */}
        <Box
          sx={{
            height: 280,
            borderTop: 1,
            borderColor: 'divider',
            overflow: 'auto',
            flexShrink: 0,
          }}
        >
          <TestResults
            result={result}
            isRunning={isRunning}
            complexity={complexity}
            isAnalyzing={isAnalyzing}
          />
        </Box>
      </Box>

      {/* Hints Drawer */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={hintsOpen}
        onClose={() => setHintsOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              top: '64px',
              height: 'calc(100vh - 64px)',
            },
          },
        }}
      >
        <HintChat slug={problem.slug} code={code} open={hintsOpen} onClose={() => setHintsOpen(false)} language={language} />
      </Drawer>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
