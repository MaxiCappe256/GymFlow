'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { WeeklyVolumePoint } from '../server/stats-actions';
import { TrendingUp } from 'lucide-react';

interface VolumeChartProps {
  data: WeeklyVolumePoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: WeeklyVolumePoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-xl text-xs space-y-1">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
          {data.weekLabel}
        </span>
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
          <span>{data.volumeKg.toLocaleString()} kg</span>
        </div>
        <span className="text-[11px] text-zinc-500 block">
          {data.sessionCount} {data.sessionCount === 1 ? 'sesión' : 'sesiones'}
        </span>
      </div>
    );
  }
  return null;
}

export function VolumeChart({ data }: VolumeChartProps) {
  const hasData = data.some((d) => d.volumeKg > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Evolución de Volumen Semanal
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Carga total movida en kg por semana
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-xs text-zinc-400">
            Aún no hay suficientes entrenamientos para generar la curva de volumen.
          </p>
          <span className="text-[11px] text-zinc-500 mt-1">
            Completá tus sesiones en vivo para ver tu progresión.
          </span>
        </div>
      ) : (
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="weekLabel"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} />
              <Bar
                dataKey="volumeKg"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
