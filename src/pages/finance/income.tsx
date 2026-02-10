import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useIncome } from '@/hooks/useIncome'
import { validateAmount } from '@/lib/finance/validation'
import type { IncomeFrequency } from '@/data/finance-types'

/**
 * Income Tracking Page
 * 
 * Page for tracking and managing income records with monthly summaries.
 * Implements mobile-first responsive design with proper validation.
 * 
 * Features:
 * - Monthly income summary (total and count)
 * - Add income form with validation
 * - Income list sorted by date (newest first)
 * - Edit/delete income actions
 * - Month navigation
 * - Green color theme for income
 * - 48px minimum touch targets
 * 
 * @example
 * ```tsx
 * <Route path="/finance/income" element={<IncomePage />} />
 * ```
 */
export default function IncomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Current month calculation
  const currentMonth = new Date()
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`

  const { 
    createIncome, 
    deleteIncome, 
    getIncomeByMonth,
    getTotalIncomeByMonth
  } = useIncome({ userId: user!.uid })

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [frequency, setFrequency] = useState<IncomeFrequency>('one-time')
  
  // UI state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get month data
  const monthIncome = getIncomeByMonth(monthKey)
  const total = getTotalIncomeByMonth(monthKey)

  // Sort income by date (newest first)
  const sortedIncome = [...monthIncome].sort((a, b) => b.date - a.date)

  /**
   * Handle form submission
   * Validates input and creates income record
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validate amount
    const amountNum = parseFloat(amount)
    const validation = validateAmount(amountNum)
    if (!validation.isValid) {
      setError(validation.error || 'Valor inválido')
      return
    }

    // Validate source
    if (!source.trim()) {
      setError('Fonte é obrigatória')
      return
    }

    try {
      setLoading(true)

      await createIncome({
        amount: amountNum,
        description: description.trim() || source,
        source: source.trim(),
        date: new Date(date).getTime(),
        isRecurring: frequency !== 'one-time',
        frequency
      })

      // Reset form
      setShowForm(false)
      setAmount('')
      setDescription('')
      setSource('')
      setDate(new Date().toISOString().split('T')[0])
      setFrequency('one-time')
    } catch (err) {
      setError('Erro ao adicionar receita')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle income deletion with confirmation
   */
  const handleDelete = async (id: string, source: string) => {
    if (!confirm(`Deletar receita "${source}"?`)) {
      return
    }

    try {
      await deleteIncome(id)
    } catch (err) {
      console.error('Error deleting income:', err)
      alert('Erro ao deletar receita')
    }
  }

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  /**
   * Cancel form and reset state
   */
  const handleCancel = () => {
    setShowForm(false)
    setAmount('')
    setDescription('')
    setSource('')
    setDate(new Date().toISOString().split('T')[0])
    setFrequency('one-time')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => navigate('/finance')}
          className="text-gray-600 hover:text-gray-900 mb-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
          aria-label="Voltar para dashboard"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
        <p className="text-sm text-gray-500">{monthKey}</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-500">Total do Mês</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {monthIncome.length} {monthIncome.length === 1 ? 'receita' : 'receitas'}
          </p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-12 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Adicionar nova receita"
          >
            + Adicionar Receita
          </button>
        )}

        {/* Add Income Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Nova Receita</h2>

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
                  className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="0,00"
                  required
                  aria-required="true"
                  aria-invalid={error.includes('valor') ? 'true' : 'false'}
                />
              </div>
            </div>

            {/* Source */}
            <div>
              <label 
                htmlFor="source"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fonte *
              </label>
              <input
                id="source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ex: Salário, Freelance"
                required
                aria-required="true"
                aria-invalid={error.includes('Fonte') ? 'true' : 'false'}
              />
            </div>

            {/* Description */}
            <div>
              <label 
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição (opcional)
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Detalhes adicionais"
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
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
                aria-required="true"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência
              </label>
              <div 
                className="grid grid-cols-3 gap-2"
                role="group"
                aria-label="Frequência da receita"
              >
                {[
                  { value: 'one-time' as const, label: 'Única' },
                  { value: 'monthly' as const, label: 'Mensal' },
                  { value: 'weekly' as const, label: 'Semanal' },
                ].map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setFrequency(freq.value)}
                    className={`
                      h-12 rounded-lg border-2 transition-all font-medium text-sm
                      focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                      ${
                        frequency === freq.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    aria-pressed={frequency === freq.value}
                    aria-label={`Selecionar frequência ${freq.label.toLowerCase()}`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
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

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-12 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-busy={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 h-12 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Income List */}
        <div className="space-y-3">
          {sortedIncome.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow text-center">
              <p className="text-gray-500">Nenhuma receita registrada neste mês</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                >
                  Adicionar primeira receita
                </button>
              )}
            </div>
          ) : (
            sortedIncome.map((inc) => (
              <div 
                key={inc.id} 
                className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{inc.source}</p>
                    {inc.description && inc.description !== inc.source && (
                      <p className="text-sm text-gray-600 mt-1">{inc.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(inc.date)}
                      </p>
                      {inc.isRecurring && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          {inc.frequency === 'monthly' ? 'Mensal' : 'Semanal'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600 ml-4">
                    R$ {inc.amount.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(inc.id, inc.source)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  aria-label={`Remover receita ${inc.source}`}
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
