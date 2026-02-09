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

  const increment = () => onSetInventory(item.id, (inventory || 0) + 1)
  const decrement = () => onSetInventory(item.id, Math.max(0, (inventory || 0) - 1))

  return (
    <li className={`rounded-xl border border-transparent px-3 py-3 transition-colors ${isDone ? 'bg-primary-50/30' : 'bg-white hover:border-gray-100'}`}>
      <div className="flex items-start gap-3">
        {!isCovered && (
          <input
            type="checkbox"
            checked={bought}
            onChange={() => onToggleBought(item.id)}
            className={`mt-0.5 h-6 w-6 shrink-0 rounded border-gray-300 ${accentColor} focus:ring-opacity-50`}
          />
        )}
        {isCovered && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            ✓
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className={`block text-sm font-medium ${
                  isDone ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}
              >
                {item.name}
              </span>
              {item.note && (
                <p className="mt-0.5 text-xs text-gray-500">{item.note}</p>
              )}
            </div>
            
            {!isCovered && (
              <span className="shrink-0 rounded bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">
                {formatAmount(toBuy, item.unit)}
              </span>
            )}
            {isCovered && (
              <span className="shrink-0 text-xs font-medium text-emerald-600">OK</span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-1">
              <span className="pl-1 text-[10px] font-bold uppercase text-gray-400">Tenho:</span>
              
              <button 
                onClick={decrement}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm active:bg-gray-100"
              >
                -
              </button>
              
              <div className="flex items-center gap-1 bg-white px-2 shadow-sm rounded-md h-8 border border-gray-100">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={inventory || ''}
                  placeholder="0"
                  onChange={(e) => onSetInventory(item.id, parseFloat(e.target.value) || 0)}
                  className="w-10 text-center text-sm font-bold text-gray-900 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 font-medium">{item.unit}</span>
              </div>

              <button 
                onClick={increment}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm active:bg-gray-100"
              >
                +
              </button>
            </div>

            <div className="text-right text-[10px] text-gray-400">
              R${item.costMin}-{item.costMax}
            </div>
          </div>
        </div>
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
