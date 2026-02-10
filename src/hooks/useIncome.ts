import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import type { Income } from '../data/finance-types'

interface UseIncomeOptions {
  readonly userId: string
}

interface UseIncomeReturn {
  readonly income: readonly Income[]
  readonly loading: boolean
  readonly error: string | null
  readonly createIncome: (
    income: Omit<Income, 'id' | 'createdAt' | 'userId' | 'updatedAt'>,
  ) => Promise<string>
  readonly updateIncome: (id: string, updates: Partial<Income>) => Promise<void>
  readonly deleteIncome: (id: string) => Promise<void>
  readonly getIncomeByDateRange: (
    startDate: Date,
    endDate: Date,
  ) => readonly Income[]
  readonly getIncomeByMonth: (month: string) => readonly Income[]
  readonly getTotalIncomeByMonth: (month: string) => number
}

/**
 * Specialized hook for managing income records
 *
 * Wraps useFirestore to provide income-specific operations including:
 * - CRUD operations with automatic userId and timestamp injection
 * - Query helpers for date range and month filtering
 * - Total income calculation by month
 * - Real-time sync inherited from useFirestore
 *
 * @param options - Configuration with userId
 * @returns Income operations and real-time data
 *
 * @example
 * ```tsx
 * const {
 *   income,
 *   loading,
 *   createIncome,
 *   getIncomeByMonth,
 *   getTotalIncomeByMonth
 * } = useIncome({ userId: user.uid });
 *
 * // Get income for current month
 * const monthIncome = getIncomeByMonth('2026-02');
 * const totalIncome = getTotalIncomeByMonth('2026-02');
 *
 * // Create new income
 * await createIncome({
 *   amount: 5000.00,
 *   source: 'Salário',
 *   description: 'Salário mensal',
 *   date: Date.now(),
 *   isRecurring: true,
 *   frequency: 'monthly'
 * });
 * ```
 */
export function useIncome(options: UseIncomeOptions): UseIncomeReturn {
  const { userId } = options

  const {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteDoc,
  } = useFirestore<Income>({
    userId,
    collectionPath: 'income',
  })

  /**
   * Create a new income record with automatic userId, createdAt, and updatedAt
   * Validates required fields before creation
   *
   * @param income - Income data without id, createdAt, userId, updatedAt
   * @returns Promise with new income ID
   */
  const createIncome = useCallback(
    async (
      income: Omit<Income, 'id' | 'createdAt' | 'userId' | 'updatedAt'>,
    ): Promise<string> => {
      // Validate required fields
      if (!income.amount || income.amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }
      if (!income.source) {
        throw new Error('Source is required')
      }
      if (!income.description) {
        throw new Error('Description is required')
      }
      if (!income.date) {
        throw new Error('Date is required')
      }
      if (typeof income.isRecurring !== 'boolean') {
        throw new Error('isRecurring is required')
      }
      if (!income.frequency) {
        throw new Error('Frequency is required')
      }

      const now = Date.now()
      const newIncome = {
        ...income,
        userId,
        createdAt: now,
        updatedAt: now,
      }

      return create(newIncome as Omit<Income, 'id'>)
    },
    [create, userId],
  )

  /**
   * Filter income by date range (inclusive)
   *
   * @param startDate - Start date (inclusive)
   * @param endDate - End date (inclusive)
   * @returns Filtered income within date range
   */
  const getIncomeByDateRange = useCallback(
    (startDate: Date, endDate: Date): readonly Income[] => {
      const start = startDate.getTime()
      const end = endDate.getTime()
      return data.filter((inc) => inc.date >= start && inc.date <= end)
    },
    [data],
  )

  /**
   * Filter income by month in YYYY-MM format
   *
   * @param month - Month string in YYYY-MM format (e.g., "2026-02")
   * @returns Filtered income for the specified month
   */
  const getIncomeByMonth = useCallback(
    (month: string): readonly Income[] => {
      return data.filter((inc) => {
        const incDate = new Date(inc.date)
        const incMonth = `${incDate.getFullYear()}-${String(incDate.getMonth() + 1).padStart(2, '0')}`
        return incMonth === month
      })
    },
    [data],
  )

  /**
   * Calculate total income for a specific month
   *
   * @param month - Month string in YYYY-MM format (e.g., "2026-02")
   * @returns Total income amount for the specified month
   */
  const getTotalIncomeByMonth = useCallback(
    (month: string): number => {
      const monthIncome = getIncomeByMonth(month)
      return monthIncome.reduce((total, inc) => total + inc.amount, 0)
    },
    [getIncomeByMonth],
  )

  return {
    income: data as readonly Income[],
    loading,
    error,
    createIncome,
    updateIncome: update,
    deleteIncome: deleteDoc,
    getIncomeByDateRange,
    getIncomeByMonth,
    getTotalIncomeByMonth,
  } as const
}
