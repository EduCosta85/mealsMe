import type { Mesocycle } from '../data/training-types'
import { MESOCYCLE_INFO } from '../data/training-plan'

interface MesocycleSelectorProps {
  readonly current: Mesocycle
  readonly onChange: (m: Mesocycle) => void
}

const MESOCYCLES: readonly Mesocycle[] = [1, 2, 3]

export function MesocycleSelector({ current, onChange }: MesocycleSelectorProps) {
  const info = MESOCYCLE_INFO[current]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-on-surface-muted">Mesociclo:</span>
        <div className="flex gap-1">
          {MESOCYCLES.map((m) => (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                current === m
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-on-surface-muted hover:bg-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
        <span className="rounded bg-orange-100 px-1.5 py-0.5 font-medium text-orange-700">
          {info.name}
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-on-surface-muted">
          {info.weeks}
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-on-surface-muted">
          {info.intensity}
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-on-surface-muted">
          {info.reps} reps
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-on-surface-muted">
          RIR {info.rir}
        </span>
      </div>
    </div>
  )
}
