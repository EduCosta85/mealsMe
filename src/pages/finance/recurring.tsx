import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useRecurring } from '@/hooks/useRecurring'
import { useCategories } from '@/hooks/useCategories'
import { validateAmount } from '@/lib/finance/validation'
import type { PaymentMethod } from '@/data/finance-types'

/**
 * RecurringPage Component
 *
 * Manages recurring expenses with CRUD operations.
 * Features:
 * - List all recurring expenses with active/inactive status
 * - Add new recurring expense with validation
 * - Edit existing recurring expense
 * - Delete recurring expense with confirmation
 * - Toggle active/inactive status
 * - Mobile-first responsive design with 48px touch targets
 *
 * @example
 * ```tsx
 * <Route path="/finance/recurring" element={<RecurringPage />} />
 * ```
 */
export default function RecurringPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('debit')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')

  // Data hooks
  const {
    recurring,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    getActiveRecurring,
  } = useRecurring({ userId: user!.uid })

  const { categories, getCategoryById } = useCategories({
    userId: user!.uid,
  })

  const activeRecurring = getActiveRecurring()

  /**
   * Calculate total monthly amount from active recurring expenses
   */
  const totalMonthlyAmount = useCallback(() => {
    return activeRecurring.reduce((sum, rec) => sum + rec.amount, 0)
  }, [activeRecurring])

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setShowForm(false)
    setEditingId(null)
    setCategoryId('')
    setAmount('')
    setDescription('')
    setDayOfMonth('1')
    setPaymentMethod('debit')
    setIsActive(true)
    setError('')
  }, [])

  /**
   * Handle form submission for create/update
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      // Validate amount
      const amountNum = parseFloat(amount)
      const validation = validateAmount(amountNum)
      if (!validation.isValid) {
        setError(validation.error || 'Valor inválido')
        return
      }

      // Validate day of month
      const day = parseInt(dayOfMonth)
      if (day < 1 || day > 31) {
        setError('Dia deve estar entre 1 e 31')
        return
      }

      // Validate category
      if (!categoryId) {
        setError('Selecione uma categoria')
        return
      }

      // Validate description
      if (!description.trim()) {
        setError('Descrição é obrigatória')
        return
      }

      try {
        const now = Date.now()
        const data = {
          category: categoryId,
          amount: amountNum,
          description: description.trim(),
          dayOfMonth: day,
          isActive,
          paymentMethod,
          startDate: now,
          updatedAt: now,
        }

        if (editingId) {
          await updateRecurring(editingId, data)
        } else {
          await createRecurring(data)
        }

        resetForm()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao salvar despesa recorrente',
        )
      }
    },
    [
      amount,
      categoryId,
      dayOfMonth,
      description,
      editingId,
      isActive,
      paymentMethod,
      createRecurring,
      updateRecurring,
      resetForm,
    ],
  )

  /**
   * Populate form with existing recurring expense data for editing
   */
  const handleEdit = useCallback(
    (rec: (typeof recurring)[number]) => {
      setEditingId(rec.id)
      setCategoryId(rec.category)
      setAmount(rec.amount.toString())
      setDescription(rec.description)
      setDayOfMonth(rec.dayOfMonth.toString())
      setPaymentMethod(rec.paymentMethod)
      setIsActive(rec.isActive)
      setShowForm(true)
    },
    [],
  )

  /**
   * Toggle active/inactive status of recurring expense
   */
  const handleToggle = useCallback(
    async (id: string, currentActive: boolean) => {
      try {
        await updateRecurring(id, { isActive: !currentActive })
      } catch {
        setError('Erro ao atualizar status')
      }
    },
    [updateRecurring],
  )

  /**
   * Delete recurring expense with confirmation
   */
  const handleDelete = useCallback(
    async (id: string, desc: string) => {
      if (
        window.confirm(
          `Deletar despesa recorrente "${desc}"?\n\nEsta ação não pode ser desfeita.`,
        )
      ) {
        try {
          await deleteRecurring(id)
        } catch {
          setError('Erro ao deletar despesa recorrente')
        }
      }
    },
    [deleteRecurring],
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <button
          onClick={() => navigate('/finance')}
          className="text-gray-600 mb-2 min-h-[48px] flex items-center hover:text-gray-900 transition-colors"
          aria-label="Voltar para finanças"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Despesas Recorrentes
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Despesas lançadas automaticamente todo mês
        </p>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6">
        {/* Summary Card */}
        <section
          className="bg-white rounded-lg p-4 shadow"
          aria-label="Resumo de despesas recorrentes"
        >
          <p className="text-sm text-gray-500">
            Ativas: {activeRecurring.length}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            R$ {totalMonthlyAmount().toFixed(2)}/mês
          </p>
        </section>

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full min-h-[48px] bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Adicionar nova despesa recorrente"
          >
            + Nova Despesa Recorrente
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-4 shadow space-y-4"
            aria-label={
              editingId
                ? 'Editar despesa recorrente'
                : 'Adicionar despesa recorrente'
            }
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Editar Despesa' : 'Nova Despesa'}
            </h2>

            {/* Category Selector */}
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Categoria
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Selecione a categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Valor (R$)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descrição
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Internet, Netflix"
                className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Day of Month Input */}
            <div className="space-y-2">
              <label
                htmlFor="dayOfMonth"
                className="block text-sm font-medium text-gray-700"
              >
                Dia do mês
              </label>
              <input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="1-31"
                className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700"
              >
                Forma de pagamento
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="w-full min-h-[48px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              >
                <option value="cash">Dinheiro</option>
                <option value="debit">Débito</option>
                <option value="credit">Crédito</option>
                <option value="pix">PIX</option>
              </select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Ativa
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
                role="alert"
              >
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 min-h-[48px] bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 min-h-[48px] bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Recurring List */}
        <section
          className="space-y-3"
          aria-label="Lista de despesas recorrentes"
        >
          {recurring.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow text-center">
              <p className="text-gray-500">
                Nenhuma despesa recorrente cadastrada
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Adicione despesas que se repetem todo mês
              </p>
            </div>
          ) : (
            recurring.map((rec) => {
              const category = getCategoryById(rec.category)
              return (
                <article
                  key={rec.id}
                  className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-2xl"
                        aria-hidden="true"
                      >
                        {category?.icon}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {rec.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dia {rec.dayOfMonth} • {category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        R$ {rec.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() =>
                          handleToggle(rec.id, rec.isActive)
                        }
                        className={`text-xs px-2 py-1 rounded min-h-[32px] transition-colors ${
                          rec.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        aria-label={`${rec.isActive ? 'Desativar' : 'Ativar'} despesa recorrente ${rec.description}`}
                      >
                        {rec.isActive ? 'Ativa' : 'Inativa'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => handleEdit(rec)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium min-h-[32px] transition-colors"
                      aria-label={`Editar despesa recorrente ${rec.description}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(rec.id, rec.description)
                      }
                      className="text-sm text-red-600 hover:text-red-700 font-medium min-h-[32px] transition-colors"
                      aria-label={`Remover despesa recorrente ${rec.description}`}
                    >
                      Remover
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </section>

        {/* Info Section */}
        <section
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          aria-label="Informações sobre despesas recorrentes"
        >
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Como funciona?
          </h3>
          <p className="text-sm text-blue-800">
            Despesas recorrentes são lançadas automaticamente todo
            mês no dia especificado. Você pode ativar ou desativar
            uma despesa a qualquer momento sem precisar deletá-la.
          </p>
        </section>
      </main>
    </div>
  )
}
