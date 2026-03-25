'use client';

import { CalendarDays, Globe2, Moon, ShieldCheck, Sparkles, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTheme } from '../context/ThemeContext';
import { dashboardBranding } from '../config/branding';
import OptimizedLogo from './OptimizedLogo';

interface DashboardShellHeaderProps {
  title: string;
  subtitle?: string;
}

export default function DashboardShellHeader({
  title,
  subtitle = 'Workspace autenticado',
}: DashboardShellHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-shell-header relative overflow-hidden rounded-[2.2rem] px-5 py-5 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_34%)]" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="hidden rounded-[1.65rem] border border-white/60 bg-white/80 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/6 dark:bg-white/[0.03] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] lg:inline-flex">
            <OptimizedLogo href="/dashboard" size={40} showText={false} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="app-shell-chip">
                <ShieldCheck className="h-3.5 w-3.5" />
                {subtitle}
              </span>
              <span className="app-shell-chip">
                <Sparkles className="h-3.5 w-3.5" />
                Pronto para venda
              </span>
            </div>

            <div className="mt-4">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="truncate text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white md:text-[1.7rem]">
                  {title}
                </h1>
                <span className="hidden text-sm text-slate-500 dark:text-slate-400 xl:inline-flex">
                  {dashboardBranding.shellSubtitle}
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Shell executivo com navegacao protegida, leitura comercial clara e base pronta para evolucao por modulo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <div className="dashboard-surface-muted flex min-w-[11.5rem] items-start gap-3 px-4 py-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/14 dark:text-emerald-300">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <div className="app-shell-section-title">Operacao</div>
              <div className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                Publica e autenticada
              </div>
            </div>
          </div>

          <div className="dashboard-surface-muted px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" />
              Hoje
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
              {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:text-white"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
