import { useCallback } from 'react'
import { useStorage } from './use-storage'
import { todayKey } from '../lib/date-utils'
import type { Mesocycle, TrainingProgress } from '../data/training-types'

const EMPTY_PROGRESS: TrainingProgress = {
  date: '',
  mesocycle: 1,
  checkedWarmup: [],
  checkedExercises: [],
  checkedCooldown: [],
  checkedCorrectivos: [],
  lissCompleted: false,
  notes: '',
  customLoads: {},
  startedAt: null,
}

const buildKey = (dateKey: string) => `training_${dateKey}`

// Ensure backward compat: old stored data may lack new fields
const withDefaults = (p: TrainingProgress): TrainingProgress => ({
  ...EMPTY_PROGRESS,
  ...p,
})

export function useTrainingTracker(dateKey?: string) {
  const key = dateKey ?? todayKey()
  const [progress, setProgress] = useStorage<TrainingProgress>(
    buildKey(key),
    { ...EMPTY_PROGRESS, date: key },
  )

  const validProgress =
    progress.date === key ? withDefaults(progress) : { ...EMPTY_PROGRESS, date: key }

  const toggleWarmup = useCallback(
    (itemId: string) => {
      setProgress((prev) => {
        const current = prev.date === key ? withDefaults(prev) : { ...EMPTY_PROGRESS, date: key }
        const isChecked = current.checkedWarmup.includes(itemId)
        return {
          ...current,
          startedAt: current.startedAt ?? Date.now(),
          checkedWarmup: isChecked
            ? current.checkedWarmup.filter((id) => id !== itemId)
            : [...current.checkedWarmup, itemId],
        }
      })
    },
    [setProgress, key],
  )

  const toggleExercise = useCallback(
    (exerciseKey: string) => {
      setProgress((prev) => {
        const current = prev.date === key ? withDefaults(prev) : { ...EMPTY_PROGRESS, date: key }
        const isChecked = current.checkedExercises.includes(exerciseKey)
        return {
          ...current,
          startedAt: current.startedAt ?? Date.now(),
          checkedExercises: isChecked
            ? current.checkedExercises.filter((id) => id !== exerciseKey)
            : [...current.checkedExercises, exerciseKey],
        }
      })
    },
    [setProgress, key],
  )

  const toggleCooldown = useCallback(
    (itemId: string) => {
      setProgress((prev) => {
        const current = prev.date === key ? withDefaults(prev) : { ...EMPTY_PROGRESS, date: key }
        const isChecked = current.checkedCooldown.includes(itemId)
        return {
          ...current,
          startedAt: current.startedAt ?? Date.now(),
          checkedCooldown: isChecked
            ? current.checkedCooldown.filter((id) => id !== itemId)
            : [...current.checkedCooldown, itemId],
        }
      })
    },
    [setProgress, key],
  )

  const toggleCorrective = useCallback(
    (itemId: string) => {
      setProgress((prev) => {
        const current = prev.date === key ? withDefaults(prev) : { ...EMPTY_PROGRESS, date: key }
        const isChecked = current.checkedCorrectivos.includes(itemId)
        return {
          ...current,
          checkedCorrectivos: isChecked
            ? current.checkedCorrectivos.filter((id) => id !== itemId)
            : [...current.checkedCorrectivos, itemId],
        }
      })
    },
    [setProgress, key],
  )

  const toggleLiss = useCallback(() => {
    setProgress((prev) => {
      const current = prev.date === key ? withDefaults(prev) : { ...EMPTY_PROGRESS, date: key }
      return { ...current, lissCompleted: !current.lissCompleted }
    })
  }, [setProgress, key])

  const setCustomLoad = useCallback(
    (exerciseId: string, load: string) => {
      setProgress((prev) => {
        const current = prev.date === key ? withDefaults(prev) : { ...EMPTY_PROGRESS, date: key }
        const updated = { ...current.customLoads }
        if (load) {
          updated[exerciseId] = load
        } else {
          delete updated[exerciseId]
        }
        return { ...current, customLoads: updated }
      })
    },
    [setProgress, key],
  )

  const getCustomLoad = useCallback(
    (exerciseId: string): string | null => validProgress.customLoads[exerciseId] ?? null,
    [validProgress.customLoads],
  )

  const isWarmupChecked = useCallback(
    (itemId: string): boolean => validProgress.checkedWarmup.includes(itemId),
    [validProgress.checkedWarmup],
  )

  const isExerciseChecked = useCallback(
    (exerciseKey: string): boolean => validProgress.checkedExercises.includes(exerciseKey),
    [validProgress.checkedExercises],
  )

  const isCooldownChecked = useCallback(
    (itemId: string): boolean => validProgress.checkedCooldown.includes(itemId),
    [validProgress.checkedCooldown],
  )

  const isCorrectiveChecked = useCallback(
    (itemId: string): boolean => validProgress.checkedCorrectivos.includes(itemId),
    [validProgress.checkedCorrectivos],
  )

  return {
    progress: validProgress,
    toggleWarmup,
    toggleExercise,
    toggleCooldown,
    toggleCorrective,
    toggleLiss,
    setCustomLoad,
    getCustomLoad,
    isWarmupChecked,
    isExerciseChecked,
    isCooldownChecked,
    isCorrectiveChecked,
  } as const
}

export function useMesocycle() {
  const [mesocycle, setMesocycle] = useStorage<Mesocycle>('mesocycle', 1)

  const changeMesocycle = useCallback(
    (m: Mesocycle) => setMesocycle(m),
    [setMesocycle],
  )

  return { mesocycle, changeMesocycle } as const
}
