// Category Distribution Pie Chart Component
// Following patterns from react-patterns.md and ui-styling-standards.md

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/**
 * Category data structure for pie chart
 * Includes visual properties (icon, color) and numeric data
 */
interface CategoryData {
  id: string
  name: string
  icon: string
  color: string
  value: number
  percentage: number
}

/**
 * Props for CategoryPieChart component
 */
interface CategoryPieChartProps {
  data: readonly CategoryData[]
  height?: number
  className?: string
}

/**
 * Props for custom label rendering on pie slices
 * Provided by Recharts Pie component
 */
interface CustomLabelProps {
  cx: number
  cy: number
  midAngle?: number
  innerRadius: number
  outerRadius: number
  percent?: number
  index: number
}

/**
 * Render custom percentage labels on pie slices
 * Only shows labels for slices >= 5% to avoid overlap
 * 
 * @param props - Label positioning and data from Recharts
 * @returns SVG text element with percentage or null for small slices
 */
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: CustomLabelProps) => {
  // Guard against undefined values
  if (percent === undefined || midAngle === undefined) return null
  
  // Hide labels for small slices to prevent overlap
  if (percent < 0.05) return null

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/**
 * Custom tooltip component with currency formatting
 * Shows category name, formatted amount in R$, and percentage
 * 
 * @param props - Tooltip props from Recharts
 * @returns Styled tooltip or null if inactive
 */
const CustomTooltip = ({
  active,
  payload,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0]
  
  // Format value as Brazilian Real (R$)
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(data.value as number)

  // Get percentage from payload data
  const percentage = data.payload.percentage

  return (
    <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-800">
        {data.payload.icon} {data.name}
      </p>
      <p className="text-blue-600 font-medium">{formattedValue}</p>
      <p className="text-gray-500 text-sm">{percentage.toFixed(1)}% do total</p>
    </div>
  )
}

/**
 * Category Distribution Pie Chart Component
 * 
 * Displays expense distribution by category using a pie chart with:
 * - Custom colors from category data
 * - Percentage labels on slices (>= 5%)
 * - Currency-formatted tooltips (R$)
 * - Responsive design (mobile-friendly)
 * - Empty state handling
 * 
 * @param props - Component props
 * @returns Pie chart component or empty state message
 * 
 * @example
 * ```tsx
 * const chartData = categories.map(cat => ({
 *   id: cat.id,
 *   name: cat.name,
 *   icon: cat.icon,
 *   color: cat.color,
 *   value: aggregated.get(cat.id) || 0,
 *   percentage: (aggregated.get(cat.id) || 0) / total * 100
 * }))
 * 
 * <CategoryPieChart data={chartData} height={400} />
 * ```
 */
export default function CategoryPieChart({
  data,
  height = 300,
  className = '',
}: CategoryPieChartProps) {
  // Check if data is valid (not empty and has non-zero values)
  const hasData = data.length > 0 && data.some((item) => item.value > 0)

  // Empty state - show user-friendly message
  if (!hasData) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
          <p className="mt-2 text-gray-500 text-lg font-medium">
            Nenhum dado disponível
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Adicione despesas para ver a distribuição
          </p>
        </div>
      </div>
    )
  }

  // Transform data for Recharts - include icon in name for legend
  const chartData = data.map((cat) => ({
    name: `${cat.icon} ${cat.name}`,
    value: cat.value,
    color: cat.color,
    percentage: cat.percentage,
    icon: cat.icon,
  }))

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius="80%"
            dataKey="value"
            nameKey="name"
            isAnimationActive={true}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
