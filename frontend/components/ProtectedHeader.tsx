'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { dashboardBranding } from '../config/branding';
import OptimizedLogo from './OptimizedLogo';

interface ProtectedHeaderProps {
  title: string;
  subtitle?: string;
}

export default function ProtectedHeader({ title, subtitle = 'Workspace autenticado' }: ProtectedHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full">
      <div className="app-shell-header mx-auto flex h-16 max-w-[1520px] items-center justify-between gap-4 border-b border-slate-200/70 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <OptimizedLogo
            href="/dashboard"
            size={38}
            showText
            gapClassName="gap-3"
            textClassName="hidden text-[17px] tracking-tight sm:inline-flex"
          />
          <span className="hidden text-[11px] text-slate-500 dark:text-slate-400 lg:inline-flex">
            {dashboardBranding.shellSubtitle}
          </span>
        </div>

        <div className="hidden min-w-0 flex-1 px-6 lg:block">
          <div className="flex items-center gap-3">
            <span className="app-shell-chip">{subtitle}</span>
            <h1 className="truncate text-sm font-semibold text-slate-950 dark:text-white">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 lg:inline-flex">
            Dashboard protegido
          </span>

          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
