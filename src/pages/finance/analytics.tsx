/**
 * Analytics Page
 * 
 * Comprehensive analytics dashboard displaying all financial charts with data filtering.
 * 
 * Features:
 * - Month selector for data filtering
 * - Summary statistics (total spent, budget, remaining, expense count)
 * - Budget vs Actual bar chart
 * - Category distribution pie chart
 * - Daily spending line chart
 * - Mobile-first responsive layout
 * - Loading states
 * - Empty state handling
 * 
 * Following patterns from:
 * - react-patterns.md: Functional components, custom hooks, useMemo for performance
 * - ui-styling-standards.md: Mobile-first, responsive grid, Tailwind CSS
 * - code-quality.md: Pure functions, immutability, composition
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses } from '@/hooks/useExpenses'
import { useBudget } from '@/hooks/useBudget'
import { useCategories } from '@/hooks/useCategories'
import { aggregateExpensesByCategory } from '@/lib/finance/calculations'
import BudgetVsActualChart from '@/components/finance/charts/BudgetVsActualChart'
import CategoryPieChart from '@/components/finance/charts/CategoryPieChart'
import DailySpendingChart from '@/components/finance/charts/DailySpendingChart'
import { MonthSelector } from '@/components/finance/MonthSelector'

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Analytics Page Component
 * 
 * Displays comprehensive financial analytics with three chart types:
 * 1. Budget vs Actual - Bar chart comparing budgets to spending
 * 2. Category Distribution - Pie chart showing expense breakdown
 * 3. Daily Spending - Line chart showing spending trends over time
 */
export default function AnalyticsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Fetch data using custom hooks
  const { expenses, loading: expensesLoading } = useExpenses({ userId: user!.uid })
  const { budgets, loading: budgetsLoading } = useBudget({ userId: user!.uid })
  const { categories } = useCategories({ userId: user!.uid })

  // Calculate month key for filtering
  const monthKey = useMemo(() => formatMonthKey(currentMonth), [currentMonth])

  // Filter expenses for current month
  // Following code-quality.md: Pure function, immutable filtering
  const monthExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date)
      const expMonth = formatMonthKey(expDate)
      return expMonth === monthKey
    })
  }, [expenses, monthKey])

  // Calculate summary statistics
  // Following code-quality.md: Pure calculations, no side effects
  const summaryStats = useMemo(() => {
    const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const monthBudgets = budgets.filter((b) => b.month === monthKey)
    const totalBudget = monthBudgets.reduce((sum, b) => sum + b.amount, 0)
    const remaining = totalBudget - totalSpent
    const expenseCount = monthExpenses.length

    return {
      totalSpent,
      totalBudget,
      remaining,
      expenseCount,
      isOverBudget: remaining < 0,
    }
  }, [monthExpenses, budgets, monthKey])

  // Prepare Budget vs Actual chart data
  // Following react-patterns.md: useMemo for expensive calculations
  const budgetChartData = useMemo(() => {
    const aggregated = aggregateExpensesByCategory(monthExpenses)
    const monthBudgets = budgets.filter((b) => b.month === monthKey)

    return categories
      .filter((cat) => monthBudgets.some((b) => b.categoryId === cat.id))
      .map((cat) => {
        const budget = monthBudgets.find((b) => b.categoryId === cat.id)
        const spent = aggregated.get(cat.id) || 0
        const percentage = budget ? (spent / budget.amount) * 100 : 0

        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          budget: budget?.amount || 0,
          spent,
          percentage,
        }
      })
  }, [categories, budgets, monthExpenses, monthKey])

  // Prepare Category Pie chart data
  // Following code-quality.md: Immutable data transformation
  const pieChartData = useMemo(() => {
    const aggregated = aggregateExpensesByCategory(monthExpenses)
    const total = Array.from(aggregated.values()).reduce((sum, val) => sum + val, 0)

    return categories
      .filter((cat) => aggregated.has(cat.id))
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        value: aggregated.get(cat.id) || 0,
        percentage: total > 0 ? ((aggregated.get(cat.id) || 0) / total) * 100 : 0,
      }))
  }, [categories, monthExpenses])

  // Prepare Daily spending chart data
  // Following code-quality.md: Pure function, create new data
  const dailyChartData = useMemo(() => {
    const dailyMap = new Map<string, number>()

    // Aggregate expenses by date
    monthExpenses.forEach((exp) => {
      const date = new Date(exp.date)
      const dateKey = date.toISOString().split('T')[0]
      const current = dailyMap.get(dateKey) || 0
      dailyMap.set(dateKey, current + exp.amount)
    })

    // Transform to array and sort chronologically
    return Array.from(dailyMap.entries())
      .map(([date, amount]) => {
        const [, month, day] = date.split('-')
        return {
          date,
          amount,
          formattedDate: `${day}/${month}`,
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [monthExpenses])

  // Loading state
  // Following react-patterns.md: Early return pattern
  if (expensesLoading || budgetsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      {/* Following ui-styling-standards.md: Semantic HTML, accessibility */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="p-4 space-y-3">
          {/* Back button */}
          <button
            onClick={() => navigate('/finance')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Voltar para o dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm font-medium">Voltar</span>
          </button>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Análises 💹
          </h1>

          {/* Month selector */}
          <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6">
        {/* Summary Cards */}
        {/* Following ui-styling-standards.md: Responsive grid, mobile-first */}
        <section aria-label="Resumo financeiro">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* Total Spent Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Gasto</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">
                {formatCurrency(summaryStats.totalSpent)}
              </p>
            </div>

            {/* Total Budget Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Orçamento</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">
                {formatCurrency(summaryStats.totalBudget)}
              </p>
            </div>

            {/* Remaining/Over Budget Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                {summaryStats.isOverBudget ? 'Acima do Orçamento' : 'Restante'}
              </p>
              <p
                className={`text-lg md:text-xl font-bold ${
                  summaryStats.isOverBudget ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formatCurrency(Math.abs(summaryStats.remaining))}
              </p>
            </div>

            {/* Expense Count Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Despesas</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">
                {summaryStats.expenseCount}
              </p>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        {/* Following ui-styling-standards.md: Responsive layout, cards */}
        <section aria-label="Gráficos de análise" className="space-y-6">
          {/* Budget vs Actual Chart */}
          <article className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Orçamento vs Gasto
            </h2>
            <BudgetVsActualChart data={budgetChartData} height={300} />
          </article>

          {/* Category Distribution Chart */}
          <article className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Distribuição por Categoria
            </h2>
            <CategoryPieChart data={pieChartData} height={300} />
          </article>

          {/* Daily Spending Chart */}
          <article className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Gastos Diários
            </h2>
            <DailySpendingChart data={dailyChartData} height={300} />
          </article>
        </section>

        {/* Empty State */}
        {/* Following react-patterns.md: Conditional rendering */}
        {monthExpenses.length === 0 && (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma despesa neste mês
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione despesas para visualizar as análises
            </p>
            <button
              onClick={() => navigate('/finance/add-expense')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Adicionar Despesa
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
