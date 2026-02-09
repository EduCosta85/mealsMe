export type Mesocycle = 1 | 2 | 3

export type TrainingDayId = 'upper-a' | 'lower-a' | 'upper-b' | 'lower-b' | 'liss' | 'rest'

export interface ExerciseSet {
  readonly sets: number
  readonly reps: string
  readonly load: string
  readonly rest: string
  readonly rir: string
}

export interface Exercise {
  readonly id: string
  readonly name: string
  readonly category: 'main' | 'accessory' | 'corrective'
  readonly muscles: string
  readonly sets: readonly ExerciseSet[]
  readonly cues: readonly string[]
  readonly safety?: string
  readonly isNew?: boolean
}

export interface WarmupItem {
  readonly id: string
  readonly phase: string
  readonly name: string
  readonly prescription: string
  readonly minutes: number
}

export interface CooldownItem {
  readonly id: string
  readonly name: string
  readonly prescription: string
}

export interface TrainingSession {
  readonly id: TrainingDayId
  readonly name: string
  readonly shortName: string
  readonly weekday: number
  readonly focus: string
  readonly duration: string
  readonly warmup: readonly WarmupItem[]
  readonly exercises: readonly Exercise[]
  readonly cooldown: readonly CooldownItem[]
  readonly extraWarmup?: string
}

export interface LissSession {
  readonly id: 'liss'
  readonly name: string
  readonly weekday: number
  readonly zone: string
  readonly bpmRange: string
  readonly duration: string
  readonly options: readonly string[]
}

export interface DailyCorrectiveItem {
  readonly id: string
  readonly name: string
  readonly frequency: string
  readonly when: string
}

export interface SetLog {
  readonly reps?: string
  readonly load?: string
}

export interface TrainingProgress {
  readonly date: string
  readonly mesocycle: Mesocycle
  readonly checkedWarmup: readonly string[]
  readonly checkedExercises: readonly string[]
  readonly checkedCooldown: readonly string[]
  readonly checkedCorrectivos: readonly string[]
  readonly lissCompleted: boolean
  readonly notes: string
  readonly setLogs: Record<string, SetLog>
  readonly startedAt: number | null
  readonly endedAt: number | null
  readonly isActive: boolean
}
