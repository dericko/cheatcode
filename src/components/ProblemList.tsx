'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import type { Problem, Difficulty, Topic } from '@/types/problem'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import CheckIcon from '@mui/icons-material/Check'

const TOPICS: Topic[] = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'misc']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

interface ProblemListProps {
  problems: Problem[]
  solvedSlugs: string[]
}

function difficultyColor(d: Difficulty): 'success' | 'warning' | 'error' {
  if (d === 'easy') return 'success'
  if (d === 'medium') return 'warning'
  return 'error'
}

function ProblemRow({ p, solved }: { p: Problem; solved: boolean }) {
  return (
    <ListItemButton
      component={Link as any}
      href={`/problems/${p.slug}`}
      divider
      sx={{ px: 1, py: 1.25 }}
    >
      <ListItemText
        primary={p.title}
        slotProps={{ primary: { variant: 'body2', fontWeight: 500, noWrap: true } as any }}
        sx={{ flex: 1, pr: 3 }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ width: 144, flexShrink: 0, display: { xs: 'none', md: 'block' } }}
      >
        {p.topic}
      </Typography>
      <Box sx={{ width: 80, flexShrink: 0 }}>
        <Chip
          label={p.difficulty}
          color={difficultyColor(p.difficulty as Difficulty)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>
      <Box sx={{ width: 20, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
        {solved && <CheckIcon fontSize="small" color="success" />}
      </Box>
    </ListItemButton>
  )
}

export default function ProblemList({ problems, solvedSlugs: solvedSlugsArr }: ProblemListProps) {
  const solvedSlugs = new Set(solvedSlugsArr)
  const router = useRouter()
  const searchParams = useSearchParams()

  const topicFilter = (searchParams.get('topic') as Topic | null) ?? 'all'
  const diffFilter = (searchParams.get('difficulty') as Difficulty | null) ?? 'all'

  const setFilter = useCallback((key: 'topic' | 'difficulty', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }, [router, searchParams])

  const filtered = problems.filter(p =>
    (topicFilter === 'all' || p.topic === topicFilter) &&
    (diffFilter === 'all' || p.difficulty === diffFilter)
  )

  const grouped = TOPICS.map(topic => ({
    topic,
    items: filtered.filter(p => p.topic === topic),
  })).filter(g => g.items.length > 0)

  return (
    <Box>
      {/* Filters */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 152 }}>
          <InputLabel id="topic-filter-label">Topic</InputLabel>
          <Select
            labelId="topic-filter-label"
            value={topicFilter}
            label="Topic"
            onChange={(e) => setFilter('topic', e.target.value)}
          >
            <MenuItem value="all">All Topics</MenuItem>
            {TOPICS.map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 152 }}>
          <InputLabel id="diff-filter-label">Difficulty</InputLabel>
          <Select
            labelId="diff-filter-label"
            value={diffFilter}
            label="Difficulty"
            onChange={(e) => setFilter('difficulty', e.target.value)}
          >
            <MenuItem value="all">All Difficulties</MenuItem>
            {DIFFICULTIES.map(d => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }}>
          {filtered.length} problems
        </Typography>
      </Stack>

      {/* Column headers */}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', px: 1, pb: 1, mb: 0.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
          Problem
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: 144, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, display: { xs: 'none', md: 'block' } }}>
          Topic
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: 80, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
          Difficulty
        </Typography>
        <Box sx={{ width: 20 }} />
      </Stack>

      {/* Grouped list */}
      {topicFilter === 'all' ? (
        grouped.map(({ topic, items }) => (
          <List
            key={topic}
            subheader={
              <ListSubheader sx={{ lineHeight: '2rem', px: 1, bgcolor: 'transparent' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                  {topic} <Box component="span" sx={{ opacity: 0.5 }}>({items.length})</Box>
                </Typography>
              </ListSubheader>
            }
            disablePadding
            sx={{ mb: 3 }}
          >
            {items.map(p => (
              <ProblemRow key={p.slug} p={p} solved={solvedSlugs.has(p.slug)} />
            ))}
          </List>
        ))
      ) : (
        <List disablePadding>
          {filtered.map(p => (
            <ProblemRow key={p.slug} p={p} solved={solvedSlugs.has(p.slug)} />
          ))}
        </List>
      )}
    </Box>
  )
}
