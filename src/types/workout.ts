export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type GoalType = 'HYPERTROPHY' | 'STRENGTH' | 'ENDURANCE' | 'WEIGHT_LOSS';
export type Methodology = 'WEIDER' | 'PUSH_PULL_LEGS' | 'UPPER_LOWER' | 'FULL_BODY' | 'HEAVY_DUTY' | 'CUSTOM';

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'LEGS_QUADRICEPS'
  | 'LEGS_HAMSTRINGS'
  | 'LEGS_CALVES'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'CORE'
  | 'FULL_BODY';

export type SetType = 'WARMUP' | 'NORMAL' | 'DROPSET' | 'MYO_REPS' | 'FAILURE';

export interface SetDraft {
  id: string;
  setNumber: number;
  setType: SetType;
  weightKg: number;
  reps: number;
  rir?: number;
  isCompleted: boolean;
  previousWeightKg?: number;
  previousReps?: number;
}

export interface ActiveExerciseSession {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  restTimeSec: number;
  notes?: string;
  sets: SetDraft[];
}

export interface ActiveWorkoutState {
  sessionId: string;
  routineId?: string;
  routineDayId?: string;
  sessionName: string;
  startedAt: number; // Unix epoch ms
  elapsedSeconds: number;
  isPaused: boolean;
  currentExerciseIndex: number;
  exercises: ActiveExerciseSession[];
  restTimer: {
    active: boolean;
    durationSec: number;
    remainingSec: number;
    timerEndTimestamp?: number;
  };
}
