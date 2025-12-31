// components/ProtectedRoute.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';

import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  allowedPlans?: string[];
}

export function ProtectedRoute({ 
  children, 
  requireSubscription = false, 
  allowedPlans = [] 
}: ProtectedRouteProps) {
  const { user, loading, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) {
      console.log('[ProtectedRoute] Auth not ready yet, waiting...');
      return;
    }

    const isOnAuthPage = router.pathname.startsWith('/auth/');
    console.log('[ProtectedRoute] Current path:', router.pathname, 'isOnAuthPage:', isOnAuthPage, 'user:', !!user);

    // Se não há usuário e não está em página de auth, redirecionar para login
    if (!user && !isOnAuthPage) {
      console.log('[ProtectedRoute] User not authenticated. Redirecting to login.');
      router.replace(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Se há usuário e está em página de auth, redirecionar para dashboard
    if (user && isOnAuthPage) {
      console.log('[ProtectedRoute] User authenticated, redirecting from auth page to dashboard.');
      router.replace('/dashboard');
      return;
    }

    // Verificar se a rota requer assinatura ativa
    if (requireSubscription && user) {
      // Temporariamente sem checagem de assinatura
        return;
      }
  }, [isAuthReady, user, router, requireSubscription, allowedPlans]);

  if (!isAuthReady || loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  // Se requer assinatura mas não há assinatura ativa, mostrar loading
  if (requireSubscription) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
}