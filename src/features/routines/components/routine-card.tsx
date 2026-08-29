'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Methodology, MuscleGroup } from '@prisma/client';
import { deleteRoutine } from '../server/routine-actions';
import { Play, Edit3, Trash2, Calendar, Dumbbell, MoreVertical } from 'lucide-react';

interface RoutineExerciseSummary {
  id: string;
  orderIndex: number;
  targetSets: number;
  exercise: {
    name: string;
    targetMuscle: MuscleGroup;
  };
}

interface RoutineDaySummary {
  id: string;
  dayIndex: number;
  name: string;
  restDay: boolean;
  exercises: RoutineExerciseSummary[];
}

export interface RoutineCardData {
  id: string;
  name: string;
  description: string | null;
  methodology: Methodology;
  updatedAt: Date;
  days: RoutineDaySummary[];
}

const METHODOLOGY_LABELS: Record<Methodology, { label: string; color: string }> = {
  PUSH_PULL_LEGS: { label: 'Empuje / Tracción / Piernas (PPL)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  UPPER_LOWER: { label: 'Torso / Pierna', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  WEIDER: { label: 'División Weider', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  FULL_BODY: { label: 'Cuerpo Completo (Full Body)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  HEAVY_DUTY: { label: 'Heavy Duty / HIT', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  CUSTOM: { label: 'Personalizada', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

export function RoutineCard({ routine }: { routine: RoutineCardData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalExercises = routine.days.reduce(
    (acc, day) => acc + (day.restDay ? 0 : day.exercises.length),
    0
  );

  const activeDays = routine.days.filter((d) => !d.restDay);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`¿Estás seguro de que querés eliminar "${routine.name}"?`)) return;

    setIsDeleting(true);
    await deleteRoutine(routine.id);
    setIsDeleting(false);
  };

  const methodMeta = METHODOLOGY_LABELS[routine.methodology] || METHODOLOGY_LABELS.CUSTOM;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-200 shadow-sm dark:shadow-lg dark:shadow-black/20 flex flex-col justify-between relative group">
      <div>
        {/* Header Badge & Action Menu */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${methodMeta.color}`}
          >
            {methodMeta.label}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Opciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 w-36 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-1 text-xs animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  href={`/routines/${routine.id}/edit`}
                  className="flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Rutina
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 w-full text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Routine Name & Description */}
        <Link href={`/routines/${routine.id}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">{routine.name}</h3>
        </Link>
        {routine.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
            {routine.description}
          </p>
        )}

        {/* Days & Exercise Breakdown */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-5 py-2 border-y border-zinc-200 dark:border-zinc-800/60">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>{routine.days.length} Días</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>{totalExercises} Ejercicios</span>
          </div>
        </div>

        {/* Days Chips Preview */}
        <div className="space-y-1.5 mb-5">
          {routine.days.map((day) => (
            <div
              key={day.id}
              className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/50"
            >
              <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                {day.name}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {day.restDay ? 'Descanso' : `${day.exercises.length} ej.`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA: Start First Active Day */}
      {activeDays.length > 0 && (
        <Link
          href={`/workout/${routine.id}/active?dayId=${activeDays[0].id}`}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          ENTRENAR
        </Link>
      )}
    </div>
  );
}
