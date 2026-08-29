'use client';

import { useEffect, useState, useRef } from 'react';
import { Timer, Plus, Minus, SkipForward, Play, Pause } from 'lucide-react';
import { playRestCompleteTone, triggerRestCompleteVibration } from '../utils/audio-cue';

interface FloatingRestTimerProps {
  initialSeconds: number;
  active: boolean;
  onDismiss: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  triggerKey?: string | number;
}

function FloatingRestTimerInner({
  durationSec,
  onDismiss,
  soundEnabled = true,
  vibrationEnabled = true,
}: {
  durationSec: number;
  onDismiss: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}) {
  const [totalSeconds, setTotalSeconds] = useState(durationSec);
  const [remaining, setRemaining] = useState(durationSec);
  const [isPaused, setIsPaused] = useState(false);
  const endTimestampRef = useRef<number | null>(null);
  const soundFiredRef = useRef<boolean>(false);

  useEffect(() => {
    endTimestampRef.current = Date.now() + durationSec * 1000;
    soundFiredRef.current = false;

    const interval = setInterval(() => {
      if (isPaused || endTimestampRef.current === null) return;

      const diffMs = endTimestampRef.current - Date.now();
      const secondsLeft = Math.max(0, Math.ceil(diffMs / 1000));

      setRemaining(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (!soundFiredRef.current) {
          soundFiredRef.current = true;
          if (soundEnabled) playRestCompleteTone();
          if (vibrationEnabled) triggerRestCompleteVibration();
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [durationSec, isPaused, soundEnabled, vibrationEnabled]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 100;
  const isFinished = remaining === 0;

  const handleAdjust = (deltaSec: number) => {
    const newRemaining = Math.max(5, remaining + deltaSec);
    const newTotal = Math.max(newRemaining, totalSeconds + (deltaSec > 0 ? deltaSec : 0));
    setTotalSeconds(newTotal);
    setRemaining(newRemaining);
    endTimestampRef.current = Date.now() + newRemaining * 1000;
    soundFiredRef.current = false;
  };

  const togglePause = () => {
    if (isPaused) {
      endTimestampRef.current = Date.now() + remaining * 1000;
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  return (
    <aside
      aria-label="Rest Timer"
      className={`fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-bottom ${
        isFinished
          ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/40 animate-pulse'
          : 'bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
      }`}
    >
      {/* Progress Bar Top Edge */}
      {!isFinished && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Left: Timer Display */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              isFinished
                ? 'bg-white text-emerald-600'
                : 'bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20'
            }`}
          >
            <Timer className="w-5 h-5 animate-spin-slow" />
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-2xl tracking-tight font-mono">
                {formattedTime}
              </span>
              <span className="text-[11px] font-semibold opacity-75">
                {isFinished ? '¡A entrenar!' : 'Descanso'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls (+15s, -15s, Pause, Skip) */}
        <div className="flex items-center gap-1.5">
          {!isFinished && (
            <>
              <button
                type="button"
                onClick={() => handleAdjust(-15)}
                disabled={remaining <= 15}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Restar 15 segundos"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjust(15)}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Sumar 15 segundos"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={togglePause}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title={isPaused ? 'Reanudar' : 'Pausar'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              isFinished
                ? 'bg-white text-emerald-700 hover:bg-zinc-100'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>{isFinished ? 'Listo' : 'Saltar'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function FloatingRestTimer({
  initialSeconds,
  active,
  onDismiss,
  soundEnabled = true,
  vibrationEnabled = true,
  triggerKey,
}: FloatingRestTimerProps) {
  if (!active) return null;

  return (
    <FloatingRestTimerInner
      key={triggerKey !== undefined ? String(triggerKey) : String(initialSeconds)}
      durationSec={initialSeconds}
      onDismiss={onDismiss}
      soundEnabled={soundEnabled}
      vibrationEnabled={vibrationEnabled}
    />
  );
}
