// Finance Validation Module
// Pure functions for input validation with clear error messages
// Following patterns from code-quality.md and security-patterns.md

import type { Expense, Budget, Category } from '../../data/finance-types'

// Validation result types
export interface ValidationResult {
  readonly isValid: boolean
  readonly error?: string
}

export interface MultiValidationResult {
  readonly isValid: boolean
  readonly errors: readonly string[]
}

/**
 * Validates that an amount is a positive, finite number greater than zero
 * @param amount - The monetary amount to validate
 * @returns Validation result with error message if invalid
 */
export const validateAmount = (amount: number): ValidationResult => {
  // Check for NaN
  if (Number.isNaN(amount)) {
    return { isValid: false, error: 'O valor deve ser um número válido' }
  }

  // Check for Infinity
  if (!Number.isFinite(amount)) {
    return { isValid: false, error: 'O valor deve ser um número finito' }
  }

  // Check for positive and greater than zero
  if (amount <= 0) {
    return { isValid: false, error: 'O valor deve ser maior que zero' }
  }

  return { isValid: true }
}

/**
 * Validates expense input data
 * @param expense - Partial expense object to validate
 * @returns Validation result with array of error messages
 */
export const validateExpenseInput = (
  expense: Partial<Expense>
): MultiValidationResult => {
  const errors: string[] = []

  // Validate required fields
  if (expense.amount === undefined) {
    errors.push('O campo "amount" é obrigatório')
  } else {
    const amountValidation = validateAmount(expense.amount)
    if (!amountValidation.isValid && amountValidation.error) {
      errors.push(amountValidation.error)
    }
  }

  if (!expense.category) {
    errors.push('O campo "categoryId" é obrigatório')
  }

  if (!expense.description) {
    errors.push('O campo "description" é obrigatório')
  } else if (expense.description.trim().length < 3) {
    errors.push('A descrição deve ter no mínimo 3 caracteres')
  }

  if (expense.date === undefined) {
    errors.push('O campo "date" é obrigatório')
  } else if (!Number.isFinite(expense.date) || expense.date < 0) {
    errors.push('A data deve ser um timestamp válido')
  }

  if (!expense.paymentMethod) {
    errors.push('O campo "paymentMethod" é obrigatório')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates budget input data
 * @param budget - Partial budget object to validate
 * @returns Validation result with array of error messages
 */
export const validateBudgetInput = (
  budget: Partial<Budget>
): MultiValidationResult => {
  const errors: string[] = []

  // Validate required fields
  if (!budget.category) {
    errors.push('O campo "categoryId" é obrigatório')
  }

  if (!budget.month) {
    errors.push('O campo "month" é obrigatório')
  } else {
    // Validate month format: YYYY-MM
    const monthRegex = /^\d{4}-\d{2}$/
    if (!monthRegex.test(budget.month)) {
      errors.push('O formato do mês deve ser YYYY-MM')
    }
  }

  if (budget.monthlyLimit === undefined) {
    errors.push('O campo "amount" é obrigatório')
  } else {
    const amountValidation = validateAmount(budget.monthlyLimit)
    if (!amountValidation.isValid && amountValidation.error) {
      errors.push(amountValidation.error)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates category input data
 * @param category - Partial category object to validate
 * @returns Validation result with array of error messages
 */
export const validateCategoryInput = (
  category: Partial<Category>
): MultiValidationResult => {
  const errors: string[] = []

  // Validate name
  if (!category.name) {
    errors.push('O campo "name" é obrigatório')
  } else if (category.name.trim().length < 2) {
    errors.push('O nome deve ter no mínimo 2 caracteres')
  } else if (category.name.length > 50) {
    errors.push('O nome deve ter no máximo 50 caracteres')
  }

  // Validate icon
  if (!category.icon) {
    errors.push('O campo "icon" é obrigatório')
  } else if (category.icon.trim().length < 1) {
    errors.push('O ícone deve ter no mínimo 1 caractere')
  }

  // Validate color
  if (!category.color) {
    errors.push('O campo "color" é obrigatório')
  } else if (!category.color.startsWith('#')) {
    errors.push('A cor deve ser um código hexadecimal (começar com #)')
  }

  // Validate type
  if (!category.type) {
    errors.push('O campo "type" é obrigatório')
  } else if (category.type !== 'fixed' && category.type !== 'variable') {
    errors.push('O tipo deve ser "fixed" ou "variable"')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates a date range
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Validation result with error message if invalid
 */
export const validateDateRange = (
  startDate: Date,
  endDate: Date
): ValidationResult => {
  // Check if dates are valid
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    return { isValid: false, error: 'A data inicial não é válida' }
  }

  if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
    return { isValid: false, error: 'A data final não é válida' }
  }

  // Check if startDate is before or equal to endDate
  if (startDate.getTime() > endDate.getTime()) {
    return { isValid: false, error: 'A data inicial deve ser anterior à data final' }
  }

  return { isValid: true }
}
