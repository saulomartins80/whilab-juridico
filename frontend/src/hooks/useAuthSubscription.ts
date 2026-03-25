// src/hooks/useAuthSubscription.ts
import { useState, useEffect, useCallback } from 'react';


import { useAuth } from '../../context/AuthContext';


interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'inactive' | 'canceled' | 'expired' | 'pending';
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseAuthSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAuthSubscription(): UseAuthSubscriptionReturn {
  const { user } = useAuth();
  const [state, setState] = useState({
    subscription: null as Subscription | null,
    loading: false,
    error: null as string | null,
  });

  const refresh = useCallback(async () => {
    if (!user?.uid) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = 'mock-token'; // Mock token for WhiLab development
      const res = await fetch(`/api/subscriptions/${user.uid}`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await res.json();
      
      setState({
        subscription: {
          id: data.id,
          plan: data.plan,
          status: data.status,
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        subscription: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [user]); // user como dependência

  useEffect(() => {
    let isMounted = true;
    
    const fetchSubscription = async () => {
      if (user?.uid && !state.subscription && !state.loading) {
        try {
          await refresh();
        } catch (error) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              error: error instanceof Error ? error.message : 'Unknown error'
            }));
          }
        }
      }
    };

    fetchSubscription();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, state.subscription, state.loading, refresh]);

  return {
    ...state,
    refresh,
  };
}
