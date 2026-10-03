import { supabase } from './supabase'
import type { Dish, MealPlan, Slot } from './types'

function check<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message)
  return res.data as NonNullable<T>
}

export async function getDay(date: string): Promise<MealPlan[]> {
  const res = await supabase
    .from('meal_plans')
    .select('*, meal_items(*)')
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

async function resize(file: File, max = 1280): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('이미지 변환 실패'))), 'image/jpeg', 0.8),
  )
}

export async function uploadPhoto(dishId: string, file: File): Promise<string> {
  const blob = await resize(file)
  const path = `${dishId}/${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from('dish-photos')
    .upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw new Error(error.message)
  const url = supabase.storage.from('dish-photos').getPublicUrl(path).data.publicUrl
  await updateDish(dishId, { photo_url: url })
  return url
}
