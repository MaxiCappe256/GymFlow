'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type {
  ActiveWorkoutState,
  ActiveExerciseSession,
  SetDraft,
  MuscleGroup,
} from '@/types/workout';
import { db } from '@/lib/idb/workout-db';
import { useWakeLock } from '../hooks/use-wake-lock';
import { ActiveSetRow } from './active-set-row';
import { FloatingRestTimer } from './floating-rest-timer';
import { FinishWorkoutDialog } from './finish-workout-dialog';
import { ExercisePickerModal } from '@/features/exercises/components/exercise-picker-modal';
import { saveCompletedWorkout } from '../server/workout-actions';
import {
  Play,
  Pause,
  Plus,
  Dumbbell,
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface ActiveWorkoutRunnerProps {
  initialState: ActiveWorkoutState;
}

export function ActiveWorkoutRunner({ initialState }: ActiveWorkoutRunnerProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState<ActiveWorkoutState>(initialState);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(initialState.elapsedSeconds || 0);
  const [restTimerState, setRestTimerState] = useState<{
    active: boolean;
    durationSec: number;
    triggerKey: number;
  }>({
    active: false,
    durationSec: 90,
    triggerKey: 0,
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Keep screen awake while active workout is underway
  useWakeLock(true);

  // Restore or persist state from/to IndexedDB
  useEffect(() => {
    async function loadSavedState() {
      try {
        const saved = await db.activeWorkouts.get(initialState.sessionId);
        if (saved) {
          setWorkout(saved);
          setElapsedSec(saved.elapsedSeconds);
        }
      } catch (e) {
        console.warn('Could not read workout state from IndexedDB:', e);
      }
    }
    loadSavedState();
  }, [initialState.sessionId]);

  const saveToIndexedDb = useCallback(async (state: ActiveWorkoutState) => {
    try {
      await db.activeWorkouts.put(state);
    } catch (e) {
      console.warn('Could not sync workout to IndexedDB:', e);
    }
  }, []);

  // Main Session Elapsed Stopwatch
  const timerStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (isPaused) return;

    timerStartRef.current = Date.now() - elapsedSec * 1000;
    const interval = setInterval(() => {
      if (timerStartRef.current !== null) {
        const currentElapsed = Math.floor((Date.now() - timerStartRef.current) / 1000);
        setElapsedSec(currentElapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync state changes to IndexedDB
  useEffect(() => {
    const updated = {
      ...workout,
      elapsedSeconds: elapsedSec,
      isPaused,
    };
    saveToIndexedDb(updated);
  }, [workout, elapsedSec, isPaused, saveToIndexedDb]);

  // Formatted Stopwatch
  const hours = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const seconds = elapsedSec % 60;
  const formattedStopwatch =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentExercise = workout.exercises[activeExerciseIdx];

  // Total Completed Sets & Total Mechanical Volume (kg)
  const totalCompletedSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalVolumeKg = workout.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets.reduce((sAcc, s) => sAcc + (s.isCompleted ? s.weightKg * s.reps : 0), 0),
    0
  );

  // Handler: Update a specific set
  const handleUpdateSet = (exIdx: number, setIdx: number, updatedSet: SetDraft) => {
    setWorkout((prev) => {
      const copy = { ...prev };
      copy.exercises[exIdx].sets[setIdx] = updatedSet;
      return copy;
    });
  };

  // Handler: Toggle set completion & trigger Rest Timer
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    const exercise = workout.exercises[exIdx];
    const currentSet = exercise.sets[setIdx];
    const newStatus = !currentSet.isCompleted;

    setWorkout((prev) => {
      const copy = { ...prev };
      const setList = [...copy.exercises[exIdx].sets];
      setList[setIdx] = { ...currentSet, isCompleted: newStatus };

      // If completing and next set exists with 0 weight, prefill next set with this set's weight & reps
      if (newStatus && setIdx + 1 < setList.length) {
        const nextSet = setList[setIdx + 1];
        if (nextSet.weightKg === 0 && !nextSet.isCompleted) {
          setList[setIdx + 1] = {
            ...nextSet,
            weightKg: currentSet.weightKg,
            reps: currentSet.reps,
          };
        }
      }

      copy.exercises[exIdx].sets = setList;
      return copy;
    });

    // If marked completed, trigger rest countdown timer
    if (newStatus) {
      setRestTimerState((prev) => ({
        active: true,
        durationSec: exercise.restTimeSec || 90,
        triggerKey: prev.triggerKey + 1,
      }));
    }
  };

  // Handler: Add a set to current exercise
  const handleAddSet = (exIdx: number) => {
    const exercise = workout.exercises[exIdx];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: SetDraft = {
      id: `set_${exercise.exerciseId}_${exercise.sets.length + 1}_${Date.now()}`,
      setNumber: exercise.sets.length + 1,
      setType: 'NORMAL',
      weightKg: lastSet ? lastSet.weightKg : 0,
      reps: lastSet ? lastSet.reps : 10,
      rir: lastSet?.rir,
      isCompleted: false,
      previousWeightKg: lastSet?.previousWeightKg,
      previousReps: lastSet?.previousReps,
    };

    setWorkout((prev) => {
      const copy = { ...prev };
      copy.exercises[exIdx].sets.push(newSet);
      return copy;
    });
  };

  // Handler: Delete a set
  const handleDeleteSet = (exIdx: number, setIdx: number) => {
    setWorkout((prev) => {
      const copy = { ...prev };
      copy.exercises[exIdx].sets.splice(setIdx, 1);
      // Renumber
      copy.exercises[exIdx].sets.forEach((s, idx) => {
        s.setNumber = idx + 1;
      });
      return copy;
    });
  };

  // Handler: Add an exercise from modal picker
  const handleAddExerciseFromPicker = (selected: {
    id: string;
    name: string;
    targetMuscle: MuscleGroup;
    description: string | null;
  }) => {
    const newExercise: ActiveExerciseSession = {
      exerciseId: selected.id,
      exerciseName: selected.name,
      targetMuscle: selected.targetMuscle,
      restTimeSec: 90,
      notes: selected.description || undefined,
      sets: [
        {
          id: `set_${selected.id}_1_${Date.now()}`,
          setNumber: 1,
          setType: 'NORMAL',
          weightKg: 0,
          reps: 10,
          isCompleted: false,
        },
        {
          id: `set_${selected.id}_2_${Date.now()}`,
          setNumber: 2,
          setType: 'NORMAL',
          weightKg: 0,
          reps: 10,
          isCompleted: false,
        },
        {
          id: `set_${selected.id}_3_${Date.now()}`,
          setNumber: 3,
          setType: 'NORMAL',
          weightKg: 0,
          reps: 10,
          isCompleted: false,
        },
      ],
    };

    setWorkout((prev) => {
      const copy = { ...prev };
      copy.exercises.push(newExercise);
      return copy;
    });

    setActiveExerciseIdx(workout.exercises.length);
  };

  // Handler: Remove an exercise from the session
  const handleRemoveExercise = (exIdx: number) => {
    if (!confirm(`¿Eliminar "${workout.exercises[exIdx].exerciseName}" de esta sesión?`)) return;

    setWorkout((prev) => {
      const copy = { ...prev };
      copy.exercises.splice(exIdx, 1);
      return copy;
    });

    if (activeExerciseIdx >= workout.exercises.length - 1) {
      setActiveExerciseIdx(Math.max(0, workout.exercises.length - 2));
    }
  };

  // Handler: Finalize & Save Workout
  const handleConfirmFinish = async (notes?: string) => {
    setSubmitting(true);
    try {
      const res = await saveCompletedWorkout({
        sessionId: workout.sessionId,
        routineId: workout.routineId,
        sessionName: workout.sessionName,
        startedAt: workout.startedAt,
        endedAt: Date.now(),
        durationSec: elapsedSec,
        notes,
        exercises: workout.exercises,
      });

      if (res.success && res.sessionId) {
        // Clean up from local storage
        await db.activeWorkouts.delete(workout.sessionId);
        router.push(`/workout/summary/${res.sessionId}`);
      } else {
        alert(res.error || 'Error al guardar el entrenamiento.');
        setSubmitting(false);
      }
    } catch (e) {
      console.error('Error saving workout:', e);
      alert('Ocurrió un error inesperado al guardar.');
      setSubmitting(false);
    }
  };

  // Handler: Discard Workout
  const handleDiscard = async () => {
    await db.activeWorkouts.delete(workout.sessionId);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Distraction-Free Sticky Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 transition-colors">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Stopwatch & Pause Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                isPaused
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{formattedStopwatch}</span>
            </button>
          </div>

          {/* Session Title */}
          <div className="text-center truncate px-2">
            <h1 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-xs">
              {workout.sessionName}
            </h1>
          </div>

          {/* Finish Button */}
          <button
            type="button"
            onClick={() => setShowFinishModal(true)}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finalizar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 pb-32 space-y-5">
        {/* Progress & Exercise Indicator Tabs */}
        {workout.exercises.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>
                Ejercicio {activeExerciseIdx + 1} de {workout.exercises.length}
              </span>
              <span>
                {totalCompletedSets} series completadas • {Math.round(totalVolumeKg)} kg
              </span>
            </div>

            {/* Exercise Horizontal Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {workout.exercises.map((ex, idx) => {
                const isSelected = activeExerciseIdx === idx;
                const isAllCompleted =
                  ex.sets.length > 0 && ex.sets.every((s) => s.isCompleted);

                return (
                  <button
                    key={ex.exerciseId + idx}
                    type="button"
                    onClick={() => setActiveExerciseIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : isAllCompleted
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-2xs'
                    }`}
                  >
                    {isAllCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    <span className="truncate max-w-[120px]">{ex.exerciseName}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                title="Agregar Ejercicio"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty Workout State */}
        {workout.exercises.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-4 shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Dumbbell className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Sesión sin ejercicios
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Seleccioná los ejercicios que vas a realizar hoy para comenzar a registrar tus series y descansos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Seleccionar Primer Ejercicio
            </button>
          </div>
        ) : currentExercise ? (
          /* Active Exercise Card */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
            {/* Exercise Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    {currentExercise.targetMuscle}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <Timer className="w-3.5 h-3.5" />
                    {currentExercise.restTimeSec}s descanso
                  </span>
                </div>

                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
                  {currentExercise.exerciseName}
                </h2>

                {currentExercise.notes && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {currentExercise.notes}
                  </p>
                )}
              </div>

              {/* Remove Exercise Button */}
              <button
                type="button"
                onClick={() => handleRemoveExercise(activeExerciseIdx)}
                className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                title="Quitar ejercicio de la sesión"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Set Table Column Headers */}
            <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 px-2 tracking-wider uppercase">
              <div className="col-span-2">Serie</div>
              <div className="col-span-3 text-center">Anterior</div>
              <div className="col-span-2 text-center">Kg</div>
              <div className="col-span-2 text-center">Reps</div>
              <div className="col-span-1 text-center">Rir</div>
              <div className="col-span-2 text-right">Listo</div>
            </div>

            {/* Sets Rows List */}
            <div className="space-y-1.5">
              {currentExercise.sets.map((set, sIdx) => (
                <ActiveSetRow
                  key={set.id}
                  set={set}
                  index={sIdx}
                  onUpdate={(up) => handleUpdateSet(activeExerciseIdx, sIdx, up)}
                  onToggleComplete={() => handleToggleSetComplete(activeExerciseIdx, sIdx)}
                  onDelete={() => handleDeleteSet(activeExerciseIdx, sIdx)}
                />
              ))}
            </div>

            {/* Add Set CTA Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleAddSet(activeExerciseIdx)}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-blue-500 bg-zinc-50 dark:bg-zinc-950/40 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Serie
              </button>
            </div>

            {/* Exercise Navigation Footer (Previous / Next) */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                disabled={activeExerciseIdx === 0}
                onClick={() => setActiveExerciseIdx((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-30 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <button
                type="button"
                disabled={activeExerciseIdx === workout.exercises.length - 1}
                onClick={() =>
                  setActiveExerciseIdx((prev) =>
                    Math.min(workout.exercises.length - 1, prev + 1)
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-30 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Floating High-Precision Rest Timer Bar */}
      <FloatingRestTimer
        active={restTimerState.active}
        initialSeconds={restTimerState.durationSec}
        triggerKey={restTimerState.triggerKey}
        onDismiss={() => setRestTimerState((prev) => ({ ...prev, active: false }))}
      />

      {/* Finish / Discard Workout Dialog */}
      <FinishWorkoutDialog
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirmFinish={handleConfirmFinish}
        onDiscard={handleDiscard}
        durationSec={elapsedSec}
        completedSetsCount={totalCompletedSets}
        totalVolumeKg={Math.round(totalVolumeKg)}
        submitting={submitting}
      />

      {/* Exercise Picker Modal for Adding on the fly */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAddExerciseFromPicker}
      />
    </div>
  );
}
