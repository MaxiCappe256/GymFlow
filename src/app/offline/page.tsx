'use client';

import Link from 'next/link';
import { WifiOff, Dumbbell, RotateCcw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 text-center transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 text-amber-500 shadow-md">
        <WifiOff className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">Estás sin conexión</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mb-8 leading-relaxed">
        ¡No te preocupes! GymFlow guarda tu entrenamiento localmente en tu dispositivo y se sincronizará automáticamente cuando recuperes la conexión.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25"
        >
          <Dumbbell className="w-4 h-4" />
          Continuar entrenamiento local
        </Link>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
          className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm transition-colors cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          Reintentar conexión
        </button>
      </div>
    </div>
  );
}
