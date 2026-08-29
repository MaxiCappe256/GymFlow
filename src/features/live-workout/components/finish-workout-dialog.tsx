'use client';

import { useState } from 'react';
import { Trophy, Clock, Dumbbell, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface FinishWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFinish: (notes?: string) => Promise<void>;
  onDiscard: () => void;
  durationSec: number;
  completedSetsCount: number;
  totalVolumeKg: number;
  submitting: boolean;
}

export function FinishWorkoutDialog({
  isOpen,
  onClose,
  onConfirmFinish,
  onDiscard,
  durationSec,
  completedSetsCount,
  totalVolumeKg,
  submitting,
}: FinishWorkoutDialogProps) {
  const [notes, setNotes] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  if (!isOpen) return null;

  const minutes = Math.floor(durationSec / 60);
  const hours = Math.floor(minutes / 60);
  const formattedDuration =
    hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes} min`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
        {!showDiscardConfirm ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Finalizar Entrenamiento
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    ¡Gran trabajo! Revisá el resumen de tu sesión
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI stats preview */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-center">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 block">
                  {formattedDuration}
                </span>
                <span className="text-[10px] text-zinc-500">Duración</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 block">
                  {completedSetsCount}
                </span>
                <span className="text-[10px] text-zinc-500">Series</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-center">
                <Dumbbell className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 block">
                  {totalVolumeKg} kg
                </span>
                <span className="text-[10px] text-zinc-500">Volumen</span>
              </div>
            </div>

            {/* Session Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Notas de la sesión (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej. Muy buena congestión en pecho, subí 2.5kg en press de banca."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => onConfirmFinish(notes)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Guardando sesión...' : 'GUARDAR Y FINALIZAR'}
              </button>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer text-center"
                >
                  Continuar entrenando
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowDiscardConfirm(true)}
                  className="py-2 text-xs font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Descartar
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Discard Confirmation Step */
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ¿Descartar este entrenamiento?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Se perderán las series registradas en esta sesión y no se guardará en tu historial.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Volver
              </button>

              <button
                type="button"
                onClick={onDiscard}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-red-600/20"
              >
                Sí, descartar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
