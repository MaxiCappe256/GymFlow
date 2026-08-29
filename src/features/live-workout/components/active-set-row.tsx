'use client';

import { useState } from 'react';
import type { SetDraft, SetType } from '@/types/workout';
import { Check, Trash2 } from 'lucide-react';

interface ActiveSetRowProps {
  set: SetDraft;
  index: number;
  onUpdate: (updatedSet: SetDraft) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

const SET_TYPE_LABELS: Record<SetType, { label: string; short: string; badgeClass: string }> = {
  NORMAL: {
    label: 'Normal',
    short: 'N',
    badgeClass: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
  },
  WARMUP: {
    label: 'Calentamiento',
    short: 'C',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  },
  DROPSET: {
    label: 'Drop Set',
    short: 'D',
    badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  },
  MYO_REPS: {
    label: 'Myo Reps',
    short: 'M',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  },
  FAILURE: {
    label: 'Al Fallo',
    short: 'F',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20',
  },
};

export function ActiveSetRow({
  set,
  index,
  onUpdate,
  onToggleComplete,
  onDelete,
}: ActiveSetRowProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const typeMeta = SET_TYPE_LABELS[set.setType] || SET_TYPE_LABELS.NORMAL;

  return (
    <div
      className={`grid grid-cols-12 items-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
        set.isCompleted
          ? 'bg-emerald-500/10 border border-emerald-500/20'
          : 'bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80'
      }`}
    >
      {/* Set Number & Type Toggle */}
      <div className="col-span-2 flex items-center gap-1 relative">
        <button
          type="button"
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-transform cursor-pointer active:scale-95 ${typeMeta.badgeClass}`}
          title={`Tipo de serie: ${typeMeta.label}`}
        >
          {set.setType === 'NORMAL' ? index + 1 : typeMeta.short}
        </button>

        {showTypeMenu && (
          <div
            className="absolute left-0 top-8 z-30 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
            onMouseLeave={() => setShowTypeMenu(false)}
          >
            {(Object.keys(SET_TYPE_LABELS) as SetType[]).map((typeKey) => (
              <button
                key={typeKey}
                type="button"
                onClick={() => {
                  onUpdate({ ...set, setType: typeKey });
                  setShowTypeMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ${
                  set.setType === typeKey
                    ? 'font-bold text-blue-600 dark:text-blue-400'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span>{SET_TYPE_LABELS[typeKey].label}</span>
                <span className="text-[10px] opacity-70">({SET_TYPE_LABELS[typeKey].short})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Previous Performance Reference */}
      <div className="col-span-3 text-center">
        {set.previousWeightKg !== undefined && set.previousReps !== undefined ? (
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
            {set.previousWeightKg}kg × {set.previousReps}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600 block">—</span>
        )}
      </div>

      {/* Weight (KG) Input */}
      <div className="col-span-2">
        <input
          type="number"
          step="0.5"
          min="0"
          max="999"
          value={set.weightKg === 0 ? '' : set.weightKg}
          placeholder="0"
          onChange={(e) =>
            onUpdate({
              ...set,
              weightKg: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
            })
          }
          className={`w-full text-center font-bold text-sm py-1 px-1 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
            set.isCompleted
              ? 'bg-white/60 dark:bg-zinc-900/60 border-emerald-500/30 text-zinc-900 dark:text-zinc-100'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
          }`}
        />
      </div>

      {/* Reps Input */}
      <div className="col-span-2">
        <input
          type="number"
          min="0"
          max="999"
          value={set.reps === 0 ? '' : set.reps}
          placeholder="0"
          onChange={(e) =>
            onUpdate({
              ...set,
              reps: e.target.value === '' ? 0 : parseInt(e.target.value) || 0,
            })
          }
          className={`w-full text-center font-bold text-sm py-1 px-1 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
            set.isCompleted
              ? 'bg-white/60 dark:bg-zinc-900/60 border-emerald-500/30 text-zinc-900 dark:text-zinc-100'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
          }`}
        />
      </div>

      {/* RIR (Reps in Reserve) Input */}
      <div className="col-span-1">
        <input
          type="number"
          min="0"
          max="5"
          value={set.rir ?? ''}
          placeholder="-"
          onChange={(e) =>
            onUpdate({
              ...set,
              rir: e.target.value === '' ? undefined : parseInt(e.target.value),
            })
          }
          className="w-full text-center text-xs py-1 px-0.5 rounded-lg border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500"
          title="RIR (Repeticiones en reserva: 0-4)"
        />
      </div>

      {/* Complete Checkbox & Actions */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onToggleComplete}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
            set.isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40'
              : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-zinc-500 hover:text-white'
          }`}
          title={set.isCompleted ? 'Desmarcar serie' : 'Marcar serie completada'}
        >
          <Check className={`w-4 h-4 stroke-[3] ${set.isCompleted ? 'scale-110' : 'scale-90'}`} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
          title="Eliminar serie"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
