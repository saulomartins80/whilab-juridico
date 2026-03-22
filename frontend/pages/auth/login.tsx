import Link from 'next/link';
import Image from 'next/image';
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
  Shield,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { usePreloadCheck } from '../../src/hooks/usePreloadCheck';
import { dashboardBranding } from '../../config/branding';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

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
      } else {
        setError('Nao foi possivel entrar agora. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPreloading || loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-11 w-11 rounded-full border-2 border-white/20 border-t-[#22d3ee]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white antialiased overflow-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#22d3ee]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 md:px-10 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt={dashboardBranding.logoAlt} width={28} height={28} />
          <span className="text-[16px] font-semibold tracking-tight">{dashboardBranding.brandName}</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-white/[0.15] px-5 py-2.5 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          Voltar para home
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-10 mt-8 lg:mt-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-120px)]">

          {/* Left — Branding */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 mb-8">
              <Shield className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span className="text-[13px] font-medium text-[#969696]">Acesso seguro</span>
            </div>

            <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              Acesse sua<br />
              <span className="text-[#22d3ee]">gestao pecuaria.</span>
            </h1>

            <p className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-[#969696]">
              Entre no {dashboardBranding.brandName} para acompanhar seu rebanho, manejos, producao e vendas em tempo real com inteligencia artificial.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
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
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                >
                  <card.icon className="w-5 h-5 text-[#22d3ee] mb-3" />
                  <p className="text-[13px] font-semibold text-white">{card.title}</p>
                  <p className="text-[12px] text-[#969696] mt-1">{card.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-8 flex flex-wrap gap-2">
              {['Plataforma completa', 'White-label pronto', 'Suporte dedicado'].map((point) => (
                <span key={point} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-white/60">
                  <Check className="w-3.5 h-3.5 text-[#22d3ee]" />
                  {point}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Login form */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between gap-3 mb-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#969696]">Entrada segura</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Acessar conta</h2>
                  <p className="mt-1 text-[14px] text-[#969696]">Use seu email e senha para entrar.</p>
                </div>
                <div className="rounded-xl bg-white/[0.05] p-3">
                  <Lock className="w-5 h-5 text-[#22d3ee]" />
                </div>
              </div>

              {showRegistrationSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-[14px] text-emerald-400"
                >
                  <Check className="mt-0.5 w-4 h-4 flex-shrink-0" />
                  Cadastro concluido. Agora voce pode fazer login.
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-[14px] text-red-400"
                >
                  <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-white/80">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-[#969696]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="username"
                      required
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] py-3.5 pl-11 pr-10 text-white text-[14px] outline-none transition placeholder:text-white/30 focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30"
                    />
                    {email && emailIsValid && (
                      <Check className="pointer-events-none absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-emerald-400" />
                    )}
                  </div>
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white/80">Senha</span>
                    <Link href="/auth/forgot-password" className="text-[12px] font-medium text-[#22d3ee] hover:text-[#22d3ee]/80 transition-colors">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-[#969696]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      minLength={6}
                      required
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] py-3.5 pl-11 pr-11 text-white text-[14px] outline-none transition placeholder:text-white/30 focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#969696] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#121212] py-3.5 text-[14px] font-semibold transition-all duration-300 hover:bg-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
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

              <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center text-[14px] text-[#969696]">
                Nao tem conta?{' '}
                <Link href="/auth/register" className="font-semibold text-white hover:text-[#22d3ee] transition-colors">
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
