import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Globe, RefreshCw, BarChart3 } from 'lucide-react';

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
  week: 'Esta semana',
  month: 'Este mês',
  year: 'Este ano',
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
        setStats((prev) => ({ ...prev, ...response.data }));
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

  const handleRefresh = () => {
    loadDashboardData();
  };

  const userData = (user ?? {}) as UserShape;
  const operationName = userData.fazenda || userData.fazenda_nome || userData.user_metadata?.fazenda_nome || 'Operação demonstrativa';
  const userName = userData.nome || userData.display_name || userData.user_metadata?.display_name || userData.email?.split('@')[0] || 'Administrador';
  const location = userData.location || userData.user_metadata?.location || 'Brasil';
  const selectedPeriodLabel = periodLabels[selectedPeriod];
  const operationInitial = operationName.trim().charAt(0).toUpperCase() || 'B';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <main className="relative px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-[1600px] space-y-6 lg:space-y-8"
          >
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bovinext-shell relative overflow-hidden p-5 sm:p-6"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_30%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`bovinext-pill ${isOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                      <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isOnline ? 'Online' : 'Sem conexão'}
                    </span>
                    <span className="bovinext-pill border-slate-200 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                      <Building className="h-3.5 w-3.5" />
                      Suite white-label
                    </span>
                    <span className="bovinext-pill border-slate-200 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                      {selectedPeriodLabel}
                    </span>
                    <span className="bovinext-pill border-slate-200 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                      Demo vertical
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
                      {operationInitial}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
                        Camada executiva
                      </p>
                      <h2 className="text-2xl font-semibold capitalize text-slate-950 dark:text-white sm:text-3xl">
                        {operationName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-500" />
                          {location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Building className="h-4 w-4 text-emerald-500" />
                          Responsável: {userName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Período
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as keyof typeof periodLabels)}
                      className="min-w-[160px] rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                    >
                      <option value="today">Hoje</option>
                      <option value="week">Esta semana</option>
                      <option value="month">Este mês</option>
                      <option value="year">Este ano</option>
                    </select>
                  </label>

                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:border-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar dados
                  </button>
                </div>
              </div>
            </motion.section>

            <div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 dark:bg-emerald-900/50">
                    <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white lg:text-2xl">
                      Indicadores da demo vertical
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Métricas em tempo real da operação · {selectedPeriodLabel}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Atualização automática a cada 30 segundos
                </div>
              </motion.div>

              <KPICards stats={stats} loading={loading} />
            </div>

            <ChartsSection />
            <TablesAndAlerts />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
