// Budget vs Actual Bar Chart Component
// Following patterns from react-patterns.md and ui-styling-standards.md

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from 'recharts'

// Pure function for color determination based on percentage thresholds
// Following code-quality.md: pure functions, explicit logic
const getBarColor = (percentage: number): string => {
  if (percentage < 80) return '#22c55e' // green - under budget
  if (percentage <= 100) return '#eab308' // yellow - near budget
  return '#ef4444' // red - over budget
}

// Pure function for currency formatting
// Immutable, no side effects
const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2)}`
}

// TypeScript interfaces following clean-code.md naming conventions
interface TooltipPayload {
  readonly name: string
  readonly Orçamento: number
  readonly Gasto: number
  readonly percentage: number
}

interface CustomTooltipProps {
  readonly active?: boolean
  readonly payload?: readonly { payload: TooltipPayload }[]
}

// Custom tooltip component for better UX
// Following ui-styling-standards.md: WCAG AA compliance
// Declared outside render to avoid recreation on each render
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const percentage = data.percentage

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
      <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
      <div className="space-y-1">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Orçamento:</span>{' '}
          {formatCurrency(data.Orçamento)}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Gasto:</span>{' '}
          {formatCurrency(data.Gasto)}
        </p>
        <p className="text-sm font-medium" style={{ color: getBarColor(percentage) }}>
          {percentage.toFixed(1)}% utilizado
        </p>
      </div>
    </div>
  )
}

// TypeScript interfaces following clean-code.md naming conventions
interface CategoryData {
  id: string
  name: string
  icon: string
  color: string
  budget: number
  spent: number
  percentage: number
}

interface BudgetVsActualChartProps {
  data: readonly CategoryData[]
  height?: number
  className?: string
}

// Functional component following react-patterns.md
// Small, focused, single responsibility
export default function BudgetVsActualChart({
  data,
  height = 300,
  className = '',
}: BudgetVsActualChartProps) {
  // Empty state handling - following acceptance criteria
  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    )
  }

  // Pure data transformation - immutable pattern
  // Following code-quality.md: create new data, don't modify
  const chartData = data.map((cat) => ({
    name: `${cat.icon} ${cat.name}`,
    Orçamento: cat.budget,
    Gasto: cat.spent,
    percentage: cat.percentage,
  }))



  return (
    <div className={className}>
      {/* ResponsiveContainer for mobile-first responsive design */}
      {/* Following ui-styling-standards.md: test at 375px minimum */}
      <ResponsiveContainer width="100%" height={height} minWidth={375}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {/* CartesianGrid for visual structure */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          {/* XAxis with category names */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          
          {/* YAxis with currency formatting */}
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `R$ ${value}`}
          />
          
          {/* Custom tooltip for better UX */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* Legend for clarity */}
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="rect"
          />
          
          {/* Budget bar - gray color for neutral baseline */}
          <Bar
            dataKey="Orçamento"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            name="Orçamento"
          />
          
          {/* Actual spending bar with dynamic color coding */}
          {/* Using shape prop (NOT deprecated Cell) per Recharts v3.7.0 docs */}
          <Bar
            dataKey="Gasto"
            name="Gasto"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shape={(props: any) => {
              const { x, y, width, height, payload } = props
              const fill = getBarColor(payload.percentage)
              
              return (
                <Rectangle
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={fill}
                  radius={[4, 4, 0, 0]}
                />
              )
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
