import { useCallback } from 'react'
import { useStorage } from './use-storage'
import { SHOPPING_CATEGORIES, getToBuyAmount } from '../data/shopping-list'

interface ShoppingProgress {
  readonly weekKey: string
  readonly inventory: Record<string, number>
  readonly bought: readonly string[]
}

const EMPTY_PROGRESS: ShoppingProgress = {
  weekKey: '',
  inventory: {},
  bought: [],
}

const getWeekKey = (): string => {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - now.getDay())
  return sunday.toISOString().slice(0, 10)
}

export function useShoppingTracker() {
  const weekKey = getWeekKey()
  const [progress, setProgress] = useStorage<ShoppingProgress>(
    `shopping_${weekKey}`,
    { ...EMPTY_PROGRESS, weekKey },
  )

  const validProgress =
    progress.weekKey === weekKey ? progress : { ...EMPTY_PROGRESS, weekKey }

  const setInventory = useCallback(
    (itemId: string, amount: number) => {
      setProgress((prev) => {
        const current = prev.weekKey === weekKey ? prev : { ...EMPTY_PROGRESS, weekKey }
        return {
          ...current,
          inventory: { ...current.inventory, [itemId]: Math.max(0, amount) },
        }
      })
    },
    [setProgress, weekKey],
  )

  const getInventory = useCallback(
    (itemId: string): number => validProgress.inventory[itemId] ?? 0,
    [validProgress.inventory],
  )

  const toggleBought = useCallback(
    (itemId: string) => {
      setProgress((prev) => {
        const current = prev.weekKey === weekKey ? prev : { ...EMPTY_PROGRESS, weekKey }
        const isBought = current.bought.includes(itemId)
        return {
          ...current,
          bought: isBought
            ? current.bought.filter((id) => id !== itemId)
            : [...current.bought, itemId],
        }
      })
    },
    [setProgress, weekKey],
  )

  const isBought = useCallback(
    (itemId: string): boolean => validProgress.bought.includes(itemId),
    [validProgress.bought],
  )

  const needsToBuy = useCallback(
    (itemId: string, needed: number): boolean => {
      const inv = validProgress.inventory[itemId] ?? 0
      return getToBuyAmount(needed, inv) > 0
    },
    [validProgress.inventory],
  )

  const totalItemsToBuy = SHOPPING_CATEGORIES.reduce((sum, cat) => {
    const catNeedsBuy = cat.items.filter((item) => {
      const inv = validProgress.inventory[item.id] ?? 0
      return getToBuyAmount(item.amount, inv) > 0
    }).length
    return sum + catNeedsBuy
  }, 0)

  const totalItemsBought = validProgress.bought.length

  const totalItems = SHOPPING_CATEGORIES.reduce(
    (sum, cat) => sum + cat.items.length, 0,
  )

  const itemsCovered = SHOPPING_CATEGORIES.reduce((sum, cat) => {
    const covered = cat.items.filter((item) => {
      const inv = validProgress.inventory[item.id] ?? 0
      const toBuy = getToBuyAmount(item.amount, inv)
      return toBuy === 0 || validProgress.bought.includes(item.id)
    }).length
    return sum + covered
  }, 0)

  const resetAll = useCallback(() => {
    setProgress({ ...EMPTY_PROGRESS, weekKey })
  }, [setProgress, weekKey])

  return {
    progress: validProgress,
    setInventory,
    getInventory,
    toggleBought,
    isBought,
    needsToBuy,
    totalItemsToBuy,
    totalItemsBought,
    totalItems,
    itemsCovered,
    resetAll,
  } as const
}
