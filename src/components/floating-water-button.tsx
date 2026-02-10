import { useState } from 'react'

interface FloatingWaterButtonProps {
  readonly currentMl: number
  readonly targetMl: number
  readonly onAdd: (ml: number) => void
}

export function FloatingWaterButton({ currentMl, targetMl, onAdd }: FloatingWaterButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100))
  const liters = (currentMl / 1000).toFixed(1)
  
  const getColor = () => {
    if (percent >= 100) return 'from-green-500 to-emerald-600'
    if (percent >= 70) return 'from-blue-500 to-blue-600'
    if (percent >= 40) return 'from-sky-500 to-blue-500'
    return 'from-amber-500 to-orange-500'
  }

  return (
    <>
      {/* Overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating Button */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        {/* Quick Actions - shown when expanded */}
        {isExpanded && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => {
                onAdd(200)
                setIsExpanded(false)
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg active:scale-95"
            >
              <span className="text-xs font-bold">+200</span>
            </button>
            <button
              onClick={() => {
                onAdd(300)
                setIsExpanded(false)
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg active:scale-95"
            >
              <span className="text-xs font-bold">+300</span>
            </button>
            <button
              onClick={() => {
                onAdd(500)
                setIsExpanded(false)
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg active:scale-95"
            >
              <span className="text-xs font-bold">+500</span>
            </button>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-xl transition-transform active:scale-95 ${getColor()}`}
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="4"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${(percent / 100) * 175.93} 175.93`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          
          {/* Icon and Text */}
          <div className="flex flex-col items-center">
            <span className="text-xl">💧</span>
            <span className="text-[9px] font-bold leading-none text-white">
              {liters}L
            </span>
          </div>
        </button>
      </div>
    </>
  )
}
