'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/current-user';

export interface WeeklyVolumePoint {
  weekLabel: string;
  volumeKg: number;
  sessionCount: number;
}

export interface MuscleDistributionPoint {
  muscle: string;
  muscleKey: string;
  sets: number;
  percentage: number;
}

export interface ExerciseTrendPoint {
  date: string;
  estimated1RM: number;
  weightKg: number;
  reps: number;
}

export interface ExerciseTrend {
  exerciseId: string;
  exerciseName: string;
  points: ExerciseTrendPoint[];
}

export interface PersonalRecordItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  oneRepMaxEst: number;
  maxWeightKg: number;
  maxVolumeSet: number;
  achievedAt: Date;
}

const MUSCLE_SPANISH_LABELS: Record<string, string> = {
  CHEST: 'Pecho',
  BACK: 'Espalda',
  LEGS_QUADRICEPS: 'Cuádriceps',
  LEGS_HAMSTRINGS: 'Isquios',
  LEGS_CALVES: 'Gemelos',
  SHOULDERS: 'Hombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  CORE: 'Abdomen / Core',
  FULL_BODY: 'Cuerpo Completo',
};

export async function getStatsOverview() {
  try {
    const userId = await getCurrentUserId();

    // 1. Fetch user's workout sessions
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'asc' },
      include: {
        sets: {
          where: { isCompleted: true },
          include: { exercise: true },
        },
      },
    });

    // 2. Fetch user's personal records
    const prs = await prisma.personalRecord.findMany({
      where: { userId },
      orderBy: { achievedAt: 'desc' },
    });

    // 3. Compute KPI aggregations
    const totalWorkouts = sessions.length;
    const totalVolumeKg = sessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);
    const totalSetsCompleted = sessions.reduce((acc, s) => acc + s.sets.length, 0);

    // 4. Calculate Weekly Volume Load (last 8 weeks)
    const now = new Date();
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(now.getDate() - 56);

    const weeklyMap = new Map<string, { volumeKg: number; sessionCount: number }>();

    // Pre-populate 8 weeks
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * 7);
      const weekLabel = `Sem ${8 - i}`;
      weeklyMap.set(weekLabel, { volumeKg: 0, sessionCount: 0 });
    }

    sessions.forEach((s) => {
      const sessionDate = new Date(s.startedAt);
      if (sessionDate >= eightWeeksAgo) {
        const diffWeeks = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const weekIndex = 7 - Math.min(7, Math.max(0, diffWeeks));
        const weekLabel = `Sem ${weekIndex + 1}`;
        const existing = weeklyMap.get(weekLabel);
        if (existing) {
          existing.volumeKg += s.totalVolumeKg;
          existing.sessionCount += 1;
        }
      }
    });

    const weeklyProgression: WeeklyVolumePoint[] = Array.from(weeklyMap.entries()).map(
      ([weekLabel, data]) => ({
        weekLabel,
        volumeKg: Math.round(data.volumeKg),
        sessionCount: data.sessionCount,
      })
    );

    // 5. Muscle Distribution Breakdown
    const muscleMap = new Map<string, number>();
    let totalCategorizedSets = 0;

    sessions.forEach((s) => {
      s.sets.forEach((set) => {
        const muscle = set.exercise.targetMuscle;
        muscleMap.set(muscle, (muscleMap.get(muscle) || 0) + 1);
        totalCategorizedSets += 1;
      });
    });

    const muscleDistribution: MuscleDistributionPoint[] = Array.from(muscleMap.entries())
      .map(([muscleKey, sets]) => ({
        muscleKey,
        muscle: MUSCLE_SPANISH_LABELS[muscleKey] || muscleKey,
        sets,
        percentage: totalCategorizedSets > 0 ? Math.round((sets / totalCategorizedSets) * 100) : 0,
      }))
      .sort((a, b) => b.sets - a.sets);

    // 6. 1RM Historical Progress for top logged exercises
    const exerciseHistoryMap = new Map<string, { name: string; points: ExerciseTrendPoint[] }>();

    sessions.forEach((s) => {
      const dateStr = new Date(s.startedAt).toLocaleDateString('es-AR', {
        month: 'short',
        day: 'numeric',
      });

      s.sets.forEach((set) => {
        if (set.weightKg > 0 && set.reps > 0) {
          const est1RM = Math.round(set.weightKg * (1 + set.reps / 30) * 10) / 10;
          const existing = exerciseHistoryMap.get(set.exerciseId);

          const point: ExerciseTrendPoint = {
            date: dateStr,
            estimated1RM: est1RM,
            weightKg: set.weightKg,
            reps: set.reps,
          };

          if (existing) {
            // Keep best set for this date
            const lastPoint = existing.points[existing.points.length - 1];
            if (lastPoint && lastPoint.date === dateStr) {
              if (est1RM > lastPoint.estimated1RM) {
                existing.points[existing.points.length - 1] = point;
              }
            } else {
              existing.points.push(point);
            }
          } else {
            exerciseHistoryMap.set(set.exerciseId, {
              name: set.exercise.name,
              points: [point],
            });
          }
        }
      });
    });

    const exerciseTrends: ExerciseTrend[] = Array.from(exerciseHistoryMap.entries())
      .filter(([, data]) => data.points.length >= 1)
      .map(([exerciseId, data]) => ({
        exerciseId,
        exerciseName: data.name,
        points: data.points,
      }));

    // 7. Formatted PRs List
    const prExerciseIds = Array.from(new Set(prs.map((p) => p.exerciseId)));
    const prExercises = await prisma.exercise.findMany({
      where: { id: { in: prExerciseIds } },
    });
    const prExerciseMap = new Map(prExercises.map((e) => [e.id, e]));

    const personalRecords: PersonalRecordItem[] = prs.map((p) => {
      const ex = prExerciseMap.get(p.exerciseId);
      return {
        id: p.id,
        exerciseId: p.exerciseId,
        exerciseName: ex?.name || 'Ejercicio',
        targetMuscle: ex ? MUSCLE_SPANISH_LABELS[ex.targetMuscle] || ex.targetMuscle : '',
        oneRepMaxEst: p.oneRepMaxEst,
        maxWeightKg: p.maxWeightKg,
        maxVolumeSet: p.maxVolumeSet,
        achievedAt: p.achievedAt,
      };
    });

    return {
      success: true,
      data: {
        totalWorkouts,
        totalVolumeKg: Math.round(totalVolumeKg),
        totalSetsCompleted,
        weeklyProgression,
        muscleDistribution,
        exerciseTrends,
        personalRecords,
      },
    };
  } catch (error) {
    console.error('Error fetching stats overview:', error);
    return { success: false, error: 'Error al calcular las métricas de progreso.' };
  }
}
