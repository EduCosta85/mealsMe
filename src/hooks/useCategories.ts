import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import type { Category, CategoryType } from '../data/finance-types'

interface UseCategoriesOptions {
  readonly userId: string
}

interface UseCategoriesReturn {
  readonly categories: readonly Category[]
  readonly loading: boolean
  readonly error: string | null
  readonly createCategory: (
    category: Omit<Category, 'id' | 'createdAt' | 'userId'>,
  ) => Promise<string>
  readonly updateCategory: (
    id: string,
    updates: Partial<Category>,
  ) => Promise<void>
  readonly deleteCategory: (id: string) => Promise<void>
  readonly getCategoryById: (id: string) => Category | undefined
  readonly getCategoriesByType: (
    type: CategoryType,
  ) => readonly Category[]
}

/**
 * Specialized hook for managing categories using Firestore
 *
 * Wraps the generic useFirestore hook with category-specific operations
 * including helper functions for filtering and finding categories.
 *
 * @param options - Configuration with userId
 * @returns Category CRUD operations and helper functions
 *
 * @example
 * ```tsx
 * const { categories, loading, createCategory, getCategoriesByType } =
 *   useCategories({ userId: user.uid });
 *
 * const variableCategories = getCategoriesByType('variable');
 *
 * await createCategory({
 *   name: 'Alimentação',
 *   icon: '🍕',
 *   color: '#f97316',
 *   budget: 500,
 *   type: 'variable'
 * });
 * ```
 */
export function useCategories(
  options: UseCategoriesOptions,
): UseCategoriesReturn {
  const { userId } = options

  const {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteDoc,
  } = useFirestore<Category>({
    userId,
    collectionPath: 'categories',
  })

  /**
   * Create a new category with automatic fields
   * Adds createdAt timestamp and userId automatically
   */
  const createCategory = useCallback(
    async (
      category: Omit<Category, 'id' | 'createdAt' | 'userId'>,
    ): Promise<string> => {
      // Validate required fields
      if (!category.name || !category.icon || !category.color || !category.type) {
        throw new Error('Missing required fields: name, icon, color, type')
      }

      const newCategory = {
        ...category,
        createdAt: Date.now(),
        userId,
      }

      return create(newCategory)
    },
    [create, userId],
  )

  /**
   * Find a category by ID
   * Returns undefined if not found
   */
  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return data.find((cat) => cat.id === id)
    },
    [data],
  )

  /**
   * Filter categories by type (fixed or variable)
   * Returns readonly array of matching categories
   */
  const getCategoriesByType = useCallback(
    (type: CategoryType): readonly Category[] => {
      return data.filter((cat) => cat.type === type)
    },
    [data],
  )

  return {
    categories: data as readonly Category[],
    loading,
    error,
    createCategory,
    updateCategory: update,
    deleteCategory: deleteDoc,
    getCategoryById,
    getCategoriesByType,
  }
}

/**
 * Default categories for initial setup
 * Can be used to populate a new user's categories
 */
export const DEFAULT_CATEGORIES: ReadonlyArray<
  Omit<Category, 'id' | 'createdAt' | 'userId'>
> = [
  {
    name: 'Alimentação',
    icon: '🍕',
    color: '#f97316',
    budget: 0,
    type: 'variable',
  },
  {
    name: 'Transporte',
    icon: '🚗',
    color: '#3b82f6',
    budget: 0,
    type: 'variable',
  },
  {
    name: 'Moradia',
    icon: '🏠',
    color: '#8b5cf6',
    budget: 0,
    type: 'fixed',
  },
  {
    name: 'Saúde',
    icon: '🏥',
    color: '#ef4444',
    budget: 0,
    type: 'variable',
  },
  {
    name: 'Lazer',
    icon: '🎮',
    color: '#10b981',
    budget: 0,
    type: 'variable',
  },
  {
    name: 'Educação',
    icon: '📚',
    color: '#6366f1',
    budget: 0,
    type: 'variable',
  },
  {
    name: 'Contas',
    icon: '📄',
    color: '#f59e0b',
    budget: 0,
    type: 'fixed',
  },
] as const

/**
 * Initialize default categories for a new user
 * Creates all default categories in Firestore
 *
 * @param createCategory - The createCategory function from useCategories
 * @returns Promise that resolves when all categories are created
 *
 * @example
 * ```tsx
 * const { createCategory } = useCategories({ userId: user.uid });
 * await initializeDefaultCategories(createCategory);
 * ```
 */
export async function initializeDefaultCategories(
  createCategory: (
    cat: Omit<Category, 'id' | 'createdAt' | 'userId'>,
  ) => Promise<string>,
): Promise<void> {
  for (const category of DEFAULT_CATEGORIES) {
    await createCategory(category)
  }
}
