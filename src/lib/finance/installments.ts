// Installments Module - Pure Functions for Credit Card Installment Management
// Following patterns from code-quality.md and clean-code.md

import type { Installment, InstallmentPayment } from '../../data/finance-types'

/**
 * Calculate the amount per installment
 * Divides total by number of installments and rounds to 2 decimal places
 * 
 * @param totalAmount - Total amount to be divided
 * @param numberOfInstallments - Number of installments
 * @returns Amount per installment rounded to centavos
 * 
 * @example
 * calculateInstallmentAmount(300, 3) // Returns 100.00
 * calculateInstallmentAmount(100, 3) // Returns 33.33
 */
export function calculateInstallmentAmount(
  totalAmount: number,
  numberOfInstallments: number
): number {
  if (numberOfInstallments <= 0) {
    return 0
  }
  
  const amount = totalAmount / numberOfInstallments
  return Math.round(amount * 100) / 100
}

/**
 * Generate a schedule of installment payments
 * Creates one payment per month starting from startDate
 * All payments are created with 'pending' status
 * 
 * @param installment - Installment configuration
 * @param startDate - First payment due date
 * @returns Immutable array of InstallmentPayment objects
 * 
 * @example
 * const schedule = generateInstallmentSchedule(installment, new Date('2026-01-01'))
 * // Returns array of payments for Jan, Feb, Mar, etc.
 */
export function generateInstallmentSchedule(
  installment: Installment,
  startDate: Date
): readonly InstallmentPayment[] {
  const payments: InstallmentPayment[] = []
  
  for (let i = 0; i < installment.totalInstallments; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)
    
    const payment: InstallmentPayment = {
      id: `${installment.id}-payment-${i + 1}`,
      installmentId: installment.id,
      installmentNumber: i + 1,
      amount: installment.installmentAmount,
      dueDate: dueDate.getTime(),
      status: 'pending',
      createdAt: Date.now()
    }
    
    payments.push(payment)
  }
  
  return Object.freeze(payments)
}

/**
 * Count the number of paid installments
 * 
 * @param payments - Array of installment payments
 * @returns Count of payments with 'paid' status
 * 
 * @example
 * calculatePaidInstallments(payments) // Returns 3 if 3 are paid
 */
export function calculatePaidInstallments(
  payments: readonly InstallmentPayment[]
): number {
  return payments.filter(payment => payment.status === 'paid').length
}

/**
 * Calculate remaining balance on an installment
 * Formula: Total amount - (paid installments × amount per installment)
 * 
 * @param installment - Installment configuration
 * @param payments - Array of installment payments
 * @returns Remaining balance to be paid
 * 
 * @example
 * calculateRemainingBalance(installment, payments) // Returns 200.00 if 1 of 3 paid
 */
export function calculateRemainingBalance(
  installment: Installment,
  payments: readonly InstallmentPayment[]
): number {
  const paidCount = calculatePaidInstallments(payments)
  const paidAmount = paidCount * installment.installmentAmount
  const remaining = installment.totalAmount - paidAmount
  
  return Math.round(remaining * 100) / 100
}

/**
 * Get the next payment that is due
 * Finds the first pending payment sorted by due date
 * 
 * @param payments - Array of installment payments
 * @returns Next pending payment or null if all paid
 * 
 * @example
 * const next = getNextDueInstallment(payments)
 * if (next) console.log(`Next payment: ${next.amount} due ${next.dueDate}`)
 */
export function getNextDueInstallment(
  payments: readonly InstallmentPayment[]
): InstallmentPayment | null {
  const pendingPayments = payments
    .filter(payment => payment.status === 'pending')
    .sort((a, b) => a.dueDate - b.dueDate)
  
  return pendingPayments.length > 0 ? pendingPayments[0] : null
}
