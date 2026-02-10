import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  useCategories,
  initializeDefaultCategories,
} from '@/hooks/useCategories'
import { validateCategoryInput } from '@/lib/finance/validation'
import type { Category, CategoryType } from '@/data/finance-types'

/**
 * Category Management Page
 *
 * Provides a complete interface for managing expense categories with:
 * - Visual category grid with icons and colors
 * - Create/Edit/Delete operations
 * - Form validation using validateCategoryInput
 * - Default categories initialization
 * - Mobile-first responsive design with 48px touch targets
 *
 * Features:
 * - Category list in responsive grid (2 cols mobile → 3 cols tablet)
 * - Add category form with name, icon, color, and type inputs
 * - Inline editing by clicking on category cards
 * - Delete with confirmation (warns if category has expenses)
 * - Initialize default categories button (only shown when no categories exist)
 *
 * @example
 * Navigate to /finance/categories to access this page
 */
export default function CategoriesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('#f97316')
  const [type, setType] = useState<CategoryType>('variable')
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories({ userId: user!.uid })

  /**
   * Handle form submission for create/update operations
   * Validates input and creates or updates category based on editingId state
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate input using validation module
    const validation = validateCategoryInput({ name, icon, color, type })
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }

    try {
      if (editingId) {
        // Update existing category
        await updateCategory(editingId, { name, icon, color, type })
      } else {
        // Create new category
        await createCategory({ name, icon, color, type, budget: 0 })
      }

      // Reset form state
      resetForm()
    } catch (err) {
      setError('Erro ao salvar categoria')
      console.error('Error saving category:', err)
    }
  }

  /**
   * Reset form to initial state
   * Clears all input fields and closes the form
   */
  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setName('')
    setIcon('')
    setColor('#f97316')
    setType('variable')
    setError('')
  }

  /**
   * Populate form with category data for editing
   * Opens form in edit mode with pre-filled values
   */
  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setIcon(category.icon)
    setColor(category.color)
    setType(category.type)
    setShowForm(true)
    setError('')
  }

  /**
   * Handle category deletion with confirmation
   * Shows confirmation dialog before deleting
   */
  const handleDelete = async (categoryId: string) => {
    if (deleteConfirm !== categoryId) {
      // First click: show confirmation
      setDeleteConfirm(categoryId)
      return
    }

    // Second click: confirm deletion
    try {
      await deleteCategory(categoryId)
      setDeleteConfirm(null)
    } catch (err) {
      setError('Erro ao excluir categoria')
      console.error('Error deleting category:', err)
    }
  }

  /**
   * Initialize default categories for new users
   * Creates all predefined categories in Firestore
   */
  const handleInitDefaults = async () => {
    try {
      await initializeDefaultCategories(createCategory)
    } catch (err) {
      setError('Erro ao criar categorias padrão')
      console.error('Error initializing default categories:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate('/finance')}
          className="text-gray-600 mb-2 hover:text-gray-900 transition-colors flex items-center gap-1"
          aria-label="Voltar para dashboard"
        >
          <span className="text-lg">←</span> Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie suas categorias de despesas
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Default Categories Button - Only show if no categories exist */}
        {categories.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-3">
              Você ainda não tem categorias. Comece criando as categorias
              padrão ou adicione suas próprias.
            </p>
            <button
              onClick={handleInitDefaults}
              className="w-full h-12 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors"
              aria-label="Criar categorias padrão"
            >
              ✨ Criar Categorias Padrão
            </button>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-12 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-md"
            aria-label="Adicionar nova categoria"
          >
            + Nova Categoria
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-4 shadow-md space-y-4 border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            {/* Name Input */}
            <div>
              <label
                htmlFor="category-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome da Categoria
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alimentação"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                maxLength={50}
                aria-label="Nome da categoria"
              />
            </div>

            {/* Icon Input */}
            <div>
              <label
                htmlFor="category-icon"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ícone (Emoji)
              </label>
              <input
                id="category-icon"
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🍕"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-center text-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={2}
                required
                aria-label="Ícone da categoria"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use um emoji para representar a categoria
              </p>
            </div>

            {/* Color Input */}
            <div>
              <label
                htmlFor="category-color"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cor
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id="category-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  required
                  aria-label="Cor da categoria"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#f97316"
                  className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  aria-label="Código hexadecimal da cor"
                />
              </div>
            </div>

            {/* Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Despesa
              </label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-2 h-12 px-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                  <input
                    type="radio"
                    value="variable"
                    checked={type === 'variable'}
                    onChange={() => setType('variable')}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                    aria-label="Despesa variável"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Variável
                  </span>
                </label>
                <label className="flex-1 flex items-center gap-2 h-12 px-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                  <input
                    type="radio"
                    value="fixed"
                    checked={type === 'fixed'}
                    onChange={() => setType('fixed')}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                    aria-label="Despesa fixa"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Fixa
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fixa: despesas recorrentes (aluguel, contas). Variável:
                despesas ocasionais
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-3"
                role="alert"
              >
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 h-12 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:bg-orange-700 transition-colors"
                aria-label={editingId ? 'Atualizar categoria' : 'Criar categoria'}
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 h-12 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:bg-gray-400 transition-colors"
                aria-label="Cancelar"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Suas Categorias ({categories.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg p-4 shadow-md border border-gray-200 relative group hover:shadow-lg transition-shadow"
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(category.id)
                    }}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      deleteConfirm === category.id
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                    aria-label={
                      deleteConfirm === category.id
                        ? 'Confirmar exclusão'
                        : 'Excluir categoria'
                    }
                    title={
                      deleteConfirm === category.id
                        ? 'Clique novamente para confirmar'
                        : 'Excluir'
                    }
                  >
                    {deleteConfirm === category.id ? '✓' : '×'}
                  </button>

                  {/* Category Content - Clickable for Edit */}
                  <button
                    onClick={() => handleEdit(category)}
                    className="w-full text-center"
                    aria-label={`Editar categoria ${category.name}`}
                  >
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">
                      {category.name}
                    </p>
                    <div
                      className="w-full h-2 rounded mt-2"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {category.type === 'fixed' ? 'Fixa' : 'Variável'}
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {categories.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-gray-600 mb-2">Nenhuma categoria criada</p>
            <p className="text-sm text-gray-500">
              Crie categorias para organizar suas despesas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
