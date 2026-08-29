'use client';

import Link from 'next/link';
import { Trophy, Clock, Dumbbell, CheckCircle2, ArrowRight, Home } from 'lucide-react';
import type { SetType } from '@/types/workout';

interface WorkoutSummaryViewProps {
  summary: {
    session: {
      id: string;
      name: string;
      startedAt: Date;
      endedAt: Date | null;
      durationSec: number;
      totalVolumeKg: number;
      notes: string | null;
    };
    exercises: {
      exerciseName: string;
      targetMuscle: string;
      totalExerciseVolume: number;
      sets: {
        id: string;
        setNumber: number;
        setType: SetType;
        weightKg: number;
        reps: number;
        rir: number | null;
        isCompleted: boolean;
      }[];
    }[];
    totalSetsCount: number;
  };
}

export function WorkoutSummaryView({ summary }: WorkoutSummaryViewProps) {
  const { session, exercises, totalSetsCount } = summary;

  const minutes = Math.floor(session.durationSec / 60);
  const hours = Math.floor(minutes / 60);
  const formattedDuration =
    hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes} min`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-200">
      {/* Celebration Header */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-zinc-900 dark:from-blue-900/50 dark:via-zinc-900 dark:to-zinc-950 border border-blue-400/30 dark:border-blue-500/30 rounded-3xl p-6 sm:p-8 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-lg shadow-black/20">
          <Trophy className="w-8 h-8 text-amber-300 fill-amber-300" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          ¡Entrenamiento Completado!
        </h1>
        <p className="text-xs text-blue-100/90 dark:text-zinc-300 mt-1 max-w-sm mx-auto">
          {session.name} • Sesión registrada con éxito
        </p>

        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center shadow-xs">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 block">
            {formattedDuration}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Tiempo Total
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 block">
            {totalSetsCount}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Series Hechas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center shadow-xs">
          <Dumbbell className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 block">
            {session.totalVolumeKg} kg
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Volumen Total
          </span>
        </div>
      </div>

      {/* Session Notes if any */}
      {session.notes && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Notas de la sesión
          </span>
          <p className="text-xs text-zinc-800 dark:text-zinc-200 italic">
            &quot;{session.notes}&quot;
          </p>
        </div>
      )}

      {/* Exercises Breakdown */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Detalle por Ejercicio ({exercises.length})
        </h2>

        <div className="space-y-3">
          {exercises.map((ex, idx) => (
            <div
              key={ex.exerciseName + idx}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {ex.exerciseName}
                  </h3>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    {ex.targetMuscle}
                  </span>
                </div>
                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                  {Math.round(ex.totalExerciseVolume)} kg
                </span>
              </div>

              {/* Set chips list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ex.sets.map((s, sIdx) => (
                  <div
                    key={s.id || sIdx}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-center text-xs font-semibold"
                  >
                    <span className="text-[10px] text-zinc-400 block mb-0.5">
                      Serie {s.setNumber}
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {s.weightKg}kg × {s.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
        <Link
          href="/"
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Volver al Inicio
        </Link>

        <Link
          href="/routines"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition-colors"
        >
          <span>Ver Rutinas</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
