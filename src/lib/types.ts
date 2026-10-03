export type Slot = 'lunch' | 'dinner'

export interface Dish {
  id: string
  name: string
  photo_url: string | null
  ingredients: string | null
  recipe: string | null
  memo: string | null
}

export interface MealItem {
  id: string
  plan_id: string
  dish_id: string | null
  label: string
  position: number
}

export interface MealPlan {
  id: string
  date: string
  slot: Slot
  meal_items: MealItem[]
}
