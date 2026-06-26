import { getAllProblems } from '@/lib/problems'
import { db } from '@/lib/db'
import ProblemList from '@/components/ProblemList'
import { ThemeToggle } from '@/components/ThemeToggle'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const problems = getAllProblems()
  const solvedProgress = await db.problemProgress.findMany({ where: { solved: true } })
  const solvedSlugs = solvedProgress.map(p => p.slug)

  const easy = problems.filter(p => p.difficulty === 'easy').length
  const medium = problems.filter(p => p.difficulty === 'medium').length
  const hard = problems.filter(p => p.difficulty === 'hard').length
  const solvedCount = solvedProgress.length
  const pct = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cheatcode
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5, flex: 1 }}>
        {/* Progress section */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="overline" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {solvedCount} / {problems.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={`${easy} easy`} color="success" size="small" />
            <Chip label={`${medium} medium`} color="warning" size="small" />
            <Chip label={`${hard} hard`} color="error" size="small" />
          </Box>
          <LinearProgress variant="determinate" value={pct} />
        </Box>

        <ProblemList problems={problems} solvedSlugs={solvedSlugs} />
      </Container>
    </Box>
  )
}
