'use client';

import { useState } from 'react';
import { usePWA } from '@/lib/pwa/use-pwa';
import { Download, X, Smartphone, Share, PlusSquare } from 'lucide-react';

export function InstallBanner() {
  const { isInstallable, isIOS, isStandalone, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // If already installed as standalone app or user closed banner
  if (isStandalone || dismissed) {
    return null;
  }

  // Case 1: Android / Chrome / Desktop native prompt
  if (isInstallable) {
    return (
      <aside
        aria-label="Install App"
        className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Instalar GymFlow
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Agregala a tu inicio para entrenar offline
            </p>
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

  // Case 2: iOS Safari Step-by-Step Guide
  if (isIOS) {
    return (
      <aside
        aria-label="Install App iOS"
        className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-2.5 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Instalá GymFlow en tu iPhone
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Para usarla como app nativa a pantalla completa:
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-2.5 space-y-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
              1
            </span>
            <span>Tocá el botón Compartir</span>
            <Share className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline shrink-0" />
            <span>en Safari</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
              2
            </span>
            <span>Elegí</span>
            <PlusSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline shrink-0" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">&quot;Agregar a inicio&quot;</span>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
