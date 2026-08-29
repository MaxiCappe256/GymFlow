'use client';

import { useState } from 'react';
import { usePWA } from '@/lib/pwa/use-pwa';
import { Download, X, Smartphone } from 'lucide-react';

export function InstallBanner() {
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || isStandalone || dismissed) {
    return null;
  }

  return (
    <aside aria-label="Install App" className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Instalar GymFlow</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Agregala a tu pantalla de inicio para registrar sin conexión</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={installApp}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
          aria-label="Cerrar aviso de instalación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
