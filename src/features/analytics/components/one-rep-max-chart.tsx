'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ExerciseTrend } from '../server/stats-actions';
import { Zap } from 'lucide-react';

interface OneRepMaxChartProps {
  trends: ExerciseTrend[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
      estimated1RM: number;
      weightKg: number;
      reps: number;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const pt = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-xl text-xs space-y-1">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{pt.date}</span>
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black">
          <span>1RM Estimado: {pt.estimated1RM} kg</span>
        </div>
        <span className="text-[11px] text-zinc-500 block">
          Basado en: {pt.weightKg} kg × {pt.reps} reps
        </span>
      </div>
    );
  }
  return null;
}

export function OneRepMaxChart({ trends }: OneRepMaxChartProps) {
  const [selectedExId, setSelectedExId] = useState<string>(
    trends.length > 0 ? trends[0].exerciseId : ''
  );

  const selectedTrend = trends.find((t) => t.exerciseId === selectedExId) || trends[0];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Progresión de Fuerza (1RM Estimado)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Cálculo mediante fórmula de Epley: Peso × (1 + Reps / 30)
          </p>
        </div>

        {trends.length > 1 && (
          <select
            value={selectedExId}
            onChange={(e) => setSelectedExId(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {trends.map((t) => (
              <option key={t.exerciseId} value={t.exerciseId}>
                {t.exerciseName}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedTrend || selectedTrend.points.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-xs text-zinc-400">
            Aún no hay suficientes registros de series pesadas para graficar 1RM.
          </p>
        </div>
      ) : (
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={selectedTrend.points}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="date"
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
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(val) => `${val}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="estimated1RM"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
