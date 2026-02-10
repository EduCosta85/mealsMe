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
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Status Card */}
            <div className="rounded-xl bg-white p-3.5 shadow-lg">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 flex-shrink-0 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Agora:</span>
                    <span className="font-bold text-gray-900">{liters}L / {(targetMl / 1000).toFixed(1)}L</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-gray-600">Esperado:</span>
                    <span className="font-bold text-blue-600">{(expectedMl / 1000).toFixed(1)}L ({expectedPercent}%)</span>
                  </div>
                </div>
              </div>
              <div className={`mt-2.5 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-center text-xs font-bold ${
                isAhead ? 'bg-emerald-100 text-emerald-700' : 
                isBehind ? 'bg-rose-100 text-rose-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {isAhead && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                )}
                {isBehind && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                )}
                {!isAhead && !isBehind && percent < 100 && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l3 3 3-3M9 8l3 3 3-3" opacity="0.5"/>
                  </svg>
                )}
                {percent >= 100 && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
                <span>{getStatusText()}</span>
              </div>
            </div>
            
            {/* Quick Add Buttons */}
            <button
              onClick={() => {
                onAdd(200)
                setIsExpanded(false)
              }}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transition-all active:scale-95 hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="text-[10px] font-bold">200ml</span>
              </div>
            </button>
            <button
              onClick={() => {
                onAdd(300)
                setIsExpanded(false)
              }}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg transition-all active:scale-95 hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="text-[10px] font-bold">300ml</span>
              </div>
            </button>
            <button
              onClick={() => {
                onAdd(500)
                setIsExpanded(false)
              }}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 text-white shadow-lg transition-all active:scale-95 hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="text-[10px] font-bold">500ml</span>
              </div>
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
          <div className="flex flex-col items-center gap-0.5">
            {/* Water Droplet SVG Icon */}
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="white">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            <span className="text-[10px] font-bold leading-none text-white">
              {liters}L
            </span>
          </div>
          
          {/* Status Indicator */}
          {isAhead && (
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-md">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="white">
                <path d="M7 14l5-5 5 5z"/>
              </svg>
            </div>
          )}
          {isBehind && (
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 shadow-md">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="white">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          )}
        </button>
      </div>
    </>
  )
}
