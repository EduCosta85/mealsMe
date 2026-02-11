import { useState } from 'react'
import type { TimelineItem, ItemStatus } from '../../lib/timeline-utils'
import type { DailyProgress, ActivityStatus } from '../../data/types'

interface TimelineItemProps {
  readonly item: TimelineItem
  readonly status: ItemStatus
  readonly progress?: DailyProgress
  readonly onItemClick?: (itemId: string) => void
  readonly onChangeStatus?: (itemId: string, type: TimelineItem['type'], status: ActivityStatus) => void
  readonly toggleFood?: (mealId: string, foodIndex: number) => void
  readonly isFoodChecked?: (mealId: string, foodIndex: number) => boolean
}

/**
 * Get icon emoji based on timeline item type
 */
const getTypeIcon = (type: TimelineItem['type']): string => {
  const icons = {
    meal: '🍽️',
    supplement: '💊',
    training: '🏋️',
    water: '💧'
  }
  return icons[type]
}

/**
 * Get status badge configuration
 */
const getStatusBadge = (status: ItemStatus) => {
  const badges = {
    completed: {
      icon: '✓',
      label: 'Completo',
      className: 'bg-green-50 text-green-700 border-green-200'
    },
    partial: {
      icon: '🟡',
      label: 'Parcial',
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    pending: {
      icon: '⚪',
      label: 'Pendente',
      className: 'bg-gray-50 text-gray-500 border-gray-200'
    },
    skipped: {
      icon: '⏭️',
      label: 'Pulado',
      className: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    postponed: {
      icon: '⏸️',
      label: 'Adiado',
      className: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    missed: {
      icon: '❌',
      label: 'Perdido',
      className: 'bg-red-50 text-red-700 border-red-200'
    }
  }
  return badges[status] || badges.pending
}

/**
 * Get all available status options with styling
 */
const getStatusOptions = (): Array<{ 
  value: ActivityStatus
  label: string
  icon: string
  colors: string
}> => {
  return [
    { 
      value: 'completed', 
      label: 'Completo', 
      icon: '✓',
      colors: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
    },
    { 
      value: 'skipped', 
      label: 'Pulado', 
      icon: '⏭️',
      colors: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
    },
    { 
      value: 'postponed', 
      label: 'Adiado', 
      icon: '⏸️',
      colors: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
    },
    { 
      value: 'pending', 
      label: 'Pendente', 
      icon: '⚪',
      colors: 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
    },
    { 
      value: 'missed', 
      label: 'Perdido', 
      icon: '❌',
      colors: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
    }
  ]
}

/**
 * Calculate progress text (e.g., "2/7 items")
 */
const getProgressText = (
  item: TimelineItem,
  progress?: DailyProgress
): string | null => {
  if (!progress) return null

  switch (item.type) {
    case 'meal': {
      const checkedFoods = progress.checkedFoods[item.id] || []
      // We don't have total count here, so we just show checked count
      return checkedFoods.length > 0 ? `${checkedFoods.length} itens` : null
    }

    case 'water': {
      const currentMl = progress.waterMl || 0
      const goalMl = item.goal || 0
      return goalMl > 0 ? `${currentMl}/${goalMl}ml` : null
    }

    default:
      return null
  }
}

/**
 * TimelineItem Component
 * 
 * Displays a single timeline item with:
 * - Icon based on type
 * - Time and title
 * - Status badge
 * - Progress indicator
 * - Expandable details
 * 
 * Features:
 * - Smooth expand/collapse animation (300ms)
 * - Hover effects on desktop
 * - Responsive layout (mobile-first)
 * - Accessible (ARIA labels, keyboard navigation)
 */
export function TimelineItemComponent({
  item,
  status,
  progress,
  onItemClick,
  onChangeStatus,
  toggleFood,
  isFoodChecked
}: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const badge = getStatusBadge(status)
  const icon = getTypeIcon(item.type)
  const progressText = getProgressText(item, progress)
  const statusOptions = getStatusOptions()

  const handleClick = () => {
    setIsExpanded(!isExpanded)
    onItemClick?.(item.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleStatusChange = (newStatus: ActivityStatus) => {
    onChangeStatus?.(item.id, item.type, newStatus)
  }

  return (
    <div
      className={`
        overflow-hidden rounded-xl border transition-all duration-200
        ${status === 'completed' 
          ? 'border-green-200 bg-green-50/30' 
          : 'border-gray-200 bg-white'
        }
        hover:shadow-md hover:-translate-y-0.5
        active:scale-[0.98]
      `}
    >
      {/* Card Header - Always Visible */}
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center gap-3 p-4 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
        aria-expanded={isExpanded}
        aria-label={`${item.title} às ${item.time}, status: ${badge.label}`}
      >
        {/* Icon + Time (Fixed Width) */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <span 
            className="text-2xl" 
            role="img" 
            aria-label={`Tipo: ${item.type}`}
          >
            {icon}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {item.time}
          </span>
        </div>

        {/* Title + Progress (Flex Grow) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-on-surface truncate">
              {item.title}
            </span>
          </div>
          {progressText && (
            <span className="text-xs text-on-surface-muted">
              {progressText}
            </span>
          )}
        </div>

        {/* Status Badge (Read-only display) */}
        <div
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium
            ${badge.className}
          `}
          role="status"
          aria-label={badge.label}
        >
          <span>{badge.icon}</span>
          <span className="hidden sm:inline">{badge.label}</span>
        </div>

        {/* Expand/Collapse Arrow */}
        <svg
          className={`
            h-4 w-4 text-gray-400 transition-transform duration-300
            ${isExpanded ? 'rotate-180' : ''}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {/* Expandable Details */}
      {isExpanded && (
        <div
          className="border-t border-gray-100 px-4 pb-4 pt-3 animate-fadeIn"
          role="region"
          aria-label="Detalhes do item"
        >
          {/* Status Change Buttons */}
          <div className="mb-3 pb-3 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isActive = status === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`
                      flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                      transition-all duration-150
                      ${isActive 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      active:scale-95
                    `}
                  >
                    <span className="text-sm">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-700 mb-3">
              {item.description}
            </p>
          )}

          {/* Type-Specific Content */}
          {item.type === 'water' && item.goal && (
            <div className="rounded-lg bg-blue-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Meta de água
                </span>
                <span className="text-sm text-blue-600">
                  {progress?.waterMl || 0} / {item.goal}ml
                </span>
              </div>
              <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((progress?.waterMl || 0) / item.goal) * 100,
                      100
                    )}%`
                  }}
                  role="progressbar"
                  aria-valuenow={progress?.waterMl || 0}
                  aria-valuemin={0}
                  aria-valuemax={item.goal}
                />
              </div>
            </div>
          )}

          {/* Meal foods list */}
          {item.type === 'meal' && item.foods && (
            <div className="space-y-2">
              {/* Macros summary */}
              {item.macros && (
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 pb-2 border-b border-gray-100">
                  <span className="font-medium">{item.macros.kcal} kcal</span>
                  <span>•</span>
                  <span>P: {item.macros.protein}g</span>
                  <span>•</span>
                  <span>C: {item.macros.carbs}g</span>
                  <span>•</span>
                  <span>G: {item.macros.fat}g</span>
                  <span>•</span>
                  <span>F: {item.macros.fiber}g</span>
                </div>
              )}
              
              {/* Foods list with checkboxes */}
              <div className="space-y-1.5">
                {item.foods.map((food, idx) => {
                  const isChecked = isFoodChecked ? isFoodChecked(item.id, idx) : false
                  
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 text-sm cursor-pointer group hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFood?.(item.id, idx)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                      />
                      
                      {/* Food details */}
                      <div className={`flex-1 min-w-0 transition-all ${isChecked ? 'opacity-60' : ''}`}>
                        <span className={`text-gray-700 ${isChecked ? 'line-through' : ''}`}>
                          {food.name}
                        </span>
                        {food.quantity && (
                          <span className="text-gray-500 ml-1">
                            ({food.quantity})
                          </span>
                        )}
                        {food.tags && food.tags.length > 0 && (
                          <span className="ml-1">
                            {food.tags.join(' ')}
                          </span>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
              
              {/* Food progress indicator */}
              {progress && item.foods && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  {(() => {
                    const checkedFoods = progress.checkedFoods[item.id] || []
                    const totalFoods = item.foods.length
                    const checkedCount = checkedFoods.length
                    const percentage = totalFoods > 0 ? Math.round((checkedCount / totalFoods) * 100) : 0
                    
                    return (
                      <div className="flex items-center justify-between">
                        <span>
                          {checkedCount} de {totalFoods} itens marcados
                        </span>
                        <span className="font-medium">
                          {percentage}%
                        </span>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {item.type === 'supplement' && (
            <div className="text-xs text-gray-500 italic">
              Suplemento: {item.title}
            </div>
          )}

          {item.type === 'training' && (
            <div className="text-xs text-gray-500 italic">
              Treino programado para {item.time}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Add fadeIn animation to global styles or use Tailwind config
// For now, using inline style approach
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 300ms ease-out;
  }
`
if (typeof document !== 'undefined' && !document.querySelector('style[data-timeline-animations]')) {
  style.setAttribute('data-timeline-animations', 'true')
  document.head.appendChild(style)
}
