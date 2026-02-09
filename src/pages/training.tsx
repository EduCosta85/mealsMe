import { useMemo } from 'react'
import { useMesocycle, useTrainingTracker } from '../hooks/use-training-tracker'
import { MesocycleSelector } from '../components/mesocycle-selector'
import { WarmupSection } from '../components/warmup-section'
import { ExerciseCard } from '../components/exercise-card'
import { CooldownSection } from '../components/cooldown-section'
import { CorrectivesSection } from '../components/correctives-section'
import { LissCard } from '../components/liss-card'
import { SessionTimer } from '../components/session-timer'
import {
  getTodaySessionId,
  isLissDay,
  isRestDay,
  getTrainingSession,
  LISS_SESSIONS,
  DAILY_CORRECTIVES,
} from '../data/training-plan'
import type { TrainingSession, TrainingProgress } from '../data/training-types'

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

function SessionHeader({ session }: { readonly session: Pick<TrainingSession, 'name' | 'focus' | 'duration'> }) {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🏋️</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-orange-800">{session.name}</h2>
          <p className="truncate text-[10px] text-orange-600">{session.focus}</p>
        </div>
        <span className="shrink-0 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
          {session.duration}
        </span>
      </div>
    </div>
  )
}

export function TrainingPage() {
  const today = useMemo(() => new Date(), [])
  const { mesocycle, changeMesocycle } = useMesocycle()
  const tracker = useTrainingTracker()

  const sessionId = getTodaySessionId(today)
  const lissDay = isLissDay(today)
  const restDay = isRestDay(today)

  const session = sessionId ? getTrainingSession(sessionId, mesocycle) : null
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

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-4">
      <div className="text-center">
        <h1 className="text-lg font-bold text-on-surface">Treino</h1>
        <p className="text-xs text-on-surface-muted">{formatToday(today)}</p>
      </div>

      <MesocycleSelector current={mesocycle} onChange={changeMesocycle} />

      {session && (
        <SessionTimer
          startedAt={tracker.progress.startedAt}
          expectedMinutes={expectedMinutes}
          completionPercent={percent}
        />
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

      {restDay && <RestDayCard />}

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
      <SessionHeader session={session} />
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
            customLoad={tracker.getCustomLoad(ex.id)}
            onSetLoad={(load) => tracker.setCustomLoad(ex.id, load)}
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

function RestDayCard() {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-center">
      <span className="text-2xl">😴</span>
      <h3 className="mt-2 text-sm font-semibold text-purple-800">Dia de Descanso</h3>
      <p className="mt-1 text-xs text-purple-600">
        Recuperacao ativa. Faca os corretivos abaixo.
      </p>
    </div>
  )
}
