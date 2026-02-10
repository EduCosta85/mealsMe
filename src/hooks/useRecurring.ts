import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import type { RecurringExpense } from '../data/finance-types'

interface UseRecurringOptions {
  readonly userId: string
}

interface UseRecurringReturn {
  readonly recurring: readonly RecurringExpense[]
  readonly loading: boolean
  readonly error: string | null
  readonly createRecurring: (
    recurring: Omit<RecurringExpense, 'id' | 'createdAt' | 'userId'>,
  ) => Promise<string>
  readonly updateRecurring: (
    id: string,
    updates: Partial<RecurringExpense>,
  ) => Promise<void>
  readonly deleteRecurring: (id: string) => Promise<void>
  readonly getActiveRecurring: () => readonly RecurringExpense[]
  readonly getRecurringByCategory: (
    categoryId: string,
  ) => readonly RecurringExpense[]
}

/**
 * Specialized hook for managing recurring expenses
 *
 * Wraps useFirestore to provide CRUD operations and query helpers
 * for recurring expenses with automatic field management.
 *
 * @param options - Configuration with userId
 * @returns CRUD operations and query helpers for recurring expenses
 *
 * @example
 * ```tsx
 * const { recurring, loading, createRecurring, getActiveRecurring } =
 *   useRecurring({ userId: user.uid });
 *
 * const activeRecurring = getActiveRecurring();
 *
 * await createRecurring({
 *   amount: 1200.00,
 *   category: 'housing-category-id',
 *   description: 'Aluguel',
 *   dayOfMonth: 5,
 *   isActive: true,
 *   paymentMethod: 'debit',
 *   startDate: Date.now()
 * });
 * ```
 */
export function useRecurring(
  options: UseRecurringOptions,
): UseRecurringReturn {
  const { userId } = options

  const {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteDoc,
  } = useFirestore<RecurringExpense>({
    userId,
    collectionPath: 'recurring',
  })

  /**
   * Create a new recurring expense with automatic field management
   * Automatically adds createdAt, updatedAt, and userId fields
   */
  const createRecurring = useCallback(
    async (
      recurring: Omit<RecurringExpense, 'id' | 'createdAt' | 'userId'>,
    ): Promise<string> => {
      // Validate required fields
      if (!recurring.amount || recurring.amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }
      if (!recurring.category) {
        throw new Error('Category is required')
      }
      if (!recurring.description) {
        throw new Error('Description is required')
      }
      if (
        !recurring.dayOfMonth ||
        recurring.dayOfMonth < 1 ||
        recurring.dayOfMonth > 31
      ) {
        throw new Error('Day of month must be between 1 and 31')
      }
      if (recurring.isActive === undefined) {
        throw new Error('isActive is required')
      }

      const now = Date.now()
      const newRecurring = {
        ...recurring,
        createdAt: now,
        updatedAt: now,
        userId,
      }

      return create(newRecurring)
    },
    [create, userId],
  )

  /**
   * Update a recurring expense with automatic updatedAt timestamp
   */
  const updateRecurring = useCallback(
    async (id: string, updates: Partial<RecurringExpense>): Promise<void> => {
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: Date.now(),
      }
      return update(id, updatesWithTimestamp)
    },
    [update],
  )

  /**
   * Filter only active recurring expenses (isActive === true)
   */
  const getActiveRecurring = useCallback((): readonly RecurringExpense[] => {
    return data.filter((rec) => rec.isActive)
  }, [data])

  /**
   * Filter recurring expenses by category
   */
  const getRecurringByCategory = useCallback(
    (categoryId: string): readonly RecurringExpense[] => {
      return data.filter((rec) => rec.category === categoryId)
    },
    [data],
  )

  return {
    recurring: data as readonly RecurringExpense[],
    loading,
    error,
    createRecurring,
    updateRecurring,
    deleteRecurring: deleteDoc,
    getActiveRecurring,
    getRecurringByCategory,
  } as const
}
