import { useState } from 'react'
import type { ShoppingCategory, ShoppingItem } from '../data/shopping-list'
import { getCategoryTotalCost, getToBuyAmount, formatAmount } from '../data/shopping-list'

interface ShoppingCategorySectionProps {
  readonly category: ShoppingCategory
  readonly getInventory: (id: string) => number
  readonly onSetInventory: (id: string, amount: number) => void
  readonly isBought: (id: string) => boolean
  readonly onToggleBought: (id: string) => void
}

interface ShoppingItemRowProps {
  readonly item: ShoppingItem
  readonly inventory: number
  readonly bought: boolean
  readonly accentColor: string
  readonly onSetInventory: (id: string, amount: number) => void
  readonly onToggleBought: (id: string) => void
}

function ShoppingItemRow({
  item,
  inventory,
  bought,
  accentColor,
  onSetInventory,
  onToggleBought,
}: ShoppingItemRowProps) {
  const toBuy = getToBuyAmount(item.amount, inventory)
  const isCovered = toBuy === 0
  const isDone = isCovered || bought

  return (
    <li className={`rounded-lg px-2 py-2.5 ${isDone ? 'bg-primary-50/40' : ''}`}>
      <div className="flex items-center gap-2">
        {!isCovered && (
          <input
            type="checkbox"
            checked={bought}
            onChange={() => onToggleBought(item.id)}
            className={`h-4 w-4 shrink-0 ${accentColor}`}
          />
        )}
        {isCovered && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-xs text-primary-500">
            ✓
          </span>
        )}

        <div className="min-w-0 flex-1">
          <span
            className={`text-sm ${isDone ? 'text-on-surface-muted line-through' : 'text-on-surface'}`}
          >
            {item.name}
          </span>
          {item.note && (
            <div className="text-[10px] text-on-surface-muted">{item.note}</div>
          )}
        </div>

        <span className="shrink-0 text-[10px] text-on-surface-muted">
          R${item.costMin}-{item.costMax}
        </span>
      </div>

      <div className="mt-1.5 ml-6 flex items-center gap-2 text-[11px]">
        <span className="w-16 text-on-surface-muted">
          Precisa: <span className="font-semibold text-on-surface">{formatAmount(item.amount, item.unit)}</span>
        </span>

        <div className="flex items-center gap-1">
          <span className="text-on-surface-muted">Tenho:</span>
          <input
            type="number"
            min={0}
            step="any"
            value={inventory || ''}
            placeholder="0"
            onChange={(e) => onSetInventory(item.id, parseFloat(e.target.value) || 0)}
            className="w-14 rounded border border-gray-200 px-1.5 py-0.5 text-center text-[11px] text-on-surface focus:border-primary-400 focus:outline-none"
          />
          <span className="text-on-surface-muted">{item.unit}</span>
        </div>

        {!isCovered && (
          <span className="ml-auto font-semibold text-orange-600">
            Comprar: {formatAmount(toBuy, item.unit)}
          </span>
        )}
        {isCovered && (
          <span className="ml-auto font-semibold text-primary-600">OK</span>
        )}
      </div>
    </li>
  )
}

export function ShoppingCategorySection({
  category,
  getInventory,
  onSetInventory,
  isBought,
  onToggleBought,
}: ShoppingCategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  const doneCount = category.items.filter((item) => {
    const inv = getInventory(item.id)
    const toBuy = getToBuyAmount(item.amount, inv)
    return toBuy === 0 || isBought(item.id)
  }).length

  const total = category.items.length
  const percent = Math.round((doneCount / total) * 100)
  const cost = getCategoryTotalCost(category)
  const isComplete = doneCount === total

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        isComplete
          ? 'border-primary-200 bg-primary-50/50'
          : `${category.borderColor} ${category.bgColor}`
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="text-xl">{category.icon}</span>

        <div className="flex-1">
          <span className={`text-sm font-semibold ${category.color}`}>
            {category.name}
          </span>
          <div className="mt-0.5 text-[10px] text-on-surface-muted">
            R${cost.min}-{cost.max}
          </div>
        </div>

        <span className={`text-xs font-medium ${category.color}`}>
          {doneCount}/{total} ({percent}%)
        </span>

        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-2">
          <ul className="space-y-1">
            {category.items.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                inventory={getInventory(item.id)}
                bought={isBought(item.id)}
                accentColor={category.accentColor}
                onSetInventory={onSetInventory}
                onToggleBought={onToggleBought}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
