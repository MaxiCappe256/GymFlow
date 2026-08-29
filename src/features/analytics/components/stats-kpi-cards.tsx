'use client';

import { Dumbbell, Flame, Trophy, Layers } from 'lucide-react';

interface StatsKpiCardsProps {
  totalWorkouts: number;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  totalPrs: number;
}

export function StatsKpiCards({
  totalWorkouts,
  totalVolumeKg,
  totalSetsCompleted,
  totalPrs,
}: StatsKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
          <Flame className="w-4 h-4" />
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Sesiones
          </span>
        </div>
        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 block">
          {totalWorkouts}
        </span>
        <span className="text-[10px] text-zinc-400">Entrenamientos totales</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
          <Dumbbell className="w-4 h-4" />
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Volumen Total
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {totalVolumeKg > 1000 ? `${(totalVolumeKg / 1000).toFixed(1)}k` : totalVolumeKg}
          </span>
          <span className="text-xs text-zinc-500 font-bold">kg</span>
        </div>
        <span className="text-[10px] text-zinc-400">Carga mecánica movida</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
          <Layers className="w-4 h-4" />
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Series Totales
          </span>
        </div>
        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 block">
          {totalSetsCompleted}
        </span>
        <span className="text-[10px] text-zinc-400">Series efectivas</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-amber-500">
          <Trophy className="w-4 h-4" />
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Récords (PRs)
          </span>
        </div>
        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 block">
          {totalPrs}
        </span>
        <span className="text-[10px] text-zinc-400">Marcas superadas</span>
      </div>
    </div>
  );
}
