// Recurring Expense Business Logic
// Pure functions for recurring expense auto-launch logic

import type { RecurringExpense, Expense } from '../../data/finance-types'

/**
 * Check if a recurring expense should launch based on current date and last launch date.
 * 
 * For monthly frequency:
 * - Returns true if lastLaunchDate is null (never launched)
 * - Returns true if current month is different from last launch month
 * - Returns false if already launched in current month
 * 
 * @param currentDate - The current date to check against
 * @param lastLaunchDate - The date of the last launch, or null if never launched
 * @returns true if the recurring expense should launch, false otherwise
 */
export const shouldLaunchRecurring = (
  currentDate: Date,
  lastLaunchDate: Date | null
): boolean => {
  // Never launched before
  if (lastLaunchDate === null) {
    return true
  }

  // Check if in different month
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const lastMonth = lastLaunchDate.getMonth()
  const lastYear = lastLaunchDate.getFullYear()

  return currentYear !== lastYear || currentMonth !== lastMonth
}

/**
 * Generate a new Expense object from a RecurringExpense template.
 * 
 * Creates a new expense with all fields from the recurring template,
 * setting the date to the launch date and linking back to the recurring expense.
 * 
 * @param recurring - The recurring expense template
 * @param launchDate - The date for the new expense
 * @param userId - The user ID for the expense
 * @returns A new Expense object without an id (Firestore will generate)
 */
export const generateExpenseFromRecurring = (
  recurring: RecurringExpense,
  launchDate: Date,
  userId: string
): Omit<Expense, 'id'> => {
  const timestamp = launchDate.getTime()

  return {
    userId,
    amount: recurring.amount,
    category: recurring.category,
    date: timestamp,
    description: recurring.description,
    paymentMethod: recurring.paymentMethod,
    isRecurring: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

/**
 * Calculate the next due date for a recurring expense.
 * 
 * For monthly frequency: adds 1 month to the current date.
 * Handles edge cases like Jan 31 -> Feb 28/29.
 * 
 * @param currentDate - The current date
 * @param _frequency - The frequency type (currently only 'monthly' supported)
 * @returns The next due date
 */
export const calculateNextDueDate = (
  currentDate: Date,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _frequency: 'monthly'
): Date => {
  const nextDate = new Date(currentDate)
  
  // Add 1 month
  nextDate.setMonth(nextDate.getMonth() + 1)
  
  // Handle edge case: if day changed (e.g., Jan 31 -> Mar 3)
  // Set to last day of previous month
  if (nextDate.getDate() !== currentDate.getDate()) {
    nextDate.setDate(0) // Sets to last day of previous month
  }
  
  return nextDate
}

/**
 * Get all recurring expenses that are due for launch.
 * 
 * Filters recurring expenses to find those that:
 * 1. Are active
 * 2. Should launch based on current date
 * 3. Haven't already been launched this month
 * 
 * @param recurrings - Array of all recurring expenses
 * @param expenses - Array of all expenses (to check for existing launches)
 * @param currentDate - The current date to check against
 * @returns Array of recurring expenses ready to launch (immutable)
 */
export const getRecurringsDueForLaunch = (
  recurrings: readonly RecurringExpense[],
  expenses: readonly Expense[],
  currentDate: Date
): readonly RecurringExpense[] => {
  return recurrings.filter((recurring) => {
    // Skip inactive recurrings
    if (!recurring.isActive) {
      return false
    }

    // Find the most recent expense for this recurring
    const recurringExpenses = expenses.filter(
      (expense) => expense.category === recurring.category &&
                   expense.description === recurring.description &&
                   expense.amount === recurring.amount
    )

    // If no expenses found, should launch
    if (recurringExpenses.length === 0) {
      return true
    }

    // Find most recent expense
    const mostRecentExpense = recurringExpenses.reduce((latest, current) =>
      current.date > latest.date ? current : latest
    )

    const lastLaunchDate = new Date(mostRecentExpense.date)
    
    // Check if should launch based on last launch date
    return shouldLaunchRecurring(currentDate, lastLaunchDate)
  })
}
