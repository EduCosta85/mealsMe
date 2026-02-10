/**
 * Budget Configuration Page
 * 
 * Page for setting and managing monthly budgets per category.
 * 
 * Features:
 * - Budget list with progress bars showing current spending vs budget
 * - Add/Edit budget form with category selection and amount input
 * - Budget summary (total budget, total spent, total remaining)
 * - Edit and delete budget actions with confirmation
 * - Form validation (amount > 0, category required)
 * - Mobile-first responsive design with 48px touch targets
 * 
 * Following patterns from:
 * - react-patterns.md: Functional components with hooks, custom hooks
 * - ui-styling-standards.md: Mobile-first, Tailwind CSS, 48px touch targets
 * - code-quality.md: Pure functions, immutability, < 50 line functions
 * - security-patterns.md: Input validation, error handling
 */

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useBudget } from '@/hooks/useBudget'
import { useCategories } from '@/hooks/useCategories'
import { useExpenses } from '@/hooks/useExpenses'
import BudgetProgressBar from '@/components/finance/BudgetProgressBar'
import { validateAmount } from '@/lib/finance/validation'

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
 * Format month for display (e.g., "Fevereiro 2026")
 * Pure function for user-friendly month display
 */
function formatMonthDisplay(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
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
 * Filter expenses by month
 * Pure function - does not modify input array
 */
function filterExpensesByMonth(
  expenses: readonly { date: number; category: string; amount: number }[],
  monthKey: string
): readonly { date: number; category: string; amount: number }[] {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const expenseMonth = formatMonthKey(expenseDate)
    return expenseMonth === monthKey
  })
}

/**
 * Calculate spending by category
 * Pure function - returns Map of categoryId to total amount
 */
function calculateSpendingByCategory(
  expenses: readonly { category: string; amount: number }[]
): Map<string, number> {
  const spending = new Map<string, number>()
  expenses.forEach((expense) => {
    const current = spending.get(expense.category) || 0
    spending.set(expense.category, current + expense.amount)
  })
  return spending
}

/**
 * Budget Configuration Page Component
 * 
 * Main entry point for budget management
 * Allows users to set, edit, and delete monthly budgets per category
 */
export default function BudgetPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  // Current month
  const currentMonth = useMemo(() => new Date(), [])
  const monthKey = useMemo(() => formatMonthKey(currentMonth), [currentMonth])

  // Fetch data using custom hooks
  const { budgets, createBudget, updateBudget, deleteBudget, loading: budgetsLoading } = 
    useBudget({ userId: user!.uid })
  const { categories, loading: categoriesLoading } = useCategories({ userId: user!.uid })
  const { expenses, loading: expensesLoading } = useExpenses({ userId: user!.uid })

  // Filter data for current month
  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === monthKey),
    [budgets, monthKey]
  )

  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, monthKey),
    [expenses, monthKey]
  )

  // Calculate spending by category
  const spendingByCategory = useMemo(
    () => calculateSpendingByCategory(monthExpenses),
    [monthExpenses]
  )

  // Calculate totals
  const totalBudget = useMemo(
    () => monthBudgets.reduce((sum, b) => sum + b.amount, 0),
    [monthBudgets]
  )

  const totalSpent = useMemo(
    () => Array.from(spendingByCategory.values()).reduce((sum, amount) => sum + amount, 0),
    [spendingByCategory]
  )

  const totalRemaining = useMemo(
    () => totalBudget - totalSpent,
    [totalBudget, totalSpent]
  )

  // Get categories that don't have budgets yet (for form dropdown)
  const availableCategories = useMemo(() => {
    if (editingBudgetId) {
      // When editing, include the current category
      return categories
    }
    // When adding new, exclude categories that already have budgets
    return categories.filter(
      (cat) => !monthBudgets.some((b) => b.categoryId === cat.id)
    )
  }, [categories, monthBudgets, editingBudgetId])

  /**
   * Handle form submission
   * Validates input and creates or updates budget
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      // Validate category selection
      if (!categoryId) {
        setError('Selecione uma categoria')
        return
      }

      // Validate amount
      const amountNum = parseFloat(amount)
      const validation = validateAmount(amountNum)
      if (!validation.isValid) {
        setError(validation.error || 'Valor inválido')
        return
      }

      try {
        if (editingBudgetId) {
          // Update existing budget
          await updateBudget(editingBudgetId, { amount: amountNum })
        } else {
          // Create new budget
          await createBudget({
            categoryId,
            month: monthKey,
            amount: amountNum,
          })
        }

        // Reset form
        setShowForm(false)
        setEditingBudgetId(null)
        setCategoryId('')
        setAmount('')
      } catch {
        setError('Erro ao salvar orçamento. Tente novamente.')
      }
    },
    [categoryId, amount, editingBudgetId, monthKey, createBudget, updateBudget]
  )

  /**
   * Handle edit button click
   * Populates form with existing budget data
   */
  const handleEdit = useCallback((budgetId: string) => {
    const budget = monthBudgets.find((b) => b.id === budgetId)
    if (budget) {
      setEditingBudgetId(budgetId)
      setCategoryId(budget.categoryId)
      setAmount(budget.amount.toString())
      setShowForm(true)
      setError('')
    }
  }, [monthBudgets])

  /**
   * Handle delete button click
   * Shows confirmation and deletes budget
   */
  const handleDelete = useCallback(
    async (budgetId: string) => {
      const budget = monthBudgets.find((b) => b.id === budgetId)
      const category = categories.find((c) => c.id === budget?.categoryId)
      
      if (window.confirm(`Deletar orçamento de ${category?.name || 'categoria'}?`)) {
        try {
          await deleteBudget(budgetId)
        } catch {
          setError('Erro ao deletar orçamento. Tente novamente.')
        }
      }
    },
    [monthBudgets, categories, deleteBudget]
  )

  /**
   * Handle cancel button click
   * Resets form state
   */
  const handleCancel = useCallback(() => {
    setShowForm(false)
    setEditingBudgetId(null)
    setCategoryId('')
    setAmount('')
    setError('')
  }, [])

  // Loading state
  const loading = budgetsLoading || categoriesLoading || expensesLoading

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4">
        <button
          onClick={() => navigate('/finance')}
          className="mb-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label="Voltar para dashboard"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos 💰</h1>
        <p className="text-sm text-gray-500">{formatMonthDisplay(monthKey)}</p>
      </header>

      {/* Main Content */}
      <main className="space-y-6 p-4">
        {/* Summary Section */}
        <section
          className="rounded-lg bg-white p-4 shadow"
          aria-label="Resumo de orçamentos"
        >
          <h2 className="mb-4 text-lg font-bold text-gray-900">Resumo</h2>
          <div className="space-y-3">
            {/* Total Budget */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Orçamento Total</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </span>
            </div>

            {/* Total Spent */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Gasto</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalSpent)}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Total Remaining */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {totalRemaining >= 0 ? 'Restante' : 'Acima do Orçamento'}
              </span>
              <span
                className={`text-xl font-bold ${
                  totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(Math.abs(totalRemaining))}
              </span>
            </div>
          </div>
        </section>

        {/* Add/Edit Button */}
        {!showForm && availableCategories.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="min-h-[48px] w-full rounded-lg bg-orange-500 px-6 py-3 font-medium text-white shadow transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Adicionar novo orçamento"
          >
            + Adicionar Orçamento
          </button>
        )}

        {/* No categories available message */}
        {!showForm && availableCategories.length === 0 && monthBudgets.length > 0 && (
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-700">
              Todas as categorias já possuem orçamentos definidos
            </p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-lg bg-white p-4 shadow"
            aria-label={editingBudgetId ? 'Editar orçamento' : 'Adicionar orçamento'}
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingBudgetId ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>

            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Categoria
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={!!editingBudgetId}
                  aria-label="Selecione a categoria"
                >
                  <option value="">Selecione a categoria</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Valor do Orçamento
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="R$ 0,00"
                  className="min-h-[48px] w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  aria-label="Digite o valor do orçamento"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="min-h-[48px] flex-1 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white shadow transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  aria-label={editingBudgetId ? 'Salvar alterações' : 'Criar orçamento'}
                >
                  {editingBudgetId ? 'Salvar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="min-h-[48px] flex-1 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 shadow transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="Cancelar"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Budget List Section */}
        <section aria-label="Lista de orçamentos">
          {monthBudgets.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-sm text-gray-500">
                Nenhum orçamento definido para este mês
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Clique em "Adicionar Orçamento" para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthBudgets.map((budget) => {
                const category = categories.find((c) => c.id === budget.categoryId)
                if (!category) return null

                const spent = spendingByCategory.get(budget.categoryId) || 0

                return (
                  <div
                    key={budget.id}
                    className="rounded-lg bg-white p-4 shadow"
                  >
                    {/* Budget Progress Bar */}
                    <BudgetProgressBar
                      spent={spent}
                      budget={budget.amount}
                      categoryName={category.name}
                      categoryIcon={category.icon}
                      showDetails={true}
                    />

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(budget.id)}
                        className="min-h-[48px] flex-1 rounded-lg border-2 border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        aria-label={`Editar orçamento de ${category.name}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="min-h-[48px] flex-1 rounded-lg border-2 border-red-500 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label={`Remover orçamento de ${category.name}`}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
