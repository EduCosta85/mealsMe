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
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-on-surface-muted">
          <span>🍽️</span> Refeicoes ({plan.meals.length})
        </h3>
        <div className="mb-3 flex flex-wrap gap-3 rounded-lg bg-surface-alt px-3 py-2 text-[10px] text-on-surface-muted">
          <span>★ Osso/Calcio</span>
          <span>♥ Cardio/Omega-3</span>
          <span>⚡ Baixo IG</span>
        </div>
        <div className="space-y-3">
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
