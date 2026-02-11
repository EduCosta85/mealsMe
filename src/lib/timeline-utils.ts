import type { DailyProgress, FoodItem, Macros } from '../data/types'

// Timeline item types
export interface TimelineItem {
  readonly id: string
  readonly type: 'meal' | 'supplement' | 'training' | 'water'
  readonly time: string
  readonly title: string
  readonly description?: string
  readonly goal?: number // For water tracking
  readonly foods?: readonly FoodItem[] // For meals
  readonly macros?: Macros // For meals
}

export interface TimelinePeriod {
  readonly name: 'Manhã' | 'Tarde' | 'Noite'
  readonly items: readonly TimelineItem[]
}

export type ItemStatus = 'pending' | 'partial' | 'completed'

/**
 * Parse time string to minutes since midnight
 * Handles approximate times with "~" prefix
 * 
 * @param time - Time string in format "HH:MM" or "~HH:MM"
 * @returns Minutes since midnight (e.g., "08:30" → 510)
 * 
 * @example
 * parseTime("06:00") // 360
 * parseTime("08:30") // 510
 * parseTime("~12:30") // 750
 */
export const parseTime = (time: string): number => {
  const cleanTime = time.startsWith('~') ? time.slice(1) : time
  const [hours, minutes] = cleanTime.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Sort timeline items by parsed time (earliest first)
 * Pure function - returns new array without mutations
 * 
 * @param items - Array of timeline items to sort
 * @returns New sorted array
 * 
 * @example
 * sortByTime([
 *   { id: '1', time: '12:00', ... },
 *   { id: '2', time: '08:00', ... }
 * ]) // Returns items with '08:00' first
 */
export const sortByTime = (items: readonly TimelineItem[]): readonly TimelineItem[] => {
  return [...items].sort((a, b) => parseTime(a.time) - parseTime(b.time))
}

/**
 * Group timeline items into periods: Manhã (00:00-11:59), Tarde (12:00-17:59), Noite (18:00-23:59)
 * Only includes periods that have items
 * 
 * @param items - Array of timeline items to group
 * @returns Array of periods with their items
 * 
 * @example
 * groupByPeriod([
 *   { id: '1', time: '08:00', ... },
 *   { id: '2', time: '14:00', ... }
 * ]) // Returns [{ name: 'Manhã', items: [...] }, { name: 'Tarde', items: [...] }]
 */
export const groupByPeriod = (items: readonly TimelineItem[]): readonly TimelinePeriod[] => {
  const periods: Record<string, TimelineItem[]> = {
    Manhã: [],
    Tarde: [],
    Noite: []
  }

  items.forEach(item => {
    const minutes = parseTime(item.time)
    const hours = Math.floor(minutes / 60)

    if (hours < 12) {
      periods.Manhã.push(item)
    } else if (hours < 18) {
      periods.Tarde.push(item)
    } else {
      periods.Noite.push(item)
    }
  })

  // Only return periods that have items
  return Object.entries(periods)
    .filter(([_, periodItems]) => periodItems.length > 0)
    .map(([name, periodItems]) => ({
      name: name as 'Manhã' | 'Tarde' | 'Noite',
      items: sortByTime(periodItems)
    }))
}

/**
 * Calculate completion status for a timeline item based on daily progress
 * 
 * @param item - Timeline item to check
 * @param progress - Daily progress data
 * @returns Status: 'pending' | 'partial' | 'completed'
 * 
 * @example
 * calculateStatus(
 *   { id: 'meal-1', type: 'meal', ... },
 *   { checkedFoods: { 'meal-1': ['food1', 'food2'] }, ... }
 * ) // Returns 'partial' or 'completed' based on foods checked
 */
export const calculateStatus = (
  item: TimelineItem,
  progress: DailyProgress
): ItemStatus => {
  switch (item.type) {
    case 'meal': {
      const checkedFoods = progress.checkedFoods[item.id] || []
      if (checkedFoods.length === 0) return 'pending'
      // Partial if some foods checked, completed if all checked
      // Note: We don't have total food count here, so we assume partial if any checked
      return 'partial'
    }

    case 'supplement': {
      const isChecked = progress.checkedSupplements.includes(item.id)
      return isChecked ? 'completed' : 'pending'
    }

    case 'training': {
      const trainingStatus = progress.trainingActivity?.status
      if (!trainingStatus || trainingStatus === 'pending') return 'pending'
      if (trainingStatus === 'completed') return 'completed'
      return 'partial' // For 'skipped', 'postponed', 'missed'
    }

    case 'water': {
      const currentMl = progress.waterMl || 0
      const goalMl = item.goal || 0
      
      if (currentMl === 0) return 'pending'
      if (currentMl >= goalMl) return 'completed'
      return 'partial'
    }

    default:
      return 'pending'
  }
}
