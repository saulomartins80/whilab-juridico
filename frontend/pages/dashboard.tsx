import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Shield, X, Brain, BarChart2 } from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-surface w-full max-w-md p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/50">
            <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Acesso restrito
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Voce precisa fazer login para acessar o painel executivo da plataforma.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="app-shell-button-primary mt-6 w-full"
          >
            Fazer login
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="dashboard-surface relative mx-auto w-full max-w-lg overflow-hidden p-8 text-center"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_34%)]" />

              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/50">
                  <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>

                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                  Bem-vindo ao {dashboardBranding.brandName}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Seu workspace esta pronto para operar com dados, rotina e acompanhamento centralizados.
                </p>

                <div className="mt-6 space-y-3 text-left">
                  <div className="dashboard-surface-muted flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    <BarChart2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    Dashboard com KPIs em tempo real
                  </div>
                  <div className="dashboard-surface-muted flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    <Brain className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    IA integrada para alertas e previsoes
                  </div>
                  <div className="dashboard-surface-muted flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    <Shield className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    Dados protegidos e fluxos prontos para escala
                  </div>
                </div>

                <button
                  onClick={() => setShowWelcome(false)}
                  className="app-shell-button-primary mt-6 w-full"
                >
                  Entrar no painel
                </button>

                <button
                  onClick={() => setShowWelcome(false)}
                  className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900/70 dark:hover:text-slate-200"
                  aria-label="Fechar boas-vindas"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <BovinextDashboardContent />
      </div>
    </>
  );
}
