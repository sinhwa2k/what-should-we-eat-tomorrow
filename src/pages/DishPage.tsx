import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteDish, getDish, updateDish, uploadPhoto } from '../lib/api'
import type { Dish } from '../lib/types'

const FIELDS: { key: 'ingredients' | 'recipe' | 'memo'; title: string; rows: number }[] = [
  { key: 'ingredients', title: '재료', rows: 5 },
  { key: 'recipe', title: '레시피', rows: 12 },
  { key: 'memo', title: '메모', rows: 3 },
]

export default function DishPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const [dish, setDish] = useState<Dish | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getDish(id).then(setDish).catch((e) => setError(e.message))
  }, [id])

  if (!dish && error) return <p className="text-red-600">{error}</p>
  if (!dish) return <p>불러오는 중…</p>

  async function save() {
    if (!dish) return
    try {
      await updateDish(dish.id, {
        name: dish.name,
        ingredients: dish.ingredients,
        recipe: dish.recipe,
        memo: dish.memo,
      })
      setEditing(false)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => nav(-1)} className="p-2">‹ 뒤로</button>
        {editing ? (
          <button onClick={save} className="rounded-xl bg-orange-500 px-4 py-2 text-white">저장</button>
        ) : (
          <button onClick={() => setEditing(true)} className="rounded-xl border px-4 py-2">편집</button>
        )}
      </div>
      {editing ? (
        <input
          className="mb-4 w-full rounded-xl border px-3 py-2 text-xl font-bold"
          value={dish.name}
          onChange={(e) => setDish({ ...dish, name: e.target.value })}
        />
      ) : (
        <h1 className="mb-4 text-2xl font-bold">{dish.name}</h1>
      )}
      {dish.photo_url && (
        <img src={dish.photo_url} alt={dish.name} className="mb-4 w-full rounded-2xl object-cover" />
      )}
      {editing && (
        <label className="mb-4 block rounded-xl border border-dashed px-4 py-3 text-center text-sm">
          {dish.photo_url ? '사진 바꾸기' : '사진 추가 (촬영/앨범)'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f || !dish) return
              try {
                const url = await uploadPhoto(dish.id, f)
                setDish({ ...dish, photo_url: url })
              } catch (err) {
                setError((err as Error).message)
              }
            }}
          />
        </label>
      )}
      {FIELDS.map(({ key, title, rows }) => (
        <section key={key} className="mb-4">
          <h2 className="mb-1 font-bold text-orange-600">{title}</h2>
          {editing ? (
            <textarea
              rows={rows}
              className="w-full rounded-xl border px-3 py-2"
              value={dish[key] ?? ''}
              onChange={(e) => setDish({ ...dish, [key]: e.target.value })}
            />
          ) : (
            <p className="whitespace-pre-wrap text-lg leading-relaxed">
              {dish[key] || <span className="text-gray-400">없음</span>}
            </p>
          )}
        </section>
      ))}
      {editing && (
        <button
          className="mt-4 text-sm text-red-600"
          onClick={async () => {
            if (confirm('이 메뉴를 삭제할까요? 식단에는 이름만 남습니다.')) {
              await deleteDish(dish.id)
              nav('/dishes')
            }
          }}
        >
          메뉴 삭제
        </button>
      )}
    </div>
  )
}
