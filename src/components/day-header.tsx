import type { DayPlan } from '../data/types'

interface DayHeaderProps {
  readonly plan: DayPlan
  readonly overallPercent: number
}

export function DayHeader({ plan, overallPercent }: DayHeaderProps) {
  const isTraining = plan.dayType === 'training'

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{plan.label}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                isTraining
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-sky-100 text-sky-700'
              }`}
            >
              {isTraining ? `Treino: ${plan.training}` : 'Descanso'}
            </span>
            <span className="text-xs text-on-surface-muted">
              {plan.targets.kcal} kcal
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">
            {overallPercent}%
          </div>
          <span className="text-[10px] text-on-surface-muted">completo</span>
        </div>
      </div>

      <div className="mt-3 flex gap-3">
        {[
          { label: 'Prot', value: `${plan.targets.protein}g`, color: 'bg-red-100 text-red-700' },
          { label: 'Carb', value: `${plan.targets.carbs}g`, color: 'bg-amber-100 text-amber-700' },
          { label: 'Gord', value: `${plan.targets.fat}g`, color: 'bg-blue-100 text-blue-700' },
          { label: 'Fibra', value: `≥${plan.targets.fiber}g`, color: 'bg-green-100 text-green-700' },
        ].map((m) => (
          <div
            key={m.label}
            className={`flex-1 rounded-lg px-2 py-1.5 text-center ${m.color}`}
          >
            <div className="text-[10px] font-medium">{m.label}</div>
            <div className="text-xs font-bold">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
