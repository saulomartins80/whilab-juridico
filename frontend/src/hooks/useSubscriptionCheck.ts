// src/hooks/useAuthSubscriptionCheck.ts
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';


import { useAuth } from '../../context/AuthContext';

interface UseSubscriptionCheckOptions {
  requireActive?: boolean;
  allowedPlans?: string[];
  redirectTo?: string;
}

export function useSubscriptionCheck(options: UseSubscriptionCheckOptions = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const {
    requireActive = false,
    allowedPlans = [],
    redirectTo = '/assinaturas'
  } = options;

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    // Se não requer assinatura ativa, permitir acesso
    if (!requireActive) {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    if (!user) {
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    // Verificar se o plano é permitido
    // Plano não checado no momento

    setHasAccess(true);
    setIsChecking(false);
  }, [user, requireActive, allowedPlans, redirectTo, router]);

  return {
    hasAccess,
    isChecking: isChecking,
    subscription: undefined,
    user
  };
}