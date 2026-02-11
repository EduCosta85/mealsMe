import { useState, useRef, useEffect } from 'react'
import type { TimelineItem, ItemStatus } from '../../lib/timeline-utils'
import type { DailyProgress, ActivityStatus } from '../../data/types'

interface TimelineItemProps {
  readonly item: TimelineItem
  readonly status: ItemStatus
  readonly progress?: DailyProgress
  readonly onItemClick?: (itemId: string) => void
  readonly onChangeStatus?: (itemId: string, type: TimelineItem['type'], status: ActivityStatus) => void
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
 * Get all available status options for dropdown
 */
const getStatusOptions = (): Array<{ value: ActivityStatus; label: string; icon: string }> => {
  return [
    { value: 'completed', label: 'Completo', icon: '✓' },
    { value: 'skipped', label: 'Pulado', icon: '⏭️' },
    { value: 'postponed', label: 'Adiado', icon: '⏸️' },
    { value: 'pending', label: 'Pendente', icon: '⚪' },
    { value: 'missed', label: 'Perdido', icon: '❌' }
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
  onChangeStatus
}: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const badge = getStatusBadge(status)
  const icon = getTypeIcon(item.type)
  const progressText = getProgressText(item, progress)
  const statusOptions = getStatusOptions()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false)
      }
    }
    
    if (showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStatusMenu])

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

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card expansion
    
    // Calculate position for fixed dropdown
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4, // 4px below button
        right: window.innerWidth - rect.right // Align to right edge of button
      })
    }
    
    setShowStatusMenu(!showStatusMenu)
  }

  const handleStatusSelect = (newStatus: ActivityStatus) => {
    onChangeStatus?.(item.id, item.type, newStatus)
    setShowStatusMenu(false)
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

        {/* Status Badge (Clickable) with Dropdown */}
        <div ref={menuRef}>
          <button
            ref={buttonRef}
            onClick={handleStatusClick}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium
              transition-all duration-200
              ${badge.className}
              hover:scale-105 hover:shadow-md active:scale-95
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            `}
            role="button"
            aria-label={`Mudar status de ${badge.label}`}
            aria-haspopup="true"
            aria-expanded={showStatusMenu}
            title="Clique para alterar o status"
          >
            <span>{badge.icon}</span>
            <span className="hidden sm:inline">{badge.label}</span>
            <svg 
              className={`w-3 h-3 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Dropdown Menu (Fixed Position - renders outside card) */}
        {showStatusMenu && (
          <div 
            className="fixed z-50 w-40 rounded-lg shadow-xl bg-white border border-gray-200 py-1 animate-fadeIn"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`
            }}
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}

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

          {/* Placeholder for future meal/supplement details */}
          {item.type === 'meal' && (
            <div className="text-xs text-gray-500 italic">
              Clique na refeição no painel principal para ver detalhes
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
