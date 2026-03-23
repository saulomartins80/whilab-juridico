import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

export default function ChangePasswordPage() {
  const { user, loading: authLoading, authChecked } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && authChecked && !user) {
      router.push('/auth/login?redirect=/auth/change-password');
    }
  }, [user, authLoading, authChecked, router]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('As novas senhas nao coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setSuccess('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      console.error('Erro ao alterar senha:', err);
      const message = err instanceof Error ? err.message : 'Erro ao alterar senha. Tente novamente.';
      setError(message);
    }
    setIsLoading(false);
  };

  if (authLoading || !authChecked) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-11 w-11 rounded-full border-2 border-slate-200 border-t-[#0f766e] dark:border-white/20 dark:border-t-[#22d3ee]"
          />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[480px] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 backdrop-blur-xl shadow-[0_30px_80px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
            <div className="flex items-start justify-between gap-3 mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696]">Seguranca</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 dark:text-white">Alterar senha</h2>
                <p className="mt-1 text-[14px] text-slate-500 dark:text-[#969696]">Defina uma nova senha para sua conta.</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-white/80">Nova senha</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-[#969696]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimo de 8 caracteres"
                    autoComplete="new-password"
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
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
                disabled={!passwordsMatch || newPassword.length < 8 || isLoading}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold transition-all duration-300 ${
                  passwordsMatch && newPassword.length >= 8 && !isLoading
                    ? 'bg-slate-900 text-white hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/[0.1] dark:text-white/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar senha'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
