import { useState } from 'react'
import type { Exercise } from '../data/training-types'

interface ExerciseCardProps {
  readonly exercise: Exercise
  readonly index: number
  readonly isSetChecked: (key: string) => boolean
  readonly onToggleSet: (key: string) => void
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  main: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Principal' },
  accessory: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Acessorio' },
  corrective: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Corretivo' },
}

export function ExerciseCard({ exercise, index, isSetChecked, onToggleSet }: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const setInfo = exercise.sets[0]
  const totalSets = setInfo.sets
  const checkedSets = Array.from({ length: totalSets }, (_, i) =>
    isSetChecked(`${exercise.id}-s${i}`),
  ).filter(Boolean).length
  const isComplete = checkedSets === totalSets

  const cat = CATEGORY_STYLES[exercise.category]

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
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-on-surface">
              {exercise.name}
            </span>
            {exercise.isNew && (
              <span className="shrink-0 rounded bg-green-100 px-1 py-0.5 text-[9px] font-bold text-green-700">
                NOVO
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
            <span className={`rounded px-1 py-0.5 font-medium ${cat.bg} ${cat.text}`}>
              {cat.label}
            </span>
            <span className="text-on-surface-muted">
              {setInfo.sets}x{setInfo.reps} · {setInfo.load} · {setInfo.rest}
            </span>
          </div>
        </div>

        <span className="shrink-0 text-xs font-medium text-on-surface-muted">
          {checkedSets}/{totalSets}
        </span>

        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          <div className="mb-2 text-[10px] text-on-surface-muted">
            {exercise.muscles}
          </div>

          {exercise.safety && (
            <div className="mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-700">
              ⚠️ {exercise.safety}
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-1">
            {Array.from({ length: totalSets }, (_, i) => {
              const setKey = `${exercise.id}-s${i}`
              const checked = isSetChecked(setKey)
              return (
                <button
                  key={setKey}
                  onClick={() => onToggleSet(setKey)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                    checked
                      ? 'border-primary-300 bg-primary-500 text-white'
                      : 'border-gray-200 bg-gray-50 text-on-surface-muted hover:bg-gray-100'
                  }`}
                >
                  S{i + 1}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-4 gap-1 rounded-lg bg-gray-50 p-2 text-center text-[10px]">
            <div>
              <div className="font-semibold text-on-surface">{setInfo.reps}</div>
              <div className="text-on-surface-muted">reps</div>
            </div>
            <div>
              <div className="font-semibold text-on-surface">{setInfo.load}</div>
              <div className="text-on-surface-muted">carga</div>
            </div>
            <div>
              <div className="font-semibold text-on-surface">{setInfo.rest}</div>
              <div className="text-on-surface-muted">descanso</div>
            </div>
            <div>
              <div className="font-semibold text-on-surface">{setInfo.rir}</div>
              <div className="text-on-surface-muted">RIR</div>
            </div>
          </div>

          {exercise.cues.length > 0 && (
            <div className="mt-2">
              <div className="mb-1 text-[10px] font-semibold text-on-surface-muted">Dicas:</div>
              <ul className="space-y-0.5 text-[11px] text-on-surface-muted">
                {exercise.cues.map((cue, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-[8px]">▸</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
