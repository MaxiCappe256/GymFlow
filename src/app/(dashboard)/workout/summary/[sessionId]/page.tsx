import { notFound, redirect } from 'next/navigation';
import { getWorkoutSummary } from '@/features/live-workout/server/workout-actions';
import { WorkoutSummaryView } from '@/features/live-workout/components/workout-summary-view';
import { getCurrentUser } from '@/lib/current-user';

interface WorkoutSummaryPageProps {
  params: Promise<{ sessionId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function WorkoutSummaryPage({ params }: WorkoutSummaryPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { sessionId } = await params;
  const res = await getWorkoutSummary(sessionId);

  if (!res.success || !res.data) {
    notFound();
  }

  return <WorkoutSummaryView summary={res.data} />;
}
