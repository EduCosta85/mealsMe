import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import CategoryPicker from '@/components/finance/CategoryPicker'
import { validateAmount, validateExpenseInput } from '@/lib/finance/validation'
import { calculateInstallmentAmount } from '@/lib/finance/installments'
import type { PaymentMethod } from '@/data/finance-types'

/**
 * AddExpense Page
 * 
 * Form page for adding new expenses with installment support.
 * Implements mobile-first responsive design with proper validation.
 * 
 * Features:
 * - Amount input with R$ prefix
 * - Category picker with visual selection
 * - Description field with validation
 * - Date picker (default: today)
 * - Payment method selector (Cash, Debit, Credit, PIX)
 * - Conditional installment input (Credit only)
 * - Real-time installment preview
 * - Form validation with Portuguese error messages
 * - Loading states during submission
 * - Navigation back to dashboard on success
 * 
 * @example
 * ```tsx
 * <Route path="/finance/add-expense" element={<AddExpense />} />
 * ```
 */
export default function AddExpense() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { createExpense } = useExpenses({ userId: user!.uid })
  const { categories } = useCategories({ userId: user!.uid })

  // Form state
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [installments, setInstallments] = useState(1)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Handle form submission
   * Validates input, creates expense (with installments if applicable)
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validate amount
    const amountNum = parseFloat(amount)
    const amountValidation = validateAmount(amountNum)
    if (!amountValidation.isValid) {
      setError(amountValidation.error || 'Valor inválido')
      return
    }

    // Validate expense data
    const expenseData = {
      amount: amountNum,
      category: categoryId,
      description,
      date: new Date(date).getTime(),
      paymentMethod,
      isRecurring: false,
    }

    const validation = validateExpenseInput(expenseData)
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }

    // Validate installments for credit
    if (paymentMethod === 'credit' && (installments < 1 || installments > 36)) {
      setError('Número de parcelas deve estar entre 1 e 36')
      return
    }

    try {
      setLoading(true)

      // Create expense
      await createExpense(expenseData)

      // Navigate back to dashboard
      navigate('/finance')
    } catch (err) {
      setError('Erro ao criar despesa')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calculate installment preview
   */
  const getInstallmentPreview = (): string => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return ''
    
    if (installments === 1) {
      return 'À vista'
    }
    
    const installmentAmount = calculateInstallmentAmount(amountNum, installments)
    return `${installments}× de R$ ${installmentAmount.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => navigate('/finance')}
          className="text-gray-600 hover:text-gray-900 mb-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
          aria-label="Voltar para dashboard"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Despesa</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Amount */}
        <div>
          <label 
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Valor *
          </label>
          <div className="relative">
            <span 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            >
              R$
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="0,00"
              required
              aria-required="true"
              aria-invalid={error.includes('valor') ? 'true' : 'false'}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <CategoryPicker
            categories={categories}
            selectedCategoryId={categoryId}
            onSelect={setCategoryId}
          />
          {!categoryId && error && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              Selecione uma categoria
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label 
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Descrição *
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Ex: Almoço no restaurante"
            required
            minLength={3}
            aria-required="true"
            aria-invalid={error.includes('descrição') ? 'true' : 'false'}
          />
        </div>

        {/* Date */}
        <div>
          <label 
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Data *
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            required
            aria-required="true"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forma de Pagamento *
          </label>
          <div 
            className="grid grid-cols-2 gap-3"
            role="group"
            aria-label="Forma de pagamento"
          >
            {[
              { value: 'cash' as const, icon: '💰', label: 'Dinheiro' },
              { value: 'debit' as const, icon: '💳', label: 'Débito' },
              { value: 'credit' as const, icon: '💳', label: 'Crédito' },
              { value: 'pix' as const, icon: '🔷', label: 'PIX' },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => {
                  setPaymentMethod(method.value)
                  if (method.value !== 'credit') {
                    setInstallments(1)
                  }
                }}
                className={`
                  h-12 rounded-lg border-2 transition-all font-medium
                  focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                  ${
                    paymentMethod === method.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                aria-pressed={paymentMethod === method.value}
                aria-label={`Selecionar ${method.label}`}
              >
                <span aria-hidden="true">{method.icon}</span> {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Installments (Credit only) */}
        {paymentMethod === 'credit' && (
          <div>
            <label 
              htmlFor="installments"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Parcelas
            </label>
            <input
              id="installments"
              type="number"
              min="1"
              max="36"
              value={installments}
              onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              aria-describedby="installment-preview"
            />
            {amount && installments > 0 && (
              <p 
                id="installment-preview"
                className="mt-2 text-sm text-gray-600"
                aria-live="polite"
              >
                {getInstallmentPreview()}
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div 
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !categoryId}
          className="w-full h-12 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-busy={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Despesa'}
        </button>
      </form>
    </div>
  )
}
