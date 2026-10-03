import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { configured } from './lib/supabase'
import { toISO } from './lib/date'
import DayPage from './pages/DayPage'
import DishesPage from './pages/DishesPage'
import DishPage from './pages/DishPage'
import MonthPage from './pages/MonthPage'

const tab = ({ isActive }: { isActive: boolean }) =>
  `flex-1 py-3 text-center text-sm ${isActive ? 'font-bold text-orange-600' : 'text-gray-500'}`

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
      <main className="flex-1 p-4 pb-20">
        <Routes>
          <Route path="/" element={<Navigate to={`/day/${toISO(new Date())}`} replace />} />
          <Route path="/day/:date" element={<DayPage />} />
          <Route path="/month" element={<MonthPage />} />
          <Route path="/month/:ym" element={<MonthPage />} />
          <Route path="/dishes" element={<DishesPage />} />
          <Route path="/dish/:id" element={<DishPage />} />
        </Routes>
      </main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-xl border-t bg-white">
        <NavLink to="/" end className={tab}>하루</NavLink>
        <NavLink to="/month" className={tab}>월</NavLink>
        <NavLink to="/dishes" className={tab}>메뉴</NavLink>
      </nav>
    </div>
  )
}
