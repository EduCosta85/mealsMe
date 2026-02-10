import { useMemo, useState } from 'react'
import { useMesocycle, useTrainingTracker } from '../hooks/use-training-tracker'
import { useDailyTracker } from '../hooks/use-daily-tracker'
import { MesocycleSelector } from '../components/mesocycle-selector'
import { WarmupSection } from '../components/warmup-section'
import { ExerciseCard } from '../components/exercise-card'
import { CooldownSection } from '../components/cooldown-section'
import { CorrectivesSection } from '../components/correctives-section'
import { LissCard } from '../components/liss-card'
import { SessionTimer } from '../components/session-timer'
import type { ActivityStatus } from '../data/types'
import {
  getTodaySessionId,
  isLissDay,
  isRestDay,
  getTrainingSession,
  LISS_SESSIONS,
  DAILY_CORRECTIVES,
} from '../data/training-plan'
import type { TrainingSession, TrainingProgress, TrainingDayId } from '../data/training-types'

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']

function formatToday(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('pt-BR', { month: 'short' })
  return `${WEEKDAY_NAMES[date.getDay()]}, ${day} ${month}`
}

// Pure: compute overall progress percentage
function computePercent(
  session: TrainingSession | null,
  isLiss: boolean,
  progress: TrainingProgress,
): number {
  const correctivesTotal = DAILY_CORRECTIVES.length
  const correctivesChecked = progress.checkedCorrectivos.length

  if (session) {
    const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets[0].sets, 0)
    const total = session.warmup.length + totalSets + session.cooldown.length + correctivesTotal
    const checked =
      progress.checkedWarmup.length +
      progress.checkedExercises.length +
      progress.checkedCooldown.length +
      correctivesChecked
    return total > 0 ? Math.round((checked / total) * 100) : 0
  }

  if (isLiss) {
    const total = 1 + correctivesTotal
    const checked = (progress.lissCompleted ? 1 : 0) + correctivesChecked
    return Math.round((checked / total) * 100)
  }

  return correctivesTotal > 0
    ? Math.round((correctivesChecked / correctivesTotal) * 100)
    : 0
}

// Pure: parse rest string like "90s" → 90
function parseRestSeconds(rest: string): number {
  const match = rest.match(/\d+/)
  return match ? parseInt(match[0], 10) : 60
}

// Pure: estimate total session duration in minutes
function computeExpectedMinutes(session: TrainingSession): number {
  const warmup = session.warmup.reduce((sum, w) => sum + w.minutes, 0)
  const exercises = session.exercises.reduce((sum, ex) => {
    const sets = ex.sets[0].sets
    const rest = parseRestSeconds(ex.sets[0].rest)
    return sum + (sets * (40 + rest)) / 60
  }, 0)
  const cooldown = 5
  return Math.round(warmup + exercises + cooldown)
}

interface TrainingActivityCardProps {
  readonly activityState: import('../data/types').ActivityState | undefined
  readonly onSetActivity: (status: ActivityStatus) => void
}

function TrainingActivityCard({ activityState, onSetActivity }: TrainingActivityCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-on-surface">Status do Treino</h3>

      {/* Activity Status Display */}
      {activityState && activityState.status !== 'pending' && (
        <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2 text-xs">
            {activityState.status === 'completed' && (
              <>
                <span className="text-green-600">✅</span>
                <span className="font-medium text-green-700">Feito</span>
              </>
            )}
            {activityState.status === 'skipped' && (
              <>
                <span className="text-amber-600">⏭️</span>
                <span className="font-medium text-amber-700">Pulado</span>
              </>
            )}
            {activityState.status === 'postponed' && (
              <>
                <span className="text-blue-600">⏰</span>
                <span className="font-medium text-blue-700">Adiado</span>
              </>
            )}
            {activityState.status === 'missed' && (
              <>
                <span className="text-red-600">❌</span>
                <span className="font-medium text-red-700">Perdido</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Activity Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onSetActivity('completed')}
          className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
            activityState?.status === 'completed'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
          }`}
        >
          <span className="mr-1">✓</span>
          Feito
        </button>
        <button
          onClick={() => onSetActivity('skipped')}
          className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
            activityState?.status === 'skipped'
              ? 'border-amber-500 bg-amber-50 text-amber-700'
              : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
          }`}
        >
          <span className="mr-1">⏭</span>
          Pular
        </button>
        <button
          onClick={() => onSetActivity('postponed')}
          className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
            activityState?.status === 'postponed'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
          }`}
        >
          <span className="mr-1">⏰</span>
          Adiar
        </button>
      </div>
    </div>
  )
}

export function TrainingPage() {
  const today = useMemo(() => new Date(), [])
  const { mesocycle, changeMesocycle } = useMesocycle()
  const tracker = useTrainingTracker()
  const dailyTracker = useDailyTracker()
  
  // Estado para controlar qual treino está sendo visualizado
  const [selectedSessionId, setSelectedSessionId] = useState<TrainingDayId | null>(null)

  const sessionId = getTodaySessionId(today)
  const lissDay = isLissDay(today)
  const restDay = isRestDay(today)

  // Mostrar o treino selecionado, ou o do dia se nenhum estiver selecionado
  const displaySessionId = selectedSessionId || sessionId
  const session = displaySessionId ? getTrainingSession(displaySessionId, mesocycle) : null
  
  const lissSession = lissDay
    ? LISS_SESSIONS.find((s) => s.weekday === today.getDay()) ?? LISS_SESSIONS[0]
    : null

  const percent = useMemo(
    () => computePercent(session, lissDay, tracker.progress),
    [session, lissDay, tracker.progress],
  )

  const expectedMinutes = useMemo(
    () => (session ? computeExpectedMinutes(session) : 0),
    [session],
  )

  // Define todos os treinos disponíveis
  const allWorkouts: Array<{ id: TrainingDayId; name: string; short: string }> = [
    { id: 'upper-a', name: 'Upper A', short: 'Upper A' },
    { id: 'lower-a', name: 'Lower A', short: 'Lower A' },
    { id: 'upper-b', name: 'Upper B', short: 'Upper B' },
    { id: 'lower-b', name: 'Lower B', short: 'Lower B' },
  ]

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center">
        <h1 className="text-lg font-bold text-on-surface">Treino</h1>
        <p className="text-xs text-on-surface-muted">{formatToday(today)}</p>
      </div>

      {/* Tabs de Treinos - Navegação Horizontal */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {allWorkouts.map((workout) => {
            const isActive = displaySessionId === workout.id
            const isToday = sessionId === workout.id
            
            return (
              <button
                key={workout.id}
                onClick={() => setSelectedSessionId(workout.id)}
                className={`relative flex-shrink-0 rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
                }`}
              >
                {workout.name}
                {isToday && (
                  <span className={`ml-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                  }`}>
                    HOJE
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info do Treino Selecionado */}
      {session && (
        <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-bold text-orange-900">{session.name}</div>
              <div className="mt-0.5 text-xs text-orange-700">{session.focus}</div>
            </div>
            <div className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">
              {session.duration}
            </div>
          </div>
        </div>
      )}

      {/* Aviso de Dia de Descanso */}
      {restDay && !selectedSessionId && !session && (
        <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-4 text-center">
          <div className="text-3xl">😴</div>
          <div className="mt-2 text-sm font-bold text-purple-900">Dia de Descanso</div>
          <div className="mt-1 text-xs text-purple-700">Recuperação ativa • Faça os corretivos abaixo</div>
        </div>
      )}

      <MesocycleSelector current={mesocycle} onChange={changeMesocycle} />

      {/* Timer só aparece para o treino DO DIA */}
      {session && displaySessionId === sessionId && (
        <>
          <SessionTimer
            startedAt={tracker.progress.startedAt}
            endedAt={tracker.progress.endedAt}
            isActive={tracker.progress.isActive}
            expectedMinutes={expectedMinutes}
            completionPercent={percent}
            onStart={tracker.startSession}
            onEnd={tracker.endSession}
          />
          
          {/* Training Activity Status - shown after session ends */}
          {tracker.progress.endedAt && (
            <TrainingActivityCard
              activityState={dailyTracker.getTrainingActivity()}
              onSetActivity={(status: ActivityStatus) => dailyTracker.setTrainingActivity(status)}
            />
          )}
        </>
      )}

      {/* Aviso quando está vendo treino diferente do dia */}
      {session && displaySessionId !== sessionId && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
          <div className="text-xs text-blue-700">
            ℹ️ Você está visualizando <span className="font-bold">{session.name}</span>
            {sessionId && (
              <>
                {' • '}
                <button
                  onClick={() => setSelectedSessionId(null)}
                  className="font-bold underline"
                >
                  Ver treino de hoje
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!session && <ProgressBar percent={percent} />}

      {session && <TrainingDayContent session={session} tracker={tracker} />}

      {lissSession && !session && (
        <LissCard
          session={lissSession}
          isCompleted={tracker.progress.lissCompleted}
          onToggle={tracker.toggleLiss}
        />
      )}

      <CorrectivesSection
        isChecked={tracker.isCorrectiveChecked}
        onToggle={tracker.toggleCorrective}
      />
    </div>
  )
}

function ProgressBar({ percent }: { readonly percent: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-on-surface">Progresso</span>
        <span className="font-semibold text-orange-600">{percent}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function TrainingDayContent({
  session,
  tracker,
}: {
  readonly session: TrainingSession
  readonly tracker: ReturnType<typeof useTrainingTracker>
}) {
  return (
    <>
      <WarmupSection
        items={session.warmup}
        isChecked={tracker.isWarmupChecked}
        onToggle={tracker.toggleWarmup}
        extraWarmup={session.extraWarmup}
      />
      <div className="space-y-3">
        {session.exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            index={i}
            isSetChecked={tracker.isExerciseChecked}
            onToggleSet={tracker.toggleExercise}
            getSetLog={tracker.getSetLog}
            onSaveSetLog={tracker.setSetLog}
          />
        ))}
      </div>
      <CooldownSection
        items={session.cooldown}
        isChecked={tracker.isCooldownChecked}
        onToggle={tracker.toggleCooldown}
      />
    </>
  )
}
