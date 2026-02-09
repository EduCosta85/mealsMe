import { useState } from 'react'
import type { WarmupItem } from '../data/training-types'

interface WarmupSectionProps {
  readonly items: readonly WarmupItem[]
  readonly isChecked: (id: string) => boolean
  readonly onToggle: (id: string) => void
  readonly extraWarmup?: string
}

function groupByPhase(items: readonly WarmupItem[]): Record<string, readonly WarmupItem[]> {
  const groups: Record<string, WarmupItem[]> = {}
  for (const item of items) {
    const list = groups[item.phase] ?? []
    list.push(item)
    groups[item.phase] = list
  }
  return groups
}

export function WarmupSection({ items, isChecked, onToggle, extraWarmup }: WarmupSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const checkedCount = items.filter((i) => isChecked(i.id)).length
  const total = items.length
  const percent = Math.round((checkedCount / total) * 100)
  const isComplete = checkedCount === total
  const groups = groupByPhase(items)
  const totalMinutes = items.reduce((sum, i) => sum + i.minutes, 0)

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        isComplete
          ? 'border-primary-200 bg-primary-50/50'
          : 'border-amber-200 bg-amber-50/50'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="text-lg">🔥</span>
        <div className="flex-1">
          <span className="text-sm font-semibold text-amber-800">Aquecimento</span>
          <div className="mt-0.5 text-[10px] text-on-surface-muted">~{totalMinutes} min</div>
        </div>
        <span className="text-xs font-medium text-amber-700">
          {checkedCount}/{total} ({percent}%)
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-amber-100 px-4 pb-4 pt-2">
          {extraWarmup && (
            <p className="mb-3 rounded-lg bg-amber-100 px-3 py-2 text-[11px] text-amber-700">
              + {extraWarmup}
            </p>
          )}
          {Object.entries(groups).map(([phase, phaseItems]) => (
            <div key={phase} className="mb-2">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                {phase}
              </div>
              <ul className="space-y-0.5">
                {phaseItems.map((item) => {
                  const checked = isChecked(item.id)
                  return (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-amber-100/50 active:bg-amber-100">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(item.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
                        />
                        <div className="flex-1">
                          <span className={`text-sm ${checked ? 'text-on-surface-muted line-through' : 'text-on-surface'}`}>
                            {item.name}
                          </span>
                          <span className="ml-2 text-[10px] text-on-surface-muted">
                            {item.prescription}
                          </span>
                        </div>
                        <span className="shrink-0 text-[10px] text-on-surface-muted">
                          {item.minutes}min
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
