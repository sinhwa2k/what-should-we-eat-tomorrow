import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addItem, createDish, getDay, listDishes, removeItem } from '../lib/api'
import { label, shift } from '../lib/date'
import type { Dish, MealPlan, Slot } from '../lib/types'

const SLOTS: { slot: Slot; title: string }[] = [
  { slot: 'lunch', title: '🌞 점심' },
  { slot: 'dinner', title: '🌙 저녁' },
]

export default function DayPage() {
  const { date = '' } = useParams()
  const nav = useNavigate()
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setPlans(await getDay(date))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [date])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <button className="p-2 text-2xl" onClick={() => nav(`/day/${shift(date, -1)}`)}>‹</button>
        <h1 className="text-xl font-bold">{label(date)}</h1>
        <button className="p-2 text-2xl" onClick={() => nav(`/day/${shift(date, 1)}`)}>›</button>
      </header>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="space-y-4">
        {SLOTS.map(({ slot, title }) => {
          const items = plans.find((p) => p.slot === slot)?.meal_items ?? []
          return (
            <section key={slot} className="rounded-2xl border bg-orange-50 p-4">
              <h2 className="mb-3 font-bold">{title}</h2>
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-lg">
                    {it.dish_id ? (
                      <Link to={`/dish/${it.dish_id}`} className="flex-1">{it.label}</Link>
                    ) : (
                      <span className="flex-1">{it.label}</span>
                    )}
                    <button
                      className="px-2 text-gray-400"
                      aria-label="삭제"
                      onClick={async () => {
                        await removeItem(it.id)
                        load()
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
                {items.length === 0 && <li className="text-sm text-gray-400">비어 있음</li>}
              </ul>
              <AddItem date={date} slot={slot} onAdded={load} />
            </section>
          )
        })}
      </div>
    </div>
  )
}

function AddItem({ date, slot, onAdded }: { date: string; slot: Slot; onAdded: () => void }) {
  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState<Dish[]>([])

  useEffect(() => {
    if (!text.trim()) {
      setSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      try {
        setSuggestions(await listDishes(text))
      } catch {
        setSuggestions([])
      }
    }, 200)
    return () => clearTimeout(t)
  }, [text])

  async function submit(name: string, dishId: string | null) {
    const n = name.trim()
    if (!n) return
    let id = dishId
    if (!id && n !== '외식') {
      const exact = (await listDishes(n)).find((d) => d.name === n)
      id = (exact ?? (await createDish(n))).id
    }
    await addItem(date, slot, n, id)
    setText('')
    setSuggestions([])
    onAdded()
  }

  return (
    <div className="mt-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit(text, null)
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-xl border bg-white px-3 py-2"
          placeholder="메뉴 추가 (이전 메뉴 검색)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="rounded-xl bg-orange-500 px-4 py-2 text-white">추가</button>
      </form>
      {suggestions.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((d) => (
            <li key={d.id}>
              <button
                className="rounded-full border bg-white px-3 py-1 text-sm"
                onClick={() => submit(d.name, d.id)}
              >
                {d.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
