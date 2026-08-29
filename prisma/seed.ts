import {
  PrismaClient,
  MuscleGroup,
  ExperienceLevel,
  GoalType,
  Methodology,
  SetType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const exercises = [
  // PECHO (CHEST)
  {
    name: 'Press de Banca Plano con Barra',
    description: 'Ejercicio compuesto de empuje horizontal para pectoral mayor, tríceps y deltoides anterior.',
    targetMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
  },
  {
    name: 'Press Inclinado con Mancuernas',
    description: 'Empuje en banco inclinado (30-45°) con énfasis en el haz clavicular del pectoral mayor.',
    targetMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
  },
  {
    name: 'Aperturas en Polea (Cruces de Polea)',
    description: 'Ejercicio de aislamiento para aducción horizontal manteniendo tensión mecánica continua en el pectoral.',
    targetMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS],
  },
  {
    name: 'Fondos en Paralelas (con Lastre)',
    description: 'Movimiento compuesto para pectoral inferior, tríceps y serrato anterior.',
    targetMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
  },

  // ESPALDA (BACK)
  {
    name: 'Remo con Barra',
    description: 'Tirón horizontal compuesto enfocado en dorsal ancho, romboides, trapecio medio/inferior y deltoides posterior.',
    targetMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.CORE],
  },
  {
    name: 'Jalón al Pecho (Agarre Ancho)',
    description: 'Tirón vertical enfocado en la amplitud del dorsal ancho y redondo mayor.',
    targetMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
  },
  {
    name: 'Dominadas (Pronas)',
    description: 'Tracción vertical con peso corporal/lastre para activación dorsal y estabilización del core.',
    targetMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.CORE],
  },
  {
    name: 'Remo en Polea Baja (Agarre Cerrado)',
    description: 'Tirón horizontal para zona media de la espalda y dorsal con máximo recorrido.',
    targetMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
  },

  // PIERNAS - CUÁDRICEPS (LEGS_QUADRICEPS)
  {
    name: 'Sentadilla Trasera con Barra',
    description: 'Patrón de sentadilla con barra libre, pilar para cuádriceps, glúteos y cadena posterior.',
    targetMuscle: MuscleGroup.LEGS_QUADRICEPS,
    secondaryMuscles: [MuscleGroup.LEGS_HAMSTRINGS, MuscleGroup.CORE],
  },
  {
    name: 'Prensa de Piernas 45°',
    description: 'Empuje pesado en máquina guiada para cuádriceps reduciendo carga axial en la columna.',
    targetMuscle: MuscleGroup.LEGS_QUADRICEPS,
    secondaryMuscles: [MuscleGroup.LEGS_HAMSTRINGS],
  },
  {
    name: 'Sillón de Cuádriceps (Extensiones)',
    description: 'Aislamiento en máquina enfocado en la contracción del recto femoral y vastos.',
    targetMuscle: MuscleGroup.LEGS_QUADRICEPS,
    secondaryMuscles: [],
  },
  {
    name: 'Sentadilla Búlgara',
    description: 'Ejercicio unilateral para desarrollo de cuádriceps y glúteos corrigiendo asimetrías.',
    targetMuscle: MuscleGroup.LEGS_QUADRICEPS,
    secondaryMuscles: [MuscleGroup.LEGS_HAMSTRINGS, MuscleGroup.CORE],
  },

  // PIERNAS - ISQUIOS Y CADENA POSTERIOR (LEGS_HAMSTRINGS)
  {
    name: 'Peso Muerto Rumano (RDL)',
    description: 'Patrón de bisagra de cadera con énfasis en elongación excéntrica de isquiotibiales y glúteos.',
    targetMuscle: MuscleGroup.LEGS_HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.BACK, MuscleGroup.CORE],
  },
  {
    name: 'Camilla Femoral Tumbado (Curl Femoral)',
    description: 'Flexión de rodilla en aislamiento para las cabezas del bíceps femoral.',
    targetMuscle: MuscleGroup.LEGS_HAMSTRINGS,
    secondaryMuscles: [],
  },

  // PIERNAS - GEMELOS (LEGS_CALVES)
  {
    name: 'Elevaciones de Talones de Pie',
    description: 'Flexión plantar con rodillas extendidas para máximo estímulo del gastrocnemio.',
    targetMuscle: MuscleGroup.LEGS_CALVES,
    secondaryMuscles: [],
  },
  {
    name: 'Elevaciones de Talones Sentado',
    description: 'Flexión plantar con rodillas a 90° con énfasis en el músculo sóleo.',
    targetMuscle: MuscleGroup.LEGS_CALVES,
    secondaryMuscles: [],
  },

  // HOMBROS (SHOULDERS)
  {
    name: 'Press Militar de Pie con Barra (OHP)',
    description: 'Empuje vertical compuesto para deltoides anterior, lateral y estabilidad central.',
    targetMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.CORE],
  },
  {
    name: 'Vuelos Laterales con Mancuernas',
    description: 'Aislamiento de la cabeza lateral del deltoides para amplitud y forma 3D.',
    targetMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [],
  },
  {
    name: 'Pájaros / Deltoides Posterior en Polea',
    description: 'Abducción horizontal para deltoides posterior y salud escapular.',
    targetMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.BACK],
  },

  // BRAZOS - BÍCEPS (BICEPS)
  {
    name: 'Curl de Bíceps con Barra',
    description: 'Flexión bilateral de codo para masa y tensión en ambas cabezas del bíceps.',
    targetMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [],
  },
  {
    name: 'Curl de Bíceps en Banco Inclinado',
    description: 'Flexión con hombro en extensión enfatizando la cabeza larga del bíceps en estiramiento.',
    targetMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [],
  },
  {
    name: 'Curl Martillo con Mancuernas',
    description: 'Agarre neutro para desarrollo del braquial anterior y braquiorradial.',
    targetMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [],
  },

  // BRAZOS - TRÍCEPS (TRICEPS)
  {
    name: 'Extensiones de Tríceps en Polea (Cuerda/Barra)',
    description: 'Extensión de codo para cabeza lateral y medial con resistencia constante.',
    targetMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [],
  },
  {
    name: 'Press Francés con Barra',
    description: 'Extensión de tríceps acostado con gran estiramiento de la cabeza larga.',
    targetMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [MuscleGroup.SHOULDERS],
  },
  {
    name: 'Extensiones de Tríceps Copa en Polea Alta',
    description: 'Extensión sobre la cabeza para máximo estiramiento de la cabeza larga del tríceps.',
    targetMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [],
  },

  // CORE / ABDOMEN (CORE)
  {
    name: 'Elevaciones de Piernas Colgado',
    description: 'Flexión espinal y de cadera para recto abdominal y flexores.',
    targetMuscle: MuscleGroup.CORE,
    secondaryMuscles: [],
  },
  {
    name: 'Leñador en Polea (Woodchopper)',
    description: 'Patrón rotacional dinámico para fuerza y control en oblicuos y transverso.',
    targetMuscle: MuscleGroup.CORE,
    secondaryMuscles: [],
  },
];

async function seedExercises() {
  console.log('Seeding exercise database with Spanish catalog...');
  const exerciseMap = new Map<string, string>();

  // Upsert all Spanish catalog exercises
  for (const ex of exercises) {
    const record = await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {
        description: ex.description,
        targetMuscle: ex.targetMuscle,
        secondaryMuscles: ex.secondaryMuscles,
      },
      create: {
        name: ex.name,
        description: ex.description,
        targetMuscle: ex.targetMuscle,
        secondaryMuscles: ex.secondaryMuscles,
        isCustom: false,
      },
    });
    exerciseMap.set(record.name, record.id);
  }

  console.log(`Successfully seeded ${exercises.length} standard exercises in Spanish.`);
  return exerciseMap;
}

async function seedTestUsers(exerciseMap: Map<string, string>) {
  console.log('Seeding test users for Beginner, Intermediate, and Advanced roles...');
  const defaultPasswordHash = await bcrypt.hash('Gymflow123!', 10);

  // -------------------------------------------------------------
  // 1. BEGINNER USER
  // -------------------------------------------------------------
  const beginnerUser = await prisma.user.upsert({
    where: { email: 'beginner@gymflow.dev' },
    update: {
      name: 'Lucas Principiante',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'beginner@gymflow.dev',
      name: 'Lucas Principiante',
      passwordHash: defaultPasswordHash,
      profile: {
        create: {
          experienceLevel: ExperienceLevel.BEGINNER,
          goal: GoalType.HYPERTROPHY,
          weightKg: 72.0,
          heightCm: 175.0,
          preferredDays: 3,
        },
      },
    },
    include: { profile: true },
  });

  if (!beginnerUser.profile) {
    await prisma.userProfile.create({
      data: {
        userId: beginnerUser.id,
        experienceLevel: ExperienceLevel.BEGINNER,
        goal: GoalType.HYPERTROPHY,
        weightKg: 72.0,
        heightCm: 175.0,
        preferredDays: 3,
      },
    });
  }

  await prisma.routine.deleteMany({ where: { userId: beginnerUser.id } });
  await prisma.workoutSession.deleteMany({ where: { userId: beginnerUser.id } });
  await prisma.personalRecord.deleteMany({ where: { userId: beginnerUser.id } });

  const beginnerRoutine = await prisma.routine.create({
    data: {
      userId: beginnerUser.id,
      name: 'Full Body Starter (3 Días)',
      description: 'Rutina cuerpo completo orientada a adaptación neuromuscular e hipertrofia inicial.',
      methodology: Methodology.FULL_BODY,
      days: {
        create: [
          {
            dayIndex: 0,
            name: 'Día A - Empuje & Tren Inferior',
            exercises: {
              create: [
                {
                  exerciseId: exerciseMap.get('Press de Banca Plano con Barra')!,
                  orderIndex: 0,
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 12,
                  targetRir: 2,
                  restTimeSec: 90,
                  notes: 'Controlar bajada en 2 segundos.',
                },
                {
                  exerciseId: exerciseMap.get('Sentadilla Trasera con Barra')!,
                  orderIndex: 1,
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 12,
                  targetRir: 2,
                  restTimeSec: 90,
                  notes: 'Profundidad paralela.',
                },
                {
                  exerciseId: exerciseMap.get('Jalón al Pecho (Agarre Ancho)')!,
                  orderIndex: 2,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 2,
                  restTimeSec: 60,
                },
                {
                  exerciseId: exerciseMap.get('Press Militar de Pie con Barra (OHP)')!,
                  orderIndex: 3,
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 2,
                  restTimeSec: 90,
                },
              ],
            },
          },
          {
            dayIndex: 1,
            name: 'Día B - Tracción & Isquios',
            exercises: {
              create: [
                {
                  exerciseId: exerciseMap.get('Peso Muerto Rumano (RDL)')!,
                  orderIndex: 0,
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 12,
                  targetRir: 2,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Press Inclinado con Mancuernas')!,
                  orderIndex: 1,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 2,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Remo con Barra')!,
                  orderIndex: 2,
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 2,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Elevaciones de Piernas Colgado')!,
                  orderIndex: 3,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 15,
                  targetRir: 2,
                  restTimeSec: 60,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const benchId = exerciseMap.get('Press de Banca Plano con Barra')!;
  const squatId = exerciseMap.get('Sentadilla Trasera con Barra')!;

  await prisma.workoutSession.create({
    data: {
      userId: beginnerUser.id,
      routineId: beginnerRoutine.id,
      name: 'Día A - Empuje & Tren Inferior',
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      durationSec: 2700,
      totalVolumeKg: 2400,
      notes: 'Primera sesión completada con buena técnica.',
      sets: {
        create: [
          { exerciseId: benchId, setNumber: 1, setType: SetType.NORMAL, weightKg: 40, reps: 10, rir: 2, isCompleted: true },
          { exerciseId: benchId, setNumber: 2, setType: SetType.NORMAL, weightKg: 40, reps: 10, rir: 2, isCompleted: true },
          { exerciseId: benchId, setNumber: 3, setType: SetType.NORMAL, weightKg: 40, reps: 8, rir: 1, isCompleted: true },
          { exerciseId: squatId, setNumber: 1, setType: SetType.NORMAL, weightKg: 50, reps: 10, rir: 2, isCompleted: true },
          { exerciseId: squatId, setNumber: 2, setType: SetType.NORMAL, weightKg: 50, reps: 10, rir: 2, isCompleted: true },
        ],
      },
    },
  });

  await prisma.personalRecord.create({
    data: {
      userId: beginnerUser.id,
      exerciseId: benchId,
      maxWeightKg: 40,
      oneRepMaxEst: 50,
      maxVolumeSet: 400,
    },
  });

  // -------------------------------------------------------------
  // 2. INTERMEDIATE USER
  // -------------------------------------------------------------
  const intermediateUser = await prisma.user.upsert({
    where: { email: 'intermediate@gymflow.dev' },
    update: {
      name: 'Marcos Intermedio',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'intermediate@gymflow.dev',
      name: 'Marcos Intermedio',
      passwordHash: defaultPasswordHash,
      profile: {
        create: {
          experienceLevel: ExperienceLevel.INTERMEDIATE,
          goal: GoalType.HYPERTROPHY,
          weightKg: 80.0,
          heightCm: 180.0,
          preferredDays: 4,
        },
      },
    },
    include: { profile: true },
  });

  if (!intermediateUser.profile) {
    await prisma.userProfile.create({
      data: {
        userId: intermediateUser.id,
        experienceLevel: ExperienceLevel.INTERMEDIATE,
        goal: GoalType.HYPERTROPHY,
        weightKg: 80.0,
        heightCm: 180.0,
        preferredDays: 4,
      },
    });
  }

  await prisma.routine.deleteMany({ where: { userId: intermediateUser.id } });
  await prisma.workoutSession.deleteMany({ where: { userId: intermediateUser.id } });
  await prisma.personalRecord.deleteMany({ where: { userId: intermediateUser.id } });

  const intermediateRoutine = await prisma.routine.create({
    data: {
      userId: intermediateUser.id,
      name: 'Torso / Pierna Frecuencia 2 (4 Días)',
      description: 'División clásica Upper/Lower orientada a sobrecarga progresiva e hipertrofia.',
      methodology: Methodology.UPPER_LOWER,
      days: {
        create: [
          {
            dayIndex: 0,
            name: 'Torso - Fuerza / Hipertrofia',
            exercises: {
              create: [
                {
                  exerciseId: exerciseMap.get('Press de Banca Plano con Barra')!,
                  orderIndex: 0,
                  targetSets: 4,
                  targetRepsMin: 6,
                  targetRepsMax: 8,
                  targetRir: 1,
                  restTimeSec: 120,
                },
                {
                  exerciseId: exerciseMap.get('Remo con Barra')!,
                  orderIndex: 1,
                  targetSets: 4,
                  targetRepsMin: 6,
                  targetRepsMax: 8,
                  targetRir: 1,
                  restTimeSec: 120,
                },
                {
                  exerciseId: exerciseMap.get('Press Militar de Pie con Barra (OHP)')!,
                  orderIndex: 2,
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 1,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Dominadas (Pronas)')!,
                  orderIndex: 3,
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 1,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Press Francés con Barra')!,
                  orderIndex: 4,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 1,
                  restTimeSec: 60,
                },
                {
                  exerciseId: exerciseMap.get('Curl de Bíceps con Barra')!,
                  orderIndex: 5,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 1,
                  restTimeSec: 60,
                },
              ],
            },
          },
          {
            dayIndex: 1,
            name: 'Pierna - Fuerza / Hipertrofia',
            exercises: {
              create: [
                {
                  exerciseId: exerciseMap.get('Sentadilla Trasera con Barra')!,
                  orderIndex: 0,
                  targetSets: 4,
                  targetRepsMin: 6,
                  targetRepsMax: 8,
                  targetRir: 1,
                  restTimeSec: 120,
                },
                {
                  exerciseId: exerciseMap.get('Peso Muerto Rumano (RDL)')!,
                  orderIndex: 1,
                  targetSets: 4,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 1,
                  restTimeSec: 120,
                },
                {
                  exerciseId: exerciseMap.get('Sillón de Cuádriceps (Extensiones)')!,
                  orderIndex: 2,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 1,
                  restTimeSec: 60,
                },
                {
                  exerciseId: exerciseMap.get('Camilla Femoral Tumbado (Curl Femoral)')!,
                  orderIndex: 3,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 1,
                  restTimeSec: 60,
                },
                {
                  exerciseId: exerciseMap.get('Elevaciones de Talones de Pie')!,
                  orderIndex: 4,
                  targetSets: 4,
                  targetRepsMin: 12,
                  targetRepsMax: 15,
                  targetRir: 1,
                  restTimeSec: 60,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const rowId = exerciseMap.get('Remo con Barra')!;
  await prisma.workoutSession.create({
    data: {
      userId: intermediateUser.id,
      routineId: intermediateRoutine.id,
      name: 'Torso - Fuerza / Hipertrofia',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 65 * 60 * 1000),
      durationSec: 3900,
      totalVolumeKg: 6800,
      notes: 'Buen estímulo en pecho y dorsal.',
      sets: {
        create: [
          { exerciseId: benchId, setNumber: 1, setType: SetType.NORMAL, weightKg: 80, reps: 8, rir: 1, isCompleted: true },
          { exerciseId: benchId, setNumber: 2, setType: SetType.NORMAL, weightKg: 85, reps: 7, rir: 1, isCompleted: true },
          { exerciseId: benchId, setNumber: 3, setType: SetType.NORMAL, weightKg: 85, reps: 6, rir: 0, isCompleted: true },
          { exerciseId: rowId, setNumber: 1, setType: SetType.NORMAL, weightKg: 75, reps: 8, rir: 1, isCompleted: true },
          { exerciseId: rowId, setNumber: 2, setType: SetType.NORMAL, weightKg: 80, reps: 8, rir: 1, isCompleted: true },
        ],
      },
    },
  });

  await prisma.personalRecord.createMany({
    data: [
      { userId: intermediateUser.id, exerciseId: benchId, maxWeightKg: 85, oneRepMaxEst: 102, maxVolumeSet: 680 },
      { userId: intermediateUser.id, exerciseId: squatId, maxWeightKg: 120, oneRepMaxEst: 144, maxVolumeSet: 960 },
    ],
  });

  // -------------------------------------------------------------
  // 3. ADVANCED / PRO USER
  // -------------------------------------------------------------
  const advancedUser = await prisma.user.upsert({
    where: { email: 'advanced@gymflow.dev' },
    update: {
      name: 'Valeria Avanzada',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'advanced@gymflow.dev',
      name: 'Valeria Avanzada',
      passwordHash: defaultPasswordHash,
      profile: {
        create: {
          experienceLevel: ExperienceLevel.ADVANCED,
          goal: GoalType.STRENGTH,
          weightKg: 68.0,
          heightCm: 168.0,
          preferredDays: 6,
        },
      },
    },
    include: { profile: true },
  });

  if (!advancedUser.profile) {
    await prisma.userProfile.create({
      data: {
        userId: advancedUser.id,
        experienceLevel: ExperienceLevel.ADVANCED,
        goal: GoalType.STRENGTH,
        weightKg: 68.0,
        heightCm: 168.0,
        preferredDays: 6,
      },
    });
  }

  await prisma.routine.deleteMany({ where: { userId: advancedUser.id } });
  await prisma.workoutSession.deleteMany({ where: { userId: advancedUser.id } });
  await prisma.personalRecord.deleteMany({ where: { userId: advancedUser.id } });

  const rdlId = exerciseMap.get('Peso Muerto Rumano (RDL)')!;
  const dipsId = exerciseMap.get('Fondos en Paralelas (con Lastre)')!;
  const latRaiseId = exerciseMap.get('Vuelos Laterales con Mancuernas')!;

  const advancedRoutine = await prisma.routine.create({
    data: {
      userId: advancedUser.id,
      name: 'Push Pull Legs Pro (6 Días)',
      description: 'Periodización avanzada de alta intensidad con técnicas de intensidad (RIR 0, dropsets).',
      methodology: Methodology.PUSH_PULL_LEGS,
      days: {
        create: [
          {
            dayIndex: 0,
            name: 'Empuje A - Banca Pesada & Pecho',
            exercises: {
              create: [
                {
                  exerciseId: benchId,
                  orderIndex: 0,
                  targetSets: 5,
                  targetRepsMin: 5,
                  targetRepsMax: 5,
                  targetRir: 0,
                  restTimeSec: 180,
                  notes: 'Trabajo pesado 5x5 RPE 9-10.',
                },
                {
                  exerciseId: exerciseMap.get('Press Inclinado con Mancuernas')!,
                  orderIndex: 1,
                  targetSets: 4,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 1,
                  restTimeSec: 90,
                },
                {
                  exerciseId: dipsId,
                  orderIndex: 2,
                  targetSets: 4,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 1,
                  restTimeSec: 90,
                  notes: 'Con lastre.',
                },
                {
                  exerciseId: latRaiseId,
                  orderIndex: 3,
                  targetSets: 4,
                  targetRepsMin: 12,
                  targetRepsMax: 15,
                  targetRir: 0,
                  restTimeSec: 60,
                },
                {
                  exerciseId: exerciseMap.get('Extensiones de Tríceps Copa en Polea Alta')!,
                  orderIndex: 4,
                  targetSets: 4,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 0,
                  restTimeSec: 60,
                },
              ],
            },
          },
          {
            dayIndex: 1,
            name: 'Tracción A - Remo & Amplitud Dorsal',
            exercises: {
              create: [
                {
                  exerciseId: rowId,
                  orderIndex: 0,
                  targetSets: 4,
                  targetRepsMin: 6,
                  targetRepsMax: 8,
                  targetRir: 1,
                  restTimeSec: 120,
                },
                {
                  exerciseId: exerciseMap.get('Dominadas (Pronas)')!,
                  orderIndex: 1,
                  targetSets: 4,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 0,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Remo en Polea Baja (Agarre Cerrado)')!,
                  orderIndex: 2,
                  targetSets: 4,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 0,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Pájaros / Deltoides Posterior en Polea')!,
                  orderIndex: 3,
                  targetSets: 4,
                  targetRepsMin: 12,
                  targetRepsMax: 15,
                  targetRir: 0,
                  restTimeSec: 60,
                },
              ],
            },
          },
          {
            dayIndex: 2,
            name: 'Piernas A - Sentadilla Pesada & Isquios',
            exercises: {
              create: [
                {
                  exerciseId: squatId,
                  orderIndex: 0,
                  targetSets: 5,
                  targetRepsMin: 5,
                  targetRepsMax: 5,
                  targetRir: 0,
                  restTimeSec: 180,
                },
                {
                  exerciseId: rdlId,
                  orderIndex: 1,
                  targetSets: 4,
                  targetRepsMin: 6,
                  targetRepsMax: 8,
                  targetRir: 1,
                  restTimeSec: 120,
                },
                {
                  exerciseId: exerciseMap.get('Prensa de Piernas 45°')!,
                  orderIndex: 2,
                  targetSets: 4,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                  targetRir: 0,
                  restTimeSec: 90,
                },
                {
                  exerciseId: exerciseMap.get('Sentadilla Búlgara')!,
                  orderIndex: 3,
                  targetSets: 3,
                  targetRepsMin: 10,
                  targetRepsMax: 12,
                  targetRir: 1,
                  restTimeSec: 60,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.workoutSession.create({
    data: {
      userId: advancedUser.id,
      routineId: advancedRoutine.id,
      name: 'Empuje A - Banca Pesada & Pecho',
      startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 75 * 60 * 1000),
      durationSec: 4500,
      totalVolumeKg: 9450,
      notes: 'Excelente sesión. PR en Banca 5x5 a 105kg.',
      sets: {
        create: [
          { exerciseId: benchId, setNumber: 1, setType: SetType.WARMUP, weightKg: 60, reps: 8, rir: 4, isCompleted: true },
          { exerciseId: benchId, setNumber: 2, setType: SetType.NORMAL, weightKg: 105, reps: 5, rir: 0, isCompleted: true },
          { exerciseId: benchId, setNumber: 3, setType: SetType.NORMAL, weightKg: 105, reps: 5, rir: 0, isCompleted: true },
          { exerciseId: benchId, setNumber: 4, setType: SetType.NORMAL, weightKg: 105, reps: 5, rir: 0, isCompleted: true },
          { exerciseId: dipsId, setNumber: 1, setType: SetType.NORMAL, weightKg: 20, reps: 10, rir: 1, isCompleted: true },
        ],
      },
    },
  });

  await prisma.personalRecord.createMany({
    data: [
      { userId: advancedUser.id, exerciseId: benchId, maxWeightKg: 115, oneRepMaxEst: 125, maxVolumeSet: 525 },
      { userId: advancedUser.id, exerciseId: squatId, maxWeightKg: 155, oneRepMaxEst: 175, maxVolumeSet: 775 },
      { userId: advancedUser.id, exerciseId: rdlId, maxWeightKg: 160, oneRepMaxEst: 185, maxVolumeSet: 800 },
    ],
  });

  console.log('Successfully seeded 3 test users with complete profiles, routines, workouts, and PRs in Spanish.');
}

async function main() {
  // Clear any existing routines, workouts, PRs and standard exercises to prevent leftover English catalog entries
  await prisma.setLog.deleteMany({});
  await prisma.workoutSession.deleteMany({});
  await prisma.personalRecord.deleteMany({});
  await prisma.routineExercise.deleteMany({});
  await prisma.routineDay.deleteMany({});
  await prisma.routine.deleteMany({});
  await prisma.exercise.deleteMany({ where: { isCustom: false } });

  const exerciseMap = await seedExercises();
  await seedTestUsers(exerciseMap);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
