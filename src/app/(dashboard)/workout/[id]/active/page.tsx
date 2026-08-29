import { notFound, redirect } from 'next/navigation';
import { getActiveWorkoutData } from '@/features/live-workout/server/workout-actions';
import { ActiveWorkoutRunner } from '@/features/live-workout/components/active-workout-runner';
import { getCurrentUser } from '@/lib/current-user';

interface ActiveWorkoutPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dayId?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ActiveWorkoutPage({
  params,
  searchParams,
}: ActiveWorkoutPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const { dayId } = await searchParams;

  const res = await getActiveWorkoutData({
    routineId: id,
    dayId,
  });

  if (!res.success || !res.data) {
    notFound();
  }

  return <ActiveWorkoutRunner initialState={res.data} />;
}
