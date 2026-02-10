import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import type { Expense } from '../data/finance-types'

interface UseExpensesOptions {
  readonly userId: string
}

interface UseExpensesReturn {
  readonly expenses: readonly Expense[]
  readonly loading: boolean
  readonly error: string | null
  readonly createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'userId' | 'updatedAt'>) => Promise<string>
  readonly updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>
  readonly deleteExpense: (id: string) => Promise<void>
  readonly getExpensesByDateRange: (startDate: Date, endDate: Date) => readonly Expense[]
  readonly getExpensesByCategory: (category: string) => readonly Expense[]
  readonly getExpensesByMonth: (month: string) => readonly Expense[]
}

/**
 * Specialized hook for managing expenses with credit card installment support
 * 
 * Wraps useFirestore to provide expense-specific operations including:
 * - CRUD operations with automatic userId and timestamp injection
 * - Query helpers for date range, category, and month filtering
 * - Real-time sync inherited from useFirestore
 * 
 * @param options - Configuration with userId
 * @returns Expense operations and real-time data
 * 
 * @example
 * ```tsx
 * const { expenses, loading, createExpense, getExpensesByMonth } = 
 *   useExpenses({ userId: user.uid });
 * 
 * const monthExpenses = getExpensesByMonth('2026-02');
 * 
 * await createExpense({
 *   amount: 50.00,
 *   category: 'food',
 *   description: 'Almoço',
 *   date: Date.now(),
 *   paymentMethod: 'credit',
 *   isRecurring: false
 * });
 * ```
 */
export function useExpenses(options: UseExpensesOptions): UseExpensesReturn {
  const { userId } = options

  const {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteDoc,
  } = useFirestore<Expense>({
    userId,
    collectionPath: 'expenses',
  })

  /**
   * Create a new expense with automatic userId, createdAt, and updatedAt
   * Validates required fields before creation
   * 
   * @param expense - Expense data without id, createdAt, userId, updatedAt
   * @returns Promise with new expense ID
   */
  const createExpense = useCallback(
    async (
      expense: Omit<Expense, 'id' | 'createdAt' | 'userId' | 'updatedAt'>
    ): Promise<string> => {
      // Validate required fields
      if (!expense.amount || expense.amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }
      if (!expense.category) {
        throw new Error('Category is required')
      }
      if (!expense.description) {
        throw new Error('Description is required')
      }
      if (!expense.date) {
        throw new Error('Date is required')
      }
      if (!expense.paymentMethod) {
        throw new Error('Payment method is required')
      }

      const now = Date.now()
      const newExpense = {
        ...expense,
        userId,
        createdAt: now,
        updatedAt: now,
      }

      return create(newExpense as Omit<Expense, 'id'>)
    },
    [create, userId]
  )

  /**
   * Filter expenses by date range (inclusive)
   * 
   * @param startDate - Start date (inclusive)
   * @param endDate - End date (inclusive)
   * @returns Filtered expenses within date range
   */
  const getExpensesByDateRange = useCallback(
    (startDate: Date, endDate: Date): readonly Expense[] => {
      const start = startDate.getTime()
      const end = endDate.getTime()
      return data.filter((exp) => exp.date >= start && exp.date <= end)
    },
    [data]
  )

  /**
   * Filter expenses by category
   * 
   * @param category - Category ID to filter by
   * @returns Filtered expenses for the specified category
   */
  const getExpensesByCategory = useCallback(
    (category: string): readonly Expense[] => {
      return data.filter((exp) => exp.category === category)
    },
    [data]
  )

  /**
   * Filter expenses by month in YYYY-MM format
   * 
   * @param month - Month string in YYYY-MM format (e.g., "2026-02")
   * @returns Filtered expenses for the specified month
   */
  const getExpensesByMonth = useCallback(
    (month: string): readonly Expense[] => {
      return data.filter((exp) => {
        const expDate = new Date(exp.date)
        const expMonth = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`
        return expMonth === month
      })
    },
    [data]
  )

  return {
    expenses: data as readonly Expense[],
    loading,
    error,
    createExpense,
    updateExpense: update,
    deleteExpense: deleteDoc,
    getExpensesByDateRange,
    getExpensesByCategory,
    getExpensesByMonth,
  } as const
}
