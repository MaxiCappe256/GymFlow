import { getCurrentUserProfile, logoutUser } from '@/features/auth/server/auth-actions';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import {
  Mail,
  Shield,
  Dumbbell,
  Trophy,
  Flame,
  LogOut,
  Settings,
  SunMoon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect('/login');
  }

  const profile = user.profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Perfil del Atleta
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configuración de cuenta y preferencias de entrenamiento
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30">
            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {user.name || 'Atleta GymFlow'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>{user.email}</span>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                <Shield className="w-3 h-3" />
                {profile?.experienceLevel === 'BEGINNER'
                  ? 'PRINCIPIANTE'
                  : profile?.experienceLevel === 'INTERMEDIATE'
                  ? 'INTERMEDIO'
                  : 'AVANZADO / PRO'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 block">
            {user._count.routines}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Rutinas</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 block">
            {user._count.workoutLogs}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Sesiones</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 block">
            {user._count.personalRecords}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Récords (PRs)</span>
        </div>
      </div>

      {/* Preferences & Configuration */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Configuración y Apariencia
        </h3>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunMoon className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Tema de la aplicación</span>
            </div>
            <ThemeToggle />
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Objetivo principal</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {profile?.goal === 'HYPERTROPHY'
                ? 'Hipertrofia (Masa Muscular)'
                : profile?.goal === 'STRENGTH'
                ? 'Fuerza'
                : profile?.goal === 'ENDURANCE'
                ? 'Resistencia'
                : 'Pérdida de Grasa'}
            </span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Días por semana</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{profile?.preferredDays ?? 4} Días</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Sonido de descanso</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Activado</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Vibración al finalizar serie</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Activada</span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <form action={logoutUser} className="pt-2">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-900 hover:bg-red-500/10 border border-zinc-200 dark:border-zinc-800 hover:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión en GymFlow
        </button>
      </form>
    </div>
  );
}
