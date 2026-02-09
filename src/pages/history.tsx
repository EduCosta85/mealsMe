import { useState } from 'react'
import { useActivityHistory } from '../hooks/use-activity-history'
import { AdherenceMetrics } from '../components/adherence-metrics'
import { ActivityTimeline } from '../components/activity-timeline'

type Period = 7 | 14 | 30

export function HistoryPage() {
  const [period, setPeriod] = useState<Period>(7)
  const { dateKeys, progressData, metrics } = useActivityHistory(period)

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center">
        <h1 className="text-lg font-bold text-on-surface">Histórico</h1>
        <p className="text-xs text-on-surface-muted">Acompanhe sua aderência ao plano</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod(7)}
          className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${
            period === 7
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
          }`}
        >
          7 dias
        </button>
        <button
          onClick={() => setPeriod(14)}
          className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${
            period === 14
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
          }`}
        >
          14 dias
        </button>
        <button
          onClick={() => setPeriod(30)}
          className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${
            period === 30
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
          }`}
        >
          30 dias
        </button>
      </div>

      {/* Adherence Metrics */}
      <section>
        <AdherenceMetrics metrics={metrics} />
      </section>

      {/* Activity Timeline */}
      <section>
        <ActivityTimeline progressData={progressData} dateKeys={dateKeys} />
      </section>
    </div>
  )
}
