import type { TimelinePeriod, ItemStatus, TimelineItem } from '../../lib/timeline-utils'
import type { DailyProgress } from '../../data/types'
import { TimelineItemComponent } from './timeline-item'
import { calculateStatus } from '../../lib/timeline-utils'

interface TimelineGroupProps {
  readonly period: TimelinePeriod
  readonly progress?: DailyProgress
  readonly onItemClick?: (itemId: string) => void
  readonly onToggleStatus?: (itemId: string, type: TimelineItem['type']) => void
}

/**
 * Get period icon and styling based on period name
 */
const getPeriodConfig = (periodName: TimelinePeriod['name']) => {
  const configs = {
    Manhã: {
      icon: '🌅',
      label: 'Manhã',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-200'
    },
    Tarde: {
      icon: '☀️',
      label: 'Tarde',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50/50',
      borderColor: 'border-sky-200'
    },
    Noite: {
      icon: '🌙',
      label: 'Noite',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50/50',
      borderColor: 'border-purple-200'
    }
  }
  return configs[periodName]
}

/**
 * TimelineGroup Component
 * 
 * Groups timeline items by period (Manhã/Tarde/Noite).
 * 
 * Features:
 * - Period header with icon and label
 * - Color-coded by time of day
 * - Staggered fade-in animation (250ms)
 * - Responsive layout (mobile-first)
 * - Accessible (semantic HTML, ARIA labels)
 * 
 * @example
 * <TimelineGroup 
 *   period={{ name: 'Manhã', items: [...] }}
 *   progress={dailyProgress}
 *   onItemClick={(id) => console.log(id)}
 * />
 */
export function TimelineGroup({ 
  period, 
  progress, 
  onItemClick,
  onToggleStatus
}: TimelineGroupProps) {
  const config = getPeriodConfig(period.name)

  return (
    <section
      className="animate-fadeInUp"
      aria-labelledby={`period-${period.name}`}
    >
      {/* Period Header */}
      <div
        className={`
          flex items-center gap-2 mb-3 pb-2 border-b
          ${config.borderColor}
        `}
      >
        <span
          className="text-2xl"
          role="img"
          aria-label={`Período: ${config.label}`}
        >
          {config.icon}
        </span>
        <h2
          id={`period-${period.name}`}
          className={`text-lg font-semibold ${config.textColor}`}
        >
          {config.label}
        </h2>
        <span className="text-sm text-gray-500 ml-auto">
          {period.items.length} {period.items.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Timeline Items */}
      <div className="flex flex-col gap-3 md:gap-4">
        {period.items.map((item, index) => {
          const status: ItemStatus = progress
            ? calculateStatus(item, progress)
            : 'pending'

          return (
            <div
              key={item.id}
              className="animate-fadeInUp"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <TimelineItemComponent
                item={item}
                status={status}
                progress={progress}
                onItemClick={onItemClick}
                onToggleStatus={onToggleStatus}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

// Add animations to global styles
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 250ms ease-out both;
  }
`

if (typeof document !== 'undefined' && !document.querySelector('style[data-timeline-group-animations]')) {
  style.setAttribute('data-timeline-group-animations', 'true')
  document.head.appendChild(style)
}
