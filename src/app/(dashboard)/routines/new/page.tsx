import { RoutineForm } from '@/features/routines/components/routine-form';

export default function NewRoutinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Crear Nueva Rutina
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configurá tu división de entrenamiento, ejercicios, series objetivo y tiempos de descanso
        </p>
      </div>

      <RoutineForm />
    </div>
  );
}
