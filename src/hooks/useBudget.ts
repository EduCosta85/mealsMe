import { useCallback } from 'react'
import { useFirestore } from './useFirestore'

/**
 * Budget interface for monthly category budgets
 * One budget per category per month
 */
export interface Budget {
  readonly id: string
  readonly userId: string
  readonly categoryId: string
  readonly month: string // Format: "YYYY-MM"
  readonly amount: number
  readonly createdAt: number
}

interface UseBudgetOptions {
  readonly userId: string
}

interface UseBudgetReturn {
  readonly budgets: readonly Budget[]
  readonly loading: boolean
  readonly error: string | null
  readonly createBudget: (
    budget: Omit<Budget, 'id' | 'createdAt' | 'userId'>,
  ) => Promise<string>
  readonly updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>
  readonly deleteBudget: (id: string) => Promise<void>
  readonly getBudgetByMonth: (month: string) => readonly Budget[]
  readonly getBudgetByCategoryAndMonth: (
    categoryId: string,
    month: string,
  ) => Budget | undefined
}

/**
 * Specialized hook for managing monthly budgets per category
 *
 * Wraps useFirestore to provide budget-specific operations with
 * automatic field population and query helpers for month-based filtering.
 *
 * @param options - Configuration with userId
 * @returns Budget CRUD operations and query helpers
 *
 * @example
 * ```tsx
 * const {
 *   budgets,
 *   loading,
 *   createBudget,
 *   getBudgetByMonth,
 *   getBudgetByCategoryAndMonth
 * } = useBudget({ userId: user.uid });
 *
 * // Create budget for February 2026
 * await createBudget({
 *   categoryId: 'food-category-id',
 *   month: '2026-02',
 *   amount: 1000.00
 * });
 *
 * // Get all budgets for current month
 * const monthBudgets = getBudgetByMonth('2026-02');
 *
 * // Get specific category budget for month
 * const foodBudget = getBudgetByCategoryAndMonth('food-category-id', '2026-02');
 * ```
 */
export function useBudget(options: UseBudgetOptions): UseBudgetReturn {
  const { userId } = options

  const {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteDoc,
  } = useFirestore<Budget>({
    userId,
    collectionPath: 'budgets',
  })

  /**
   * Create a new budget with automatic field population
   * Validates required fields and adds createdAt and userId automatically
   */
  const createBudget = useCallback(
    async (
      budget: Omit<Budget, 'id' | 'createdAt' | 'userId'>,
    ): Promise<string> => {
      // Validate required fields
      if (!budget.categoryId) {
        throw new Error('categoryId é obrigatório')
      }
      if (!budget.month) {
        throw new Error('month é obrigatório')
      }
      if (typeof budget.amount !== 'number' || budget.amount <= 0) {
        throw new Error('amount deve ser um número positivo')
      }

      // Validate month format (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/
      if (!monthRegex.test(budget.month)) {
        throw new Error('month deve estar no formato YYYY-MM')
      }

      const newBudget: Omit<Budget, 'id'> = {
        ...budget,
        createdAt: Date.now(),
        userId,
      }

      return create(newBudget)
    },
    [create, userId],
  )

  /**
   * Get all budgets for a specific month
   * @param month - Month in format "YYYY-MM"
   * @returns Array of budgets for the specified month
   */
  const getBudgetByMonth = useCallback(
    (month: string): readonly Budget[] => {
      return data.filter((budget) => budget.month === month)
    },
    [data],
  )

  /**
   * Get budget for a specific category in a specific month
   * @param categoryId - Category ID
   * @param month - Month in format "YYYY-MM"
   * @returns Budget if found, undefined otherwise
   */
  const getBudgetByCategoryAndMonth = useCallback(
    (categoryId: string, month: string): Budget | undefined => {
      return data.find(
        (budget) => budget.categoryId === categoryId && budget.month === month,
      )
    },
    [data],
  )

  return {
    budgets: data as readonly Budget[],
    loading,
    error,
    createBudget,
    updateBudget: update,
    deleteBudget: deleteDoc,
    getBudgetByMonth,
    getBudgetByCategoryAndMonth,
  }
}
