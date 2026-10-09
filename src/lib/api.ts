import { supabase } from './supabase'
import type { Dish, MealPlan, Slot } from './types'

function check<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message)
  return res.data as NonNullable<T>
}

export async function getDay(date: string): Promise<MealPlan[]> {
  const res = await supabase
    .from('meal_plans')
    .select('*, meal_items(*, dishes(photo_url))')
    .eq('date', date)
  const plans = check(res) as MealPlan[]
  plans.forEach((p) => p.meal_items.sort((a, b) => a.position - b.position))
  return plans
}

export async function addItem(date: string, slot: Slot, label: string, dishId: string | null) {
  const plan = check(
    await supabase
      .from('meal_plans')
      .upsert({ date, slot }, { onConflict: 'date,slot' })
      .select()
      .single(),
  )
  const existing = check(
    await supabase.from('meal_items').select('position').eq('plan_id', plan.id),
  )
  const position = existing.reduce((m, r) => Math.max(m, r.position + 1), 0)
  check(
    await supabase
      .from('meal_items')
      .insert({ plan_id: plan.id, dish_id: dishId, label, position }),
  )
}

export async function removeItem(id: string) {
  check(await supabase.from('meal_items').delete().eq('id', id))
}

export async function listDishes(q = ''): Promise<Dish[]> {
  let query = supabase.from('dishes').select('*').order('name').limit(50)
  if (q.trim()) query = query.ilike('name', `%${q.trim()}%`)
  return check(await query) as Dish[]
}

export async function createDish(name: string): Promise<Dish> {
  return check(await supabase.from('dishes').insert({ name }).select().single()) as Dish
}

export async function getDish(id: string): Promise<Dish> {
  return check(await supabase.from('dishes').select('*').eq('id', id).single()) as Dish
}

export async function updateDish(id: string, patch: Partial<Omit<Dish, 'id'>>) {
  check(await supabase.from('dishes').update(patch).eq('id', id))
}

export async function deleteDish(id: string) {
  check(await supabase.from('dishes').delete().eq('id', id))
}

export async function getRange(from: string, to: string): Promise<MealPlan[]> {
  const res = await supabase
    .from('meal_plans')
    .select('*, meal_items(*)')
    .gte('date', from)
    .lte('date', to)
  const plans = check(res) as MealPlan[]
  plans.forEach((p) => p.meal_items.sort((a, b) => a.position - b.position))
  return plans
}

const MAX_SIDE = 1280

// returns null when the canvas came out blank (iOS Safari can do that)
async function draw(source: CanvasImageSource, w: number, h: number): Promise<Blob | null> {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)

  const probe = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  let lit = 0
  for (let i = 0; i < probe.length; i += 4 * 97) {
    if (probe[i] + probe[i + 1] + probe[i + 2] > 30) lit++
  }
  if (lit === 0) return null

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8))
}

// <img> applies EXIF rotation in every modern browser; keep the object URL alive until drawn
async function viaImg(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return await draw(img, img.naturalWidth, img.naturalHeight)
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function viaBitmap(file: File): Promise<Blob | null> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    return await draw(bmp, bmp.width, bmp.height)
  } finally {
    bmp.close()
  }
}

async function resize(file: File): Promise<Blob> {
  for (const attempt of [viaImg, viaBitmap]) {
    try {
      const blob = await attempt(file)
      if (blob) return blob
    } catch {
      // try the next decoder
    }
  }
  return file // last resort: upload the original
}

export async function uploadPhoto(dishId: string, file: File): Promise<string> {
  const blob = await resize(file)
  const path = `${dishId}/${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from('dish-photos')
    .upload(path, blob, { contentType: blob.type || 'image/jpeg' })
  if (error) throw new Error(error.message)
  const url = supabase.storage.from('dish-photos').getPublicUrl(path).data.publicUrl
  await updateDish(dishId, { photo_url: url })
  return url
}
