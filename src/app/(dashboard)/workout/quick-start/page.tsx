import { redirect } from 'next/navigation';
import { getActiveWorkoutData } from '@/features/live-workout/server/workout-actions';
import { ActiveWorkoutRunner } from '@/features/live-workout/components/active-workout-runner';
import { getCurrentUser } from '@/lib/current-user';

export const dynamic = 'force-dynamic';

export default async function QuickStartWorkoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const res = await getActiveWorkoutData({});

  if (!res.success || !res.data) {
    redirect('/');
  }

  return <ActiveWorkoutRunner initialState={res.data} />;
}
