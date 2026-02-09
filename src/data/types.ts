export type DayType = 'training' | 'rest'

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Macros {
  readonly kcal: number
  readonly protein: number
  readonly carbs: number
  readonly fat: number
  readonly fiber: number
}

export interface FoodItem {
  readonly name: string
  readonly quantity: string
  readonly tags?: readonly string[]
}

export interface Meal {
  readonly id: string
  readonly name: string
  readonly time: string
  readonly foods: readonly FoodItem[]
  readonly macros: Macros
  readonly supplements?: readonly string[]
  readonly note?: string
  readonly isOptional?: boolean
}

export interface DayPlan {
  readonly weekday: Weekday
  readonly label: string
  readonly shortLabel: string
  readonly dayType: DayType
  readonly training?: string
  readonly meals: readonly Meal[]
  readonly targets: Macros
  readonly waterLiters: number
}

export interface Supplement {
  readonly id: string
  readonly name: string
  readonly time: string
  readonly withMeal: string
  readonly note?: string
  readonly trainingOnly?: boolean
}

export interface DailyProgress {
  readonly date: string
  readonly checkedFoods: Record<string, readonly string[]>
  readonly checkedSupplements: readonly string[]
  readonly waterMl: number
}
