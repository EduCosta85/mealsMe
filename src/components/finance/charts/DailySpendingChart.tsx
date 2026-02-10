import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DailyData {
  readonly date: string // "2026-02-10"
  readonly amount: number
  readonly formattedDate: string // "10/02" for display
}

interface DailySpendingChartProps {
  readonly data: readonly DailyData[]
  readonly height?: number
  readonly className?: string
}

/**
 * Daily spending line chart showing expense trends over time
 *
 * Features:
 * - Responsive design (375px+ mobile support)
 * - Brazilian Real (R$) currency formatting
 * - Touch-friendly mobile interactions
 * - Smooth line curve with data point dots
 * - Empty state handling
 * - Color-coded spending line
 * - Accessible with ARIA labels
 *
 * @example
 * ```tsx
 * const dailyData = [
 *   { date: '2026-02-01', amount: 150.50, formattedDate: '01/02' },
 *   { date: '2026-02-02', amount: 200.00, formattedDate: '02/02' },
 * ]
 * <DailySpendingChart data={dailyData} height={400} />
 * ```
 */
export default function DailySpendingChart({
  data,
  height = 300,
  className = '',
}: DailySpendingChartProps) {
  // Empty state handling
  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
        role="status"
        aria-label="Nenhum dado de gastos disponível"
      >
        <div className="text-center">
          <p className="text-gray-500 text-base">📊</p>
          <p className="text-gray-500 text-sm mt-2">Nenhum dado disponível</p>
          <p className="text-gray-400 text-xs mt-1">
            Adicione despesas para ver o gráfico
          </p>
        </div>
      </div>
    )
  }

  // Sort data by date to ensure chronological order
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date))

  // Format currency in Brazilian Real
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Format currency for Y-axis (compact version)
  const formatYAxisCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className={className} role="region" aria-label="Gráfico de gastos diários">
      <ResponsiveContainer width="100%" height={height} minWidth={375}>
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          accessibilityLayer={true}
        >
          {/* Background grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X-axis: dates */}
          <XAxis
            dataKey="formattedDate"
            stroke="#6b7280"
            style={{
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
            tick={{ fill: '#6b7280' }}
          />

          {/* Y-axis: amounts in R$ */}
          <YAxis
            tickFormatter={formatYAxisCurrency}
            stroke="#6b7280"
            style={{
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
            tick={{ fill: '#6b7280' }}
          />

          {/* Tooltip with currency formatting */}
          <Tooltip
            formatter={(value: number | undefined) => 
              value !== undefined ? [formatCurrency(value), 'Gasto'] : ['', '']
            }
            labelFormatter={(label: unknown) => `Data: ${String(label)}`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{
              color: '#f97316',
              fontSize: '14px',
              fontWeight: '600',
            }}
            labelStyle={{
              color: '#374151',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
            }}
            cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '5 5' }}
          />

          {/* Line with dots */}
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#f97316"
            strokeWidth={2}
            dot={{
              fill: '#f97316',
              strokeWidth: 2,
              r: 4,
              stroke: '#fff',
            }}
            activeDot={{
              r: 6,
              fill: '#f97316',
              stroke: '#fff',
              strokeWidth: 2,
            }}
            name="Gasto Diário"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
