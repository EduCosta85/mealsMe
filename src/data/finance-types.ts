// Finance System Type Definitions
// Following patterns from types.ts and meal-plan.ts

export type CategoryType = 'fixed' | 'variable'

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix'

export type InstallmentStatus = 'active' | 'completed' | 'cancelled' | 'overdue'

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'skipped'

export type IncomeFrequency = 'monthly' | 'weekly' | 'one-time'

export interface Category {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly color: string
  readonly budget: number
  readonly type: CategoryType
}

export interface Expense {
  readonly id: string
  readonly userId: string
  readonly amount: number
  readonly category: string
  readonly subcategory?: string
  readonly date: number
  readonly description: string
  readonly paymentMethod: PaymentMethod
  readonly isRecurring: boolean
  readonly tags?: readonly string[]
  readonly receiptUrl?: string
  readonly installmentId?: string
  readonly createdAt: number
  readonly updatedAt: number
}

export interface Budget {
  readonly id: string
  readonly userId: string
  readonly category: string
  readonly monthlyLimit: number
  readonly currentSpent: number
  readonly remaining: number
  readonly month: string
  readonly year: number
  readonly alerts: {
    readonly enabled: boolean
    readonly threshold: number
    readonly notified: boolean
  }
  readonly createdAt: number
  readonly updatedAt: number
}

export interface Income {
  readonly id: string
  readonly userId: string
  readonly amount: number
  readonly source: string
  readonly description: string
  readonly date: number
  readonly isRecurring: boolean
  readonly frequency: IncomeFrequency
  readonly createdAt: number
  readonly updatedAt: number
}

export interface RecurringExpense {
  readonly id: string
  readonly userId: string
  readonly amount: number
  readonly category: string
  readonly description: string
  readonly paymentMethod: PaymentMethod
  readonly dayOfMonth: number
  readonly isActive: boolean
  readonly startDate: number
  readonly endDate?: number
  readonly createdAt: number
  readonly updatedAt: number
}

export interface InstallmentPayment {
  readonly id: string
  readonly installmentId: string
  readonly installmentNumber: number
  readonly amount: number
  readonly dueDate: number
  readonly paidDate?: number
  readonly status: PaymentStatus
  readonly paymentMethod?: PaymentMethod
  readonly notes?: string
  readonly createdAt: number
}

export interface Installment {
  readonly id: string
  readonly userId: string
  readonly totalAmount: number
  readonly installmentAmount: number
  readonly totalInstallments: number
  readonly paidInstallments: number
  readonly remainingInstallments: number
  readonly remainingAmount: number
  readonly description: string
  readonly category: string
  readonly vendor?: string
  readonly startDate: number
  readonly endDate: number
  readonly nextDueDate: number
  readonly paymentDay: number
  readonly status: InstallmentStatus
  readonly createdAt: number
  readonly updatedAt: number
}

export interface MonthlyStats {
  readonly id: string
  readonly userId: string
  readonly month: string
  readonly year: number
  readonly totalIncome: number
  readonly totalExpenses: number
  readonly totalSavings: number
  readonly expensesByCategory: Record<string, number>
  readonly budgetVsActual: Record<string, {
    readonly budget: number
    readonly actual: number
    readonly variance: number
  }>
  readonly updatedAt: number
}
