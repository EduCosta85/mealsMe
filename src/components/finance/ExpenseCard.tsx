import { useState } from 'react'
import type { Expense } from '../../data/finance-types'

interface ExpenseCardProps {
  readonly expense: Expense
  readonly categoryName?: string
  readonly categoryIcon?: string
  readonly categoryColor?: string
  readonly onEdit?: (expense: Expense) => void
  readonly onDelete?: (id: string) => void
  readonly className?: string
}

/**
 * ExpenseCard component displays an individual expense with category info,
 * amount, date, payment method, and action buttons.
 * 
 * Features:
 * - Collapsible card with compact and expanded views
 * - Category icon with custom color
 * - Currency formatting (R$ BRL)
 * - Date formatting (pt-BR)
 * - Payment method icons
 * - Installment indicator
 * - Edit/delete actions with 48px touch targets
 * - Mobile-first responsive design
 * 
 * @example
 * ```tsx
 * <ExpenseCard
 *   expense={expense}
 *   categoryName="Alimentação"
 *   categoryIcon="🍕"
 *   categoryColor="#f97316"
 *   onEdit={(exp) => handleEdit(exp)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * ```
 */
export function ExpenseCard({
  expense,
  categoryName = 'Sem categoria',
  categoryIcon = '📌',
  categoryColor = '#6b7280',
  onEdit,
  onDelete,
  className = ''
}: ExpenseCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Format currency in Brazilian Real
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  // Format date in Brazilian Portuguese
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    }

    // Otherwise, return formatted date
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Payment method icons mapping
  const paymentMethodIcons: Record<string, string> = {
    cash: '💰',
    debit: '💳',
    credit: '💳',
    pix: '🔷'
  }

  // Payment method labels
  const paymentMethodLabels: Record<string, string> = {
    cash: 'Dinheiro',
    debit: 'Débito',
    credit: 'Crédito',
    pix: 'PIX'
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors bg-white border-gray-200 ${className}`}
    >
      {/* Compact View - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {/* Category Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          {categoryIcon}
        </div>

        {/* Expense Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-on-surface truncate">
              {expense.description}
            </span>
            {expense.installmentId && (
              <span className="shrink-0 rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                parcelado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-on-surface-muted">{categoryName}</span>
            <span className="text-xs text-on-surface-muted">•</span>
            <span className="text-xs text-on-surface-muted">{formatDate(expense.date)}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-on-surface">{formatCurrency(expense.amount)}</p>
          <p className="text-xs text-on-surface-muted mt-0.5">
            {paymentMethodIcons[expense.paymentMethod]} {paymentMethodLabels[expense.paymentMethod]}
          </p>
        </div>

        {/* Expand/Collapse Icon */}
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded View - Details & Actions */}
      {isOpen && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {/* Additional Details */}
          <div className="space-y-2 mb-4">
            {/* Payment Method Detail */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-muted">Forma de pagamento:</span>
              <span className="font-medium text-on-surface">
                {paymentMethodIcons[expense.paymentMethod]} {paymentMethodLabels[expense.paymentMethod]}
              </span>
            </div>

            {/* Category Detail */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-muted">Categoria:</span>
              <div className="flex items-center gap-2">
                <span>{categoryIcon}</span>
                <span className="font-medium text-on-surface">{categoryName}</span>
              </div>
            </div>

            {/* Date Detail */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-muted">Data:</span>
              <span className="font-medium text-on-surface">{formatDate(expense.date)}</span>
            </div>

            {/* Installment Info */}
            {expense.installmentId && (
              <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-600">💳</span>
                  <span className="font-medium text-blue-700">Compra parcelada</span>
                </div>
                <p className="mt-1 text-xs text-blue-600">
                  Esta despesa faz parte de uma compra parcelada
                </p>
              </div>
            )}

            {/* Tags */}
            {expense.tags && expense.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {expense.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Recurring Badge */}
            {expense.isRecurring && (
              <div className="mt-2">
                <span className="rounded-sm bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                  🔄 Despesa recorrente
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {(onEdit || onDelete) && (
            <div className="grid grid-cols-2 gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(expense)}
                  className="h-12 rounded-lg border-2 border-orange-500 bg-orange-500 text-white text-sm font-medium transition-all active:bg-orange-600 hover:bg-orange-600"
                >
                  <span className="mr-1">✏️</span>
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(expense.id)}
                  className="h-12 rounded-lg border-2 border-red-500 bg-red-500 text-white text-sm font-medium transition-all active:bg-red-600 hover:bg-red-600"
                >
                  <span className="mr-1">🗑️</span>
                  Deletar
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
