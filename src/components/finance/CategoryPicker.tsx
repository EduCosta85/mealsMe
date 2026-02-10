import type { Category } from '../../data/finance-types'

interface CategoryPickerProps {
  readonly categories: readonly Category[]
  readonly selectedCategoryId?: string
  readonly onSelect: (categoryId: string) => void
  readonly className?: string
}

/**
 * CategoryPicker Component
 *
 * Visual category picker with icons, colors, and selection states.
 * Displays categories in a responsive grid layout optimized for mobile-first design.
 *
 * Features:
 * - Responsive grid (2 cols mobile → 3-4 cols tablet → 4-6 cols desktop)
 * - Visual feedback for selected state (orange border + checkmark)
 * - Category icons and colors prominently displayed
 * - 80px minimum touch targets for accessibility
 * - Hover and active states for better UX
 *
 * @example
 * ```tsx
 * <CategoryPicker
 *   categories={categories}
 *   selectedCategoryId={selectedId}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export default function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  className = '',
}: CategoryPickerProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 ${className}`}
      role="group"
      aria-label="Seleção de categoria"
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedCategoryId

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`
              relative flex flex-col items-center justify-center
              min-h-[80px] p-4 rounded-lg border-2 transition-all
              hover:scale-105 active:scale-95
              focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
            aria-pressed={isSelected}
            aria-label={`Selecionar categoria ${category.name}`}
            type="button"
          >
            {/* Selected Checkmark */}
            {isSelected && (
              <div
                className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}

            {/* Category Icon */}
            <div
              className="text-3xl mb-1"
              style={{
                filter: isSelected ? 'none' : 'grayscale(20%)',
              }}
              aria-hidden="true"
            >
              {category.icon}
            </div>

            {/* Category Name */}
            <span className="text-xs font-medium text-gray-700 text-center line-clamp-1">
              {category.name}
            </span>

            {/* Category Color Indicator */}
            <div
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
