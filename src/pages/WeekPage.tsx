import { useEffect, useRef, useState } from 'react'
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
  const todayRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [start])

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
      <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2">
        {days.map((d) => (
          <Link
            key={d}
            ref={d === today ? todayRef : undefined}
            to={`/day/${d}`}
            className={`w-32 shrink-0 snap-start rounded-2xl border p-3 ${d === today ? 'border-orange-400 bg-orange-50' : 'bg-white'}`}
          >
            <div className={`mb-2 border-b pb-1 text-center font-bold ${d === today ? 'text-orange-600' : ''}`}>{label(d)}</div>
            {SLOTS.map(({ slot, icon }) => {
              const items = plans.find((p) => p.date === d && p.slot === slot)?.meal_items ?? []
              return (
                <div key={slot} className="mb-3 last:mb-0">
                  <div className="mb-1 text-xs">{icon}</div>
                  {items.length ? (
                    items.map((it) => (
                      <p key={it.id} className="break-words py-0.5 text-sm leading-snug">{it.label}</p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-300">-</p>
                  )}
                </div>
              )
            })}
          </Link>
        ))}
      </div>
    </div>
  )
}
