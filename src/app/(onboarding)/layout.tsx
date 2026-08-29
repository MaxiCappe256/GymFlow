import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-base text-zinc-900 dark:text-zinc-100">
              GYM<span className="text-blue-600 dark:text-blue-500">FLOW</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {children}
      </main>
    </div>
  );
}
