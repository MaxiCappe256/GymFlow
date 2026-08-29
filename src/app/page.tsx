import Link from 'next/link';
import { getRoutines } from '@/features/routines/server/routine-actions';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import {
  Play,
  Dumbbell,
  Sparkles,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const res = await getRoutines();
  const routines = res.success && res.data ? res.data : [];

  const firstActiveRoutine = routines[0];
  const firstActiveDay = firstActiveRoutine?.days?.find((d) => !d.restDay);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <TopHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 pb-24 space-y-6">
        {/* Hero "Start Training" Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-zinc-900 dark:from-blue-900/40 dark:via-zinc-900 dark:to-zinc-950 border border-blue-400/30 dark:border-blue-500/30 rounded-3xl p-6 shadow-2xl shadow-blue-950/20 dark:shadow-blue-950/40">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 dark:bg-blue-500/20 border border-white/20 dark:border-blue-500/30 text-white dark:text-blue-400 text-xs font-bold rounded-full backdrop-blur-xs">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>LISTO PARA ENTRENAR</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {firstActiveDay
                  ? `${firstActiveDay.name}`
                  : 'Iniciar Entrenamiento'}
              </h1>
              <p className="text-xs text-blue-100/80 dark:text-zinc-400 max-w-md">
                {firstActiveRoutine
                  ? `De la rutina: ${firstActiveRoutine.name} (${firstActiveDay?.exercises.length ?? 0} ejercicios)`
                  : 'Modo de entrenamiento en vivo sin distracciones con temporizador y registro de series.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {firstActiveRoutine && firstActiveDay ? (
                <Link
                  href={`/workout/${firstActiveRoutine.id}/active?dayId=${firstActiveDay.id}`}
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white text-sm font-black tracking-wide shadow-lg shadow-black/20 dark:shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  EMPEZAR ENTRENAMIENTO DE HOY
                </Link>
              ) : (
                <Link
                  href="/workout/quick-start"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white text-sm font-black tracking-wide shadow-lg shadow-black/20 dark:shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  SESIÓN RÁPIDA
                </Link>
              )}

              <Link
                href="/routines"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-white/20 dark:border-zinc-800 text-white dark:text-zinc-300 text-xs font-semibold backdrop-blur-xs transition-colors"
              >
                <Dumbbell className="w-4 h-4 text-white dark:text-blue-400" />
                Elegir otra rutina
              </Link>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Racha</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-500 dark:text-amber-400">4</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">sem.</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Esta semana</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">3/4</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">días</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Volumen</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">14.2k</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">kg</span>
            </div>
          </div>
        </div>

        {/* Routines Shortcut Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Rutinas Activas
            </h2>
            <Link
              href="/routines"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold flex items-center gap-1"
            >
              Ver todas ({routines.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {routines.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 text-center space-y-3 shadow-xs">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Todavía no tenés ninguna rutina creada.
              </p>
              <Link
                href="/routines/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Crear tu primera rutina
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {routines.slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  href={`/routines/${r.id}`}
                  className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 rounded-xl p-4 transition-colors group shadow-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {r.name}
                    </h4>
                    <span className="text-xs text-zinc-500">
                      {r.days.length} Días • {r.methodology.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Guided Wizard Card for Beginners */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Asistente de Rutinas</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
              ¿Buscás un plan estructurado?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              Respondé 4 preguntas simples y GymFlow te sugerirá la división óptima para tus objetivos y disponibilidad.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="shrink-0 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700/60 shadow-xs"
          >
            Iniciar Asistente
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
