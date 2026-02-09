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
      className={`rounded-xl border p-3 ${
        isToday
          ? 'border-primary-300 bg-primary-50/50 ring-2 ring-primary-200'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">
              {plan.shortLabel}
            </span>
            {isToday && (
              <span className="rounded-sm bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                HOJE
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium ${
              isTraining ? 'text-orange-600' : 'text-sky-600'
            }`}
          >
            {isTraining ? plan.training : 'Descanso'}
          </span>
        </div>

        <ProgressRing
          percent={percent}
          size={44}
          strokeWidth={3}
          label={`${percent}%`}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
        <div className="rounded bg-gray-50 py-1">
          <div className="font-semibold text-on-surface">
            {tracker.totalFoodsChecked}/{totalFoods}
          </div>
          <div className="text-on-surface-muted">itens</div>
        </div>
        <div className="rounded bg-purple-50 py-1">
          <div className="font-semibold text-purple-700">
            {tracker.totalSupplementsChecked}/{totalSupplements}
          </div>
          <div className="text-on-surface-muted">suplem.</div>
        </div>
        <div className="rounded bg-blue-50 py-1">
          <div className="font-semibold text-blue-700">
            {waterPercent}%
          </div>
          <div className="text-on-surface-muted">agua</div>
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
