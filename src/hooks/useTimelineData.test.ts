/**
 * useTimelineData Hook Test Suite
 * 
 * Note: This project does not have a test runner configured yet.
 * To run these tests, install vitest and @testing-library/react:
 * npm install -D vitest @testing-library/react @testing-library/react-hooks
 * 
 * Then add to package.json scripts:
 * "test": "vitest"
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTimelineData } from './useTimelineData'
import * as dailyTrackerModule from './use-daily-tracker'
import * as mealPlanModule from '../data/meal-plan'
import type { DayPlan } from '../data/types'
import type { TimelinePeriod, TimelineItem } from '../lib/timeline-utils'

// Mock dependencies
vi.mock('./use-daily-tracker')
vi.mock('../data/meal-plan')

describe('useTimelineData', () => {
  const mockDayPlan: DayPlan = {
    weekday: 1,
    label: 'Segunda-feira',
    shortLabel: 'SEG',
    dayType: 'training',
    training: 'Upper A',
    targets: { kcal: 2450, protein: 160, carbs: 290, fat: 72, fiber: 30 },
    waterLiters: 3.0,
    meals: [
      {
        id: 'seg-pre',
        name: 'Pre-Treino',
        time: '06:15',
        foods: [
          { name: 'Banana media', quantity: '120g', tags: ['⚡'] }
        ],
        macros: { kcal: 105, protein: 1, carbs: 27, fat: 0, fiber: 3 }
      },
      {
        id: 'seg-cafe',
        name: 'Cafe / Pos-Treino',
        time: '08:30',
        supplements: ['D3+K2', 'Complexo B'],
        foods: [
          { name: '3 ovos inteiros mexidos', quantity: '180g', tags: ['★', '♥'] }
        ],
        macros: { kcal: 620, protein: 42, carbs: 52, fat: 28, fiber: 7 }
      },
      {
        id: 'seg-almoco',
        name: 'Almoco',
        time: '12:30',
        foods: [
          { name: 'Peito de frango grelhado', quantity: '150g' }
        ],
        macros: { kcal: 650, protein: 50, carbs: 68, fat: 16, fiber: 12 }
      }
    ]
  }

  const mockRestDayPlan: DayPlan = {
    weekday: 3,
    label: 'Quarta-feira',
    shortLabel: 'QUA',
    dayType: 'rest',
    targets: { kcal: 2100, protein: 160, carbs: 203, fat: 72, fiber: 30 },
    waterLiters: 2.5,
    meals: [
      {
        id: 'qua-cafe',
        name: 'Cafe da Manha',
        time: '07:30',
        foods: [
          { name: 'Tapioca', quantity: '40g goma', tags: ['⚡'] }
        ],
        macros: { kcal: 480, protein: 28, carbs: 40, fat: 22, fiber: 3 }
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('data aggregation', () => {
    test('aggregates meals into timeline items', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      const allItems = result.current.periods.flatMap((p: TimelinePeriod) => p.items)
      const mealItems = allItems.filter((item: TimelineItem) => item.type === 'meal')
      
      expect(mealItems).toHaveLength(3)
      expect(mealItems[0].id).toBe('seg-pre')
      expect(mealItems[0].title).toBe('Pre-Treino')
      expect(mealItems[0].time).toBe('06:15')
    })

    test('includes training session on training days', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      const allItems = result.current.periods.flatMap((p: TimelinePeriod) => p.items)
      const trainingItems = allItems.filter((item: TimelineItem) => item.type === 'training')
      
      expect(trainingItems).toHaveLength(1)
      expect(trainingItems[0].title).toBe('Upper A')
      expect(trainingItems[0].description).toBe('Strength training session')
    })

    test('excludes training session on rest days', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockRestDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      const allItems = result.current.periods.flatMap((p: TimelinePeriod) => p.items)
      const trainingItems = allItems.filter((item: TimelineItem) => item.type === 'training')
      
      expect(trainingItems).toHaveLength(0)
    })

    test('includes water goal item', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      const allItems = result.current.periods.flatMap((p) => p.items)
      const waterItems = allItems.filter((item) => item.type === 'water')
      
      expect(waterItems).toHaveLength(1)
      expect(waterItems[0].title).toBe('Water Goal')
      expect(waterItems[0].goal).toBe(3000) // 3.0L * 1000
    })

    test('includes supplements for training days', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      const allItems = result.current.periods.flatMap((p) => p.items)
      const supplementItems = allItems.filter((item) => item.type === 'supplement')
      
      // Should include all supplements (training day)
      expect(supplementItems.length).toBeGreaterThan(0)
    })
  })

  describe('sorting and grouping', () => {
    test('groups items into periods (Manhã/Tarde/Noite)', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      expect(result.current.periods.length).toBeGreaterThan(0)
      expect(result.current.periods.every((p) => 
        ['Manhã', 'Tarde', 'Noite'].includes(p.name)
      )).toBe(true)
    })

    test('sorts items within periods by time', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      const manhaPeriod = result.current.periods.find((p) => p.name === 'Manhã')
      if (manhaPeriod && manhaPeriod.items.length > 1) {
        // Verify items are sorted by time
        for (let i = 0; i < manhaPeriod.items.length - 1; i++) {
          const currentTime = manhaPeriod.items[i].time
          const nextTime = manhaPeriod.items[i + 1].time
          
          // Parse times for comparison
          const parseTime = (time: string) => {
            const clean = time.startsWith('~') ? time.slice(1) : time
            const [h, m] = clean.split(':').map(Number)
            return h * 60 + m
          }
          
          expect(parseTime(currentTime)).toBeLessThanOrEqual(parseTime(nextTime))
        }
      }
    })
  })

  describe('loading and error states', () => {
    test('returns loading state from useDailyTracker', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: true,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      expect(result.current.loading).toBe(true)
    })

    test('returns error state from useDailyTracker', () => {
      // Arrange
      vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: 'Failed to load progress',
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      const { result } = renderHook(() => useTimelineData())

      // Assert
      expect(result.current.error).toBe('Failed to load progress')
    })
  })

  describe('date handling', () => {
    test('uses today by default when no date provided', () => {
      // Arrange
      const getDayPlanSpy = vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-10',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      renderHook(() => useTimelineData())

      // Assert
      expect(getDayPlanSpy).toHaveBeenCalled()
    })

    test('uses provided date when specified', () => {
      // Arrange
      const testDate = new Date('2026-02-15')
      const getDayPlanSpy = vi.spyOn(mealPlanModule, 'getDayPlan').mockReturnValue(mockDayPlan)
      vi.spyOn(dailyTrackerModule, 'useDailyTracker').mockReturnValue({
        progress: {
          date: '2026-02-15',
          checkedFoods: {},
          checkedSupplements: [],
          waterMl: 0
        },
        loading: false,
        error: null,
        toggleFood: vi.fn(),
        isFoodChecked: vi.fn(),
        toggleSupplement: vi.fn(),
        isSupplementChecked: vi.fn(),
        addWater: vi.fn(),
        getMealProgress: vi.fn(),
        setMealActivity: vi.fn(),
        getMealActivity: vi.fn(),
        setSupplementActivity: vi.fn(),
        getSupplementActivity: vi.fn(),
        setTrainingActivity: vi.fn(),
        getTrainingActivity: vi.fn(),
        totalFoodsChecked: 0,
        totalSupplementsChecked: 0
      })

      // Act
      renderHook(() => useTimelineData(testDate))

      // Assert
      expect(getDayPlanSpy).toHaveBeenCalledWith(testDate)
    })
  })
})
