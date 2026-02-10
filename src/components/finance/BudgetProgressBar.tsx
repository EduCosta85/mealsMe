import { calculateBudgetUsagePercent } from '@/lib/finance/calculations'

interface BudgetProgressBarProps {
  readonly spent: number
  readonly budget: number
  readonly categoryName?: string
  readonly categoryIcon?: string
  readonly showDetails?: boolean
  readonly className?: string
}

/**
 * Visual progress bar showing budget usage with color coding
 * 
 * Displays spending progress against budget with:
 * - Green (< 80%): Safe zone
 * - Yellow (80-100%): Warning zone
 * - Red (> 100%): Over budget
 * 
 * @example
 * ```tsx
 * <BudgetProgressBar
 *   spent={750}
 *   budget={1000}
 *   categoryName="Alimentação"
 *   categoryIcon="🍕"
 *   showDetails={true}
 * />
 * ```
 */
export default function BudgetProgressBar({
  spent,
  budget,
  categoryName,
  categoryIcon,
  showDetails = true,
  className = '',
}: BudgetProgressBarProps) {
  const percentage = calculateBudgetUsagePercent(spent, budget)
  const remaining = Math.max(0, budget - spent)

  // Color logic based on percentage thresholds
  const getColor = (pct: number): string => {
    if (pct > 100) return '#ef4444' // red-500
    if (pct >= 80) return '#f59e0b' // amber-500
    return '#10b981' // emerald-500
  }

  const color = getColor(percentage)
  const barWidth = Math.min(percentage, 100) // Cap visual at 100%

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  // Handle no budget case
  if (budget === 0) {
    return (
      <div className={`text-sm text-on-surface-muted ${className}`}>
        Sem orçamento definido
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header with category info and percentage */}
      {showDetails && categoryName && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {categoryIcon && (
              <span className="text-lg" aria-hidden="true">
                {categoryIcon}
              </span>
            )}
            <span className="font-medium text-on-surface">{categoryName}</span>
          </div>
          <span
            className="text-sm font-bold"
            style={{ color }}
            aria-label={`${percentage.toFixed(0)} por cento do orçamento utilizado`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Progress bar track and fill */}
      <div
        className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.min(percentage, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso do orçamento: ${percentage.toFixed(0)}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${barWidth}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Detailed spending information */}
      {showDetails && (
        <>
          <div className="flex items-center justify-between mt-1 text-xs text-on-surface-muted">
            <span>Gasto: {formatCurrency(spent)}</span>
            <span>Orçamento: {formatCurrency(budget)}</span>
          </div>

          {/* Over budget warning */}
          {percentage > 100 && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              ⚠️ {formatCurrency(spent - budget)} acima do orçamento
            </p>
          )}

          {/* Remaining budget */}
          {percentage <= 100 && (
            <p className="mt-1 text-xs text-on-surface-muted">
              Restante: {formatCurrency(remaining)}
            </p>
          )}
        </>
      )}
    </div>
  )
}
