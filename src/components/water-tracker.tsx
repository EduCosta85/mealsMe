interface WaterTrackerProps {
  readonly currentMl: number
  readonly targetLiters: number
  readonly onAdd: (ml: number) => void
}

const WATER_STEPS = [200, 300, 500] as const

export function WaterTracker({ currentMl, targetLiters, onAdd }: WaterTrackerProps) {
  const targetMl = targetLiters * 1000
  const percent = Math.min(Math.round((currentMl / targetMl) * 100), 100)
  const remaining = Math.max(0, targetMl - currentMl)

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💧</span>
          <span className="text-sm font-semibold text-blue-800">Agua</span>
        </div>
        <span className="text-xs font-medium text-blue-600">
          {(currentMl / 1000).toFixed(1)}L / {targetLiters}L
        </span>
      </div>

      <div className="mb-3 h-3 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {WATER_STEPS.map((ml) => (
            <button
              key={ml}
              onClick={() => onAdd(ml)}
              className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white active:bg-blue-600"
            >
              +{ml}mL
            </button>
          ))}
        </div>
        {remaining > 0 ? (
          <span className="text-xs text-blue-600">
            Faltam {(remaining / 1000).toFixed(1)}L
          </span>
        ) : (
          <span className="text-xs font-semibold text-blue-700">Meta atingida!</span>
        )}
      </div>

      {currentMl > 0 && (
        <button
          onClick={() => onAdd(-200)}
          className="mt-2 text-xs text-blue-400 hover:text-blue-600"
        >
          Remover 200mL
        </button>
      )}
    </div>
  )
}
