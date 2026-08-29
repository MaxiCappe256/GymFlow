import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRoutineById } from '@/features/routines/server/routine-actions';
import {
  Play,
  Edit3,
  Calendar,
  Dumbbell,
  Timer,
  ArrowLeft,
} from 'lucide-react';

interface RoutineDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function RoutineDetailPage({ params }: RoutineDetailPageProps) {
  const { id } = await params;
  const res = await getRoutineById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const routine = res.data;

  return (
    <div className="space-y-6">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/routines"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Todas las rutinas
        </Link>
        <Link
          href={`/routines/${routine.id}/edit`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-xl transition-colors shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Editar
        </Link>
      </div>

      {/* Routine Banner Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div>
          <span className="inline-block px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full mb-2">
            {routine.methodology.replace(/_/g, ' ')}
          </span>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{routine.name}</h1>
          {routine.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {routine.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{routine.days.length} Días de Entrenamiento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              {routine.days.reduce((acc, d) => acc + d.exercises.length, 0)} Ejercicios Totales
            </span>
          </div>
        </div>
      </div>

      {/* Days Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Estructura de la Rutina</h2>

        <div className="space-y-4">
          {routine.days.map((day) => (
            <div
              key={day.id}
              className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{day.name}</h3>
                  <span className="text-xs text-zinc-500">
                    {day.restDay ? 'Día de descanso y recuperación' : `${day.exercises.length} Ejercicios planificados`}
                  </span>
                </div>

                {!day.restDay && (
                  <Link
                    href={`/workout/${routine.id}/active?dayId=${day.id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    ENTRENAR ESTE DÍA
                  </Link>
                )}
              </div>

              {/* Day Exercises List */}
              {day.restDay ? (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  Recuperación activa o descanso total. Mantenete hidratado y priorizá la nutrición.
                </div>
              ) : day.exercises.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  No hay ejercicios agregados en este día.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {day.exercises.map((item, idx) => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.exercise.name}
                          </h4>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {item.exercise.targetMuscle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-zinc-700 dark:text-zinc-300 pl-9 sm:pl-0">
                        <span className="bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          {item.targetSets} Series × {item.targetRepsMin}-{item.targetRepsMax} Reps
                        </span>
                        {item.targetRir !== null && (
                          <span className="bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                            RIR {item.targetRir}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                          <Timer className="w-3.5 h-3.5" />
                          {item.restTimeSec}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
