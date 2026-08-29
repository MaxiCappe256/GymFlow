'use client';

import { useState, useEffect, useMemo } from 'react';
import { MuscleGroup } from '@prisma/client';
import { getExercises, createCustomExercise } from '../server/exercise-actions';
import { Search, Plus, X, Dumbbell } from 'lucide-react';

export interface ExerciseItem {
  id: string;
  name: string;
  description: string | null;
  targetMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  isCustom: boolean;
}

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseItem) => void;
}

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  CHEST: 'Pecho',
  BACK: 'Espalda',
  LEGS_QUADRICEPS: 'Cuádriceps',
  LEGS_HAMSTRINGS: 'Isquios',
  LEGS_CALVES: 'Gemelos',
  SHOULDERS: 'Hombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  CORE: 'Abdomen / Core',
  FULL_BODY: 'Cuerpo Completo',
};

export function ExercisePickerModal({
  isOpen,
  onClose,
  onSelect,
}: ExercisePickerModalProps) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'ALL'>('ALL');
  
  // Custom exercise inline creation state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>(MuscleGroup.CHEST);
  const [customDesc, setCustomDesc] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customError, setCustomError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalog() {
      setLoading(true);
      const res = await getExercises();
      if (res.success && res.data) {
        setExercises(res.data as ExerciseItem[]);
      }
      setLoading(false);
    }

    loadCatalog();
  }, [isOpen]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle =
        selectedMuscle === 'ALL' || ex.targetMuscle === selectedMuscle;
      const matchesSearch =
        search.trim() === '' ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.description && ex.description.toLowerCase().includes(search.toLowerCase()));
      return matchesMuscle && matchesSearch;
    });
  }, [exercises, selectedMuscle, search]);

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    setCreatingCustom(true);
    setCustomError('');

    const res = await createCustomExercise({
      name: customName.trim(),
      description: customDesc.trim() || undefined,
      targetMuscle: customMuscle,
    });

    if (res.success && res.data) {
      const created = res.data as ExerciseItem;
      setExercises((prev) => [created, ...prev]);
      onSelect(created);
      setShowCustomForm(false);
      setCustomName('');
      setCustomDesc('');
      onClose();
    } else {
      setCustomError(res.error || 'Failed to create exercise');
    }
    setCreatingCustom(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Seleccionar Ejercicio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Muscle Filters */}
        {!showCustomForm && (
          <div className="p-4 space-y-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Muscle Group Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedMuscle('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedMuscle === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Todos
              </button>
              {Object.entries(MUSCLE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMuscle(key as MuscleGroup)}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                    selectedMuscle === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise List or Custom Form */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {showCustomForm ? (
            <form onSubmit={handleCreateCustom} className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Nuevo Ejercicio Personalizado
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline cursor-pointer"
                >
                  Volver al catálogo
                </button>
              </div>

              {customError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
                  {customError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre del ejercicio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Peso Muerto con Barra Hexagonal"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Músculo principal *
                </label>
                <select
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {Object.entries(MUSCLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Notas / Consejos técnicos (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Foco en fase concéntrica explosiva"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={creatingCustom || !customName.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {creatingCustom ? 'Guardando...' : 'Guardar y Seleccionar'}
              </button>
            </form>
          ) : loading ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Cargando ejercicios...
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No se encontraron ejercicios.</p>
              <button
                type="button"
                onClick={() => {
                  setCustomName(search);
                  setShowCustomForm(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear &quot;{search || 'Ejercicio Personalizado'}&quot;
              </button>
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => {
                  onSelect(ex);
                  onClose();
                }}
                className="py-3 px-2 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/40 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {ex.name}
                    </span>
                    {ex.isCustom && (
                      <span className="px-1.5 py-0.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-semibold rounded border border-purple-500/20">
                        Personalizado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {MUSCLE_LABELS[ex.targetMuscle]}
                    </span>
                    {ex.description && (
                      <span className="text-xs text-zinc-500 truncate max-w-xs">
                        • {ex.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-600 text-zinc-500 dark:text-zinc-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {!showCustomForm && (
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {filteredExercises.length} ejercicios
            </span>
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-zinc-200 dark:border-transparent"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Crear Ejercicio Personalizado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
