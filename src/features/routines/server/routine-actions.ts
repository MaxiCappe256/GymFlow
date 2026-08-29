'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/current-user';
import { Methodology } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface RoutineExerciseInput {
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRir?: number;
  restTimeSec: number;
  notes?: string;
}

export interface RoutineDayInput {
  dayIndex: number;
  name: string;
  restDay: boolean;
  exercises: RoutineExerciseInput[];
}

export interface CreateRoutineInput {
  name: string;
  description?: string;
  methodology: Methodology;
  days: RoutineDayInput[];
}

export async function getRoutines() {
  try {
    const userId = await getCurrentUserId();
    const routines = await prisma.routine.findMany({
      where: { userId, isArchived: false },
      include: {
        days: {
          orderBy: { dayIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { orderIndex: 'asc' },
              include: { exercise: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, data: routines };
  } catch (error) {
    console.error('Error fetching routines:', error);
    return { success: false, error: 'Error al obtener las rutinas.' };
  }
}

export async function getRoutineById(id: string) {
  try {
    const userId = await getCurrentUserId();
    const routine = await prisma.routine.findFirst({
      where: { id, userId, isArchived: false },
      include: {
        days: {
          orderBy: { dayIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { orderIndex: 'asc' },
              include: { exercise: true },
            },
          },
        },
      },
    });

    if (!routine) {
      return { success: false, error: 'Rutina no encontrada.' };
    }

    return { success: true, data: routine };
  } catch (error) {
    console.error(`Error fetching routine ${id}:`, error);
    return { success: false, error: 'Error al obtener los detalles de la rutina.' };
  }
}

export async function createRoutine(input: CreateRoutineInput) {
  try {
    const userId = await getCurrentUserId();

    const routine = await prisma.routine.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        methodology: input.methodology,
        days: {
          create: input.days.map((day) => ({
            dayIndex: day.dayIndex,
            name: day.name,
            restDay: day.restDay,
            exercises: {
              create: day.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                orderIndex: ex.orderIndex,
                targetSets: ex.targetSets,
                targetRepsMin: ex.targetRepsMin,
                targetRepsMax: ex.targetRepsMax,
                targetRir: ex.targetRir,
                restTimeSec: ex.restTimeSec,
                notes: ex.notes,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            exercises: {
              include: { exercise: true },
            },
          },
        },
      },
    });

    revalidatePath('/routines');
    return { success: true, data: routine };
  } catch (error) {
    console.error('Error creating routine:', error);
    return { success: false, error: 'Error al crear la rutina.' };
  }
}

export async function updateRoutine(id: string, input: CreateRoutineInput) {
  try {
    const userId = await getCurrentUserId();

    // Verify ownership
    const existing = await prisma.routine.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: 'Rutina no encontrada o no autorizada.' };
    }

    // Transaction to replace days & exercises cleanly
    const updated = await prisma.$transaction(async (tx) => {
      // Delete existing days (cascades to routine_exercises)
      await tx.routineDay.deleteMany({
        where: { routineId: id },
      });

      return tx.routine.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          methodology: input.methodology,
          days: {
            create: input.days.map((day) => ({
              dayIndex: day.dayIndex,
              name: day.name,
              restDay: day.restDay,
              exercises: {
                create: day.exercises.map((ex) => ({
                  exerciseId: ex.exerciseId,
                  orderIndex: ex.orderIndex,
                  targetSets: ex.targetSets,
                  targetRepsMin: ex.targetRepsMin,
                  targetRepsMax: ex.targetRepsMax,
                  targetRir: ex.targetRir,
                  restTimeSec: ex.restTimeSec,
                  notes: ex.notes,
                })),
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              exercises: {
                include: { exercise: true },
              },
            },
          },
        },
      });
    });

    revalidatePath('/routines');
    revalidatePath(`/routines/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error(`Error updating routine ${id}:`, error);
    return { success: false, error: 'Error al actualizar la rutina.' };
  }
}

export async function deleteRoutine(id: string) {
  try {
    const userId = await getCurrentUserId();

    const existing = await prisma.routine.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: 'Rutina no encontrada.' };
    }

    await prisma.routine.update({
      where: { id },
      data: { isArchived: true },
    });

    revalidatePath('/routines');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting routine ${id}:`, error);
    return { success: false, error: 'Error al eliminar la rutina.' };
  }
}
