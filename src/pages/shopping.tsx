import { useState, useCallback } from 'react'
import { SHOPPING_CATEGORIES, getTotalWeeklyCost, getToBuyAmount } from '../data/shopping-list'
import { useShoppingTracker } from '../hooks/use-shopping-tracker'
import { ShoppingCategorySection } from '../components/shopping-category'
import { ProgressRing } from '../components/progress-ring'

// Pure: build export text with items that still need buying
function buildExportText(
  getInventory: (id: string) => number,
  isBought: (id: string) => boolean,
): string {
  const lines: string[] = []
  for (const cat of SHOPPING_CATEGORIES) {
    for (const item of cat.items) {
      const inv = getInventory(item.id)
      const toBuy = getToBuyAmount(item.amount, inv)
      if (toBuy > 0 && !isBought(item.id)) {
        lines.push(`${item.name};${toBuy}${item.unit}`)
      }
    }
  }
  return lines.join('\n')
}

export function ShoppingPage() {
  const tracker = useShoppingTracker()
  const totalCost = getTotalWeeklyCost()
  const [copied, setCopied] = useState(false)

  const overallPercent = tracker.totalItems === 0
    ? 0
    : Math.round((tracker.itemsCovered / tracker.totalItems) * 100)

  const handleExport = useCallback(async () => {
    const text = buildExportText(tracker.getInventory, tracker.isBought)
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers / non-HTTPS
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [tracker.getInventory, tracker.isBought])

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Lista de Compras</h2>
          <p className="mt-1 text-xs text-on-surface-muted">
            Semanal · R${totalCost.min}-{totalCost.max}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              copied
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-on-surface-muted hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            {copied ? '✓ Copiado!' : '📋 Exportar'}
          </button>

          <ProgressRing
            percent={overallPercent}
            size={48}
            strokeWidth={4}
            label={`${overallPercent}%`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-orange-50 px-3 py-2 text-center">
          <div className="text-sm font-bold text-orange-700">{tracker.totalItemsToBuy}</div>
          <div className="text-[10px] text-orange-600">a comprar</div>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
          <div className="text-sm font-bold text-blue-700">{tracker.totalItemsBought}</div>
          <div className="text-[10px] text-blue-600">comprados</div>
        </div>
        <div className="rounded-lg bg-primary-50 px-3 py-2 text-center">
          <div className="text-sm font-bold text-primary-700">{tracker.itemsCovered}</div>
          <div className="text-[10px] text-primary-600">resolvidos</div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-surface-alt px-3 py-2">
        <span className="text-[11px] text-on-surface-muted">
          Preencha "Tenho" com o que ja tem em casa
        </span>
        {(tracker.totalItemsBought > 0 || Object.keys(tracker.progress.inventory).length > 0) && (
          <button
            onClick={tracker.resetAll}
            className="text-xs font-medium text-red-500 hover:text-red-700"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="space-y-3">
        {SHOPPING_CATEGORIES.map((category) => (
          <ShoppingCategorySection
            key={category.id}
            category={category}
            getInventory={tracker.getInventory}
            onSetInventory={tracker.setInventory}
            isBought={tracker.isBought}
            onToggleBought={tracker.toggleBought}
          />
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-on-surface">Dicas de Economia</h3>
        <ul className="space-y-1 text-xs text-on-surface-muted">
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Compre frutas e verduras na feira (20-30% mais barato)</span>
          </li>
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Frango inteiro e desossar em casa economiza R$40-60/mes</span>
          </li>
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Leguminosas secas em atacado sao mais baratas</span>
          </li>
          <li className="flex items-start gap-2">
            <span>💡</span>
            <span>Prefira frutas da estacao (mais baratas e saborosas)</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
