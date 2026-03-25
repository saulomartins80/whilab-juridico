import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building,
  Clock3,
  Globe,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import KPICards from './KPICards';
import ChartsSection from './ChartsSection';
import TablesAndAlerts from './TablesAndAlerts';

interface DashboardStats {
  totalAnimais: number;
  receitaMensal: number;
  gmdMedio: number;
  precoArroba: number;
  alertasAtivos: number;
  producaoLeite: number;
  custosOperacionais: number;
  margemLucro: number;
  eficienciaReprodutiva: number;
  mortalidade: number;
}

const periodLabels = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mes',
  year: 'Ano',
} as const;

type UserShape = {
  fazenda?: string;
  fazenda_nome?: string;
  nome?: string;
  display_name?: string;
  location?: string;
  email?: string;
  user_metadata?: {
    fazenda_nome?: string;
    display_name?: string;
    location?: string;
  };
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export default function BovinextDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimais: 0,
    receitaMensal: 0,
    gmdMedio: 0,
    precoArroba: 0,
    alertasAtivos: 0,
    producaoLeite: 0,
    custosOperacionais: 0,
    margemLucro: 0,
    eficienciaReprodutiva: 0,
    mortalidade: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<keyof typeof periodLabels>('month');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getKPIs();
      if (response.success && response.data) {
        setStats((previous) => ({ ...previous, ...response.data }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const userData = (user ?? {}) as UserShape;
  const operationName =
    userData.fazenda ||
    userData.fazenda_nome ||
    userData.user_metadata?.fazenda_nome ||
    'Operacao demonstrativa';
  const userName =
    userData.nome ||
    userData.display_name ||
    userData.user_metadata?.display_name ||
    userData.email?.split('@')[0] ||
    'Administrador';
  const location = userData.location || userData.user_metadata?.location || 'Brasil';
  const selectedPeriodLabel = periodLabels[selectedPeriod];
  const operationInitial = operationName.trim().charAt(0).toUpperCase() || 'W';

  const executiveHighlights = [
    {
      label: 'Receita do periodo',
      value: currencyFormatter.format(stats.receitaMensal || 0),
      helper: 'Fluxo comercial consolidado',
      icon: BarChart3,
    },
    {
      label: 'Margem operacional',
      value: `${(stats.margemLucro || 0).toFixed(1)}%`,
      helper: 'Qualidade da entrega e eficiencia',
      icon: Sparkles,
    },
    {
      label: 'Alertas em foco',
      value: `${stats.alertasAtivos || 0}`,
      helper: 'Itens que pedem acao imediata',
      icon: TriangleAlert,
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <AnimatePresence mode="wait">
        <motion.section
          key={selectedPeriod}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="dashboard-surface relative overflow-hidden p-5 sm:p-6 lg:p-7"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_28%)]" />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/12" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`app-shell-chip ${
                    isOnline
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isOnline ? 'online' : 'sem conexao'}
                </span>
                <span className="app-shell-chip">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  camada executiva
                </span>
                <span className="app-shell-chip">
                  <Clock3 className="h-3.5 w-3.5" />
                  {selectedPeriodLabel}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-emerald-500 via-emerald-500 to-sky-500 text-2xl font-bold text-white shadow-[0_28px_70px_rgba(16,185,129,0.28)]">
                  {operationInitial}
                </div>

                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
                    control tower
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl lg:text-[2.15rem]">
                    {operationName}
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                    Painel executivo com leitura operacional, comercial e financeira em um shell unico.
                    O objetivo aqui e dar cara de produto vendavel, nao de template generico.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  {location}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-500" />
                  Responsavel: {userName}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Sync automatica a cada 30s
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(periodLabels).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedPeriod(value as keyof typeof periodLabels)}
                    className={`dashboard-segment ${
                      selectedPeriod === value ? 'dashboard-segment-active' : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={loadDashboardData} className="app-shell-button-primary">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar dados
                </button>
                <Link href="/rebanho" className="dashboard-secondary-button">
                  Abrir rebanho
                </Link>
                <Link href="/manejo" className="dashboard-secondary-button">
                  Novo manejo
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {executiveHighlights.map(({ label, value, helper, icon: Icon }) => (
                <div key={label} className="dashboard-surface-soft p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        {label}
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                        {value}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {helper}
                      </p>
                    </div>

                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}

              <div className="dashboard-surface-soft p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Proximo passo
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                      Refinar dashboards derivados e paginas de operacao
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <section>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white lg:text-2xl">
                Indicadores da operacao
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Hierarquia visual mais limpa, leitura mais comercial e dark mode mais profundo.
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Atualizacao continua para o periodo: {selectedPeriodLabel}
          </div>
        </div>

        <KPICards stats={stats} loading={loading} />
      </section>

      <ChartsSection />
      <TablesAndAlerts />
    </div>
  );
}
