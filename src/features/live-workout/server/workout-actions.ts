'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/current-user';
import { revalidatePath } from 'next/cache';
import type { ActiveWorkoutState, ActiveExerciseSession, SetDraft, SetType } from '@/types/workout';

export interface SaveWorkoutInput {
  sessionId: string;
  routineId?: string;
  sessionName: string;
  startedAt: number; // Unix ms
  endedAt: number; // Unix ms
  durationSec: number;
  notes?: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      setNumber: number;
      setType: SetType;
      weightKg: number;
      reps: number;
      rir?: number;
      isCompleted: boolean;
    }[];
  }[];
}

export interface PRNotification {
  exerciseName: string;
  previous1RM: number;
  new1RM: number;
  weightKg: number;
  reps: number;
}

export async function getActiveWorkoutData({
  routineId,
  dayId,
}: {
  routineId?: string;
  dayId?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado.' };
    }

    // Freestyle / Quick Start Workout
    if (!routineId || !dayId) {
      const state: ActiveWorkoutState = {
        sessionId: `session_${Date.now()}`,
        sessionName: 'Entrenamiento Libre',
        startedAt: Date.now(),
        elapsedSeconds: 0,
        isPaused: false,
        currentExerciseIndex: 0,
        exercises: [],
        restTimer: {
          active: false,
          durationSec: 90,
          remainingSec: 90,
        },
      };
      return { success: true, data: state };
    }

    // Routine-based Workout
    const day = await prisma.routineDay.findFirst({
      where: {
        id: dayId,
        routine: {
          id: routineId,
          userId: user.id,
        },
      },
      include: {
        routine: true,
        exercises: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!day) {
      return { success: false, error: 'No se encontró la rutina o el día seleccionado.' };
    }

    // Fetch previous sets for each exercise to show progressive overload baseline
    const exerciseSessions: ActiveExerciseSession[] = await Promise.all(
      day.exercises.map(async (item) => {
        const lastSets = await prisma.setLog.findMany({
          where: {
            exerciseId: item.exerciseId,
            workoutSession: {
              userId: user.id,
            },
            isCompleted: true,
          },
          orderBy: { createdAt: 'desc' },
          take: item.targetSets,
        });

        // Map previous performance
        const sets: SetDraft[] = Array.from({ length: item.targetSets }).map((_, idx) => {
          const prevSet = lastSets[lastSets.length - 1 - idx] || lastSets[0];
          return {
            id: `set_${item.exerciseId}_${idx + 1}_${Date.now()}`,
            setNumber: idx + 1,
            setType: 'NORMAL',
            weightKg: prevSet ? prevSet.weightKg : 0,
            reps: prevSet ? prevSet.reps : item.targetRepsMin,
            rir: item.targetRir ?? undefined,
            isCompleted: false,
            previousWeightKg: prevSet?.weightKg,
            previousReps: prevSet?.reps,
          };
        });

        return {
          exerciseId: item.exerciseId,
          exerciseName: item.exercise.name,
          targetMuscle: item.exercise.targetMuscle,
          restTimeSec: item.restTimeSec,
          notes: item.notes ?? undefined,
          sets,
        };
      })
    );

    const activeState: ActiveWorkoutState = {
      sessionId: `session_${Date.now()}`,
      routineId: day.routineId,
      routineDayId: day.id,
      sessionName: `${day.routine.name} — ${day.name}`,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      isPaused: false,
      currentExerciseIndex: 0,
      exercises: exerciseSessions,
      restTimer: {
        active: false,
        durationSec: day.exercises[0]?.restTimeSec ?? 90,
        remainingSec: day.exercises[0]?.restTimeSec ?? 90,
      },
    };

    return { success: true, data: activeState };
  } catch (error) {
    console.error('Error loading active workout data:', error);
    return { success: false, error: 'Error al preparar la sesión de entrenamiento.' };
  }
}

export async function saveCompletedWorkout(payload: SaveWorkoutInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado.' };
    }

    // Flatten all completed sets to calculate total mechanical volume
    let totalVolumeKg = 0;
    const completedSetLogs: Array<{
      exerciseId: string;
      setNumber: number;
      setType: SetType;
      weightKg: number;
      reps: number;
      rir?: number;
      isCompleted: boolean;
    }> = [];

    for (const ex of payload.exercises) {
      for (const s of ex.sets) {
        if (s.isCompleted) {
          totalVolumeKg += s.weightKg * s.reps;
          completedSetLogs.push({
            exerciseId: ex.exerciseId,
            setNumber: s.setNumber,
            setType: s.setType,
            weightKg: s.weightKg,
            reps: s.reps,
            rir: s.rir,
            isCompleted: true,
          });
        }
      }
    }

    // Create WorkoutSession in DB
    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        routineId: payload.routineId ?? null,
        name: payload.sessionName,
        startedAt: new Date(payload.startedAt),
        endedAt: new Date(payload.endedAt),
        durationSec: payload.durationSec,
        totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
        notes: payload.notes ?? null,
        sets: {
          create: completedSetLogs.map((s) => ({
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            setType: s.setType,
            weightKg: s.weightKg,
            reps: s.reps,
            rir: s.rir ?? null,
            isCompleted: true,
          })),
        },
      },
    });

    // Check & calculate new PRs (Personal Records) using Epley Formula: 1RM = Weight * (1 + Reps / 30)
    const newPrs: PRNotification[] = [];

    for (const ex of payload.exercises) {
      const validSets = ex.sets.filter((s) => s.isCompleted && s.weightKg > 0 && s.reps > 0);
      if (validSets.length === 0) continue;

      let best1RMInSession = 0;
      let bestWeightInSession = 0;
      let bestVolumeSetInSession = 0;
      let bestSet = validSets[0];

      for (const s of validSets) {
        const est1RM = s.weightKg * (1 + s.reps / 30);
        const volumeSet = s.weightKg * s.reps;

        if (est1RM > best1RMInSession) {
          best1RMInSession = est1RM;
          bestSet = s;
        }
        if (s.weightKg > bestWeightInSession) {
          bestWeightInSession = s.weightKg;
        }
        if (volumeSet > bestVolumeSetInSession) {
          bestVolumeSetInSession = volumeSet;
        }
      }

      const currentPR = await prisma.personalRecord.findUnique({
        where: {
          userId_exerciseId: {
            userId: user.id,
            exerciseId: ex.exerciseId,
          },
        },
      });

      if (!currentPR) {
        await prisma.personalRecord.create({
          data: {
            userId: user.id,
            exerciseId: ex.exerciseId,
            oneRepMaxEst: Math.round(best1RMInSession * 10) / 10,
            maxWeightKg: bestWeightInSession,
            maxVolumeSet: bestVolumeSetInSession,
          },
        });

        newPrs.push({
          exerciseName: ex.exerciseName,
          previous1RM: 0,
          new1RM: Math.round(best1RMInSession * 10) / 10,
          weightKg: bestSet.weightKg,
          reps: bestSet.reps,
        });
      } else if (best1RMInSession > currentPR.oneRepMaxEst || bestWeightInSession > currentPR.maxWeightKg) {
        const prev1RM = currentPR.oneRepMaxEst;
        await prisma.personalRecord.update({
          where: { id: currentPR.id },
          data: {
            oneRepMaxEst: Math.max(currentPR.oneRepMaxEst, Math.round(best1RMInSession * 10) / 10),
            maxWeightKg: Math.max(currentPR.maxWeightKg, bestWeightInSession),
            maxVolumeSet: Math.max(currentPR.maxVolumeSet, bestVolumeSetInSession),
            achievedAt: new Date(),
          },
        });

        if (best1RMInSession > currentPR.oneRepMaxEst) {
          newPrs.push({
            exerciseName: ex.exerciseName,
            previous1RM: prev1RM,
            new1RM: Math.round(best1RMInSession * 10) / 10,
            weightKg: bestSet.weightKg,
            reps: bestSet.reps,
          });
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/profile');
    revalidatePath('/stats');

    return {
      success: true,
      sessionId: session.id,
      newPrs,
    };
  } catch (error) {
    console.error('Error saving completed workout:', error);
    return { success: false, error: 'Error al registrar el entrenamiento en la base de datos.' };
  }
}

export async function getWorkoutSummary(sessionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado.' };
    }

    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
      include: {
        routine: true,
        sets: {
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!session) {
      return { success: false, error: 'Sesión de entrenamiento no encontrada.' };
    }

    // Group sets by exercise
    const exerciseMap = new Map<
      string,
      {
        exerciseName: string;
        targetMuscle: string;
        sets: typeof session.sets;
        totalExerciseVolume: number;
      }
    >();

    for (const set of session.sets) {
      const existing = exerciseMap.get(set.exerciseId);
      const setVol = set.isCompleted ? set.weightKg * set.reps : 0;
      if (existing) {
        existing.sets.push(set);
        existing.totalExerciseVolume += setVol;
      } else {
        exerciseMap.set(set.exerciseId, {
          exerciseName: set.exercise.name,
          targetMuscle: set.exercise.targetMuscle,
          sets: [set],
          totalExerciseVolume: setVol,
        });
      }
    }

    return {
      success: true,
      data: {
        session,
        exercises: Array.from(exerciseMap.values()),
        totalSetsCount: session.sets.filter((s) => s.isCompleted).length,
      },
    };
  } catch (error) {
    console.error('Error fetching workout summary:', error);
    return { success: false, error: 'Error al obtener el resumen de entrenamiento.' };
  }
}
