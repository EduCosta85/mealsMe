import type { Installment, InstallmentPayment } from '../../data/finance-types'
import { calculatePaidInstallments } from '../../lib/finance/installments'

interface InstallmentTrackerProps {
  readonly installment: Installment
  readonly payments: readonly InstallmentPayment[]
  readonly onMarkPaid?: (paymentId: string) => void
  readonly showDetails?: boolean
  readonly className?: string
}

/**
 * InstallmentTracker Component
 * 
 * Displays credit card installment payment progress with visual indicators.
 * Shows summary view with progress bar and optional detailed payment list.
 * 
 * Features:
 * - Progress indicator (paid/total installments)
 * - Visual progress bar
 * - Detailed payment list (optional)
 * - Mark as paid action (optional)
 * - Mobile-first responsive design
 * 
 * @example
 * ```tsx
 * <InstallmentTracker
 *   installment={installment}
 *   payments={payments}
 *   onMarkPaid={handleMarkPaid}
 *   showDetails={true}
 * />
 * ```
 */
export default function InstallmentTracker({
  installment,
  payments,
  onMarkPaid,
  showDetails = false,
  className = ''
}: InstallmentTrackerProps) {
  const paidCount = calculatePaidInstallments(payments)
  const percentage = (paidCount / installment.totalInstallments) * 100

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Summary View */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Parcela {paidCount}/{installment.totalInstallments}
          </p>
          <p className="text-xs text-gray-500">
            {formatCurrency(installment.installmentAmount)} × {installment.totalInstallments}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">
            {formatCurrency(installment.totalAmount)}
          </p>
          <p className="text-xs text-gray-500">
            {paidCount} pagas
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={paidCount}
          aria-valuemin={0}
          aria-valuemax={installment.totalInstallments}
          aria-label={`${paidCount} de ${installment.totalInstallments} parcelas pagas`}
        />
      </div>

      {/* Details View */}
      {showDetails && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-700 uppercase">Pagamentos</p>
          {payments.map((payment) => {
            const isPaid = payment.status === 'paid'
            
            return (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-2 rounded ${
                  isPaid ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className={`text-lg ${isPaid ? 'text-green-600' : 'text-gray-400'}`}
                    aria-hidden="true"
                  >
                    {isPaid ? '✓' : '○'}
                  </span>
                  <div>
                    <p className={`text-sm ${isPaid ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {formatDate(payment.dueDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>

                {/* Mark as Paid Button */}
                {!isPaid && onMarkPaid && (
                  <button
                    onClick={() => onMarkPaid(payment.id)}
                    className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-label={`Marcar parcela de ${formatCurrency(payment.amount)} como paga`}
                  >
                    Marcar paga
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
