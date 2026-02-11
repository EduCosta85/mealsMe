import { useState, useCallback, useEffect } from 'react'
import { storage } from '../lib/storage'
import { useFirestoreDailyProgress } from './useFirestoreDailyProgress'
import { useAuth } from './useAuth'
import type { DailyProgress } from '../data/types'

type UseStorageReturn<T> = readonly [T, (value: T | ((prev: T) => T)) => void, () => void]

/**
 * Unified storage hook that supports both localStorage and Firestore
 * 
 * - For daily progress keys (progress_YYYY-MM-DD): Uses Firestore with real-time sync
 * - For other keys: Uses localStorage for app settings
 * 
 * @param key - Storage key (e.g., 'theme', 'progress_2026-02-10')
 * @param initialValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 */
export function useStorage<T>(key: string, initialValue: T): UseStorageReturn<T> {
  const { user } = useAuth()
  
  // Detect if this is a daily progress key (progress_YYYY-MM-DD)
  const progressKeyMatch = key.match(/^progress_(\d{4}-\d{2}-\d{2})$/)
  const isProgressKey = progressKeyMatch !== null
  const dateKey = progressKeyMatch?.[1] ?? ''

  // Use Firestore for daily progress when user is authenticated
  const shouldUseFirestore = isProgressKey && user !== null
  
  // Firestore hook (only active when shouldUseFirestore is true)
  const { 
    progress: firestoreProgress, 
    loading: firestoreLoading, 
    error: firestoreError,
    updateProgress: firestoreUpdate 
  } = useFirestoreDailyProgress(shouldUseFirestore ? dateKey : '')

  // localStorage state (used for non-progress keys or when offline)
  const [localValue, setLocalValue] = useState<T>(() => {
    if (shouldUseFirestore) return initialValue
    const existing = storage.get<T>(key)
    if (existing !== null) return existing
    storage.set(key, initialValue)
    return initialValue
  })

  // Sync Firestore data to local state when loaded
  useEffect(() => {
    if (shouldUseFirestore && !firestoreLoading && firestoreProgress !== null) {
      setLocalValue(firestoreProgress as T)
    }
  }, [shouldUseFirestore, firestoreLoading, firestoreProgress])

  // Handle Firestore errors by falling back to localStorage
  useEffect(() => {
    if (firestoreError) {
      console.warn(`Firestore error for ${key}, falling back to localStorage:`, firestoreError)
    }
  }, [firestoreError, key])

  // Determine the current value
  const storedValue = shouldUseFirestore && !firestoreLoading && firestoreProgress !== null
    ? (firestoreProgress as T)
    : localValue

  // setValue function that handles both Firestore and localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const nextValue = value instanceof Function ? value(storedValue) : value

      if (shouldUseFirestore) {
        // Update Firestore (real-time listener will update local state)
        firestoreUpdate(nextValue as DailyProgress).catch((err) => {
          console.error('Failed to update Firestore, falling back to localStorage:', err)
          // Fallback to localStorage on error
          storage.set(key, nextValue)
          setLocalValue(nextValue)
        })
      } else {
        // Update localStorage
        storage.set(key, nextValue)
        setLocalValue(nextValue)
      }
    },
    [key, shouldUseFirestore, firestoreUpdate, storedValue],
  )

  // removeValue function that handles both Firestore and localStorage
  const removeValue = useCallback(() => {
    if (shouldUseFirestore) {
      // For Firestore, reset to initial value (don't delete the document)
      firestoreUpdate(initialValue as DailyProgress).catch((err) => {
        console.error('Failed to reset Firestore value:', err)
        storage.remove(key)
        setLocalValue(initialValue)
      })
    } else {
      // Remove from localStorage
      storage.remove(key)
      setLocalValue(initialValue)
    }
  }, [key, initialValue, shouldUseFirestore, firestoreUpdate])

  return [storedValue, setValue, removeValue] as const
}
