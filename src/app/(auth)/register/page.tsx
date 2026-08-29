'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/features/auth/server/auth-actions';
import { ExperienceLevel } from '@prisma/client';
import { UserPlus, Mail, Lock, User, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

const EXPERIENCE_OPTIONS: Array<{
  value: ExperienceLevel;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'BEGINNER',
    title: 'Principiante',
    desc: 'Asistente guiado con recomendaciones de rutinas',
    icon: Sparkles,
  },
  {
    value: 'INTERMEDIATE',
    title: 'Intermedio',
    desc: 'Familiarizado con divisiones y sobrecarga progresiva',
    icon: Zap,
  },
  {
    value: 'ADVANCED',
    title: 'Avanzado / Pro',
    desc: 'Gestor directo, divisiones personalizadas sin fricción',
    icon: ShieldCheck,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('BEGINNER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completá todos los campos requeridos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await registerUser({
      email,
      password,
      name: name || undefined,
      experienceLevel,
    });

    if (res.success) {
      if (experienceLevel === 'BEGINNER') {
        router.push('/onboarding');
      } else {
        router.push('/routines');
      }
      router.refresh();
    } else {
      setError(res.error || 'Error al crear la cuenta.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Creá tu cuenta</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Empezá a registrar tus entrenamientos sin fricción
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Nombre completo (Opcional)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Lucas Gómez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Correo electrónico *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="atleta@gymflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Contraseña (Mínimo 6 caracteres) *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Experience Level Profile Picker */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Perfil de Experiencia
          </label>
          <div className="space-y-2">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = experienceLevel === opt.value;

              return (
                <div
                  key={opt.value}
                  onClick={() => setExperienceLevel(opt.value)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-500/10 dark:bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {opt.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer mt-4"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          ¿Ya tenés una cuenta?{' '}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-0.5"
          >
            Iniciar sesión
            <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
