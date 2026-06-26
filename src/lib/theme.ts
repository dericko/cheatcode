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
