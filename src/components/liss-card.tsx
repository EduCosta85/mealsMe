import type { LissSession } from '../data/training-types'

interface LissCardProps {
  readonly session: LissSession
  readonly isCompleted: boolean
  readonly onToggle: () => void
}

export function LissCard({ session, isCompleted, onToggle }: LissCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        isCompleted
          ? 'border-primary-200 bg-primary-50/50'
          : 'border-green-200 bg-green-50/50'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">🚶</span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">{session.name}</h3>
            <div className="mt-0.5 flex flex-wrap gap-2 text-[10px]">
              <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-700">
                {session.zone}
              </span>
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">
                {session.bpmRange}
              </span>
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">
                {session.duration}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-green-600">
            Opcoes
          </div>
          <ul className="space-y-1 text-sm text-on-surface-muted">
            {session.options.map((option) => (
              <li key={option} className="flex items-start gap-2">
                <span className="mt-0.5 text-[8px] text-green-500">●</span>
                <span>{option}</span>
              </li>
            ))}
          </ul>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg bg-green-100/50 px-3 py-2.5">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={onToggle}
            className="h-5 w-5 shrink-0 accent-green-500"
          />
          <span
            className={`text-sm font-medium ${
              isCompleted ? 'text-primary-700 line-through' : 'text-green-800'
            }`}
          >
            {isCompleted ? 'Cardio concluido!' : 'Marcar como concluido'}
          </span>
        </label>
      </div>
    </div>
  )
}
