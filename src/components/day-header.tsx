import type { DayPlan } from '../data/types'

interface DayHeaderProps {
  readonly plan: DayPlan
  readonly overallPercent: number
}

export function DayHeader({ plan, overallPercent }: DayHeaderProps) {
  const isTraining = plan.dayType === 'training'

  return (
    <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{plan.label}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isTraining
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-sky-100 text-sky-700'
              }`}
            >
              {isTraining ? `Treino: ${plan.training}` : 'Descanso'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-gray-50 px-3 py-2">
          <span className="text-2xl font-bold text-primary-600">
            {overallPercent}%
          </span>
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            Concluido
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { label: 'Kcal', value: `${plan.targets.kcal}`, color: 'bg-gray-100 text-gray-700' },
          { label: 'Prot', value: `${plan.targets.protein}g`, color: 'bg-red-50 text-red-700' },
          { label: 'Carb', value: `${plan.targets.carbs}g`, color: 'bg-amber-50 text-amber-700' },
          { label: 'Gord', value: `${plan.targets.fat}g`, color: 'bg-blue-50 text-blue-700' },
        ].map((m) => (
          <div
            key={m.label}
            className={`flex flex-col items-center justify-center rounded-xl py-2 ${m.color}`}
          >
            <span className="text-[10px] font-bold uppercase opacity-70">{m.label}</span>
            <span className="text-sm font-bold">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
