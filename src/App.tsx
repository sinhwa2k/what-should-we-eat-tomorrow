import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import { configured } from './lib/supabase'
import { toISO } from './lib/date'
import DayPage from './pages/DayPage'
import DishesPage from './pages/DishesPage'
import DishPage from './pages/DishPage'
import MonthPage from './pages/MonthPage'
import WeekPage from './pages/WeekPage'

const TABS = [
  { to: '/', match: '/day', text: '일별' },
  { to: '/week', match: '/week', text: '주별' },
  { to: '/month', match: '/month', text: '월별' },
  { to: '/dishes', match: '/dish', text: '메뉴' },
]

function Header() {
  const { pathname } = useLocation()
  const index = TABS.findIndex((t) =>
    t.to === '/' ? pathname === '/' || pathname.startsWith('/day') : pathname.startsWith(t.match),
  )
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="sm" disableGutters>
        <Toolbar variant="dense">
          <Typography variant="h6" color="primary">
            내일뭐먹지
          </Typography>
        </Toolbar>
        <Tabs value={index === -1 ? false : index} variant="fullWidth">
          {TABS.map((t) => (
            <Tab key={t.to} label={t.text} component={Link} to={t.to} />
          ))}
        </Tabs>
      </Container>
    </AppBar>
  )
}

export default function App() {
  if (!configured) {
    return (
      <Typography sx={{ p: 3 }}>
        .env에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 설정해주세요.
      </Typography>
    )
  }
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <Header />
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Routes>
          <Route path="/" element={<Navigate to={`/day/${toISO(new Date())}`} replace />} />
          <Route path="/day/:date" element={<DayPage />} />
          <Route path="/month" element={<MonthPage />} />
          <Route path="/month/:ym" element={<MonthPage />} />
          <Route path="/week" element={<WeekPage />} />
          <Route path="/week/:date" element={<WeekPage />} />
          <Route path="/dishes" element={<DishesPage />} />
          <Route path="/dish/:id" element={<DishPage />} />
        </Routes>
      </Container>
    </Box>
  )
}
