import { describe, test, expect } from 'vitest'
import type { TimelinePeriod } from '../../lib/timeline-utils'

describe('TimelineGroup', () => {
  test('period config returns correct values for Manhã', () => {
    const period: TimelinePeriod = {
      name: 'Manhã',
      items: [
        {
          id: 'meal-1',
          type: 'meal',
          time: '08:00',
          title: 'Café da Manhã'
        }
      ]
    }

    expect(period.name).toBe('Manhã')
    expect(period.items).toHaveLength(1)
    expect(period.items[0].time).toBe('08:00')
  })

  test('period config returns correct values for Tarde', () => {
    const period: TimelinePeriod = {
      name: 'Tarde',
      items: [
        {
          id: 'meal-2',
          type: 'meal',
          time: '14:00',
          title: 'Almoço'
        }
      ]
    }

    expect(period.name).toBe('Tarde')
    expect(period.items).toHaveLength(1)
  })

  test('period config returns correct values for Noite', () => {
    const period: TimelinePeriod = {
      name: 'Noite',
      items: [
        {
          id: 'meal-3',
          type: 'meal',
          time: '20:00',
          title: 'Jantar'
        }
      ]
    }

    expect(period.name).toBe('Noite')
    expect(period.items).toHaveLength(1)
  })

  test('period can have multiple items', () => {
    const period: TimelinePeriod = {
      name: 'Manhã',
      items: [
        {
          id: 'meal-1',
          type: 'meal',
          time: '08:00',
          title: 'Café da Manhã'
        },
        {
          id: 'supplement-1',
          type: 'supplement',
          time: '08:30',
          title: 'Vitaminas'
        },
        {
          id: 'water-1',
          type: 'water',
          time: '09:00',
          title: 'Água',
          goal: 500
        }
      ]
    }

    expect(period.items).toHaveLength(3)
    expect(period.items[0].type).toBe('meal')
    expect(period.items[1].type).toBe('supplement')
    expect(period.items[2].type).toBe('water')
  })
})
