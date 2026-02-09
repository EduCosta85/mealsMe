import { SUPPLEMENTS } from '../data/supplements'

interface SupplementSectionProps {
  readonly isSupplementChecked: (id: string) => boolean
  readonly onToggle: (id: string) => void
  readonly checkedCount: number
}

export function SupplementSection({
  isSupplementChecked,
  onToggle,
  checkedCount,
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

      <ul className="space-y-1">
        {SUPPLEMENTS.map((sup) => {
          const checked = isSupplementChecked(sup.id)
          return (
            <li key={sup.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-purple-100/50 active:bg-purple-100">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(sup.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-purple-500"
                />
                <div className="flex-1">
                  <span
                    className={`text-sm ${checked ? 'text-on-surface-muted line-through' : 'text-on-surface'}`}
                  >
                    {sup.name}
                  </span>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-on-surface-muted">
                    <span>{sup.time}</span>
                    <span>·</span>
                    <span>{sup.withMeal}</span>
                  </div>
                </div>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
