import { useMemo } from 'react'
import { Layout } from '../components/layout'
import { TimelineGroup } from '../components/timeline/timeline-group'
import { useTimelineData } from '../hooks/useTimelineData'
import { useDailyTracker } from '../hooks/use-daily-tracker'
import { getDayPlan } from '../data/meal-plan'
import { todayKey } from '../lib/date-utils'

/**
 * Format date for display (e.g., "Sexta, 11 Fev 2026")
 */
const formatDate = (date: Date): string => {
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  
  const weekday = weekdays[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${weekday}, ${day} ${month} ${year}`
}

/**
 * Loading Skeleton Component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-6 bg-gray-200 rounded-lg w-1/2" />
      </div>
      
      {/* Water Goal Skeleton */}
      <div className="h-20 bg-gray-200 rounded-xl" />
      
      {/* Timeline Groups Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4" />
          <div className="space-y-2">
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Error Message Component
 */
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
      <div className="text-2xl mb-2">⚠️</div>
      <p className="text-sm font-medium text-red-800">Erro ao carregar dados</p>
      <p className="text-xs text-red-600 mt-1">{message}</p>
    </div>
  )
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
      <div className="text-4xl mb-3">📅</div>
      <p className="text-sm font-medium text-gray-700">Nenhum item na agenda</p>
      <p className="text-xs text-gray-500 mt-1">
        Não há refeições ou atividades programadas para hoje
      </p>
    </div>
  )
}

/**
 * Water Goal Indicator Component
 */
function WaterGoalIndicator({ currentMl, goalMl }: { currentMl: number; goalMl: number }) {
  const percentage = goalMl > 0 ? Math.min((currentMl / goalMl) * 100, 100) : 0
  const goalLiters = (goalMl / 1000).toFixed(1)
  const currentLiters = (currentMl / 1000).toFixed(1)
  
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="Água">💧</span>
          <span className="text-sm font-semibold text-blue-900">Meta de Água</span>
        </div>
        <span className="text-sm font-medium text-blue-700">
          {currentLiters}L / {goalLiters}L
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentMl}
          aria-valuemin={0}
          aria-valuemax={goalMl}
          aria-label={`${percentage.toFixed(0)}% da meta de água alcançada`}
        />
      </div>
      
      {/* Percentage */}
      <div className="text-right mt-1">
        <span className="text-xs font-medium text-blue-600">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

/**
 * Agenda Page Component
 * 
 * Main timeline view displaying daily schedule:
 * - Date header with training type
 * - Water goal progress indicator
 * - Timeline groups (Manhã/Tarde/Noite)
 * - Loading and error states
 * - Empty state when no items
 * 
 * Features:
 * - Real-time sync with daily tracker
 * - Responsive layout (mobile-first)
 * - Staggered animations
 * - Accessible (ARIA labels, semantic HTML)
 */
export function AgendaPage() {
  const today = useMemo(() => new Date(), [])
  const dateKey = todayKey()
  
  // Fetch timeline data and tracker progress
  const { periods, loading, error } = useTimelineData(today)
  const tracker = useDailyTracker(dateKey)
  const dayPlan = useMemo(() => getDayPlan(today), [today])
  
  // Calculate total items
  const totalItems = periods.reduce((sum, period) => sum + period.items.length, 0)
  
  // Water goal in mL
  const waterGoalMl = dayPlan.waterLiters * 1000
  const currentWaterMl = tracker.progress.waterMl || 0
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="Calendário">📅</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {formatDate(today)}
              </h1>
              <p className="text-sm text-gray-600">
                {dayPlan.label}
              </p>
            </div>
          </div>
          
          {/* Training Type Badge */}
          {dayPlan.training && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
              <span className="text-xl" role="img" aria-label="Treino">🏋️</span>
              <span className="text-sm font-semibold text-purple-900">
                {dayPlan.training}
              </span>
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                Dia de Treino
              </span>
            </div>
          )}
          
          {dayPlan.dayType === 'rest' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <span className="text-xl" role="img" aria-label="Descanso">🌿</span>
              <span className="text-sm font-semibold text-green-900">
                Dia de Descanso
              </span>
            </div>
          )}
        </header>
        
        {/* Water Goal Indicator */}
        <WaterGoalIndicator currentMl={currentWaterMl} goalMl={waterGoalMl} />
        
        {/* Loading State */}
        {loading && <LoadingSkeleton />}
        
        {/* Error State */}
        {error && !loading && <ErrorMessage message={error} />}
        
        {/* Empty State */}
        {!loading && !error && totalItems === 0 && <EmptyState />}
        
        {/* Timeline Groups */}
        {!loading && !error && totalItems > 0 && (
          <div className="space-y-6">
            {periods.map((period, index) => (
              <div
                key={period.name}
                className="animate-fadeInUp"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <TimelineGroup
                  period={period}
                  progress={tracker.progress}
                  onItemClick={(itemId) => {
                    console.log('Timeline item clicked:', itemId)
                    // Future: Navigate to detail view or open modal
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

// Add page-level animations to global styles
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 300ms ease-out;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 350ms ease-out both;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`

if (typeof document !== 'undefined' && !document.querySelector('style[data-agenda-page-animations]')) {
  style.setAttribute('data-agenda-page-animations', 'true')
  document.head.appendChild(style)
}
