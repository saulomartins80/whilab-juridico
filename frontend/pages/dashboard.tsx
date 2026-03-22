import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, BarChart2, Shield, X, Brain, Beef } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { dashboardBranding } from '../config/branding';
import LoadingSpinner from '../components/LoadingSpinner';
import BovinextDashboardContent from '../components/BovinextDashboardContent';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, authChecked } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.welcome === 'true') {
      setShowWelcome(true);
      router.replace('/dashboard', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.welcome]);

  if (loading || !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center shadow-xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
            <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Acesso restrito
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Voce precisa fazer login para acessar o painel de gestao da plataforma.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Fazer login
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  const userName = (user as any)?.name || (user as any)?.user_metadata?.name || (user as any)?.email?.split('@')[0] || 'Produtor';

  return (
    <>
      {/* Welcome modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative mx-auto w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Bem-vindo ao {dashboardBranding.brandName}!
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Seu workspace esta pronto para operar com dados, rotina e acompanhamento centralizados.
              </p>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <BarChart2 className="mr-3 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>Dashboard com KPIs em tempo real</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Brain className="mr-3 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>IA integrada para alertas e previsoes</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="mr-3 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>Dados protegidos com criptografia</span>
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="mt-6 w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Comecar agora
              </button>

              <button
                onClick={() => setShowWelcome(false)}
                className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          {/* Hero section */}
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/5 blur-[80px]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                  <Beef className="h-3.5 w-3.5" />
                  Painel executivo
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  Ola, {userName}
                </h1>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
                  Acompanhe rebanho, manejos, producao e vendas em um so lugar.
                  Suas metricas e alertas estao organizados para a operacao de hoje.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/rebanho"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  Meu rebanho
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/manejo"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Novo manejo
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Dashboard content */}
          <div className="mt-6">
            <BovinextDashboardContent />
          </div>
        </div>
      </div>
    </>
  );
}
