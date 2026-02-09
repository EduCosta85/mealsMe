import { SUPPLEMENTS } from '../data/supplements'
import { SupplementItem } from './supplement-item'
import type { ActivityState, ActivityStatus } from '../data/types'

interface SupplementSectionProps {
  readonly isSupplementChecked: (id: string) => boolean
  readonly onToggle: (id: string) => void
  readonly checkedCount: number
  readonly getActivity: (id: string) => ActivityState | undefined
  readonly onSetActivity: (id: string, status: ActivityStatus) => void
}

export function SupplementSection({
  isSupplementChecked,
  onToggle,
  checkedCount,
  getActivity,
  onSetActivity,
}: SupplementSectionProps) {
  const total = SUPPLEMENTS.length
  const percent = Math.round((checkedCount / total) * 100)

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💊</span>
          <span className="text-sm font-semibold text-purple-800">Suplementos</span>
        </div>
        <span className="text-xs font-medium text-purple-600">
          {checkedCount}/{total} ({percent}%)
        </span>
      </div>

      <ul className="space-y-2">
        {SUPPLEMENTS.map((sup) => (
          <SupplementItem
            key={sup.id}
            supplement={sup}
            isChecked={isSupplementChecked(sup.id)}
            onToggle={onToggle}
            activityState={getActivity(sup.id)}
            onSetActivity={onSetActivity}
          />
        ))}
      </ul>
    </div>
  )
}
