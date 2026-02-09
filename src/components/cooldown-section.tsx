import { useState } from 'react'
import type { CooldownItem } from '../data/training-types'

interface CooldownSectionProps {
  readonly items: readonly CooldownItem[]
  readonly isChecked: (id: string) => boolean
  readonly onToggle: (id: string) => void
}

export function CooldownSection({ items, isChecked, onToggle }: CooldownSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const checkedCount = items.filter((i) => isChecked(i.id)).length
  const total = items.length
  const percent = Math.round((checkedCount / total) * 100)
  const isComplete = checkedCount === total

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        isComplete
          ? 'border-primary-200 bg-primary-50/50'
          : 'border-sky-200 bg-sky-50/50'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="text-lg">🧊</span>
        <div className="flex-1">
          <span className="text-sm font-semibold text-sky-800">Volta a Calma</span>
          <div className="mt-0.5 text-[10px] text-on-surface-muted">~5 min</div>
        </div>
        <span className="text-xs font-medium text-sky-700">
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
        <div className="border-t border-sky-100 px-4 pb-4 pt-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const checked = isChecked(item.id)
              return (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-sky-100/50 active:bg-sky-100">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(item.id)}
                      className="mt-0.5 h-6 w-6 shrink-0 accent-sky-500"
                    />
                    <div className="flex-1">
                      <span className={`text-sm ${checked ? 'text-on-surface-muted line-through' : 'text-on-surface'}`}>
                        {item.name}
                      </span>
                      <span className="ml-2 text-[10px] text-on-surface-muted">
                        {item.prescription}
                      </span>
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
