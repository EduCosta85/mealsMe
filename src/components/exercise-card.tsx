import { useState } from 'react'
import type { Exercise } from '../data/training-types'

interface ExerciseCardProps {
  readonly exercise: Exercise
  readonly index: number
  readonly isSetChecked: (key: string) => boolean
  readonly onToggleSet: (key: string) => void
  readonly customLoad: string | null
  readonly onSetLoad: (load: string) => void
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  main: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Principal' },
  accessory: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Acessorio' },
  corrective: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Corretivo' },
}

const buildYouTubeUrl = (name: string): string =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercicio como fazer')}`

export function ExerciseCard({ exercise, index, isSetChecked, onToggleSet, customLoad, onSetLoad }: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingLoad, setEditingLoad] = useState(false)
  const [loadDraft, setLoadDraft] = useState('')

  const setInfo = exercise.sets[0]
  const displayLoad = customLoad || setInfo.load
  const totalSets = setInfo.sets
  const checkedSets = Array.from({ length: totalSets }, (_, i) =>
    isSetChecked(`${exercise.id}-s${i}`),
  ).filter(Boolean).length
  const isComplete = checkedSets === totalSets
  const cat = CATEGORY_STYLES[exercise.category]

  const handleEditLoad = () => {
    setLoadDraft(displayLoad)
    setEditingLoad(true)
  }

  const handleSaveLoad = () => {
    const val = loadDraft.trim()
    onSetLoad(val === setInfo.load ? '' : val)
    setEditingLoad(false)
  }

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
              {setInfo.sets}x{setInfo.reps} · {displayLoad} · {setInfo.rest}
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

          <SetButtons
            exerciseId={exercise.id}
            totalSets={totalSets}
            isSetChecked={isSetChecked}
            onToggleSet={onToggleSet}
          />

          <DetailGrid
            setInfo={setInfo}
            displayLoad={displayLoad}
            editingLoad={editingLoad}
            loadDraft={loadDraft}
            customLoad={customLoad}
            onEditLoad={handleEditLoad}
            onLoadDraftChange={setLoadDraft}
            onSaveLoad={handleSaveLoad}
            onResetLoad={() => { onSetLoad(''); setEditingLoad(false) }}
          />

          <ExerciseCues cues={exercise.cues} />

          <VideoLink name={exercise.name} />
        </div>
      )}
    </div>
  )
}

function SetButtons({
  exerciseId,
  totalSets,
  isSetChecked,
  onToggleSet,
}: {
  readonly exerciseId: string
  readonly totalSets: number
  readonly isSetChecked: (key: string) => boolean
  readonly onToggleSet: (key: string) => void
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-1">
      {Array.from({ length: totalSets }, (_, i) => {
        const setKey = `${exerciseId}-s${i}`
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
  )
}

function DetailGrid({
  setInfo,
  displayLoad,
  editingLoad,
  loadDraft,
  customLoad,
  onEditLoad,
  onLoadDraftChange,
  onSaveLoad,
  onResetLoad,
}: {
  readonly setInfo: { reps: string; load: string; rest: string; rir: string }
  readonly displayLoad: string
  readonly editingLoad: boolean
  readonly loadDraft: string
  readonly customLoad: string | null
  readonly onEditLoad: () => void
  readonly onLoadDraftChange: (v: string) => void
  readonly onSaveLoad: () => void
  readonly onResetLoad: () => void
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-2">
      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
        <div>
          <div className="font-semibold text-on-surface">{setInfo.reps}</div>
          <div className="text-on-surface-muted">reps</div>
        </div>
        <div
          className="cursor-pointer rounded transition-colors hover:bg-orange-50"
          onClick={(e) => { e.stopPropagation(); onEditLoad() }}
        >
          {editingLoad ? (
            <input
              autoFocus
              type="text"
              value={loadDraft}
              onChange={(e) => onLoadDraftChange(e.target.value)}
              onBlur={onSaveLoad}
              onKeyDown={(e) => e.key === 'Enter' && onSaveLoad()}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded border border-orange-300 bg-white px-1 text-center text-[10px] font-semibold text-on-surface outline-none"
            />
          ) : (
            <div className={`font-semibold ${customLoad ? 'text-orange-600' : 'text-on-surface'}`}>
              {displayLoad}
            </div>
          )}
          <div className="text-on-surface-muted">
            carga {!editingLoad && '✏️'}
          </div>
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

      {customLoad && !editingLoad && (
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="text-[9px] text-on-surface-muted">
            Plano: {setInfo.load}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onResetLoad() }}
            className="text-[9px] font-medium text-red-500 hover:text-red-700"
          >
            Resetar
          </button>
        </div>
      )}
    </div>
  )
}

function ExerciseCues({ cues }: { readonly cues: readonly string[] }) {
  if (cues.length === 0) return null
  return (
    <div className="mt-2">
      <div className="mb-1 text-[10px] font-semibold text-on-surface-muted">Dicas:</div>
      <ul className="space-y-0.5 text-[11px] text-on-surface-muted">
        {cues.map((cue, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="mt-0.5 text-[8px]">▸</span>
            <span>{cue}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function VideoLink({ name }: { readonly name: string }) {
  return (
    <a
      href={buildYouTubeUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 active:bg-red-200"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
      Ver exercicio no YouTube
    </a>
  )
}
