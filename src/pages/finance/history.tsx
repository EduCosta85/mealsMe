/**
 * Transaction History Page
 * 
 * Displays all expenses with filtering, search, and month navigation.
 * 
 * Features:
 * - Month navigation with MonthSelector
 * - Category filtering (dropdown)
 * - Real-time text search in descriptions
 * - Expense list sorted by date (newest first)
 * - Total and count statistics for filtered results
 * - Edit/delete actions with confirmation
 * - Mobile-first responsive design
 * - 48px minimum touch targets
 * 
 * Following patterns from:
 * - react-patterns.md: Functional components, custom hooks, useMemo
 * - ui-styling-standards.md: Mobile-first, Tailwind CSS, accessibility
 * - code-quality.md: Pure functions, immutability, composition
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { ExpenseCard } from '@/components/finance/ExpenseCard'
import { MonthSelector } from '@/components/finance/MonthSelector'
import type { Expense } from '@/data/finance-types'

/**
 * Format month as YYYY-MM string
 * Pure function for consistent month formatting
 */
function formatMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Format currency in Brazilian Real (BRL)
 * Pure function for consistent currency display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

/**
 * Filter expenses by multiple criteria
 * Pure function - does not modify input array
 * 
 * @param expenses - Array of expenses to filter
 * @param monthKey - Month in YYYY-MM format
 * @param categoryId - Category ID to filter by ('all' for no filter)
 * @param searchTerm - Text to search in descriptions
 * @returns Filtered expenses array
 */
function filterExpenses(
  expenses: readonly Expense[],
  monthKey: string,
  categoryId: string,
  searchTerm: string
): readonly Expense[] {
  return expenses.filter((expense) => {
    // Month filter
    const expenseDate = new Date(expense.date)
    const expenseMonth = formatMonthKey(expenseDate)
    if (expenseMonth !== monthKey) return false

    // Category filter
    if (categoryId !== 'all' && expense.category !== categoryId) return false

    // Search filter (case-insensitive)
    if (searchTerm && !expense.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })
}

/**
 * Sort expenses by date (newest first)
 * Pure function - creates new sorted array
 */
function sortExpensesByDate(expenses: readonly Expense[]): readonly Expense[] {
  return [...expenses].sort((a, b) => b.date - a.date)
}

/**
 * Calculate total amount from expenses
 * Pure function using reduce
 */
function calculateTotal(expenses: readonly Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

/**
 * History Page Component
 * 
 * Main transaction history page with filtering and search
 */
export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Fetch data using custom hooks
  const { expenses, deleteExpense, loading } = useExpenses({ userId: user!.uid })
  const { categories, getCategoryById } = useCategories({ userId: user!.uid })

  // Memoized filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    const monthKey = formatMonthKey(currentMonth)
    const filtered = filterExpenses(expenses, monthKey, selectedCategory, searchTerm)
    return sortExpensesByDate(filtered)
  }, [expenses, currentMonth, selectedCategory, searchTerm])

  // Memoized total calculation
  const total = useMemo(() => calculateTotal(filteredExpenses), [filteredExpenses])

  // Handle delete with confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Deletar esta despesa?')) {
      deleteExpense(id)
    }
  }

  // Handle edit navigation
  const handleEdit = (id: string) => {
    navigate(`/finance/edit-expense/${id}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => navigate('/finance')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3 min-h-[44px]"
          aria-label="Voltar para dashboard"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Histórico</h1>
        <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      </header>

      {/* Filters Section */}
      <section className="p-4 space-y-3" aria-label="Filtros">
        {/* Search Input */}
        <div>
          <label htmlFor="search-input" className="sr-only">
            Buscar despesas
          </label>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar despesas..."
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            aria-label="Buscar despesas por descrição"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category-filter" className="sr-only">
            Filtrar por categoria
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
            aria-label="Filtrar despesas por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">
            Total: {filteredExpenses.length} {filteredExpenses.length === 1 ? 'despesa' : 'despesas'}
          </p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>
      </section>

      {/* Expenses List */}
      <section className="px-4 space-y-3" aria-label="Lista de despesas">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-base">Nenhuma despesa encontrada</p>
            {(searchTerm || selectedCategory !== 'all') && (
              <p className="text-gray-400 text-sm mt-2">
                Tente ajustar os filtros de busca
              </p>
            )}
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const category = getCategoryById(expense.category)
            return (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                categoryName={category?.name}
                categoryIcon={category?.icon}
                categoryColor={category?.color}
                onEdit={() => handleEdit(expense.id)}
                onDelete={() => handleDelete(expense.id)}
              />
            )
          })
        )}
      </section>
    </div>
  )
}
