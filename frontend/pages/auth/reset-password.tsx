import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Lock, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

import { supabase } from '../../lib/supabaseClient';
import { dashboardBranding } from '../../config/branding';
import OptimizedLogo from '../../components/OptimizedLogo';
import { useTheme } from '../../context/ThemeContext';

type RecoveryStatus = 'checking' | 'ready' | 'invalid' | 'success';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<RecoveryStatus>('checking');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  useEffect(() => {
    if (!router.isReady) return;

    let mounted = true;

    const bootstrapRecovery = async () => {
      try {
        const code = typeof router.query.code === 'string' ? router.query.code : null;
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) throw sessionError;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setStatus('ready');
          setError(null);
          return;
        }

        setStatus('invalid');
        setError('O link de redefinicao e invalido ou expirou. Solicite um novo email para continuar.');
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Nao foi possivel validar o link de redefinicao.';
        setStatus('invalid');
        setError(message);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || session?.user) {
        setStatus('ready');
        setError(null);
      }
    });

    void bootstrapRecovery();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router.isReady, router.query.code]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      await supabase.auth.signOut();

      setStatus('success');
      setSuccess('Senha atualizada com sucesso. Agora voce ja pode entrar com a nova senha.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel atualizar a senha agora.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased dark:bg-[#0a0a0a] dark:text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Head>
        <title>Nova senha | {dashboardBranding.brandName}</title>
        <meta name="description" content={`Defina uma nova senha para continuar usando o ${dashboardBranding.brandName}.`} />
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
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696]">Seguranca</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 dark:text-white">Criar nova senha</h2>
                <p className="mt-1 text-[14px] text-slate-500 dark:text-[#969696]">
                  {status === 'success' ? 'Sua senha foi atualizada' : 'Defina uma senha nova e segura'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/[0.05]">
                <Lock className="w-5 h-5 text-[#0f766e] dark:text-[#22d3ee]" />
              </div>
            </div>

            {status === 'checking' && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0f766e] dark:text-[#22d3ee]" />
                <p className="mt-4 text-[14px] text-slate-500 dark:text-[#969696]">
                  Validando o link de redefinicao...
                </p>
              </div>
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

            {status === 'ready' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Nova senha</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimo de 8 caracteres"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-11 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#969696] dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Confirmar nova senha</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-11 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 ${
                        confirmPassword.length > 0 && !passwordsMatch
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-slate-200 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#969696] dark:hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1.5 text-[12px] text-red-500">As senhas precisam ser identicas.</p>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={!passwordsMatch || newPassword.length < 8 || isSubmitting}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold transition-all duration-300 ${
                    passwordsMatch && newPassword.length >= 8 && !isSubmitting
                      ? 'bg-slate-900 text-white hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/[0.1] dark:text-white/30'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    'Salvar nova senha'
                  )}
                </button>
              </form>
            )}

            {status === 'invalid' && (
              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0f766e] hover:text-[#0f766e]/80 transition-colors dark:text-[#22d3ee] dark:hover:text-[#22d3ee]/80"
                >
                  Solicitar novo link de redefinicao
                </Link>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white py-3 text-[14px] font-semibold transition-all duration-300 hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]"
                >
                  Ir para o login
                </Link>
              </div>
            )}

            {status !== 'success' && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center gap-2 text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors dark:text-[#969696] dark:hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
