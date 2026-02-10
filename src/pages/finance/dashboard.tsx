/**
 * Finance Dashboard Page
 * 
 * Main dashboard displaying financial summary, budget progress, and recent expenses.
 * 
 * Features:
 * - Month summary (total spent vs budget)
 * - Budget progress bars per category with alerts
 * - Recent expenses list (last 5)
 * - Floating add button for quick expense entry
 * - Real-time sync indicator
 * - Month navigation
 * - Mobile-first responsive design
 * 
 * Following patterns from:
 * - react-patterns.md: Functional components with hooks
 * - ui-styling-standards.md: Mobile-first, Tailwind CSS, accessibility
 * - code-quality.md: Pure functions, immutability, composition
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses } from '@/hooks/useExpenses'
import { useBudget } from '@/hooks/useBudget'
import { useCategories } from '@/hooks/useCategories'
import { ExpenseCard } from '@/components/finance/ExpenseCard'
import BudgetProgressBar from '@/components/finance/BudgetProgressBar'
import { FloatingAddButton } from '@/components/finance/FloatingAddButton'
import SyncIndicator from '@/components/finance/SyncIndicator'
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
 * Filter expenses by month
 * Pure function - does not modify input array
 */
function filterExpensesByMonth(
  expenses: readonly Expense[],
  monthKey: string
): readonly Expense[] {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const expenseMonth = formatMonthKey(expenseDate)
    return expenseMonth === monthKey
  })
}

/**
 * Calculate total amount from expenses
 * Pure function using reduce
 */
function calculateTotal(expenses: readonly Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

/**
 * Sort expenses by date (newest first)
 * Pure function - creates new sorted array
 */
function sortExpensesByDate(expenses: readonly Expense[]): readonly Expense[] {
  return [...expenses].sort((a, b) => b.date - a.date)
}

/**
 * Dashboard Page Component
 * 
 * Main entry point for finance dashboard
 * Displays summary, budgets, and recent expenses
 */
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Fetch data using custom hooks
  const { expenses, loading: expensesLoading } = useExpenses({ userId: user!.uid })
  const { budgets, loading: budgetsLoading } = useBudget({ userId: user!.uid })
  const { categories, getCategoryById } = useCategories({ userId: user!.uid })

  // Format current month key
  const monthKey = useMemo(() => formatMonthKey(currentMonth), [currentMonth])

  // Filter expenses for current month (memoized for performance)
  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, monthKey),
    [expenses, monthKey]
  )

  // Filter budgets for current month
  const monthBudgets = useMemo(
    () => budgets.filter((budget) => budget.month === monthKey),
    [budgets, monthKey]
  )

  // Calculate totals (memoized to avoid recalculation)
  const totalSpent = useMemo(
    () => calculateTotal(monthExpenses),
    [monthExpenses]
  )

  const totalBudget = useMemo(
    () => monthBudgets.reduce((sum, budget) => sum + budget.amount, 0),
    [monthBudgets]
  )

  const remaining = useMemo(
    () => totalBudget - totalSpent,
    [totalBudget, totalSpent]
  )

  // Get recent expenses (last 5, sorted by date)
  const recentExpenses = useMemo(
    () => sortExpensesByDate(monthExpenses).slice(0, 5),
    [monthExpenses]
  )

  // Calculate spending by category for budget progress
  const spendingByCategory = useMemo(() => {
    const spending = new Map<string, number>()
    monthExpenses.forEach((expense) => {
      const current = spending.get(expense.category) || 0
      spending.set(expense.category, current + expense.amount)
    })
    return spending
  }, [monthExpenses])

  // Filter categories that have budgets
  const categoriesWithBudgets = useMemo(() => {
    return categories.filter((category) =>
      monthBudgets.some((budget) => budget.categoryId === category.id)
    )
  }, [categories, monthBudgets])

  // Loading state
  const loading = expensesLoading || budgetsLoading

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
      {/* Sync Indicator - Fixed top-right */}
      <SyncIndicator />

      {/* Header Section */}
      <header className="border-b border-gray-200 bg-white p-4">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Finanças 💰</h1>
        <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      </header>

      {/* Main Content */}
      <main className="space-y-6 p-4">
        {/* Summary Cards Section */}
        <section aria-label="Resumo financeiro">
          <div className="grid grid-cols-2 gap-3">
            {/* Total Spent Card */}
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-gray-500">Total Gasto</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalSpent)}
              </p>
            </div>

            {/* Total Budget Card */}
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-gray-500">Orçamento</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>

            {/* Remaining/Over Budget Card */}
            <div
              className={`col-span-2 rounded-lg p-4 shadow ${
                remaining >= 0 ? 'bg-emerald-50' : 'bg-red-50'
              }`}
            >
              <p className="text-xs text-gray-600">
                {remaining >= 0 ? 'Restante' : 'Acima do Orçamento'}
              </p>
              <p
                className={`text-xl font-bold ${
                  remaining >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {formatCurrency(Math.abs(remaining))}
              </p>
              {remaining < 0 && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ Você ultrapassou o orçamento do mês
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Budget Progress Section */}
        {categoriesWithBudgets.length > 0 && (
          <section
            className="rounded-lg bg-white p-4 shadow"
            aria-label="Progresso dos orçamentos"
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900">Orçamentos</h2>
            <div className="space-y-4">
              {categoriesWithBudgets.map((category) => {
                const budget = monthBudgets.find(
                  (b) => b.categoryId === category.id
                )
                if (!budget) return null

                // Note: Expense.category is the category ID (string)
                const spent = spendingByCategory.get(category.id) || 0
                const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
                const isOverBudget = percentage > 100

                return (
                  <div key={category.id}>
                    <BudgetProgressBar
                      spent={spent}
                      budget={budget.amount}
                      categoryName={category.name}
                      categoryIcon={category.icon}
                      showDetails={true}
                    />
                    {/* Over-budget alert badge */}
                    {isOverBudget && (
                      <div
                        className="mt-2 flex items-center gap-2 rounded-md bg-red-100 px-3 py-2"
                        role="alert"
                      >
                        <span className="text-lg" aria-hidden="true">
                          ⚠️
                        </span>
                        <span className="text-xs font-medium text-red-700">
                          Orçamento ultrapassado em {category.name}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Recent Expenses Section */}
        <section
          className="rounded-lg bg-white p-4 shadow"
          aria-label="Despesas recentes"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Despesas Recentes</h2>
            {monthExpenses.length > 5 && (
              <button
                onClick={() => navigate('/finance/history')}
                className="text-sm font-medium text-orange-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Ver todas as despesas"
              >
                Ver todas
              </button>
            )}
          </div>

          {recentExpenses.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                Nenhuma despesa registrada este mês
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Clique no botão + para adicionar uma despesa
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const category = getCategoryById(expense.category)
                return (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    categoryName={category?.name}
                    categoryIcon={category?.icon}
                    categoryColor={category?.color}
                  />
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Add Button - Fixed bottom-right */}
      <FloatingAddButton onClick={() => navigate('/finance/add-expense')} />
    </div>
  )
}
