import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, RefreshCw, BarChart3 } from 'lucide-react';
import Image from 'next/image';

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
    mortalidade: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Detectar status de conexão
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

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getKPIs();
      if (response.success && response.data) {
        setStats(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Usar dados mockados em caso de erro
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

  // Obter nome da fazenda do usuário ou usar padrão
  const farmName = (user as any)?.fazenda || (user as any)?.fazenda_nome || (user as any)?.user_metadata?.fazenda_nome || "Minha Fazenda";
  const userName = (user as any)?.nome || (user as any)?.display_name || (user as any)?.user_metadata?.display_name || user?.email?.split('@')[0] || "Administrador";
  const location = (user as { location?: string })?.location || (user as { user_metadata?: { location?: string } })?.user_metadata?.location || "Goiânia, GO";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-[1920px] mx-auto space-y-6 lg:space-y-8"
          >

            {/* Farm Header */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                    <span className="text-2xl font-bold text-white">
                      {farmName?.charAt(0)?.toUpperCase() || 'F'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white capitalize">{farmName}</h2>
                    <div className="flex items-center gap-2 mt-0.5 text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-sm">{location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">Atualizar</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* KPI Cards Section */}
            <div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      Indicadores Principais
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Métricas em tempo real da sua operação
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="year">Este Ano</option>
                  </select>
                </div>
              </motion.div>

              <KPICards stats={stats} loading={loading} />
            </div>

            {/* Seção de Gráficos - PARTE 2 */}
            <ChartsSection />

            {/* Seção de Tabelas e Alertas - PARTE 3 */}
            <TablesAndAlerts />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
