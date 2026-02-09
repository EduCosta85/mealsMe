interface ProgressRingProps {
  readonly percent: number
  readonly size?: number
  readonly strokeWidth?: number
  readonly label?: string
}

export function ProgressRing({
  percent,
  size = 48,
  strokeWidth = 4,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference

  const color =
    percent >= 100
      ? 'text-primary-500'
      : percent >= 50
        ? 'text-primary-400'
        : 'text-gray-300'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-500 ${color}`}
        />
      </svg>
      {label && (
        <span className="absolute text-[10px] font-semibold text-on-surface-muted">
          {label}
        </span>
      )}
    </div>
  )
}
