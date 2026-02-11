/**
 * Firestore Storage Layer for Daily Progress
 * 
 * Pure functions for storing and retrieving daily progress data in Firestore.
 * Data stored under: /users/{userId}/dailyProgress/{YYYY-MM-DD}
 * 
 * Implements same interface as localStorage storage for easy migration.
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  type DocumentReference,
  type DocumentSnapshot,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { DailyProgress } from '../data/types'

/**
 * Type guard to check if error is a FirestoreError
 */
const isFirestoreError = (error: unknown): error is FirestoreError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

/**
 * Creates a document reference for daily progress
 * Pure function - no side effects
 */
const getDocRef = (userId: string, date: string): DocumentReference<DailyProgress> => {
  return doc(db, 'users', userId, 'dailyProgress', date) as DocumentReference<DailyProgress>
}

/**
 * Get daily progress for a specific user and date
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @returns DailyProgress data or null if not found
 * @throws Error with user-friendly message on failure
 */
export const getDailyProgress = async (
  userId: string,
  date: string
): Promise<DailyProgress | null> => {
  try {
    const docRef = getDocRef(userId, date)
    const docSnap: DocumentSnapshot<DailyProgress> = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  } catch (error) {
    if (isFirestoreError(error)) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to view this data')
        case 'unavailable':
          throw new Error('Service temporarily unavailable. Please try again.')
        case 'unauthenticated':
          throw new Error('Please sign in to view your progress')
        default:
          console.error(`Firestore error [${error.code}]:`, error.message)
          throw new Error('Failed to retrieve daily progress')
      }
    }
    console.error('Unexpected error getting daily progress:', error)
    throw new Error('Failed to retrieve daily progress')
  }
}

/**
 * Save daily progress for a specific user and date
 * Creates new document or overwrites existing one
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @param data - DailyProgress data to save
 * @throws Error with user-friendly message on failure
 */
export const saveDailyProgress = async (
  userId: string,
  date: string,
  data: DailyProgress
): Promise<void> => {
  try {
    const docRef = getDocRef(userId, date)
    
    // Add userId and date to data (required by Firestore rules)
    const dataWithMetadata = {
      ...data,
      userId,
      date,
    }
    
    // Use setDoc to create or overwrite document
    // This matches localStorage behavior where set() overwrites
    await setDoc(docRef, dataWithMetadata)
  } catch (error) {
    if (isFirestoreError(error)) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to save this data')
        case 'invalid-argument':
          throw new Error('Invalid data provided')
        case 'unavailable':
          throw new Error('Service temporarily unavailable. Please try again.')
        case 'unauthenticated':
          throw new Error('Please sign in to save your progress')
        default:
          console.error(`Firestore error [${error.code}]:`, error.message)
          throw new Error('Failed to save daily progress')
      }
    }
    console.error('Unexpected error saving daily progress:', error)
    throw new Error('Failed to save daily progress')
  }
}

/**
 * Delete daily progress for a specific user and date
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @throws Error with user-friendly message on failure
 */
export const deleteDailyProgress = async (
  userId: string,
  date: string
): Promise<void> => {
  try {
    const docRef = getDocRef(userId, date)
    await deleteDoc(docRef)
  } catch (error) {
    if (isFirestoreError(error)) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to delete this data')
        case 'not-found':
          // Document already deleted or doesn't exist - not an error
          return
        case 'unavailable':
          throw new Error('Service temporarily unavailable. Please try again.')
        case 'unauthenticated':
          throw new Error('Please sign in to delete your progress')
        default:
          console.error(`Firestore error [${error.code}]:`, error.message)
          throw new Error('Failed to delete daily progress')
      }
    }
    console.error('Unexpected error deleting daily progress:', error)
    throw new Error('Failed to delete daily progress')
  }
}
