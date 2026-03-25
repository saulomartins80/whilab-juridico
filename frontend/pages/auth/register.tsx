import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  User,
  Mail,
  Lock,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Home,
  Eye,
  EyeOff,
  Moon,
  Shield,
  Sun,
  Zap,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fazenda: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [formValid, setFormValid] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const router = useRouter();
  const { register } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const authUnavailable = !supabaseRuntime.isConfigured;

  useEffect(() => {
    const isEmailValid = formData.email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPasswordValid = formData.password.length >= 8;
    const doPasswordsMatch = formData.password === formData.confirmPassword;
    const isFormValid =
      formData.name.trim() !== '' &&
      isEmailValid &&
      formData.fazenda.trim() !== '' &&
      isPasswordValid &&
      doPasswordsMatch &&
      agreedToTerms;

    setEmailValid(isEmailValid);
    setPasswordMatch(doPasswordsMatch);
    setFormValid(isFormValid);
  }, [formData, agreedToTerms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (authUnavailable) {
      setError('A autenticacao esta temporariamente indisponivel. Tente novamente em alguns minutos.');
      setLoading(false);
      return;
    }

    try {
      const currentEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      if (!currentEmailValid) {
        setError('Digite um e-mail valido');
        setEmailValid(false);
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas nao coincidem');
        setPasswordMatch(false);
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError('A senha deve ter no minimo 8 caracteres');
        setLoading(false);
        return;
      }

      await register(formData.email, formData.password, formData.name, formData.fazenda);
      setSuccess(true);

      globalThis.setTimeout(() => {
        router.push('/auth/login?registration=success');
      }, 2000);
    } catch (err: unknown) {
      const supabaseError = err as { message?: string };
      const message = supabaseError.message || '';

      if (/email.*(uso|cadastrado|registered)/i.test(message)) {
        setError('Este e-mail ja esta cadastrado. Tente fazer login.');
      } else if (message.includes('Password should be at least 6 characters') || /senha/i.test(message)) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (message.includes('Invalid email') || /email invalido/i.test(message)) {
        setError('Formato de email invalido.');
      } else if (message.includes('Supabase auth is unavailable') || message.includes('Supabase environment is not configured')) {
        setError('A autenticacao esta temporariamente indisponivel. Tente novamente em alguns minutos.');
      } else {
        setError(message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2rem] border border-slate-200 bg-white/80 p-10 shadow-[0_40px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_40px_100px_rgba(0,0,0,0.3)] max-w-md w-full text-center"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#0f766e] dark:bg-[#22d3ee] mb-6">
            <Check className="h-8 w-8 text-white dark:text-[#0a0a0a]" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Bem-vindo ao {dashboardBranding.brandName}!</h2>
          <p className="mt-3 text-[15px] text-slate-500 dark:text-[#969696]">
            Conta criada com sucesso. Redirecionando para o login...
          </p>
          <div className="mt-6 h-1 w-full rounded-full bg-slate-200 dark:bg-white/[0.1] overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full rounded-full bg-[#0f766e] dark:bg-[#22d3ee]"
            />
          </div>
        </motion.div>
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
      <main className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-10 mt-2 lg:mt-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[calc(100vh-100px)]">

          {/* Left — Branding */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 mb-6 dark:border-white/[0.1] dark:bg-white/[0.03]">
              <Shield className="w-3.5 h-3.5 text-[#0f766e] dark:text-[#22d3ee]" />
              <span className="text-[13px] font-medium text-slate-500 dark:text-[#969696]">Cadastro seguro</span>
            </div>

            <h1 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-white">
              Crie sua<br />
              <span className="text-[#0f766e] dark:text-[#22d3ee]">base premium.</span>
            </h1>

            <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-slate-500 dark:text-[#969696]">
              Comece a usar o {dashboardBranding.brandName} e tenha acesso a uma base com dashboard, IA assistida e operacao white-label pronta para adaptar.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Zap, title: 'Rapido', text: 'Operacao ativa em minutos' },
                { icon: Globe, title: 'White-label', text: 'Sua marca, sua plataforma' },
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

          {/* Right — Register form */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 md:p-8 backdrop-blur-xl shadow-[0_40px_100px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696]">Cadastro gratuito</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 dark:text-white">Criar conta</h2>
                  <p className="mt-1 text-[14px] text-slate-500 dark:text-[#969696]">Preencha os dados abaixo para comecar.</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/[0.05]">
                  <User className="w-5 h-5 text-[#0f766e] dark:text-[#22d3ee]" />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600 dark:border-red-500/20 dark:bg-red-500/[0.08] dark:text-red-400"
                  >
                    <AlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Nome completo</span>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Joao Silva"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Nome da operacao</span>
                    <div className="relative">
                      <Home className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                      <input
                        name="fazenda"
                        type="text"
                        required
                        value={formData.fazenda}
                        onChange={handleInputChange}
                        placeholder="Estancia Bela Vista"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                      />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-10 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 ${
                        emailValid
                          ? 'border-slate-200 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30'
                          : 'border-red-400 dark:border-red-500'
                      }`}
                    />
                    {formData.email && emailValid && formData.email.includes('@') && (
                      <Check className="pointer-events-none absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-[#0f766e] dark:text-emerald-400" />
                    )}
                  </div>
                  {!emailValid && formData.email.length > 0 && (
                    <p className="mt-1.5 text-[12px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Email invalido
                    </p>
                  )}
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Senha (min. 8)</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
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
                    <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Confirmar senha</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-11 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 ${
                          passwordMatch
                            ? 'border-slate-200 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30'
                            : 'border-red-400 dark:border-red-500'
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
                    {!passwordMatch && formData.confirmPassword.length > 0 && (
                      <p className="mt-1.5 text-[12px] text-red-500">Senhas nao coincidem</p>
                    )}
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e] dark:border-white/20 dark:text-[#22d3ee] dark:focus:ring-[#22d3ee]"
                  />
                  <label htmlFor="terms" className="text-[13px] text-slate-500 dark:text-[#969696]">
                    Concordo com os{' '}
                    <Link href="/termos" className="text-[#0f766e] hover:underline dark:text-[#22d3ee]">Termos</Link>
                    {' '}e{' '}
                    <Link href="/privacidade" className="text-[#0f766e] hover:underline dark:text-[#22d3ee]">Privacidade</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!formValid || loading || authUnavailable}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold transition-all duration-300 ${
                    formValid && !authUnavailable
                      ? 'bg-slate-900 text-white hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/[0.1] dark:text-white/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-center text-[14px] text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-[#969696]">
                Ja tem conta?{' '}
                <Link href="/auth/login" className="font-semibold text-slate-900 hover:text-[#0f766e] transition-colors dark:text-white dark:hover:text-[#22d3ee]">
                  Entrar agora
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
