import { notFound } from 'next/navigation';
import { getRoutineById } from '@/features/routines/server/routine-actions';
import { RoutineForm } from '@/features/routines/components/routine-form';

interface EditRoutinePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EditRoutinePage({ params }: EditRoutinePageProps) {
  const { id } = await params;
  const res = await getRoutineById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const routine = res.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Editar Rutina
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Modificá los días, ejercicios, series objetivo y parámetros para {routine.name}
        </p>
      </div>

      <RoutineForm initialData={routine} isEditMode={true} />
    </div>
  );
}
