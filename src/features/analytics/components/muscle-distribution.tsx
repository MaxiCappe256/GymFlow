'use client';

import type { MuscleDistributionPoint } from '../server/stats-actions';
import { PieChart } from 'lucide-react';

interface MuscleDistributionProps {
  data: MuscleDistributionPoint[];
}

export function MuscleDistribution({ data }: MuscleDistributionProps) {
  const hasData = data.length > 0 && data.some((d) => d.sets > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Distribución por Grupo Muscular
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Proporción de series efectivas por músculo
        </p>
      </div>

      {!hasData ? (
        <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-xs text-zinc-400">
            Registrá tus entrenamientos para ver el balance de tu volumen muscular.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {data.slice(0, 7).map((item) => (
            <div key={item.muscleKey} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {item.muscle}
                </span>
                <span className="text-zinc-500 font-medium">
                  {item.sets} {item.sets === 1 ? 'serie' : 'series'} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, item.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
