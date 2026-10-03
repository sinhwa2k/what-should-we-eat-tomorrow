import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRange } from '../lib/api'
import { fromISO, label, shift, toISO } from '../lib/date'
import type { MealPlan, Slot } from '../lib/types'

const SLOTS: { slot: Slot; icon: string }[] = [
  { slot: 'lunch', icon: '🌞' },
  { slot: 'dinner', icon: '🌙' },
]

export default function WeekPage() {
  const nav = useNavigate()
  const { date } = useParams()
  const today = toISO(new Date())
  const base = date ?? today
  const start = shift(base, -fromISO(base).getDay())
  const end = shift(start, 6)
  const days = Array.from({ length: 7 }, (_, i) => shift(start, i))
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getRange(start, end)
      .then((p) => {
        setPlans(p)
        setError('')
      })
      .catch((e) => setError(e.message))
  }, [start, end])

  return (
    <div>
      <header className="mb-3 flex items-center justify-between">
        <button className="p-2 text-2xl" onClick={() => nav(`/week/${shift(start, -7)}`)}>‹</button>
        <h1 className="text-lg font-bold">{label(start)} ~ {label(end)}</h1>
        <button className="p-2 text-2xl" onClick={() => nav(`/week/${shift(start, 7)}`)}>›</button>
      </header>
      {start !== shift(today, -fromISO(today).getDay()) && (
        <div className="mb-3 text-center">
          <button className="rounded-full border px-3 py-1 text-sm" onClick={() => nav('/week')}>오늘로</button>
        </div>
      )}
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <ul className="space-y-2">
        {days.map((d) => (
          <li key={d}>
            <Link
              to={`/day/${d}`}
              className={`block rounded-2xl border p-3 ${d === today ? 'border-orange-400 bg-orange-50' : 'bg-white'}`}
            >
              <div className={`mb-1 font-bold ${d === today ? 'text-orange-600' : ''}`}>{label(d)}</div>
              {SLOTS.map(({ slot, icon }) => {
                const items = plans.find((p) => p.date === d && p.slot === slot)?.meal_items ?? []
                return (
                  <div key={slot} className="flex gap-2 py-0.5">
                    <span>{icon}</span>
                    <span className={items.length ? '' : 'text-gray-300'}>
                      {items.length ? items.map((it) => it.label).join(' · ') : '-'}
                    </span>
                  </div>
                )
              })}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
