import type { AdherenceMetrics } from '../data/types'

interface AdherenceMetricsProps {
  readonly metrics: AdherenceMetrics
}

// Pure: calculate percentage
function calcPercent(completed: number, expected: number): number {
  return expected === 0 ? 0 : Math.round((completed / expected) * 100)
}

interface MetricCardProps {
  readonly icon: string
  readonly label: string
  readonly completed: number
  readonly expected: number
  readonly color: string
}

function MetricCard({ icon, label, completed, expected, color }: MetricCardProps) {
  const percent = calcPercent(completed, expected)
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-semibold text-gray-700">{label}</span>
      </div>
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900">{percent}%</div>
        <div className="text-xs text-gray-500">
          {completed} / {expected}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  )
}

export function AdherenceMetrics({ metrics }: AdherenceMetricsProps) {
  const waterPercent = calcPercent(metrics.water.actual, metrics.water.expected)
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Resumo de Aderência</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon="🍽️"
          label="Refeições"
          completed={metrics.meals.completed}
          expected={metrics.meals.expected}
          color="bg-orange-500"
        />
        
        <MetricCard
          icon="💊"
          label="Suplementos"
          completed={metrics.supplements.completed}
          expected={metrics.supplements.expected}
          color="bg-purple-500"
        />
        
        <MetricCard
          icon="💧"
          label="Água"
          completed={metrics.water.actual}
          expected={metrics.water.expected}
          color="bg-blue-500"
        />
        
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">🏋️</span>
            <span className="text-xs font-semibold text-gray-700">Treino</span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {metrics.training.completed ? '✓' : '—'}
            </div>
            <div className="text-xs text-gray-500">
              {metrics.training.completed ? 'Completo' : 'Pendente'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Detalhes</h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Refeições puladas:</span>
            <span className="font-medium text-amber-700">{metrics.meals.skipped}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Refeições adiadas:</span>
            <span className="font-medium text-blue-700">{metrics.meals.postponed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Refeições perdidas:</span>
            <span className="font-medium text-red-700">{metrics.meals.missed}</span>
          </div>
          
          <div className="my-2 border-t border-gray-200" />
          
          <div className="flex justify-between">
            <span className="text-gray-600">Suplementos pulados:</span>
            <span className="font-medium text-amber-700">{metrics.supplements.skipped}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Suplementos adiados:</span>
            <span className="font-medium text-blue-700">{metrics.supplements.postponed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Suplementos perdidos:</span>
            <span className="font-medium text-red-700">{metrics.supplements.missed}</span>
          </div>
          
          <div className="my-2 border-t border-gray-200" />
          
          <div className="flex justify-between">
            <span className="text-gray-600">Água (litros):</span>
            <span className="font-medium text-blue-700">
              {(metrics.water.actual / 1000).toFixed(1)}L / {(metrics.water.expected / 1000).toFixed(1)}L ({waterPercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
