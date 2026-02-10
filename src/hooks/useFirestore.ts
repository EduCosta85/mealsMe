import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

interface UseFirestoreOptions {
  readonly userId: string
  readonly collectionPath: string
}

interface UseFirestoreReturn<T> {
  readonly data: readonly T[]
  readonly loading: boolean
  readonly error: string | null
  readonly create: (item: Omit<T, 'id'>) => Promise<string>
  readonly update: (id: string, updates: Partial<T>) => Promise<void>
  readonly delete: (id: string) => Promise<void>
  readonly refresh: () => Promise<void>
}

/**
 * Generic Firestore CRUD hook with real-time sync
 * 
 * Provides CRUD operations for any Firestore collection with automatic
 * real-time updates via onSnapshot listener.
 * 
 * @template T - Document type (must extend { id: string })
 * @param options - Configuration with userId and collectionPath
 * @returns CRUD operations and real-time data
 * 
 * @example
 * ```tsx
 * const { data: categories, loading, error, create, update, delete: deleteCategory } = 
 *   useFirestore<Category>({
 *     userId: user.uid,
 *     collectionPath: 'categories'
 *   });
 * ```
 */
export function useFirestore<T extends { id: string }>(
  options: UseFirestoreOptions,
): UseFirestoreReturn<T> {
  const { userId, collectionPath } = options

  const [data, setData] = useState<readonly T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Build collection path: users/{userId}/{collectionPath}
  const fullPath = `users/${userId}/${collectionPath}`

  // Real-time listener setup
  useEffect(() => {
    if (!userId || !collectionPath) {
      setLoading(false)
      return
    }

    const colRef = collection(db, fullPath)
    const q = query(colRef)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as T[]

        setData(items)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Firestore listener error:', err)
        setError('Erro ao carregar dados')
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [userId, collectionPath, fullPath])

  /**
   * Create a new document in Firestore
   * @param item - Document data (without id)
   * @returns Promise with new document ID
   */
  const create = useCallback(
    async (item: Omit<T, 'id'>): Promise<string> => {
      try {
        const colRef = collection(db, fullPath)
        const docRef = await addDoc(colRef, item as DocumentData)
        return docRef.id
      } catch (err) {
        console.error('Firestore create error:', err)
        setError('Erro ao criar item')
        throw err
      }
    },
    [fullPath],
  )

  /**
   * Update an existing document in Firestore
   * @param id - Document ID
   * @param updates - Partial document updates
   */
  const update = useCallback(
    async (id: string, updates: Partial<T>): Promise<void> => {
      try {
        const docRef = doc(db, fullPath, id)
        await updateDoc(docRef, updates as DocumentData)
      } catch (err) {
        console.error('Firestore update error:', err)
        setError('Erro ao atualizar item')
        throw err
      }
    },
    [fullPath],
  )

  /**
   * Delete a document from Firestore
   * @param id - Document ID
   */
  const deleteDoc_ = useCallback(
    async (id: string): Promise<void> => {
      try {
        const docRef = doc(db, fullPath, id)
        await deleteDoc(docRef)
      } catch (err) {
        console.error('Firestore delete error:', err)
        setError('Erro ao deletar item')
        throw err
      }
    },
    [fullPath],
  )

  /**
   * Refresh data (no-op since real-time listener handles updates)
   * Included for API compatibility
   */
  const refresh = useCallback(async (): Promise<void> => {
    // Real-time listener automatically refreshes data
    // This is a no-op but provided for API consistency
  }, [])

  return {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteDoc_,
    refresh,
  } as const
}
