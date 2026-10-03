import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRange } from '../lib/api'
import { toISO } from '../lib/date'
import type { MealPlan } from '../lib/types'

const HEAD = ['일', '월', '화', '수', '목', '금', '토']

export default function MonthPage() {
  const nav = useNavigate()
  const { ym } = useParams()
  const now = new Date()
  const [y, m] = (ym ?? `${now.getFullYear()}-${now.getMonth() + 1}`).split('-').map(Number)
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [error, setError] = useState('')

  const first = new Date(y, m - 1, 1)
  const last = new Date(y, m, 0)
  const from = toISO(first)
  const to = toISO(last)

  useEffect(() => {
    getRange(from, to)
      .then((p) => {
        setPlans(p)
        setError('')
      })
      .catch((e) => setError(e.message))
  }, [from, to])

  const go = (delta: number) => {
    const d = new Date(y, m - 1 + delta, 1)
    nav(`/month/${d.getFullYear()}-${d.getMonth() + 1}`)
  }

  const cells: (number | null)[] = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: last.getDate() }, (_, i) => i + 1),
  ]
  const today = toISO(now)

  return (
    <div>
      <header className="mb-3 flex items-center justify-between">
        <button className="p-2 text-2xl" onClick={() => go(-1)}>‹</button>
        <h1 className="text-xl font-bold">{y}년 {m}월</h1>
        <button className="p-2 text-2xl" onClick={() => go(1)}>›</button>
      </header>
      {!(y === now.getFullYear() && m === now.getMonth() + 1) && (
        <div className="mb-3 text-center">
          <button className="rounded-full border px-3 py-1 text-sm" onClick={() => nav('/month')}>오늘로</button>
        </div>
      )}
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-7 items-stretch gap-px overflow-hidden rounded-xl border bg-gray-200 text-xs">
        {HEAD.map((h) => (
          <div key={h} className="bg-gray-50 py-1 text-center font-bold">{h}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="bg-white" />
          const date = toISO(new Date(y, m - 1, day))
          const names = (slot: string) =>
            plans.find((p) => p.date === date && p.slot === slot)?.meal_items.map((it) => it.label) ?? []
          return (
            <Link
              key={i}
              to={`/day/${date}`}
              className={`min-h-24 min-w-0 bg-white p-1 ${date === today ? 'bg-orange-50' : ''}`}
            >
              <div className={`font-bold ${date === today ? 'text-orange-600' : ''}`}>{day}</div>
              <div className="space-y-1 text-[11px] leading-tight text-gray-600">
                {(['lunch', 'dinner'] as const).map((slot) =>
                  names(slot).length > 0 ? (
                    <div key={slot}>
                      <span>{slot === 'lunch' ? '🌞' : '🌙'}</span>
                      {names(slot).map((n, k) => (
                        <p key={k} className="break-words">{n}</p>
                      ))}
                    </div>
                  ) : null,
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
