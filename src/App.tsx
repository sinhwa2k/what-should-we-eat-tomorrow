import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { configured } from './lib/supabase'
import { toISO } from './lib/date'
import DayPage from './pages/DayPage'
import DishesPage from './pages/DishesPage'
import DishPage from './pages/DishPage'
import MonthPage from './pages/MonthPage'
import WeekPage from './pages/WeekPage'

const TABS = [
  { to: '/', match: '/day', text: '일별' },
  { to: '/month', match: '/month', text: '월별' },
  { to: '/week', match: '/week', text: '주별' },
  { to: '/dishes', match: '/dish', text: '메뉴' },
]

function Tabs() {
  const { pathname } = useLocation()
  return (
    <nav className="sticky top-0 z-10 flex border-b bg-white">
      {TABS.map((t) => {
        const active = t.to === '/' ? pathname === '/' || pathname.startsWith('/day') : pathname.startsWith(t.match)
        return (
          <Link
            key={t.to}
            to={t.to}
            className={`flex-1 py-3 text-center text-sm ${active ? 'border-b-2 border-orange-500 font-bold text-orange-600' : 'text-gray-500'}`}
          >
            {t.text}
          </Link>
        )
      })}
    </nav>
  )
}

export default function App() {
  if (!configured) {
    return (
      <p className="p-6 text-sm">
        .env에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 설정해주세요.
      </p>
    )
  }
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <Tabs />
      <main className="flex-1 p-4">
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
      </main>
    </div>
  )
}
