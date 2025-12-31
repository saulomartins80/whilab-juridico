import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMail, FiLock, FiLoader, FiAlertCircle, FiArrowRight, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { usePreloadCheck } from '../../src/hooks/usePreloadCheck';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [showResendConfirmation, _setShowResendConfirmation] = useState(false);
  const [resendStatus, _setResendStatus] = useState<{loading: boolean; success: boolean; error: string | null}>({ loading: false, success: false, error: null });

  const { user, loading, login, supabase } = useAuth();
  const router = useRouter();
  const isPreloading = usePreloadCheck();

  // Efeitos para validação em tempo real
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  // Efeito para verificar o parâmetro de sucesso de registro
  useEffect(() => {
    if (router.isReady) {
      const registrationParam = router.query.registration;
      if (registrationParam === 'success') {
        setShowRegistrationSuccess(true);
        // Remover o parâmetro da URL para não mostrar novamente ao recarregar
        router.replace('/auth/login', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query, router]);

  // Redirecionamento se já estiver logado
  useEffect(() => {
    if (user && !loading && router.isReady) {
      const redirectPath = router.query.redirect as string || '/dashboard';
      // Evitar redirecionamento se já estiver na página de destino
      if (router.pathname !== redirectPath) {
        router.replace(redirectPath);
      }
    }
  }, [user, loading, router.isReady, router.query.redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowRegistrationSuccess(false);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      // Tratamento de erros do Supabase
      const supabaseError = err as { message?: string };
      
      if (supabaseError.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
      } else if (supabaseError.message?.includes('Email not confirmed')) {
        // Backend já confirma email automaticamente
        setError('Erro ao fazer login. Tente novamente.');
      } else if (supabaseError.message?.includes('Too many requests')) {
        setError('Muitas tentativas de login. Tente novamente em alguns minutos.');
      } else {
        setError('Erro ao fazer login. Tente novamente ou entre em contato com o suporte.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {};

  // Google login removido para BOVINEXT - usando apenas Supabase Auth

  if (isPreloading || loading || (user && !showRegistrationSuccess)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card de Login */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Cabeçalho com gradiente BOVINEXT */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl mb-3">
                <span className="text-2xl">🐄</span>
              </div>
              <h1 className="text-2xl font-bold text-white">BOVINEXT</h1>
              <p className="text-green-100 text-sm mt-1">
                Gestão Inteligente de Pecuária
              </p>
            </div>
          </div>

          {/* Conteúdo do formulário */}
          <div className="p-6">
            {/* Mensagem de sucesso de registro + instrução de confirmação */}
            {showRegistrationSuccess && (
              <div className="space-y-3 mb-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              >
                <FiCheck className="flex-shrink-0 mt-0.5" />
                  <span>
                    Cadastro realizado! Você já pode fazer login na plataforma.
                  </span>
              </motion.div>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              >
                <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email não confirmado: instrução + botão para reenviar */}
            {false && (<div />)}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Email */}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Endereço de Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${isValidEmail && email ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="seu@email.com"
                    autoComplete="username"
                    required
                  />
                  {isValidEmail && email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheck className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Campo de Senha */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                    minLength={6}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Botão de Login */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    Acessar BOVINEXT
                    <FiArrowRight />
                  </>
                )}
              </motion.button>
            </form>

            {/* Recursos BOVINEXT - Compacto */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="text-lg">📊</span>
                <span className="text-xs text-green-700 dark:text-green-300">Analytics IA</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="text-lg">🐄</span>
                <span className="text-xs text-blue-700 dark:text-blue-300">Gestão Rebanho</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <span className="text-lg">💉</span>
                <span className="text-xs text-purple-700 dark:text-purple-300">Veterinário</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <span className="text-lg">🤖</span>
                <span className="text-xs text-amber-700 dark:text-amber-300">IA BOVI</span>
              </div>
            </div>
          </div>

          {/* Rodapé do card */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 text-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Novo no BOVINEXT?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
              >
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Links adicionais */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
