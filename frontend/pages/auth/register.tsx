import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { dashboardBranding } from '../../config/branding';

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

      if (supabaseError.message?.includes('User already registered')) {
        setError('Este e-mail ja esta cadastrado. Tente fazer login.');
      } else if (supabaseError.message?.includes('Password should be at least 6 characters')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (supabaseError.message?.includes('Invalid email')) {
        setError('Formato de email invalido.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-green-200 dark:border-green-800"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-600">Bem-vindo ao {dashboardBranding.brandName}!</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300 text-sm">
            Conta criada com sucesso. Redirecionando...
          </p>
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg">
                <Image src="/logo.svg" alt={dashboardBranding.logoAlt} width={22} height={22} />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold text-white">Criar conta</h1>
                <p className="text-green-100 text-xs">{dashboardBranding.brandName} - Operacao Pecuaria Premium</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    <AlertCircle className="flex-shrink-0 h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Joao Silva"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="fazenda" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da fazenda
                  </label>
                  <div className="relative">
                    <Home className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="fazenda"
                      name="fazenda"
                      type="text"
                      required
                      value={formData.fazenda}
                      onChange={handleInputChange}
                      className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Fazenda Bela Vista"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      emailValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
                    }`}
                    placeholder="seu@email.com"
                  />
                </div>
                {!emailValid && formData.email.length > 0 && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Email invalido
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Senha (min. 8)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-8 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmar
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-8 pr-8 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        passwordMatch ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
                      }`}
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!passwordMatch && formData.confirmPassword.length > 0 && (
                    <p className="mt-1 text-xs text-red-600">Senhas nao coincidem</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                  Concordo com os <Link href="/termos" className="text-green-600 hover:underline">Termos</Link> e <Link href="/privacidade" className="text-green-600 hover:underline">Privacidade</Link>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={!formValid || loading}
                whileHover={{ scale: formValid ? 1.01 : 1 }}
                whileTap={{ scale: formValid ? 0.99 : 1 }}
                className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all ${
                  formValid
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Criando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" /> Criar conta
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400">
                Voltar
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ja tem conta? <Link href="/auth/login" className="text-green-600 font-medium hover:underline">Entrar</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
