import { useMemo } from 'react'
import { useDailyTracker } from './use-daily-tracker'
import { getDayPlan } from '../data/meal-plan'
import { SUPPLEMENTS } from '../data/supplements'
import type { TimelineItem, TimelinePeriod } from '../lib/timeline-utils'
import { sortByTime, groupByPeriod } from '../lib/timeline-utils'
import { toDateKey, todayKey } from '../lib/date-utils'

interface UseTimelineDataReturn {
  readonly periods: readonly TimelinePeriod[]
  readonly loading: boolean
  readonly error: string | null
}

/**
 * Aggregates daily data (meals, supplements, training, water) into timeline format
 * 
 * Transforms data from multiple sources into sorted and grouped timeline items:
 * - Meals from DayPlan
 * - Supplements filtered by day type
 * - Training session from DayPlan
 * - Water goal from DayPlan
 * 
 * @param date - Optional date to get timeline for (defaults to today)
 * @returns Timeline periods with items, loading state, and error state
 * 
 * @example
 * const { periods, loading, error } = useTimelineData()
 * // periods = [{ name: 'Manhã', items: [...] }, ...]
 */
export function useTimelineData(date?: Date): UseTimelineDataReturn {
  const targetDate = date ?? new Date()
  const dateKey = date ? toDateKey(date) : todayKey()
  
  const { loading, error } = useDailyTracker(dateKey)
  const dayPlan = useMemo(() => getDayPlan(targetDate), [targetDate])

  const periods = useMemo(() => {
    const items: TimelineItem[] = []

    // 1. Add meals
    dayPlan.meals.forEach(meal => {
      items.push({
        id: meal.id,
        type: 'meal',
        time: meal.time,
        title: meal.name,
        description: `${meal.foods.length} items • ${meal.macros.kcal} kcal`,
        foods: meal.foods,
        macros: meal.macros
      })
    })

    // 2. Add supplements (filter by day type)
    const dayType = dayPlan.dayType
    const supplementsForDay = SUPPLEMENTS.filter(supplement => {
      // Include all supplements except training-only ones on rest days
      if (dayType === 'rest' && supplement.trainingOnly) {
        return false
      }
      return true
    })

    supplementsForDay.forEach(supplement => {
      items.push({
        id: supplement.id,
        type: 'supplement',
        time: supplement.time,
        title: supplement.name,
        description: supplement.withMeal
      })
    })

    // 3. Add training session (if training day)
    if (dayPlan.training) {
      items.push({
        id: 'training',
        type: 'training',
        time: '06:30', // Training typically starts after pre-workout
        title: dayPlan.training,
        description: 'Strength training session'
      })
    }

    // 4. Add water goal
    items.push({
      id: 'water',
      type: 'water',
      time: '23:59', // End of day tracking
      title: 'Water Goal',
      description: `${dayPlan.waterLiters}L daily target`,
      goal: dayPlan.waterLiters * 1000 // Convert to mL
    })

    // Sort all items by time
    const sortedItems = sortByTime(items)

    // Group by period (Manhã/Tarde/Noite)
    return groupByPeriod(sortedItems)
  }, [dayPlan])

  return {
    periods,
    loading,
    error: error ? String(error) : null
  }
}
