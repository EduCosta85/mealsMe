/**
 * useFirestoreDailyProgress Hook
 * 
 * Custom hook for real-time Firestore sync of daily progress data.
 * Automatically subscribes to Firestore changes and provides CRUD operations.
 * 
 * Features:
 * - Real-time sync via onSnapshot listener
 * - Automatic subscription/unsubscription lifecycle management
 * - User authentication validation
 * - Loading and error state management
 * - User-scoped data access (users/{userId}/dailyProgress/{date})
 * 
 * @example
 * ```tsx
 * function DailyTracker() {
 *   const { user } = useAuth();
 *   const { progress, loading, error, updateProgress } = useFirestoreDailyProgress('2026-02-10');
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       <h2>Water: {progress?.waterMl || 0}ml</h2>
 *       <button onClick={() => updateProgress({ ...progress, waterMl: 500 })}>
 *         Update Water
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, type FirestoreError } from 'firebase/firestore'
import { db } from '../config/firebase'
import { saveDailyProgress } from '../lib/firestore-storage'
import { useAuth } from './useAuth'
import type { DailyProgress } from '../data/types'

interface UseFirestoreDailyProgressReturn {
  readonly progress: DailyProgress | null
  readonly loading: boolean
  readonly error: string | null
  readonly updateProgress: (data: DailyProgress) => Promise<void>
}

/**
 * Hook for real-time Firestore sync of daily progress
 * 
 * @param date - Date in YYYY-MM-DD format
 * @returns Progress data, loading state, error state, and update function
 */
export function useFirestoreDailyProgress(
  date: string
): UseFirestoreDailyProgressReturn {
  const { user } = useAuth()
  const userId = user?.uid

  const [progress, setProgress] = useState<DailyProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Validate date format
  useEffect(() => {
    if (date && !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error('Invalid date format:', date)
      setError('Invalid date format. Expected YYYY-MM-DD')
      setLoading(false)
    }
  }, [date])

  // Real-time listener setup
  useEffect(() => {
    // Return early if user not authenticated
    if (!userId) {
      setProgress(null)
      setLoading(false)
      setError(null)
      return
    }

    // Return early if date is invalid
    if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setLoading(false)
      return
    }

    // Build document path: users/{userId}/dailyProgress/{date}
    const docPath = `users/${userId}/dailyProgress/${date}`
    const docRef = doc(db, docPath)

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProgress(snapshot.data() as DailyProgress)
        } else {
          // Document doesn't exist yet - return null (not an error)
          setProgress(null)
        }
        setLoading(false)
        setError(null)
      },
      (err: FirestoreError) => {
        console.error('Firestore listener error:', err)
        
        // Handle specific Firebase errors with user-friendly messages
        if (err.code === 'permission-denied') {
          setError('You do not have permission to access this data')
        } else if (err.code === 'unavailable') {
          setError('Service temporarily unavailable. Please try again.')
        } else if (err.code === 'unauthenticated') {
          setError('Please sign in to view your progress')
        } else {
          setError('Failed to sync daily progress')
        }
        
        setLoading(false)
      }
    )

    // Cleanup on unmount or dependency change
    return () => unsubscribe()
  }, [userId, date])

  /**
   * Update daily progress in Firestore
   * Uses saveDailyProgress from firestore-storage.ts
   * 
   * @param data - Complete DailyProgress object to save
   * @throws Error if user not authenticated or save fails
   */
  const updateProgress = useCallback(
    async (data: DailyProgress): Promise<void> => {
      if (!userId) {
        throw new Error('User must be authenticated to update progress')
      }

      if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD')
      }

      try {
        await saveDailyProgress(userId, date, data)
        // No need to update local state - onSnapshot listener will handle it
      } catch (err) {
        console.error('Failed to update progress:', err)
        // Re-throw to allow caller to handle error
        throw err
      }
    },
    [userId, date]
  )

  return {
    progress,
    loading,
    error,
    updateProgress,
  } as const
}
