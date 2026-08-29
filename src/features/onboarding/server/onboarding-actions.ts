'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/current-user';
import { revalidatePath } from 'next/cache';
import type { GoalType, ExperienceLevel, Methodology } from '@prisma/client';

export interface OnboardingInput {
  goal: GoalType;
  experienceLevel: ExperienceLevel;
  preferredDays: number;
  weightKg?: number;
  heightCm?: number;
}

export async function generateAndSaveStarterRoutine(input: OnboardingInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado.' };
    }

    // 1. Determine recommended methodology based on frequency and goal
    let methodology: Methodology = 'FULL_BODY';
    let routineTitle = 'Rutina Starter Full Body (3 Días)';
    let routineDesc = 'Ideal para maximizar la frecuencia de estímulo semanal y consolidar los patrones de movimiento básicos.';

    if (input.preferredDays === 2 || input.preferredDays === 3) {
      methodology = 'FULL_BODY';
      routineTitle = 'Rutina Full Body (Cuerpo Completo)';
      routineDesc = 'Estímulo de cuerpo completo por sesión con foco en movimientos multiarticulares y progresión lineal.';
    } else if (input.preferredDays === 4) {
      methodology = 'UPPER_LOWER';
      routineTitle = 'Rutina Torso / Pierna (4 Días)';
      routineDesc = 'División óptima de 4 días para equilibrar volumen y recuperación entre tren superior e inferior.';
    } else {
      methodology = 'PUSH_PULL_LEGS';
      routineTitle = 'Rutina Empuje / Tracción / Piernas (PPL)';
      routineDesc = 'Estructura avanzada para acumular alto volumen por grupo muscular y máxima hipertrofia.';
    }

    // 2. Fetch standard exercises from library
    const allExercises = await prisma.exercise.findMany();
    const findEx = (namePart: string) =>
      allExercises.find((e) =>
        e.name.toLowerCase().includes(namePart.toLowerCase())
      ) || allExercises[0];

    // 3. Assemble Days and Exercises Templates
    interface DayTemplate {
      name: string;
      restDay: boolean;
      exercises: Array<{
        namePart: string;
        targetSets: number;
        targetRepsMin: number;
        targetRepsMax: number;
        targetRir: number;
        restTimeSec: number;
      }>;
    }

    let daysTemplate: DayTemplate[] = [];

    if (methodology === 'FULL_BODY') {
      daysTemplate = [
        {
          name: 'Día A — Cuerpo Completo',
          restDay: false,
          exercises: [
            { namePart: 'Sentadilla Trasera', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Press de Banca Plano', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Remo con Barra', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Elevaciones Laterales', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
            { namePart: 'Curl de Bíceps con Barra', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 60 },
          ],
        },
        {
          name: 'Día B — Descanso',
          restDay: true,
          exercises: [],
        },
        {
          name: 'Día C — Cuerpo Completo',
          restDay: false,
          exercises: [
            { namePart: 'Peso Muerto Rumano', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Press Militar', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Jalón al Pecho', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Prensa de Piernas', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 90 },
            { namePart: 'Extensión de Tríceps en Polea', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
          ],
        },
      ];
    } else if (methodology === 'UPPER_LOWER') {
      daysTemplate = [
        {
          name: 'Día 1 — Torso (Fuerza e Hipertrofia)',
          restDay: false,
          exercises: [
            { namePart: 'Press de Banca Plano', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Remo con Barra', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Press Militar', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Jalón al Pecho', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 90 },
            { namePart: 'Elevaciones Laterales', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
          ],
        },
        {
          name: 'Día 2 — Pierna (Foco Cuádriceps & Isquios)',
          restDay: false,
          exercises: [
            { namePart: 'Sentadilla Trasera', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRir: 2, restTimeSec: 150 },
            { namePart: 'Peso Muerto Rumano', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Prensa de Piernas', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 90 },
            { namePart: 'Elevación de Talones', targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
            { namePart: 'Plancha Abdominal', targetSets: 3, targetRepsMin: 45, targetRepsMax: 60, targetRir: 0, restTimeSec: 60 },
          ],
        },
        {
          name: 'Día 3 — Descanso',
          restDay: true,
          exercises: [],
        },
        {
          name: 'Día 4 — Torso (Hipertrofia & Brazos)',
          restDay: false,
          exercises: [
            { namePart: 'Press Inclinado con Mancuernas', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Dominadas Pronas', targetSets: 3, targetRepsMin: 6, targetRepsMax: 10, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Cruces en Polea', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
            { namePart: 'Curl de Bíceps en Banco Scott', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 60 },
            { namePart: 'Press Francés con Barra Z', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 60 },
          ],
        },
      ];
    } else {
      // PUSH PULL LEGS
      daysTemplate = [
        {
          name: 'Día 1 — Empuje (Pecho, Hombro, Tríceps)',
          restDay: false,
          exercises: [
            { namePart: 'Press de Banca Plano', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Press Inclinado con Mancuernas', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Press Militar', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Elevaciones Laterales', targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
            { namePart: 'Extensión de Tríceps en Polea', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 60 },
          ],
        },
        {
          name: 'Día 2 — Tracción (Espalda, Bíceps, Posterior)',
          restDay: false,
          exercises: [
            { namePart: 'Dominadas Pronas', targetSets: 4, targetRepsMin: 6, targetRepsMax: 10, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Remo con Barra', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 90 },
            { namePart: 'Jalón al Pecho', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 90 },
            { namePart: 'Face Pull', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
            { namePart: 'Curl de Bíceps con Barra', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 60 },
          ],
        },
        {
          name: 'Día 3 — Piernas (Cuádriceps, Isquios, Gemelos)',
          restDay: false,
          exercises: [
            { namePart: 'Sentadilla Trasera', targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRir: 2, restTimeSec: 150 },
            { namePart: 'Peso Muerto Rumano', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetRir: 2, restTimeSec: 120 },
            { namePart: 'Prensa de Piernas', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restTimeSec: 90 },
            { namePart: 'Elevación de Talones', targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restTimeSec: 60 },
          ],
        },
      ];
    }

    // 4. Create Routine in DB
    const routine = await prisma.routine.create({
      data: {
        userId: user.id,
        name: routineTitle,
        description: routineDesc,
        methodology,
        days: {
          create: daysTemplate.map((d, dIdx) => ({
            dayIndex: dIdx,
            name: d.name,
            restDay: d.restDay,
            exercises: {
              create: d.exercises.map((ex, exIdx) => {
                const matchedEx = findEx(ex.namePart);
                return {
                  orderIndex: exIdx,
                  exerciseId: matchedEx.id,
                  targetSets: ex.targetSets,
                  targetRepsMin: ex.targetRepsMin,
                  targetRepsMax: ex.targetRepsMax,
                  targetRir: ex.targetRir,
                  restTimeSec: ex.restTimeSec,
                };
              }),
            },
          })),
        },
      },
    });

    // 5. Update or Create User Profile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        goal: input.goal,
        experienceLevel: input.experienceLevel,
        preferredDays: input.preferredDays,
        weightKg: input.weightKg ?? null,
        heightCm: input.heightCm ?? null,
      },
      update: {
        goal: input.goal,
        experienceLevel: input.experienceLevel,
        preferredDays: input.preferredDays,
        weightKg: input.weightKg ?? undefined,
        heightCm: input.heightCm ?? undefined,
      },
    });

    revalidatePath('/');
    revalidatePath('/routines');
    revalidatePath('/profile');

    return {
      success: true,
      routineId: routine.id,
    };
  } catch (error) {
    console.error('Error generating starter routine:', error);
    return { success: false, error: 'Error al generar la rutina recomendada.' };
  }
}
