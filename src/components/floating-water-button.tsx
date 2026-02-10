import { useState } from 'react'

interface FloatingWaterButtonProps {
  readonly currentMl: number
  readonly targetMl: number
  readonly onAdd: (ml: number) => void
}

// Pure: calcular quanto deveria ter tomado até agora (6h-22h = 16 horas)
function calculateExpectedMl(targetMl: number): number {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  const START_HOUR = 6
  const END_HOUR = 22
  const TOTAL_HOURS = END_HOUR - START_HOUR // 16 horas
  
  // Antes das 6h: 0%
  if (currentHour < START_HOUR) return 0
  
  // Depois das 22h: 100%
  if (currentHour >= END_HOUR) return targetMl
  
  // Entre 6h e 22h: calcular proporcionalmente
  const hoursElapsed = currentHour - START_HOUR
  const minutesElapsed = currentMinute
  const totalMinutesElapsed = hoursElapsed * 60 + minutesElapsed
  const totalMinutesInPeriod = TOTAL_HOURS * 60
  
  const expectedPercent = totalMinutesElapsed / totalMinutesInPeriod
  return Math.round(targetMl * expectedPercent)
}

export function FloatingWaterButton({ currentMl, targetMl, onAdd }: FloatingWaterButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100))
  const liters = (currentMl / 1000).toFixed(1)
  
  const expectedMl = calculateExpectedMl(targetMl)
  const expectedPercent = Math.round((expectedMl / targetMl) * 100)
  const difference = currentMl - expectedMl
  const isAhead = difference > 300 // Mais de 300ml adiantado
  const isBehind = difference < -300 // Mais de 300ml atrasado
  
  const getColor = () => {
    if (percent >= 100) return 'from-green-500 to-emerald-600'
    if (isAhead) return 'from-emerald-500 to-green-600'
    if (isBehind) return 'from-orange-500 to-red-500'
    if (percent >= 70) return 'from-blue-500 to-blue-600'
    if (percent >= 40) return 'from-sky-500 to-blue-500'
    return 'from-amber-500 to-orange-500'
  }
  
  const getStatusText = () => {
    if (percent >= 100) return 'Meta completa! 🎉'
    if (isAhead) return `Adiantado ${(Math.abs(difference) / 1000).toFixed(1)}L`
    if (isBehind) return `Atrasado ${(Math.abs(difference) / 1000).toFixed(1)}L`
    return 'No ritmo!'
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
            {/* Status Card */}
            <div className="rounded-xl bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Agora:</span>
                <span className="font-bold text-gray-900">{liters}L / {(targetMl / 1000).toFixed(1)}L</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-gray-600">Esperado:</span>
                <span className="font-bold text-blue-600">{(expectedMl / 1000).toFixed(1)}L ({expectedPercent}%)</span>
              </div>
              <div className="mt-2 rounded-lg bg-gray-100 px-2 py-1 text-center text-[10px] font-bold">
                {getStatusText()}
              </div>
            </div>
            
            {/* Quick Add Buttons */}
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
          {/* Progress Rings */}
          <svg className="absolute inset-0 h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="4"
            />
            {/* Expected progress (thinner, dashed) */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="white"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeDasharray={`${(expectedPercent / 100) * 175.93} 175.93`}
              className="transition-all duration-300"
            />
            {/* Actual progress (thicker, solid) */}
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
          
          {/* Status Indicator */}
          {isAhead && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px]">
              ⬆️
            </div>
          )}
          {isBehind && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px]">
              ⬇️
            </div>
          )}
        </button>
      </div>
    </>
  )
}
