import { useState } from 'react'
import type { Supplement, ActivityState, ActivityStatus } from '../data/types'

interface SupplementItemProps {
  readonly supplement: Supplement
  readonly isChecked: boolean
  readonly onToggle: (id: string) => void
  readonly activityState?: ActivityState
  readonly onSetActivity: (id: string, status: ActivityStatus) => void
}

export function SupplementItem({
  supplement,
  isChecked,
  onToggle,
  activityState,
  onSetActivity,
}: SupplementItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <li>
      <div className="overflow-hidden rounded-xl bg-purple-50/50 transition-colors">
        <label className="flex cursor-pointer items-center gap-3 p-3 transition-colors active:bg-purple-100">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle(supplement.id)}
            className="h-6 w-6 shrink-0 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
          />
          <div className="flex-1">
            <span
              className={`block text-sm font-medium ${
                isChecked ? 'text-purple-300 line-through' : 'text-purple-900'
              }`}
            >
              {supplement.name}
            </span>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-purple-700/70">
              <span>{supplement.time}</span>
              <span>·</span>
              <span>{supplement.withMeal}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsOpen(!isOpen)
            }}
            className="ml-auto"
          >
            <svg
              className={`h-4 w-4 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </label>

        {isOpen && (
          <div className="border-t border-purple-100 px-3 pb-3 pt-2">
            {/* Activity Status Display */}
            {activityState && activityState.status !== 'pending' && (
              <div className="mb-3 rounded-lg bg-white px-3 py-2">
                <div className="flex items-center gap-2 text-xs">
                  {activityState.status === 'completed' && (
                    <>
                      <span className="text-green-600">✅</span>
                      <span className="font-medium text-green-700">Feito</span>
                    </>
                  )}
                  {activityState.status === 'skipped' && (
                    <>
                      <span className="text-amber-600">⏭️</span>
                      <span className="font-medium text-amber-700">Pulado</span>
                    </>
                  )}
                  {activityState.status === 'postponed' && (
                    <>
                      <span className="text-blue-600">⏰</span>
                      <span className="font-medium text-blue-700">Adiado</span>
                    </>
                  )}
                  {activityState.status === 'missed' && (
                    <>
                      <span className="text-red-600">❌</span>
                      <span className="font-medium text-red-700">Perdido</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Activity Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSetActivity(supplement.id, 'completed')}
                className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                  activityState?.status === 'completed'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-purple-200 bg-white text-gray-700 active:bg-gray-50'
                }`}
              >
                <span className="mr-1">✓</span>
                Feito
              </button>
              <button
                onClick={() => onSetActivity(supplement.id, 'skipped')}
                className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                  activityState?.status === 'skipped'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-purple-200 bg-white text-gray-700 active:bg-gray-50'
                }`}
              >
                <span className="mr-1">⏭</span>
                Pular
              </button>
              <button
                onClick={() => onSetActivity(supplement.id, 'postponed')}
                className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                  activityState?.status === 'postponed'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-purple-200 bg-white text-gray-700 active:bg-gray-50'
                }`}
              >
                <span className="mr-1">⏰</span>
                Adiar
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
