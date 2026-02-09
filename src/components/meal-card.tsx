import { useState } from 'react'
import type { Meal, ActivityState, ActivityStatus } from '../data/types'
import { ProgressRing } from './progress-ring'

interface MealCardProps {
  readonly meal: Meal
  readonly isFoodChecked: (mealId: string, foodIndex: number) => boolean
  readonly onToggleFood: (mealId: string, foodIndex: number) => void
  readonly progress: number
  readonly activityState?: ActivityState
  readonly onSetActivity: (mealId: string, status: ActivityStatus) => void
}

export function MealCard({ meal, isFoodChecked, onToggleFood, progress, activityState, onSetActivity }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isComplete = progress === 100

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        isComplete
          ? 'border-primary-200 bg-primary-50/50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <ProgressRing percent={progress} size={40} strokeWidth={3} />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-on-surface">
              {meal.name}
            </span>
            {meal.isOptional && (
              <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                opcional
              </span>
            )}
          </div>
          <span className="text-xs text-on-surface-muted">{meal.time}</span>
        </div>

        <div className="text-right">
          <span className="text-xs font-medium text-on-surface-muted">
            {meal.macros.kcal} kcal
          </span>
          <div className="mt-0.5 flex gap-1.5 text-[10px] text-on-surface-muted">
            <span>P:{meal.macros.protein}g</span>
            <span>C:{meal.macros.carbs}g</span>
            <span>G:{meal.macros.fat}g</span>
          </div>
        </div>

        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-2">
          {meal.note && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {meal.note}
            </p>
          )}

          {meal.supplements && meal.supplements.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {meal.supplements.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700"
                >
                  💊 {s}
                </span>
              ))}
            </div>
          )}

          <ul className="space-y-2">
            {meal.foods.map((food, idx) => {
              const checked = isFoodChecked(meal.id, idx)
              return (
                <li key={idx}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50/50 p-3 transition-colors active:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFood(meal.id, idx)}
                      className="h-6 w-6 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            checked ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}
                        >
                          {food.name}
                        </span>
                        {food.tags && food.tags.length > 0 && (
                          <div className="flex gap-1">
                            {food.tags.map((tag) => (
                              <span key={tag} className="text-xs">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {food.quantity}
                      </div>
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>

          {/* Activity Status Display */}
          {activityState && activityState.status !== 'pending' && (
            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
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
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => onSetActivity(meal.id, 'completed')}
              className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                activityState?.status === 'completed'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
              }`}
            >
              <span className="mr-1">✓</span>
              Feito
            </button>
            <button
              onClick={() => onSetActivity(meal.id, 'skipped')}
              className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                activityState?.status === 'skipped'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
              }`}
            >
              <span className="mr-1">⏭</span>
              Pular
            </button>
            <button
              onClick={() => onSetActivity(meal.id, 'postponed')}
              className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                activityState?.status === 'postponed'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
              }`}
            >
              <span className="mr-1">⏰</span>
              Adiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
