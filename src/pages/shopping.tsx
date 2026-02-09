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
          <h2 className="text-xl font-bold text-gray-900">Lista de Compras</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            R${totalCost.min}-{totalCost.max} estim.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-surface-alt text-gray-700 hover:bg-gray-200'
            }`}
          >
            {copied ? (
              <>
                <span className="text-lg">✓</span> Copiado
              </>
            ) : (
              <>
                <span className="text-lg">📋</span> Exportar
              </>
            )}
          </button>

          <div className="flex flex-col items-center">
             <ProgressRing
              percent={overallPercent}
              size={48}
              strokeWidth={4}
              label={`${overallPercent}%`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl bg-orange-50 p-3 text-center ring-1 ring-orange-100">
          <span className="text-2xl font-bold text-orange-700">{tracker.totalItemsToBuy}</span>
          <span className="text-xs font-medium text-orange-600">a comprar</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-blue-50 p-3 text-center ring-1 ring-blue-100">
          <span className="text-2xl font-bold text-blue-700">{tracker.totalItemsBought}</span>
          <span className="text-xs font-medium text-blue-600">carrinho</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
          <span className="text-2xl font-bold text-emerald-700">{tracker.itemsCovered}</span>
          <span className="text-xs font-medium text-emerald-600">em casa</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-xs font-medium text-gray-500">
          💡 Marque o que você já tem em "Tenho"
        </span>
        {(tracker.totalItemsBought > 0 || Object.keys(tracker.progress.inventory).length > 0) && (
          <button
            onClick={tracker.resetAll}
            className="text-xs font-bold text-red-500 transition-colors hover:text-red-700 active:text-red-800"
          >
            Limpar tudo
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
