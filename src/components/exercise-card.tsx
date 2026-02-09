import { useState } from 'react'
import type { Exercise, SetLog } from '../data/training-types'

interface ExerciseCardProps {
  readonly exercise: Exercise
  readonly index: number
  readonly isSetChecked: (key: string) => boolean
  readonly onToggleSet: (key: string) => void
  readonly getSetLog: (key: string) => SetLog
  readonly onSaveSetLog: (key: string, log: SetLog) => void
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  main: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Principal' },
  accessory: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Acessorio' },
  corrective: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Corretivo' },
}

const buildYouTubeUrl = (name: string): string =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercicio como fazer')}`

export function ExerciseCard({ exercise, index, isSetChecked, onToggleSet, getSetLog, onSaveSetLog }: ExerciseCardProps) {
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

          <SetLogGrid
            exerciseId={exercise.id}
            totalSets={totalSets}
            planReps={setInfo.reps}
            planLoad={setInfo.load}
            isSetChecked={isSetChecked}
            onToggleSet={onToggleSet}
            getSetLog={getSetLog}
            onSaveSetLog={onSaveSetLog}
          />

          <PlanReference setInfo={setInfo} />

          <ExerciseCues cues={exercise.cues} />

          <VideoLink name={exercise.name} />
        </div>
      )}
    </div>
  )
}

function SetLogGrid({
  exerciseId,
  totalSets,
  planReps,
  planLoad,
  isSetChecked,
  onToggleSet,
  getSetLog,
  onSaveSetLog,
}: {
  readonly exerciseId: string
  readonly totalSets: number
  readonly planReps: string
  readonly planLoad: string
  readonly isSetChecked: (key: string) => boolean
  readonly onToggleSet: (key: string) => void
  readonly getSetLog: (key: string) => SetLog
  readonly onSaveSetLog: (key: string, log: SetLog) => void
}) {
  return (
    <div className="mb-3 rounded-lg bg-gray-50 p-2">
      <div className="mb-1.5 grid grid-cols-[40px_1fr_1fr] gap-1.5 text-center text-[9px] font-semibold text-on-surface-muted">
        <div>Serie</div>
        <div>Reps</div>
        <div>Carga</div>
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: totalSets }, (_, i) => {
          const setKey = `${exerciseId}-s${i}`
          return (
            <SetLogRow
              key={setKey}
              setIndex={i}
              planReps={planReps}
              planLoad={planLoad}
              checked={isSetChecked(setKey)}
              onToggle={() => onToggleSet(setKey)}
              log={getSetLog(setKey)}
              onSave={(log) => onSaveSetLog(setKey, log)}
            />
          )
        })}
      </div>
    </div>
  )
}

function SetLogRow({
  setIndex,
  planReps,
  planLoad,
  checked,
  onToggle,
  log,
  onSave,
}: {
  readonly setIndex: number
  readonly planReps: string
  readonly planLoad: string
  readonly checked: boolean
  readonly onToggle: () => void
  readonly log: SetLog
  readonly onSave: (log: SetLog) => void
}) {
  const [reps, setReps] = useState(log.reps ?? '')
  const [load, setLoad] = useState(log.load ?? '')

  const save = () => {
    onSave({
      reps: reps.trim() || undefined,
      load: load.trim() || undefined,
    })
  }

  return (
    <div className="grid grid-cols-[40px_1fr_1fr] gap-1.5">
      <button
        onClick={onToggle}
        className={`flex h-8 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
          checked
            ? 'border-primary-300 bg-primary-500 text-white'
            : 'border-gray-200 bg-white text-on-surface-muted hover:bg-gray-100'
        }`}
      >
        S{setIndex + 1}
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={reps}
        placeholder={planReps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-center text-xs text-on-surface placeholder:text-gray-300 focus:border-orange-300 focus:outline-none"
      />
      <input
        type="text"
        value={load}
        placeholder={planLoad}
        onChange={(e) => setLoad(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-center text-xs text-on-surface placeholder:text-gray-300 focus:border-orange-300 focus:outline-none"
      />
    </div>
  )
}

function PlanReference({ setInfo }: { readonly setInfo: { reps: string; load: string; rest: string; rir: string } }) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[9px] text-on-surface-muted">
      <span>Plano: {setInfo.reps} reps</span>
      <span>·</span>
      <span>{setInfo.load}</span>
      <span>·</span>
      <span>Descanso {setInfo.rest}</span>
      <span>·</span>
      <span>RIR {setInfo.rir}</span>
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
