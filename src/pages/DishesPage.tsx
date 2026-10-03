import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDishes } from '../lib/api'
import type { Dish } from '../lib/types'

export default function DishesPage() {
  const [q, setQ] = useState('')
  const [dishes, setDishes] = useState<Dish[]>([])

  useEffect(() => {
    const t = setTimeout(() => listDishes(q).then(setDishes).catch(() => setDishes([])), 200)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div>
      <h1 className="mb-3 text-xl font-bold">메뉴</h1>
      <input
        className="mb-3 w-full rounded-xl border px-3 py-2"
        placeholder="검색"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <ul className="space-y-2">
        {dishes.map((d) => (
          <li key={d.id}>
            <Link to={`/dish/${d.id}`} className="flex items-center justify-between rounded-xl border px-4 py-3">
              <span className="flex items-center gap-3">
                {d.photo_url && <img src={d.photo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                {d.name}
              </span>
              {d.recipe && <span className="text-xs text-gray-400">레시피 있음</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
