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

export type ActivityStatus = 'pending' | 'completed' | 'skipped' | 'postponed' | 'missed'

export interface ActivityState {
  readonly status: ActivityStatus
  readonly timestamp?: number
  readonly postponedTo?: string
  readonly note?: string
}

export interface MealActivity extends ActivityState {
  readonly mealId: string
}

export interface SupplementActivity extends ActivityState {
  readonly supplementId: string
}

export interface AdherenceMetrics {
  readonly meals: {
    readonly expected: number
    readonly completed: number
    readonly skipped: number
    readonly postponed: number
    readonly missed: number
  }
  readonly supplements: {
    readonly expected: number
    readonly completed: number
    readonly skipped: number
    readonly postponed: number
    readonly missed: number
  }
  readonly water: {
    readonly expected: number
    readonly actual: number
  }
  readonly training: {
    readonly expected: boolean
    readonly completed: boolean
  }
}

export interface DailyProgress {
  readonly date: string
  readonly checkedFoods: Record<string, readonly string[]>
  readonly checkedSupplements: readonly string[]
  readonly waterMl: number
  readonly mealActivities?: Record<string, ActivityState>
  readonly supplementActivities?: Record<string, ActivityState>
  readonly trainingActivity?: ActivityState
}
