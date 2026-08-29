'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GoalType, ExperienceLevel } from '@prisma/client';
import { generateAndSaveStarterRoutine } from '../server/onboarding-actions';
import {
  Sparkles,
  Dumbbell,
  Flame,
  Target,
  Shield,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const GOAL_OPTIONS: Array<{
  value: GoalType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'HYPERTROPHY',
    title: 'Ganancia Muscular (Hipertrofia)',
    desc: 'Maximizar el crecimiento muscular con rangos de 8-15 reps y volumen progresivo.',
    icon: Dumbbell,
  },
  {
    value: 'STRENGTH',
    title: 'Fuerza Máxima',
    desc: 'Incrementar marcas en levantamientos básicos (Press de Banca, Sentadilla, Peso Muerto).',
    icon: Flame,
  },
  {
    value: 'WEIGHT_LOSS',
    title: 'Pérdida de Grasa y Definición',
    desc: 'Mantener masa magra y acelerar el gasto calórico con alta densidad.',
    icon: Target,
  },
  {
    value: 'ENDURANCE',
    title: 'Resistencia y Acondicionamiento',
    desc: 'Mejorar capacidad cardiovascular, rendimiento funcional y recuperación.',
    icon: Shield,
  },
];

const EXPERIENCE_OPTIONS: Array<{
  value: ExperienceLevel;
  title: string;
  desc: string;
}> = [
  {
    value: 'BEGINNER',
    title: 'Principiante (< 1 año)',
    desc: 'Aprender técnicas correctas y aprovechar las adaptaciones iniciales rápidas.',
  },
  {
    value: 'INTERMEDIATE',
    title: 'Intermedio (1 a 3 años)',
    desc: 'Familiarizado con divisiones de torso/pierna o PPL y sobrecarga progresiva.',
  },
  {
    value: 'ADVANCED',
    title: 'Avanzado (+3 años)',
    desc: 'Manejo de autorregulación (RIR), volumen adaptativo y variantes complejas.',
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<GoalType>('HYPERTROPHY');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('BEGINNER');
  const [preferredDays, setPreferredDays] = useState<number>(3);
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const res = await generateAndSaveStarterRoutine({
        goal,
        experienceLevel,
        preferredDays,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
      });

      if (res.success) {
        router.push('/');
        router.refresh();
      } else {
        alert(res.error || 'Error al guardar la rutina.');
        setSubmitting(false);
      }
    } catch {
      alert('Error inesperado.');
      setSubmitting(false);
    }
  };

  // Preview division summary text
  const routineType =
    preferredDays <= 3
      ? 'Cuerpo Completo (Full Body 3 Días)'
      : preferredDays === 4
      ? 'Torso / Pierna (Upper-Lower 4 Días)'
      : 'Empuje / Tracción / Piernas (PPL 5-6 Días)';

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Progress Dots Bar */}
      <div className="flex items-center justify-between gap-2 px-2">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex-1 flex flex-col gap-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= num
                  ? 'bg-blue-600'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
            <span className="text-[10px] font-bold text-zinc-400">
              Paso {num}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Main Goal & Physical Data */}
      {step === 1 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>Asistente Inteligente</span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              ¿Cuál es tu objetivo principal?
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              GymFlow adaptará la selección de ejercicios y rangos de repeticiones a tu meta.
            </p>
          </div>

          <div className="space-y-2.5">
            {GOAL_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = goal === opt.value;

              return (
                <div
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-blue-500/10 dark:bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {opt.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Physical Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                Peso corporal (kg)
              </label>
              <input
                type="number"
                placeholder="ej. 75"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                placeholder="ej. 178"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Weekly Days & Experience */}
      {step === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Disponibilidad y Experiencia
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ¿Cuántos días por semana querés entrenar?
            </p>
          </div>

          {/* Days selector */}
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setPreferredDays(d)}
                className={`py-3.5 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                  preferredDays === d
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 font-black'
                    : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <span className="text-lg block">{d}</span>
                <span className="text-[10px] opacity-80 uppercase">Días</span>
              </button>
            ))}
          </div>

          {/* Experience level */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Nivel de experiencia
            </label>
            {EXPERIENCE_OPTIONS.map((opt) => {
              const isSelected = experienceLevel === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setExperienceLevel(opt.value)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-500/10 dark:bg-blue-600/15 border-blue-500 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <h4
                    className={`text-xs ${
                      isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {opt.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {opt.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Generar Rutina Recomendada</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Prescribed Routine Preview & Acceptance */}
      {step === 3 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Plan Personalizado Listo</span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {routineType}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Estructura adaptada para {preferredDays} días por semana con foco en {goal.toLowerCase()}.
            </p>
          </div>

          {/* Routine Specs Breakdown */}
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{preferredDays} Sesiones semanales de 45-60 min</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ejercicios básicos multiarticulares + accesorios de aislamiento</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Sobrecarga progresiva lineal con RIR 1-2</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
            * Podrás editar los ejercicios, series y días en cualquier momento desde la sección Rutinas.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handlePrev}
              className="py-3.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleFinish}
              className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Creando tu rutina...' : 'COMENZAR A ENTRENAR'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
