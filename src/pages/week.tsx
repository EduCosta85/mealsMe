import { getDayPlan, WEEK_PLAN } from '../data/meal-plan'
import { SUPPLEMENTS } from '../data/supplements'
import { getWeekDates, toDateKey, isSameDay } from '../lib/date-utils'
import { useDailyTracker } from '../hooks/use-daily-tracker'
import { ProgressRing } from '../components/progress-ring'

interface DaySummaryProps {
  readonly date: Date
  readonly isToday: boolean
}

function DaySummary({ date, isToday }: DaySummaryProps) {
  const dateKey = toDateKey(date)
  const plan = getDayPlan(date)
  const tracker = useDailyTracker(dateKey)

  const totalFoods = plan.meals.reduce((sum, m) => sum + m.foods.length, 0)
  const totalSupplements = SUPPLEMENTS.length
  const totalItems = totalFoods + totalSupplements
  const checkedItems = tracker.totalFoodsChecked + tracker.totalSupplementsChecked
  const percent = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100)

  const waterPercent = Math.min(
    Math.round((tracker.progress.waterMl / (plan.waterLiters * 1000)) * 100),
    100,
  )

  const isTraining = plan.dayType === 'training'

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isToday
          ? 'border-primary-400 bg-primary-50 ring-4 ring-primary-100'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              {plan.shortLabel}
            </span>
            {isToday && (
              <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                HOJE
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
                isTraining ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-700'
              }`}
            >
              {isTraining ? '🏋️ Treino' : '💤 Descanso'}
            </span>
          </div>
        </div>

        <ProgressRing
          percent={percent}
          size={52}
          strokeWidth={5}
          label={`${percent}%`}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-gray-50 p-2">
          <div className="text-sm font-bold text-gray-900">
            {tracker.totalFoodsChecked}<span className="text-gray-400">/</span>{totalFoods}
          </div>
          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Refeic.</div>
        </div>
        <div className="rounded-xl bg-purple-50 p-2">
          <div className="text-sm font-bold text-purple-700">
            {tracker.totalSupplementsChecked}<span className="text-purple-300">/</span>{totalSupplements}
          </div>
          <div className="text-[10px] font-medium text-purple-600 uppercase tracking-wide">Suplem.</div>
        </div>
        <div className="rounded-xl bg-blue-50 p-2">
          <div className="text-sm font-bold text-blue-700">
            {waterPercent}%
          </div>
          <div className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Agua</div>
        </div>
      </div>
    </div>
  )
}

export function WeekPage() {
  const now = new Date()
  const weekDates = getWeekDates(now)

  const weekTargets = WEEK_PLAN.reduce(
    (acc, d) => ({
      kcal: acc.kcal + d.targets.kcal,
      protein: acc.protein + d.targets.protein,
    }),
    { kcal: 0, protein: 0 },
  )

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Semana</h2>
        <p className="mt-1 text-xs text-on-surface-muted">
          Meta semanal: {weekTargets.kcal.toLocaleString()} kcal · {weekTargets.protein}g proteina
        </p>
      </div>

      <div className="grid gap-3">
        {weekDates.map((date) => (
          <DaySummary
            key={toDateKey(date)}
            date={date}
            isToday={isSameDay(date, now)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-on-surface">Legenda</h3>
        <div className="space-y-1 text-xs text-on-surface-muted">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
            <span>Dia de Treino (4x/sem) — 2,450 kcal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
            <span>Dia de Descanso (3x/sem) — 2,100 kcal</span>
          </div>
          <div className="flex items-center gap-2">
            <span>★</span>
            <span>Osteoprotecao</span>
            <span>♥</span>
            <span>Cardioprotecao (HDL)</span>
            <span>⚡</span>
            <span>LOW GI</span>
          </div>
        </div>
      </div>
    </div>
  )
}
