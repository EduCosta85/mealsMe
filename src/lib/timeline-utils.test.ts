/**
 * Timeline Utilities Test Suite
 * 
 * Note: This project does not have a test runner configured yet.
 * To run these tests, install vitest:
 * npm install -D vitest
 * 
 * Then add to package.json scripts:
 * "test": "vitest"
 */

import { describe, test, expect } from 'vitest'
import {
  parseTime,
  sortByTime,
  groupByPeriod,
  calculateStatus,
  type TimelineItem
} from './timeline-utils'
import type { DailyProgress } from '../data/types'

describe('parseTime', () => {
  test('converts simple time to minutes since midnight', () => {
    // Arrange
    const time = '06:00'

    // Act
    const result = parseTime(time)

    // Assert
    expect(result).toBe(360)
  })

  test('converts time with minutes to total minutes', () => {
    // Arrange
    const time = '08:30'

    // Act
    const result = parseTime(time)

    // Assert
    expect(result).toBe(510)
  })

  test('handles approximate time with tilde prefix', () => {
    // Arrange
    const time = '~12:30'

    // Act
    const result = parseTime(time)

    // Assert
    expect(result).toBe(750)
  })

  test('handles midnight correctly', () => {
    // Arrange
    const time = '00:00'

    // Act
    const result = parseTime(time)

    // Assert
    expect(result).toBe(0)
  })

  test('handles end of day correctly', () => {
    // Arrange
    const time = '23:59'

    // Act
    const result = parseTime(time)

    // Assert
    expect(result).toBe(1439)
  })
})

describe('sortByTime', () => {
  test('sorts items by time in ascending order', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '12:00', title: 'Lunch' },
      { id: '2', type: 'meal', time: '08:00', title: 'Breakfast' },
      { id: '3', type: 'meal', time: '18:00', title: 'Dinner' }
    ]

    // Act
    const result = sortByTime(items)

    // Assert
    expect(result[0].time).toBe('08:00')
    expect(result[1].time).toBe('12:00')
    expect(result[2].time).toBe('18:00')
  })

  test('handles approximate times correctly', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '~12:30', title: 'Lunch' },
      { id: '2', type: 'meal', time: '08:00', title: 'Breakfast' }
    ]

    // Act
    const result = sortByTime(items)

    // Assert
    expect(result[0].time).toBe('08:00')
    expect(result[1].time).toBe('~12:30')
  })

  test('returns new array without mutating original', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '12:00', title: 'Lunch' },
      { id: '2', type: 'meal', time: '08:00', title: 'Breakfast' }
    ]
    const originalOrder = [...items]

    // Act
    const result = sortByTime(items)

    // Assert
    expect(items).toEqual(originalOrder) // Original unchanged
    expect(result).not.toBe(items) // New array
  })

  test('handles empty array', () => {
    // Arrange
    const items: TimelineItem[] = []

    // Act
    const result = sortByTime(items)

    // Assert
    expect(result).toEqual([])
  })

  test('handles single item', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '12:00', title: 'Lunch' }
    ]

    // Act
    const result = sortByTime(items)

    // Assert
    expect(result).toEqual(items)
  })
})

describe('groupByPeriod', () => {
  test('groups items into Manhã period (00:00-11:59)', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '06:00', title: 'Breakfast' },
      { id: '2', type: 'meal', time: '09:00', title: 'Snack' }
    ]

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Manhã')
    expect(result[0].items).toHaveLength(2)
  })

  test('groups items into Tarde period (12:00-17:59)', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '12:00', title: 'Lunch' },
      { id: '2', type: 'meal', time: '15:00', title: 'Snack' }
    ]

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Tarde')
    expect(result[0].items).toHaveLength(2)
  })

  test('groups items into Noite period (18:00-23:59)', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '18:00', title: 'Dinner' },
      { id: '2', type: 'meal', time: '21:00', title: 'Snack' }
    ]

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Noite')
    expect(result[0].items).toHaveLength(2)
  })

  test('groups items across multiple periods', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '08:00', title: 'Breakfast' },
      { id: '2', type: 'meal', time: '12:00', title: 'Lunch' },
      { id: '3', type: 'meal', time: '18:00', title: 'Dinner' }
    ]

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('Manhã')
    expect(result[1].name).toBe('Tarde')
    expect(result[2].name).toBe('Noite')
  })

  test('only includes periods with items', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '08:00', title: 'Breakfast' },
      { id: '2', type: 'meal', time: '18:00', title: 'Dinner' }
    ]

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result).toHaveLength(2)
    expect(result.find(p => p.name === 'Tarde')).toBeUndefined()
  })

  test('sorts items within each period by time', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '09:00', title: 'Snack' },
      { id: '2', type: 'meal', time: '06:00', title: 'Breakfast' }
    ]

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result[0].items[0].time).toBe('06:00')
    expect(result[0].items[1].time).toBe('09:00')
  })

  test('handles empty array', () => {
    // Arrange
    const items: TimelineItem[] = []

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result).toEqual([])
  })

  test('handles boundary times correctly', () => {
    // Arrange
    const items: TimelineItem[] = [
      { id: '1', type: 'meal', time: '11:59', title: 'Late Morning' },
      { id: '2', type: 'meal', time: '12:00', title: 'Noon' },
      { id: '3', type: 'meal', time: '17:59', title: 'Late Afternoon' },
      { id: '4', type: 'meal', time: '18:00', title: 'Evening' }
    ]

    // Act
    const result = groupByPeriod(items)

    // Assert
    expect(result[0].name).toBe('Manhã')
    expect(result[0].items).toHaveLength(1)
    expect(result[1].name).toBe('Tarde')
    expect(result[1].items).toHaveLength(2)
    expect(result[2].name).toBe('Noite')
    expect(result[2].items).toHaveLength(1)
  })
})

describe('calculateStatus', () => {
  describe('meal items', () => {
    test('returns pending when no foods checked', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'meal-1',
        type: 'meal',
        time: '08:00',
        title: 'Breakfast'
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 0
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('pending')
    })

    test('returns partial when some foods checked', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'meal-1',
        type: 'meal',
        time: '08:00',
        title: 'Breakfast'
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {
          'meal-1': ['food1', 'food2']
        },
        checkedSupplements: [],
        waterMl: 0
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('partial')
    })
  })

  describe('supplement items', () => {
    test('returns pending when supplement not checked', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'supp-1',
        type: 'supplement',
        time: '08:00',
        title: 'Vitamin D'
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 0
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('pending')
    })

    test('returns completed when supplement checked', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'supp-1',
        type: 'supplement',
        time: '08:00',
        title: 'Vitamin D'
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: ['supp-1'],
        waterMl: 0
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('completed')
    })
  })

  describe('training items', () => {
    test('returns pending when no training activity', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'training-1',
        type: 'training',
        time: '07:00',
        title: 'Morning Workout'
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 0
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('pending')
    })

    test('returns completed when training completed', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'training-1',
        type: 'training',
        time: '07:00',
        title: 'Morning Workout'
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 0,
        trainingActivity: {
          status: 'completed',
          timestamp: Date.now()
        }
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('completed')
    })

    test('returns partial when training skipped', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'training-1',
        type: 'training',
        time: '07:00',
        title: 'Morning Workout'
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 0,
        trainingActivity: {
          status: 'skipped',
          timestamp: Date.now()
        }
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('partial')
    })
  })

  describe('water items', () => {
    test('returns pending when no water consumed', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'water-1',
        type: 'water',
        time: '08:00',
        title: 'Water Goal',
        goal: 2000
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 0
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('pending')
    })

    test('returns partial when some water consumed', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'water-1',
        type: 'water',
        time: '08:00',
        title: 'Water Goal',
        goal: 2000
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 1000
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('partial')
    })

    test('returns completed when goal reached', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'water-1',
        type: 'water',
        time: '08:00',
        title: 'Water Goal',
        goal: 2000
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 2000
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('completed')
    })

    test('returns completed when goal exceeded', () => {
      // Arrange
      const item: TimelineItem = {
        id: 'water-1',
        type: 'water',
        time: '08:00',
        title: 'Water Goal',
        goal: 2000
      }
      const progress: DailyProgress = {
        date: '2026-02-10',
        checkedFoods: {},
        checkedSupplements: [],
        waterMl: 2500
      }

      // Act
      const result = calculateStatus(item, progress)

      // Assert
      expect(result).toBe('completed')
    })
  })
})
