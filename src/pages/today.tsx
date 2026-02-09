import { getDayPlan } from '../data/meal-plan'
import { SUPPLEMENTS } from '../data/supplements'
import { useDailyTracker } from '../hooks/use-daily-tracker'
import { DayHeader } from '../components/day-header'
import { MealCard } from '../components/meal-card'
import { SupplementSection } from '../components/supplement-section'
import { WaterTracker } from '../components/water-tracker'

export function TodayPage() {
  const plan = getDayPlan(new Date())
  const tracker = useDailyTracker()

  const totalFoods = plan.meals.reduce((sum, m) => sum + m.foods.length, 0)
  const totalSupplements = SUPPLEMENTS.length
  const totalItems = totalFoods + totalSupplements

  const checkedItems = tracker.totalFoodsChecked + tracker.totalSupplementsChecked
  const overallPercent = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100)

  return (
    <div className="space-y-4 pb-4">
      <DayHeader plan={plan} overallPercent={overallPercent} />

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
          <span>🍽️</span> Refeicoes ({plan.meals.length})
        </h3>
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 rounded bg-white px-2 py-1 shadow-sm">
            <span className="text-yellow-500">★</span> Osso/Calcio
          </span>
          <span className="flex items-center gap-1 rounded bg-white px-2 py-1 shadow-sm">
            <span className="text-red-500">♥</span> Cardio/Omega-3
          </span>
          <span className="flex items-center gap-1 rounded bg-white px-2 py-1 shadow-sm">
            <span className="text-amber-500">⚡</span> Baixo IG
          </span>
        </div>
        <div className="space-y-4">
          {plan.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              isFoodChecked={tracker.isFoodChecked}
              onToggleFood={tracker.toggleFood}
              progress={tracker.getMealProgress(meal.id, meal.foods.length)}
            />
          ))}
        </div>
      </section>

      <section>
        <SupplementSection
          isSupplementChecked={tracker.isSupplementChecked}
          onToggle={tracker.toggleSupplement}
          checkedCount={tracker.totalSupplementsChecked}
        />
      </section>

      <section>
        <WaterTracker
          currentMl={tracker.progress.waterMl}
          targetLiters={plan.waterLiters}
          onAdd={tracker.addWater}
        />
      </section>
    </div>
  )
}
