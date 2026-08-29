'use server';

import { prisma } from '@/lib/db';
import { MuscleGroup } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getExercises(params?: {
  muscleGroup?: MuscleGroup | 'ALL';
  search?: string;
}) {
  try {
    const whereClause: {
      targetMuscle?: MuscleGroup;
      name?: { contains: string; mode: 'insensitive' };
    } = {};

    if (params?.muscleGroup && params.muscleGroup !== 'ALL') {
      whereClause.targetMuscle = params.muscleGroup;
    }

    if (params?.search && params.search.trim().length > 0) {
      whereClause.name = {
        contains: params.search.trim(),
        mode: 'insensitive',
      };
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return { success: true, data: exercises };
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    return { success: false, error: 'Error al obtener el catálogo de ejercicios.' };
  }
}

export async function createCustomExercise(data: {
  name: string;
  description?: string;
  targetMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
}) {
  try {
    const existing = await prisma.exercise.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return { success: false, error: 'Ya existe un ejercicio con este nombre.' };
    }

    const exercise = await prisma.exercise.create({
      data: {
        name: data.name,
        description: data.description,
        targetMuscle: data.targetMuscle,
        secondaryMuscles: data.secondaryMuscles ?? [],
        isCustom: true,
      },
    });

    revalidatePath('/routines');
    return { success: true, data: exercise };
  } catch (error) {
    console.error('Failed to create custom exercise:', error);
    return { success: false, error: 'Error al crear el ejercicio.' };
  }
}
