import { useState, useEffect } from 'react'

interface SessionTimerProps {
  readonly startedAt: number | null
  readonly expectedMinutes: number
  readonly completionPercent: number
}

const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

type Pace = 'ahead' | 'on-track' | 'behind'

const PACE_STYLES: Record<Pace, { label: string; color: string; bg: string }> = {
  ahead: { label: 'Adiantado', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'on-track': { label: 'No ritmo', color: 'text-orange-700', bg: 'bg-orange-100' },
  behind: { label: 'Atrasado', color: 'text-red-700', bg: 'bg-red-100' },
}

function computePace(timePercent: number, workPercent: number): Pace {
  const diff = workPercent - timePercent
  if (diff >= 5) return 'ahead'
  if (diff <= -15) return 'behind'
  return 'on-track'
}

export function SessionTimer({ startedAt, expectedMinutes, completionPercent }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    // Tick immediately (0ms delay) then every second
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    const immediate = setTimeout(tick, 0)
    const id = setInterval(tick, 1000)
    return () => { clearTimeout(immediate); clearInterval(id) }
  }, [startedAt])

  if (!startedAt) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2 text-xs text-on-surface-muted">
          <span>⏱</span>
          <span>O cronometro inicia ao marcar o primeiro item</span>
        </div>
      </div>
    )
  }

  const expectedSeconds = expectedMinutes * 60
  const timePercent = Math.min(100, Math.round((elapsed / expectedSeconds) * 100))
  const pace = computePace(timePercent, completionPercent)
  const paceStyle = PACE_STYLES[pace]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">⏱</span>
          <div>
            <div className="text-sm font-bold tabular-nums text-on-surface">
              {formatTime(elapsed)}
            </div>
            <div className="text-[10px] text-on-surface-muted">
              previsto: ~{expectedMinutes}min
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${paceStyle.bg} ${paceStyle.color}`}>
            {paceStyle.label}
          </span>
          <span className="text-xs font-medium text-on-surface-muted">
            {completionPercent}%
          </span>
        </div>
      </div>

      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        {/* Expected time progress (background track) */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gray-300/50 transition-all"
          style={{ width: `${timePercent}%` }}
        />
        {/* Work completion progress (foreground) */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-orange-500 transition-all"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-[9px] text-on-surface-muted">
        <span>Tempo: {timePercent}%</span>
        <span>Feito: {completionPercent}%</span>
      </div>
    </div>
  )
}
