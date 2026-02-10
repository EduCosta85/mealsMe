// Financial Calculations Module - Pure Functions
// Following patterns from code-quality.md and clean-code.md

import type { Expense, Income, Budget } from '../../data/finance-types'

/**
 * Calculate budget usage percentage
 * Returns percentage (0-100+) of budget spent
 * Handles division by zero by returning 0
 * 
 * @param spent - Amount spent
 * @param budget - Budget limit
 * @returns Percentage of budget used (0-100+)
 * 
 * @example
 * calculateBudgetUsagePercent(500, 1000) // Returns 50
 * calculateBudgetUsagePercent(1200, 1000) // Returns 120 (over budget)
 * calculateBudgetUsagePercent(100, 0) // Returns 0 (no budget set)
 */
export function calculateBudgetUsagePercent(
  spent: number,
  budget: number
): number {
  if (budget === 0) {
    return 0
  }
  
  const percentage = (spent / budget) * 100
  return Math.round(percentage * 100) / 100
}

/**
 * Aggregate expenses by category
 * Groups expenses by categoryId and sums amounts
 * Immutable - does not modify input array
 * 
 * @param expenses - Array of expenses to aggregate
 * @returns Map of categoryId to total amount
 * 
 * @example
 * const expenses = [
 *   { category: 'food', amount: 100 },
 *   { category: 'food', amount: 50 },
 *   { category: 'transport', amount: 200 }
 * ]
 * aggregateExpensesByCategory(expenses)
 * // Returns Map { 'food' => 150, 'transport' => 200 }
 */
export function aggregateExpensesByCategory(
  expenses: readonly Expense[]
): Map<string, number> {
  const aggregated = new Map<string, number>()
  
  for (const expense of expenses) {
    const currentTotal = aggregated.get(expense.category) || 0
    aggregated.set(expense.category, currentTotal + expense.amount)
  }
  
  return aggregated
}

/**
 * Calculate income vs expenses for a period
 * Computes totals and balance (income - expenses)
 * 
 * @param income - Array of income records
 * @param expenses - Array of expense records
 * @returns Object with totalIncome, totalExpenses, and balance
 * 
 * @example
 * calculateIncomeVsExpenses(incomes, expenses)
 * // Returns { totalIncome: 5000, totalExpenses: 3200, balance: 1800 }
 */
export function calculateIncomeVsExpenses(
  income: readonly Income[],
  expenses: readonly Expense[]
): {
  totalIncome: number
  totalExpenses: number
  balance: number
} {
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
  const balance = totalIncome - totalExpenses
  
  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    balance: Math.round(balance * 100) / 100
  }
}

/**
 * Project end-of-month spending based on current rate
 * Uses linear projection: (spent / currentDay) * daysInMonth
 * 
 * @param expenses - Array of expenses for current month
 * @param currentDay - Current day of month (1-31)
 * @param daysInMonth - Total days in month (28-31)
 * @returns Projected total spending for the month
 * 
 * @example
 * // Day 10 of 30, spent R$300
 * projectEndOfMonthSpending(expenses, 10, 30) // Returns 900
 * 
 * // Day 1 of month
 * projectEndOfMonthSpending([], 1, 30) // Returns 0
 */
export function projectEndOfMonthSpending(
  expenses: readonly Expense[],
  currentDay: number,
  daysInMonth: number
): number {
  if (currentDay <= 0 || daysInMonth <= 0) {
    return 0
  }
  
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  if (totalSpent === 0 || currentDay === 0) {
    return 0
  }
  
  const dailyAverage = totalSpent / currentDay
  const projected = dailyAverage * daysInMonth
  
  return Math.round(projected * 100) / 100
}

/**
 * Calculate budget status for a specific category
 * Computes spent, remaining, and percentage for one category
 * Handles missing budget by returning zeros
 * 
 * @param categoryId - Category identifier
 * @param expenses - Array of all expenses
 * @param budget - Budget for this category (optional)
 * @returns Object with spent, budget, remaining, and percentage
 * 
 * @example
 * calculateCategoryBudgetStatus('food', expenses, budget)
 * // Returns { spent: 500, budget: 600, remaining: 100, percentage: 83.33 }
 * 
 * calculateCategoryBudgetStatus('food', expenses, undefined)
 * // Returns { spent: 500, budget: 0, remaining: -500, percentage: 0 }
 */
export function calculateCategoryBudgetStatus(
  categoryId: string,
  expenses: readonly Expense[],
  budget: Budget | undefined
): {
  spent: number
  budget: number
  remaining: number
  percentage: number
} {
  const categoryExpenses = expenses.filter(
    expense => expense.category === categoryId
  )
  
  const spent = categoryExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  
  const budgetAmount = budget?.monthlyLimit || 0
  const remaining = budgetAmount - spent
  const percentage = calculateBudgetUsagePercent(spent, budgetAmount)
  
  return {
    spent: Math.round(spent * 100) / 100,
    budget: budgetAmount,
    remaining: Math.round(remaining * 100) / 100,
    percentage
  }
}
