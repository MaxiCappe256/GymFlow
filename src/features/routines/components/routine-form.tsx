'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Methodology, MuscleGroup } from '@prisma/client';
import {
  createRoutine,
  updateRoutine,
  type CreateRoutineInput,
  type RoutineExerciseInput,
} from '../server/routine-actions';
import {
  ExercisePickerModal,
  type ExerciseItem,
} from '@/features/exercises/components/exercise-picker-modal';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  Layers,
  ArrowLeft,
  Save,
} from 'lucide-react';
import Link from 'next/link';

interface RoutineFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string | null;
    methodology: Methodology;
    days: Array<{
      dayIndex: number;
      name: string;
      restDay: boolean;
      exercises: Array<{
        exerciseId: string;
        orderIndex: number;
        targetSets: number;
        targetRepsMin: number;
        targetRepsMax: number;
        targetRir: number | null;
        restTimeSec: number;
        notes: string | null;
        exercise: {
          id: string;
          name: string;
          targetMuscle: MuscleGroup;
        };
      }>;
    }>;
  };
  isEditMode?: boolean;
}

interface FormExerciseState extends RoutineExerciseInput {
  exerciseName: string;
  targetMuscle: MuscleGroup;
}

interface FormDayState {
  dayIndex: number;
  name: string;
  restDay: boolean;
  exercises: FormExerciseState[];
}

const METHODOLOGY_PRESETS: Record<Methodology, { name: string; defaultDays: string[] }> = {
  PUSH_PULL_LEGS: {
    name: 'Empuje / Tracción / Piernas (PPL)',
    defaultDays: ['Día 1 — Empuje (Pecho, Hombros, Tríceps)', 'Día 2 — Tracción (Espalda, Deltoides Post, Bíceps)', 'Día 3 — Piernas (Cuádriceps, Isquios, Gemelos)'],
  },
  UPPER_LOWER: {
    name: 'Torso / Pierna',
    defaultDays: ['Día 1 — Torso A', 'Día 2 — Pierna A', 'Día 3 — Torso B', 'Día 4 — Pierna B'],
  },
  WEIDER: {
    name: 'División Weider por Grupo Muscular',
    defaultDays: ['Pecho', 'Espalda', 'Piernas', 'Hombros y Trapecios', 'Brazos y Abdomen'],
  },
  FULL_BODY: {
    name: 'Cuerpo Completo (Full Body 3x)',
    defaultDays: ['Full Body A', 'Full Body B', 'Full Body C'],
  },
  HEAVY_DUTY: {
    name: 'Heavy Duty / HIT (Alta Intensidad)',
    defaultDays: ['Pecho y Espalda', 'Piernas y Abdomen', 'Hombros y Brazos'],
  },
  CUSTOM: {
    name: 'Programa Personalizado',
    defaultDays: ['Día 1'],
  },
};

export function RoutineForm({ initialData, isEditMode = false }: RoutineFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [methodology, setMethodology] = useState<Methodology>(
    initialData?.methodology ?? 'PUSH_PULL_LEGS'
  );

  // Initialize days
  const [days, setDays] = useState<FormDayState[]>(() => {
    if (initialData?.days && initialData.days.length > 0) {
      return initialData.days.map((d) => ({
        dayIndex: d.dayIndex,
        name: d.name,
        restDay: d.restDay,
        exercises: d.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          orderIndex: e.orderIndex,
          targetSets: e.targetSets,
          targetRepsMin: e.targetRepsMin,
          targetRepsMax: e.targetRepsMax,
          targetRir: e.targetRir ?? undefined,
          restTimeSec: e.restTimeSec,
          notes: e.notes ?? undefined,
          exerciseName: e.exercise.name,
          targetMuscle: e.exercise.targetMuscle,
        })),
      }));
    }

    return METHODOLOGY_PRESETS.PUSH_PULL_LEGS.defaultDays.map((dayName, idx) => ({
      dayIndex: idx,
      name: dayName,
      restDay: false,
      exercises: [],
    }));
  });

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle methodology change preset suggestion
  const handleMethodologyChange = (newMethod: Methodology) => {
    setMethodology(newMethod);
    if (!isEditMode && days.every((d) => d.exercises.length === 0)) {
      setDays(
        METHODOLOGY_PRESETS[newMethod].defaultDays.map((dayName, idx) => ({
          dayIndex: idx,
          name: dayName,
          restDay: false,
          exercises: [],
        }))
      );
      setActiveDayIdx(0);
    }
  };

  const handleAddDay = () => {
    const newIdx = days.length;
    setDays((prev) => [
      ...prev,
      {
        dayIndex: newIdx,
        name: `Día ${newIdx + 1}`,
        restDay: false,
        exercises: [],
      },
    ]);
    setActiveDayIdx(newIdx);
  };

  const handleRemoveDay = (indexToRemove: number) => {
    if (days.length <= 1) {
      alert('La rutina debe contener al menos 1 día.');
      return;
    }
    const updated = days
      .filter((_, idx) => idx !== indexToRemove)
      .map((day, newIdx) => ({ ...day, dayIndex: newIdx }));
    setDays(updated);
    setActiveDayIdx(Math.max(0, activeDayIdx - 1));
  };

  const handleAddExerciseToCurrentDay = (exercise: ExerciseItem) => {
    setDays((prev) => {
      const updated = [...prev];
      const currentDay = updated[activeDayIdx];
      const newOrder = currentDay.exercises.length;

      currentDay.exercises.push({
        exerciseId: exercise.id,
        orderIndex: newOrder,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        targetRir: 2,
        restTimeSec: 90,
        notes: '',
        exerciseName: exercise.name,
        targetMuscle: exercise.targetMuscle,
      });

      return updated;
    });
  };

  const handleRemoveExercise = (exIdx: number) => {
    setDays((prev) => {
      const updated = [...prev];
      const currentDay = updated[activeDayIdx];
      currentDay.exercises = currentDay.exercises
        .filter((_, idx) => idx !== exIdx)
        .map((e, idx) => ({ ...e, orderIndex: idx }));
      return updated;
    });
  };

  const handleMoveExercise = (exIdx: number, direction: 'up' | 'down') => {
    setDays((prev) => {
      const updated = [...prev];
      const currentDay = updated[activeDayIdx];
      const targetIdx = direction === 'up' ? exIdx - 1 : exIdx + 1;

      if (targetIdx < 0 || targetIdx >= currentDay.exercises.length) return prev;

      const temp = currentDay.exercises[exIdx];
      currentDay.exercises[exIdx] = currentDay.exercises[targetIdx];
      currentDay.exercises[targetIdx] = temp;

      currentDay.exercises = currentDay.exercises.map((e, idx) => ({
        ...e,
        orderIndex: idx,
      }));

      return updated;
    });
  };

  const handleUpdateExerciseField = (
    exIdx: number,
    field: keyof FormExerciseState,
    value: unknown
  ) => {
    setDays((prev) => {
      const updated = [...prev];
      const currentDay = updated[activeDayIdx];
      currentDay.exercises[exIdx] = {
        ...currentDay.exercises[exIdx],
        [field]: value,
      };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresá un nombre para la rutina.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload: CreateRoutineInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      methodology,
      days: days.map((d) => ({
        dayIndex: d.dayIndex,
        name: d.name,
        restDay: d.restDay,
        exercises: d.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          orderIndex: e.orderIndex,
          targetSets: Number(e.targetSets) || 3,
          targetRepsMin: Number(e.targetRepsMin) || 8,
          targetRepsMax: Number(e.targetRepsMax) || 12,
          targetRir: e.targetRir !== undefined ? Number(e.targetRir) : undefined,
          restTimeSec: Number(e.restTimeSec) || 90,
          notes: e.notes || undefined,
        })),
      })),
    };

    let res;
    if (isEditMode && initialData?.id) {
      res = await updateRoutine(initialData.id, payload);
    } else {
      res = await createRoutine(payload);
    }

    if (res.success && res.data) {
      router.push(`/routines/${res.data.id}`);
    } else {
      setError(res.error || 'Error al guardar la rutina');
      setSubmitting(false);
    }
  };

  const activeDay = days[activeDayIdx] ?? days[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/routines"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a rutinas
        </Link>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {submitting ? 'Guardando...' : isEditMode ? 'Actualizar Rutina' : 'Crear Rutina'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Routine Metadata Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Información de la Rutina
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Título de la rutina *
            </label>
            <input
              type="text"
              required
              placeholder="ej. Torso / Pierna Frecuencia 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Metodología de entrenamiento
            </label>
            <select
              value={methodology}
              onChange={(e) => handleMethodologyChange(e.target.value as Methodology)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {Object.entries(METHODOLOGY_PRESETS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
            Notas / Objetivo de la rutina (Opcional)
          </label>
          <textarea
            rows={2}
            placeholder="ej. Foco en sobrecarga progresiva en básicos. Descarga en semana 6."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Days Manager & Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Días de Entrenamiento</h2>
          <button
            type="button"
            onClick={handleAddDay}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Día
          </button>
        </div>

        {/* Day Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {days.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDayIdx(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                activeDayIdx === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-xs'
              }`}
            >
              {day.name} {day.restDay ? '(Descanso)' : `(${day.exercises.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Active Day Detail Card */}
      {activeDay && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-sm">
          {/* Day Name Edit & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex-1 max-w-sm">
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                Nombre del día
              </label>
              <input
                type="text"
                value={activeDay.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setDays((prev) => {
                    const updated = [...prev];
                    updated[activeDayIdx].name = val;
                    return updated;
                  });
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeDay.restDay}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setDays((prev) => {
                      const updated = [...prev];
                      updated[activeDayIdx].restDay = checked;
                      return updated;
                    });
                  }}
                  className="rounded border-zinc-300 dark:border-zinc-800 text-blue-600 focus:ring-0 w-4 h-4 bg-zinc-50 dark:bg-zinc-950"
                />
                Día de Descanso
              </label>

              {days.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDay(activeDayIdx)}
                  className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Eliminar Día"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Exercises for this Day */}
          {activeDay.restDay ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Este día está asignado como Día de Descanso / Recuperación.
            </div>
          ) : (
            <div className="space-y-4">
              {activeDay.exercises.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                  <Dumbbell className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No hay ejercicios agregados en este día todavía.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Primer Ejercicio
                  </button>
                </div>
              ) : (
                activeDay.exercises.map((ex, exIdx) => (
                  <div
                    key={ex.exerciseId + exIdx}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 space-y-3 relative group"
                  >
                    {/* Header: Exercise Name & Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center">
                          {exIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {ex.exerciseName}
                          </h4>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {ex.targetMuscle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={exIdx === 0}
                          onClick={() => handleMoveExercise(exIdx, 'up')}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={exIdx === activeDay.exercises.length - 1}
                          onClick={() => handleMoveExercise(exIdx, 'down')}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exIdx)}
                          className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Exercise Parameters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">
                          Series
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={ex.targetSets}
                          onChange={(e) =>
                            handleUpdateExerciseField(
                              exIdx,
                              'targetSets',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">
                          Reps (Mín - Máx)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={ex.targetRepsMin}
                            onChange={(e) =>
                              handleUpdateExerciseField(
                                exIdx,
                                'targetRepsMin',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold text-center focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-zinc-400 dark:text-zinc-600 text-xs">-</span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={ex.targetRepsMax}
                            onChange={(e) =>
                              handleUpdateExerciseField(
                                exIdx,
                                'targetRepsMax',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold text-center focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">
                          RIR Objetivo (0-4)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          value={ex.targetRir ?? ''}
                          placeholder="ej. 2"
                          onChange={(e) =>
                            handleUpdateExerciseField(
                              exIdx,
                              'targetRir',
                              e.target.value === '' ? undefined : parseInt(e.target.value)
                            )
                          }
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">
                          Descanso
                        </label>
                        <select
                          value={ex.restTimeSec}
                          onChange={(e) =>
                            handleUpdateExerciseField(
                              exIdx,
                              'restTimeSec',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value={45}>45s</option>
                          <option value={60}>60s (1m)</option>
                          <option value={90}>90s (1.5m)</option>
                          <option value={120}>120s (2m)</option>
                          <option value={180}>180s (3m)</option>
                          <option value={240}>240s (4m)</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Indicaciones / notas del ejercicio (ej. Bajada controlada en 2s, pausa abajo)"
                        value={ex.notes ?? ''}
                        onChange={(e) =>
                          handleUpdateExerciseField(exIdx, 'notes', e.target.value)
                        }
                        className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-lg px-2.5 py-1 text-[11px] text-zinc-700 dark:text-zinc-400 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))
              )}

              {/* Add Exercise CTA Button */}
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="w-full py-3 border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-700 bg-white/60 dark:bg-zinc-950/40 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                Agregar Ejercicio a {activeDay.name}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Picker */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAddExerciseToCurrentDay}
      />
    </form>
  );
}
