import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Phone, Calendar, CreditCard, Loader2, ArrowRight, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuthWithRegistration } from '../../src/hooks/useAuthWithRegistration';
import { supabase } from '../../lib/supabaseClient';
import OptimizedLogo from '../../components/OptimizedLogo';
import { useTheme } from '../../context/ThemeContext';

interface AuthUser {
  uid: string;
  name?: string;
}

const CompleteRegistration: React.FC = () => {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, loading } = useAuthWithRegistration();
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    dateOfBirth: '',
    cpf: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: (user as AuthUser).name || ''
      }));
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setSubmitting(true);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.displayName,
          telefone: formData.phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.uid);

      if (updateError) {
        throw updateError;
      }

      await router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Erro ao completar cadastro:', err);
      alert('Erro ao completar cadastro. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased dark:bg-[#0a0a0a] dark:text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
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
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all dark:border-white/[0.1] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.05]"
          aria-label={resolvedTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
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
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696]">Ultimo passo</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 dark:text-white">Complete seu cadastro</h2>
                <p className="mt-1 text-[14px] text-slate-500 dark:text-[#969696]">Precisamos de algumas informacoes adicionais.</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 dark:bg-white/[0.05]">
                <User className="w-5 h-5 text-[#0f766e] dark:text-[#22d3ee]" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Nome completo</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                  <input
                    name="displayName"
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Telefone</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Data de nascimento</span>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    autoComplete="bday"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">CPF</span>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                  <input
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 text-[14px] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#22d3ee]/50 dark:focus:ring-[#22d3ee]/30"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white py-3 text-[14px] font-semibold transition-all duration-300 hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completando cadastro...
                  </>
                ) : (
                  <>
                    Completar cadastro
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CompleteRegistration;
