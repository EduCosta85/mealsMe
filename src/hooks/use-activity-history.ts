import { useMemo } from 'react'
import { useStorage } from './use-storage'
import type { DailyProgress, AdherenceMetrics } from '../data/types'

// Pure: generate date keys for the last N days
function generateDateKeys(days: number): string[] {
  const keys: string[] = []
  const today = new Date()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    keys.push(key)
  }
  
  return keys.reverse() // oldest first
}

// Pure: calculate adherence metrics from daily progress
function calculateAdherence(
  progressList: DailyProgress[],
  expectedMeals: number,
  expectedSupplements: number,
  expectedWaterMl: number,
): AdherenceMetrics {
  let mealsCompleted = 0
  let mealsSkipped = 0
  let mealsPostponed = 0
  let mealsMissed = 0
  
  let supplementsCompleted = 0
  let supplementsSkipped = 0
  let supplementsPostponed = 0
  let supplementsMissed = 0
  
  let totalWaterActual = 0
  let trainingExpectedDays = 0
  let trainingCompletedDays = 0
  
  progressList.forEach((progress) => {
    // Count meal activities
    if (progress.mealActivities) {
      Object.values(progress.mealActivities).forEach((activity) => {
        if (activity.status === 'completed') mealsCompleted++
        if (activity.status === 'skipped') mealsSkipped++
        if (activity.status === 'postponed') mealsPostponed++
        if (activity.status === 'missed') mealsMissed++
      })
    }
    
    // Count supplement activities
    if (progress.supplementActivities) {
      Object.values(progress.supplementActivities).forEach((activity) => {
        if (activity.status === 'completed') supplementsCompleted++
        if (activity.status === 'skipped') supplementsSkipped++
        if (activity.status === 'postponed') supplementsPostponed++
        if (activity.status === 'missed') supplementsMissed++
      })
    }
    
    // Sum water intake
    totalWaterActual += progress.waterMl
    
    // Count training days
    if (progress.trainingActivity) {
      trainingExpectedDays++
      if (progress.trainingActivity.status === 'completed') {
        trainingCompletedDays++
      }
    }
  })
  
  return {
    meals: {
      expected: expectedMeals * progressList.length,
      completed: mealsCompleted,
      skipped: mealsSkipped,
      postponed: mealsPostponed,
      missed: mealsMissed,
    },
    supplements: {
      expected: expectedSupplements * progressList.length,
      completed: supplementsCompleted,
      skipped: supplementsSkipped,
      postponed: supplementsPostponed,
      missed: supplementsMissed,
    },
    water: {
      expected: expectedWaterMl * progressList.length,
      actual: totalWaterActual,
    },
    training: {
      expected: trainingExpectedDays > 0,
      completed: trainingCompletedDays > 0,
    },
  }
}

export function useActivityHistory(days: 7 | 14 | 30) {
  const dateKeys = useMemo(() => generateDateKeys(days), [days])
  
  // Load all progress data for the date range
  const progressData = dateKeys.map((dateKey) => {
    const key = `progress_${dateKey}`
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [progress] = useStorage<DailyProgress>(key, {
      date: dateKey,
      checkedFoods: {},
      checkedSupplements: [],
      waterMl: 0,
    })
    return progress
  })
  
  // Calculate metrics
  const metrics = useMemo(
    () => calculateAdherence(progressData, 7, 11, 4000),
    [progressData],
  )
  
  return {
    dateKeys,
    progressData,
    metrics,
  }
}
