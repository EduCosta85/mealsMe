import type { DailyProgress } from '../data/types'

interface ActivityTimelineProps {
  readonly progressData: DailyProgress[]
  readonly dateKeys: string[]
}

// Pure: format date to readable format
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.getDate()
  const month = date.toLocaleDateString('pt-BR', { month: 'short' })
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' })
  return `${weekday}, ${day} ${month}`
}

// Pure: count total activities for a day
function countActivities(progress: DailyProgress) {
  let completed = 0
  let skipped = 0
  let postponed = 0
  let missed = 0
  
  // Count meal activities
  if (progress.mealActivities) {
    Object.values(progress.mealActivities).forEach((activity) => {
      if (activity.status === 'completed') completed++
      if (activity.status === 'skipped') skipped++
      if (activity.status === 'postponed') postponed++
      if (activity.status === 'missed') missed++
    })
  }
  
  // Count supplement activities
  if (progress.supplementActivities) {
    Object.values(progress.supplementActivities).forEach((activity) => {
      if (activity.status === 'completed') completed++
      if (activity.status === 'skipped') skipped++
      if (activity.status === 'postponed') postponed++
      if (activity.status === 'missed') missed++
    })
  }
  
  // Count training activity
  if (progress.trainingActivity) {
    if (progress.trainingActivity.status === 'completed') completed++
    if (progress.trainingActivity.status === 'skipped') skipped++
    if (progress.trainingActivity.status === 'postponed') postponed++
    if (progress.trainingActivity.status === 'missed') missed++
  }
  
  return { completed, skipped, postponed, missed }
}

interface DayTimelineItemProps {
  readonly date: string
  readonly progress: DailyProgress
}

function DayTimelineItem({ date, progress }: DayTimelineItemProps) {
  const counts = countActivities(progress)
  const total = counts.completed + counts.skipped + counts.postponed + counts.missed
  const hasActivity = total > 0
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{formatDate(date)}</div>
          <div className="text-xs text-gray-500">{date}</div>
        </div>
        {!hasActivity && (
          <span className="text-xs text-gray-400">Sem atividades</span>
        )}
      </div>
      
      {hasActivity && (
        <div className="mt-3 flex flex-wrap gap-2">
          {counts.completed > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1">
              <span className="text-xs">✅</span>
              <span className="text-xs font-medium text-green-700">{counts.completed}</span>
            </div>
          )}
          {counts.skipped > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
              <span className="text-xs">⏭️</span>
              <span className="text-xs font-medium text-amber-700">{counts.skipped}</span>
            </div>
          )}
          {counts.postponed > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1">
              <span className="text-xs">⏰</span>
              <span className="text-xs font-medium text-blue-700">{counts.postponed}</span>
            </div>
          )}
          {counts.missed > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1">
              <span className="text-xs">❌</span>
              <span className="text-xs font-medium text-red-700">{counts.missed}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>🍽️</span>
          <span>{Object.keys(progress.checkedFoods).length}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💊</span>
          <span>{progress.checkedSupplements.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💧</span>
          <span>{(progress.waterMl / 1000).toFixed(1)}L</span>
        </div>
      </div>
    </div>
  )
}

export function ActivityTimeline({ progressData, dateKeys }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Linha do Tempo</h2>
      
      {dateKeys.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <span className="text-2xl">📅</span>
          <p className="mt-2 text-sm text-gray-500">Nenhum dado disponível</p>
        </div>
      )}
      
      <div className="space-y-3">
        {progressData.map((progress, idx) => (
          <DayTimelineItem
            key={dateKeys[idx]}
            date={dateKeys[idx]}
            progress={progress}
          />
        ))}
      </div>
    </div>
  )
}
