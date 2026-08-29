'use client';

import type { PersonalRecordItem } from '../server/stats-actions';
import { Trophy, Calendar } from 'lucide-react';

interface PersonalRecordsTableProps {
  records: PersonalRecordItem[];
}

export function PersonalRecordsTable({ records }: PersonalRecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-center shadow-xs">
        <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Sin récords personales todavía
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
          Completá tus entrenamientos registrando tus series para que GymFlow detecte automáticamente tus PRs.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Tabla de Récords Personales (PRs)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tus mejores marcas históricas calculadas y absolutas
          </p>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {records.map((pr) => {
          const dateFormatted = new Date(pr.achievedAt).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={pr.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {pr.exerciseName}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {pr.targetMuscle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  <span>Logrado el {dateFormatted}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-right">
                  <span className="text-[10px] text-zinc-400 block">1RM Estimado</span>
                  <span className="text-sm font-black text-amber-500">
                    {pr.oneRepMaxEst} kg
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-right">
                  <span className="text-[10px] text-zinc-400 block">Carga Máxima</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    {pr.maxWeightKg} kg
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
