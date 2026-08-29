import Link from 'next/link';
import { Dumbbell, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function TopHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-3 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-base text-zinc-900 dark:text-zinc-100">
              GYM<span className="text-blue-600 dark:text-blue-500">FLOW</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Asistente IA</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
