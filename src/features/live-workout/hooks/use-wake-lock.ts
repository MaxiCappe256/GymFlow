'use client';

import { useEffect } from 'react';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
  released: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
}

export function useWakeLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    let sentinel: WakeLockSentinelLike | null = null;

    async function requestLock() {
      try {
        const nav = navigator as unknown as {
          wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
        };
        sentinel = await nav.wakeLock.request('screen');
      } catch {
        // WakeLock may be rejected if low battery or permission denied
      }
    }

    requestLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (sentinel && !sentinel.released) {
        sentinel.release().catch(() => {});
      }
    };
  }, [enabled]);
}
