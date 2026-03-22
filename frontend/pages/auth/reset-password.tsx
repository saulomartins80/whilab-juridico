import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

import { supabase } from '../../lib/supabaseClient';
import { dashboardBranding } from '../../config/branding';

type RecoveryStatus = 'checking' | 'ready' | 'invalid' | 'success';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:px-6 lg:px-8">
      <Head>
        <title>Nova senha | {dashboardBranding.brandName}</title>
        <meta
          name="description"
          content={`Defina uma nova senha para continuar usando o ${dashboardBranding.brandName}.`}
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Criar nova senha</h1>
          <p className="text-green-100 mt-2">
            {status === 'success'
              ? 'Sua senha foi atualizada'
              : 'Finalize o acesso com uma senha nova e segura'}
          </p>
        </div>

        <div className="p-8">
          {status === 'checking' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Validando o link de redefinicao...
              </p>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="flex-shrink-0 mt-0.5 h-5 w-5" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 p-4 mb-6 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
            >
              <CheckCircle className="flex-shrink-0 mt-0.5 h-5 w-5" />
              <span className="text-sm">{success}</span>
            </motion.div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nova senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Minimo de 8 caracteres"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Repita a senha"
                  />
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    As senhas precisam ser identicas.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!passwordsMatch || newPassword.length < 8 || isSubmitting}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !passwordsMatch || newPassword.length < 8 || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Atualizando...
                  </>
                ) : (
                  'Salvar nova senha'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
