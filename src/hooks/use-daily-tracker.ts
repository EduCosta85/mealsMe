import { useCallback } from 'react'
import { useStorage } from './use-storage'
import { todayKey } from '../lib/date-utils'
import type { DailyProgress, ActivityStatus, ActivityState } from '../data/types'

const EMPTY_PROGRESS: DailyProgress = {
  date: '',
  checkedFoods: {},
  checkedSupplements: [],
  waterMl: 0,
}

const buildKey = (dateKey: string) => `progress_${dateKey}`

export function useDailyTracker(dateKey?: string) {
  const key = dateKey ?? todayKey()
  const [progress, setProgress] = useStorage<DailyProgress>(
    buildKey(key),
    { ...EMPTY_PROGRESS, date: key },
  )

  const validProgress =
    progress.date === key ? progress : { ...EMPTY_PROGRESS, date: key }

  const toggleFood = useCallback(
    (mealId: string, foodIndex: number) => {
      setProgress((prev) => {
        const current = prev.date === key ? prev : { ...EMPTY_PROGRESS, date: key }
        const mealChecked = current.checkedFoods[mealId] ?? []
        const foodKey = String(foodIndex)
        const isChecked = mealChecked.includes(foodKey)

        const nextMealChecked = isChecked
          ? mealChecked.filter((f) => f !== foodKey)
          : [...mealChecked, foodKey]

        return {
          ...current,
          checkedFoods: {
            ...current.checkedFoods,
            [mealId]: nextMealChecked,
          },
        }
      })
    },
    [setProgress, key],
  )

  const isFoodChecked = useCallback(
    (mealId: string, foodIndex: number): boolean => {
      const mealChecked = validProgress.checkedFoods[mealId] ?? []
      return mealChecked.includes(String(foodIndex))
    },
    [validProgress.checkedFoods],
  )

  const toggleSupplement = useCallback(
    (supplementId: string) => {
      setProgress((prev) => {
        const current = prev.date === key ? prev : { ...EMPTY_PROGRESS, date: key }
        const isChecked = current.checkedSupplements.includes(supplementId)

        return {
          ...current,
          checkedSupplements: isChecked
            ? current.checkedSupplements.filter((s) => s !== supplementId)
            : [...current.checkedSupplements, supplementId],
        }
      })
    },
    [setProgress, key],
  )

  const isSupplementChecked = useCallback(
    (supplementId: string): boolean =>
      validProgress.checkedSupplements.includes(supplementId),
    [validProgress.checkedSupplements],
  )

  const addWater = useCallback(
    (ml: number) => {
      setProgress((prev) => {
        const current = prev.date === key ? prev : { ...EMPTY_PROGRESS, date: key }
        return {
          ...current,
          waterMl: Math.max(0, current.waterMl + ml),
        }
      })
    },
    [setProgress, key],
  )

  const getMealProgress = useCallback(
    (mealId: string, totalFoods: number): number => {
      const checked = (validProgress.checkedFoods[mealId] ?? []).length
      return totalFoods === 0 ? 0 : Math.round((checked / totalFoods) * 100)
    },
    [validProgress.checkedFoods],
  )

  const setMealActivity = useCallback(
    (mealId: string, status: ActivityStatus, options?: { postponedTo?: string; note?: string }) => {
      setProgress((prev) => {
        const current = prev.date === key ? prev : { ...EMPTY_PROGRESS, date: key }
        const activityState: ActivityState = {
          status,
          timestamp: Date.now(),
          ...(options?.postponedTo && { postponedTo: options.postponedTo }),
          ...(options?.note && { note: options.note }),
        }

        return {
          ...current,
          mealActivities: {
            ...(current.mealActivities ?? {}),
            [mealId]: activityState,
          },
        }
      })
    },
    [setProgress, key],
  )

  const getMealActivity = useCallback(
    (mealId: string): ActivityState | undefined => {
      return validProgress.mealActivities?.[mealId]
    },
    [validProgress.mealActivities],
  )

  const setSupplementActivity = useCallback(
    (supplementId: string, status: ActivityStatus, options?: { postponedTo?: string; note?: string }) => {
      setProgress((prev) => {
        const current = prev.date === key ? prev : { ...EMPTY_PROGRESS, date: key }
        const activityState: ActivityState = {
          status,
          timestamp: Date.now(),
          ...(options?.postponedTo && { postponedTo: options.postponedTo }),
          ...(options?.note && { note: options.note }),
        }

        return {
          ...current,
          supplementActivities: {
            ...(current.supplementActivities ?? {}),
            [supplementId]: activityState,
          },
        }
      })
    },
    [setProgress, key],
  )

  const getSupplementActivity = useCallback(
    (supplementId: string): ActivityState | undefined => {
      return validProgress.supplementActivities?.[supplementId]
    },
    [validProgress.supplementActivities],
  )

  const setTrainingActivity = useCallback(
    (status: ActivityStatus, options?: { postponedTo?: string; note?: string }) => {
      setProgress((prev) => {
        const current = prev.date === key ? prev : { ...EMPTY_PROGRESS, date: key }
        const activityState: ActivityState = {
          status,
          timestamp: Date.now(),
          ...(options?.postponedTo && { postponedTo: options.postponedTo }),
          ...(options?.note && { note: options.note }),
        }

        return {
          ...current,
          trainingActivity: activityState,
        }
      })
    },
    [setProgress, key],
  )

  const getTrainingActivity = useCallback(
    (): ActivityState | undefined => {
      return validProgress.trainingActivity
    },
    [validProgress.trainingActivity],
  )

  const totalFoodsChecked = Object.values(validProgress.checkedFoods)
    .reduce((sum, arr) => sum + arr.length, 0)

  const totalSupplementsChecked = validProgress.checkedSupplements.length

  return {
    progress: validProgress,
    toggleFood,
    isFoodChecked,
    toggleSupplement,
    isSupplementChecked,
    addWater,
    getMealProgress,
    setMealActivity,
    getMealActivity,
    setSupplementActivity,
    getSupplementActivity,
    setTrainingActivity,
    getTrainingActivity,
    totalFoodsChecked,
    totalSupplementsChecked,
  } as const
}
