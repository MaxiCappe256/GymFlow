import { getStatsOverview } from '@/features/analytics/server/stats-actions';
import { StatsKpiCards } from '@/features/analytics/components/stats-kpi-cards';
import { VolumeChart } from '@/features/analytics/components/volume-chart';
import { MuscleDistribution } from '@/features/analytics/components/muscle-distribution';
import { OneRepMaxChart } from '@/features/analytics/components/one-rep-max-chart';
import { PersonalRecordsTable } from '@/features/analytics/components/personal-records-table';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const res = await getStatsOverview();

  if (!res.success || !res.data) {
    return (
      <div className="p-6 text-center text-red-500">
        Ocurrió un error al cargar las estadísticas.
      </div>
    );
  }

  const data = res.data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Progreso y Métricas
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Seguimiento de sobrecarga progresiva, volumen mecánico y récords personales
        </p>
      </div>

      {/* KPI Overviews */}
      <StatsKpiCards
        totalWorkouts={data.totalWorkouts}
        totalVolumeKg={data.totalVolumeKg}
        totalSetsCompleted={data.totalSetsCompleted}
        totalPrs={data.personalRecords.length}
      />

      {/* Volume Load Progression */}
      <VolumeChart data={data.weeklyProgression} />

      {/* 1RM Strength Curve */}
      <OneRepMaxChart trends={data.exerciseTrends} />

      {/* Muscle Distribution Breakdown */}
      <MuscleDistribution data={data.muscleDistribution} />

      {/* Personal Records Table */}
      <PersonalRecordsTable records={data.personalRecords} />
    </div>
  );
}
