import Link from 'next/link';
import { getRoutines } from '@/features/routines/server/routine-actions';
import { RoutineCard, type RoutineCardData } from '@/features/routines/components/routine-card';
import { Plus, Dumbbell, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const res = await getRoutines();
  const routines = (res.success && res.data ? res.data : []) as RoutineCardData[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Mis Rutinas
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gestioná tus divisiones de entrenamiento y ejercicios
          </p>
        </div>

        <Link
          href="/routines/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Rutina
        </Link>
      </div>

      {/* Routine Grid */}
      {routines.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <Dumbbell className="w-8 h-8" />
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-200">No hay rutinas todavía</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Creá tu rutina personalizada con series, rangos de repeticiones y temporizador de descanso, o utilizá el asistente guiado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/routines/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              Crear Rutina Personalizada
            </Link>
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-colors border border-zinc-200 dark:border-transparent"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Asistente Guiado
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      )}
    </div>
  );
}
