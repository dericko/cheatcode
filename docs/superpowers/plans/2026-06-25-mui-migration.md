# MUI Migration Plan

**Goal:** Replace all CSS and UI components with MUI/Material-UI. Same functionality, MUI defaults (blue primary), simple/minimal/clean.

## Global Constraints

- Next.js 16 App Router, React 19
- Keep all API routes, data layer, problem logic untouched
- Monaco editor (@monaco-editor/react) stays as-is
- Timer logic unchanged; only its visual output changes
- No new features; no extra abstractions
- MUI default blue palette — no custom color overrides
- Dark mode via MUI's built-in colorSchemes (not next-themes)
- Use system-ui font stack (not Geist)
- shape.borderRadius: 4 in theme (tighter than MUI default 8)
- Delete src/components/ui/ folder entirely
- Remove Tailwind, postcss, Radix, next-themes, class-variance-authority, tailwind-merge, lucide-react

---

## Task 1: Package Installation

**Scope:** Install MUI packages, uninstall old packages, remove config files.

**Install:**
- @mui/material
- @emotion/react
- @emotion/styled
- @mui/icons-material
- @mui/material-nextjs (for AppRouterCacheProvider)
- @mui/lab (for LoadingButton)

**Uninstall:**
- tailwindcss
- @tailwindcss/postcss
- @radix-ui/react-checkbox
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slot
- next-themes
- class-variance-authority
- tailwind-merge
- lucide-react

**Delete files:**
- postcss.config.mjs

**No code changes in this task — only package.json and config files.**

**Commit message:** `chore: install MUI, remove Tailwind and Radix`

---

## Task 2: Theme and Layout

**Scope:** Create MUI theme, update layout.tsx, strip globals.css.

### src/lib/theme.ts (new file)

```ts
'use client'
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: { light: true, dark: true },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  shape: {
    borderRadius: 4,
  },
})
```

### src/app/layout.tsx

Replace next-themes ThemeProvider + Geist fonts with:
- Remove Geist font imports
- Wrap with AppRouterCacheProvider (from @mui/material-nextjs/v15-appRouter)
- Wrap with ThemeProvider (from @mui/material/styles) using the theme
- Add CssBaseline inside ThemeProvider
- Keep html/body structure; remove font className variables
- suppressHydrationWarning stays

```tsx
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/lib/theme'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
```

### src/app/globals.css

Strip to only what MUI cannot own — Monaco container sizing and custom scrollbar styles:

```css
/* Monaco editor fill */
.monaco-container {
  width: 100%;
  height: 100%;
}

/* Thin scrollbars */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgba(128,128,128,0.3); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(128,128,128,0.5); }
```

**Commit message:** `feat: add MUI theme and update layout providers`

---

## Task 3: ThemeToggle + delete /components/ui/

**Scope:** Rewrite ThemeToggle to use MUI's useColorScheme, then delete the entire src/components/ui/ folder.

### src/components/ThemeToggle.tsx

```tsx
'use client'
import IconButton from '@mui/material/IconButton'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useColorScheme } from '@mui/material/styles'

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme()
  return (
    <IconButton
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      size="small"
    >
      {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
    </IconButton>
  )
}
```

### Delete these files:
- src/components/ui/badge.tsx
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/checkbox.tsx
- src/components/ui/input.tsx
- src/components/ui/select.tsx
- src/components/ui/separator.tsx
- src/components/ui/skeleton.tsx

**Commit message:** `refactor: replace ThemeToggle with MUI, delete shadcn ui components`

---

## Task 4: Home Page

**Scope:** Rewrite src/app/page.tsx using MUI components. No logic changes.

Replace:
- Custom header div → AppBar + Toolbar
- Badge → Chip with color="success"/"warning"/"error" for easy/medium/hard
- Progress bar div → LinearProgress
- ThemeToggle import stays (already updated)

```tsx
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import { ThemeToggle } from '@/components/ThemeToggle'
import ProblemList from '@/components/ProblemList'
```

Layout:
- AppBar elevation=0, outlined bottom border (sx={{ borderBottom: 1, borderColor: 'divider' }})
- Toolbar: "Cheatcode" Typography left, ThemeToggle right
- Container maxWidth="md" with py={5}
- Progress section: "Progress" overline label, solved/total h5, difficulty Chips in a row, LinearProgress
- ProblemList below

Difficulty chip colors:
- easy → color="success"
- medium → color="warning"  
- hard → color="error"

**Commit message:** `feat: rewrite home page with MUI components`

---

## Task 5: ProblemList

**Scope:** Rewrite src/components/ProblemList.tsx using MUI List, ListItemButton, Select, Chip.

Replace:
- Radix Select → MUI FormControl + Select + MenuItem (two filters: Topic, Difficulty)
- Custom div rows → List + ListItemButton
- Badge → Chip (difficulty colors as above)
- Solved checkmark → CheckIcon from @mui/icons-material

```tsx
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import CheckIcon from '@mui/icons-material/Check'
import Link from 'next/link'
```

Layout:
- Filter row: two FormControl+Select (size="small") for topic and difficulty, count Typography right-aligned
- Column headers: Typography variant="caption" in a row
- Grouped list: ListSubheader for each topic group (when topicFilter === 'all')
- ListItemButton wrapping Link (component={Link} href=...)
  - Primary text: problem title
  - Secondary text: topic (hidden on small screens)
  - Right side: difficulty Chip + CheckIcon (when solved)

**Commit message:** `feat: rewrite ProblemList with MUI List and Select`

---

## Task 6: TestResults

**Scope:** Rewrite src/components/TestResults.tsx using MUI Skeleton, Chip, Box, Typography, List.

Replace:
- Skeleton → MUI Skeleton
- Badge → Chip
- Button (verbose/summary toggle) → Button from MUI
- Color classes → sx props with theme colors

```tsx
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
```

Layout:
- Loading state: Box with spacing, Skeletons
- Empty state: centered Typography "Run your code to see results"
- Results header: Chip for pass count (color="success" if all passed, "error" otherwise), verbose/summary Button toggle
- Verbose mode: list of test results, each with CheckCircleIcon/CancelIcon, failure details in a Box with monospace Typography
- Complexity section: Chip for optimal/suboptimal, Typography for time/space, Skeleton while analyzing

**Commit message:** `feat: rewrite TestResults with MUI components`

---

## Task 7: HintChat

**Scope:** Rewrite src/components/HintChat.tsx using MUI components (not a Drawer — the parent controls the drawer; this component just renders the panel content).

Note: HintChat renders as a panel *inside* the drawer that ProblemClient controls. Keep the same interface: `{ slug, code, open, onClose }`.

Replace:
- Input → TextField
- Button → MUI Button
- Skeleton → MUI Skeleton
- Message bubbles → Paper (user: variant="elevation" color primary-ish, assistant: variant="outlined")
- X close button → IconButton + CloseIcon

```tsx
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
```

Layout:
- Header: Typography "AI · no spoilers" + IconButton CloseIcon
- Messages scroll Box (flex: 1, overflow: auto)
  - Empty state: Typography hint text
  - User messages: right-aligned Paper (bgcolor="primary.main", color="primary.contrastText")
  - Assistant messages: left-aligned Paper variant="outlined"
  - Loading: left-aligned Paper variant="outlined" with Skeletons
- Footer: TextField + Button row

**Commit message:** `feat: rewrite HintChat with MUI components`

---

## Task 8: ProblemClient (Editor Page)

**Scope:** Rewrite src/app/problems/[slug]/ProblemClient.tsx — the most complex component. All logic stays identical; only the JSX/styling changes.

Replace:
- Header div → AppBar + Toolbar
- Button (Back) → IconButton + ArrowBackIcon
- Button (Run) → LoadingButton from @mui/lab (loading={isRunning})
- Button (Hints) → IconButton + ChatIcon (or ForumIcon)
- Badge (difficulty) → Chip
- Checkbox → MUI Checkbox + FormControlLabel
- Toast div → Snackbar + Alert
- Hints drawer div (currently a fixed positioned div) → MUI Drawer anchor="right" variant="temporary"
- ThemeToggle stays

Layout:
- AppBar elevation=0 with border-bottom
- Toolbar: back IconButton left, title Typography + difficulty Chip center (via Box flexGrow), timer+controls right
- Body: Box with display="flex" flexDirection="column" height="calc(100vh - 64px)" (64px = AppBar height)
  - Top section: CSS grid or flex row
    - Description panel: Box width={280} overflow="auto" p={2} borderRight={1} (hidden below md)
    - Editor: Box flexGrow={1} (Monaco, full height)
  - Bottom section: TestResults in a Box with fixed height, borderTop, overflow="auto"
- Drawer: width=320, anchor="right", open={hintsOpen}, onClose={() => setHintsOpen(false)}
  - HintChat inside

Timer: keep same logic; use Typography component with sx for color (no className)

Snackbar: autoHideDuration=4000, anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}

**Commit message:** `feat: rewrite ProblemClient with MUI components`

---

## Task 9: Timer

**Scope:** Rewrite src/components/Timer.tsx to use MUI Typography instead of Tailwind className for colors.

Keep all timing logic exactly as-is. Only change: replace className color strings with MUI sx prop.

```tsx
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
```

Color mapping:
- overtime → color="warning.main" (orange-ish in MUI)
- nearEnd → color="warning.light"
- normal → color="text.secondary"

Dot: Box component="span" with sx bgcolor matching the Typography color, small circle.

**Commit message:** `feat: rewrite Timer with MUI Typography`
