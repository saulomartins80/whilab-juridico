import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart2,
  Brain,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Moon,
  Shield,
  Sun,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePreloadCheck } from '../../src/hooks/usePreloadCheck';
import { dashboardBranding } from '../../config/branding';
import { supabaseRuntime } from '../../lib/supabaseClient';
import OptimizedLogo from '../../components/OptimizedLogo';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease },
  }),
};

export default function LoginPage() {
  const router = useRouter();
  const isPreloading = usePreloadCheck();
  const { user, loading, login } = useAuth();
  const authUnavailable = !supabaseRuntime.isConfigured;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  const emailIsValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.registration === 'success') {
      setShowRegistrationSuccess(true);
      router.replace('/auth/login', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.registration]);

  useEffect(() => {
    if (!router.isReady || loading || !user) return;
    const redirectPath = (router.query.redirect as string) || '/dashboard';
    if (router.pathname !== redirectPath) {
      router.replace(redirectPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, router.isReady]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setShowRegistrationSuccess(false);

    if (authUnavailable) {
      setError('A autenticacao esta temporariamente indisponivel. Tente novamente em alguns minutos.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message?: string }).message)
          : '';

      if (message.includes('Invalid login credentials')) {
        setError('Email ou senha invalidos. Confira os dados e tente novamente.');
      } else if (message.includes('Too many requests')) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else if (message.includes('Supabase auth is unavailable') || message.includes('Supabase environment is not configured')) {
        setError('A autenticacao esta temporariamente indisponivel. Tente novamente em alguns minutos.');
      } else {
        setError('Nao foi possivel entrar agora. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPreloading || loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-11 w-11 rounded-full border-2 border-slate-200 border-t-[#0f766e] dark:border-white/20 dark:border-t-[#22d3ee]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-hidden dark:bg-[#0a0a0a] dark:text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#0f766e]/[0.04] dark:bg-[#22d3ee]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.03] dark:bg-indigo-500/[0.04] blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 md:px-10 py-5">
        <OptimizedLogo
          href="/"
          size={38}
          showText
          gapClassName="gap-3"
          textClassName="text-[18px] tracking-tight"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all dark:border-white/[0.1] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.05]"
            aria-label={resolvedTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-[14px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all dark:border-white/[0.15] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.05]"
          >
            Voltar para home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-10 mt-2 lg:mt-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[calc(100vh-100px)]">

          {/* Left — Branding */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 mb-6 dark:border-white/[0.1] dark:bg-white/[0.03]">
              <Shield className="w-3.5 h-3.5 text-[#0f766e] dark:text-[#22d3ee]" />
              <span className="text-[13px] font-medium text-slate-500 dark:text-[#969696]">Acesso seguro</span>
            </div>

            <h1 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-white">
              Acesse sua<br />
              <span className="text-[#0f766e] dark:text-[#22d3ee]">base premium.</span>
            </h1>

            <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-slate-500 dark:text-[#969696]">
              Entre no {dashboardBranding.brandName} para acessar dashboard, auth e a estrutura white-label pronta para operar, adaptar e evoluir.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: BarChart2, title: 'Dashboard', text: 'KPIs e metricas em tempo real' },
                { icon: Brain, title: 'IA aplicada', text: 'Alertas e previsoes automaticas' },
                { icon: Shield, title: 'Seguro', text: 'Dados protegidos com Supabase' },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  custom={i + 1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"
                >
                  <card.icon className="w-5 h-5 text-[#0f766e] dark:text-[#22d3ee] mb-3" />
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{card.title}</p>
                  <p className="text-[12px] text-slate-500 dark:text-[#969696] mt-1">{card.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-6 flex flex-wrap gap-2">
              {['Plataforma completa', 'Marca propria', 'Suporte dedicado'].map((point) => (
                <span key={point} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/60">
                  <Check className="w-3.5 h-3.5 text-[#0f766e] dark:text-[#22d3ee]" />
                  {point}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Login form */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 md:p-10 backdrop-blur-xl shadow-[0_40px_100px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between gap-3 mb-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696]">Entrada segura</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 dark:text-white">Acessar conta</h2>
                  <p className="mt-1 text-[14px] text-slate-500 dark:text-[#969696]">Use seu email e senha para entrar.</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/[0.05]">
                  <Lock className="w-5 h-5 text-[#0f766e] dark:text-[#22d3ee]" />
                </div>
              </div>

              {showRegistrationSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] dark:text-emerald-400"
                >
                  <Check className="mt-0.5 w-4 h-4 flex-shrink-0" />
                  Cadastro concluido. Agora voce pode fazer login.
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600 dark:border-red-500/20 dark:bg-red-500/[0.08] dark:text-red-400"
                >
                  <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {authUnavailable && !error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/[0.08] dark:text-amber-300"
                >
                  <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
                  A autenticacao esta temporariamente indisponivel. Tente novamente em alguns minutos.
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="username"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-10 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                    />
                    {email && emailIsValid && (
                      <Check className="pointer-events-none absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-[#0f766e] dark:text-emerald-400" />
                    )}
                  </div>
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">Senha</span>
                    <Link href="/auth/forgot-password" className="text-[12px] font-medium text-[#0f766e] hover:text-[#0f766e]/80 transition-colors dark:text-[#22d3ee] dark:hover:text-[#22d3ee]/80">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      minLength={6}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-11 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors dark:text-[#969696] dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isLoading || authUnavailable}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white py-3.5 text-[14px] font-semibold transition-all duration-300 hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar no dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-center text-[14px] text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-[#969696]">
                Nao tem conta?{' '}
                <Link href="/auth/register" className="font-semibold text-slate-900 hover:text-[#0f766e] transition-colors dark:text-white dark:hover:text-[#22d3ee]">
                  Criar conta agora
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
