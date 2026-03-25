import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, ArrowLeft, Loader2, ArrowRight, Lock, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import Head from 'next/head';

import { supabase, supabaseRuntime } from '../../lib/supabaseClient';
import { dashboardBranding } from '../../config/branding';
import OptimizedLogo from '../../components/OptimizedLogo';
import { useTheme } from '../../context/ThemeContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const authUnavailable = !supabaseRuntime.isConfigured;
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const redirect = router.query.redirect as string | undefined;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendResetEmail = async () => {
    setError(null);

    if (authUnavailable) {
      setError('A autenticacao esta temporariamente indisponivel. Tente novamente em alguns minutos.');
      return;
    }

    if (!isEmailValid) {
      setError('Digite um e-mail valido.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess(`Enviamos um link de redefinicao para ${email}. Verifique sua caixa de entrada e a pasta de spam.`);
      setEmailSent(true);
      setCountdown(30);
    } catch (err: unknown) {
      console.error('Erro ao enviar e-mail de redefinicao:', err);
      const supabaseError = err as { message?: string };
      setError(
        supabaseError.message?.includes('not found')
          ? 'E-mail nao cadastrado.'
          : supabaseError.message?.includes('Supabase auth is unavailable') || supabaseError.message?.includes('Supabase environment is not configured')
            ? 'A autenticacao esta temporariamente indisponivel. Tente novamente em alguns minutos.'
          : 'Erro ao enviar e-mail de redefinicao. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendResetEmail();
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    await sendResetEmail();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased dark:bg-[#0a0a0a] dark:text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Head>
        <title>Redefinir Senha | {dashboardBranding.brandName}</title>
      </Head>

      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#0f766e]/[0.04] dark:bg-[#22d3ee]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.03] dark:bg-indigo-500/[0.04] blur-[120px]" />

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
            href="/auth/login"
            className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-[14px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all dark:border-white/[0.15] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.05]"
          >
            Voltar ao login
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-[480px] flex-col items-center justify-center px-5 mt-8 lg:mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 md:p-10 backdrop-blur-xl shadow-[0_40px_100px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between gap-3 mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696]">Recuperacao de conta</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 dark:text-white">Redefinir senha</h2>
                <p className="mt-1 text-[14px] text-slate-500 dark:text-[#969696]">
                  {emailSent ? 'Verifique seu e-mail' : 'Digite seu e-mail para receber o link'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/[0.05]">
                <Lock className="w-5 h-5 text-[#0f766e] dark:text-[#22d3ee]" />
              </div>
            </div>

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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] dark:text-emerald-400"
              >
                <CheckCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
                {success}
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

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 ${
                        email.length > 0 && !isEmailValid
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-slate-200 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30'
                      }`}
                    />
                  </div>
                  {email.length > 0 && !isEmailValid && (
                    <p className="mt-1.5 text-[12px] text-red-500">Por favor, insira um email valido</p>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={!isEmailValid || isLoading || authUnavailable}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold transition-all duration-300 ${
                    isEmailValid && !isLoading && !authUnavailable
                      ? 'bg-slate-900 text-white hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/[0.1] dark:text-white/30'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar link de redefinicao
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-[#0f766e]/10 dark:bg-[#22d3ee]/10 mb-4">
                    <CheckCircle className="h-7 w-7 text-[#0f766e] dark:text-[#22d3ee]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-slate-900 dark:text-white mb-2">Verifique seu e-mail</h3>
                  <p className="text-[14px] text-slate-500 dark:text-[#969696]">
                    Enviamos um link para <span className="font-medium text-slate-900 dark:text-white">{email}</span>. O link expira em 24 horas.
                  </p>
                </div>

                <div className="text-[14px] text-center text-slate-500 dark:text-[#969696]">
                  Nao recebeu?{' '}
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={countdown > 0 || isLoading || authUnavailable}
                    className={`font-semibold ${
                      countdown > 0 || isLoading || authUnavailable
                        ? 'text-slate-400 cursor-not-allowed dark:text-white/30'
                        : 'text-[#0f766e] hover:text-[#0f766e]/80 dark:text-[#22d3ee] dark:hover:text-[#22d3ee]/80'
                    }`}
                  >
                    {countdown > 0 ? `Reenviar (${countdown}s)` : 'reenviar o link'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => router.push('/auth/login' + (redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''))}
                className="w-full inline-flex items-center justify-center gap-2 text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors dark:text-[#969696] dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
