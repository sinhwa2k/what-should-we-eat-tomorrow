import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme.ts'
import { ConfirmProvider } from './lib/confirm.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfirmProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ConfirmProvider>
    </ThemeProvider>
  </StrictMode>,
)
