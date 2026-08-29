'use client';

import { usePWA } from '@/lib/pwa/use-pwa';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-zinc-950 text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 backdrop-blur-sm animate-in slide-in-from-top duration-300">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo sin conexión — Los cambios se guardan localmente</span>
    </div>
  );
}
