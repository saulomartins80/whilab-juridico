// context/AuthContext.tsx - BOVINEXT Mock Authentication
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { SupabaseClient, User as SupabaseUser, Subscription, PostgrestError } from '@supabase/supabase-js';

import { supabase } from '../lib/supabaseClient';

// BOVINEXT User Types
export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  name: string; // Alias para compatibilidade
  uid: string; // Alias para compatibilidade
  telefone?: string;
  fazenda?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authChecked: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, fazenda?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearErrors: () => void;
  updateProfile: (updatedData: Partial<AuthUser>) => Promise<AuthUser>;
  setUser: (user: AuthUser | null) => void;
  isAuthReady: boolean;
  subscription?: Subscription | null; // Para compatibilidade
  loadingSubscription?: boolean; // Para compatibilidade
  supabase: SupabaseClient; // Expor cliente Supabase de forma tipada
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authChecked: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearErrors: () => {},
  updateProfile: async () => {
    throw new Error('AuthProvider not initialized');
  },
  setUser: () => {},
  isAuthReady: false,
  subscription: null,
  loadingSubscription: false,
  supabase,
});

// Tipagem mínima para linha da tabela users utilizada neste arquivo
interface UserProfileRow {
  id: string;
  email?: string;
  display_name?: string;
  fazenda_nome?: string;
  telefone?: string;
  avatar_url?: string;
  firebase_uid?: string;
  subscription_plan?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for BOVINEXT Supabase auth
const normalizeUser = (supabaseUser: SupabaseUser | null, profile: UserProfileRow | null): AuthUser | null => {
  if (!supabaseUser) return null;
  
  // Usando os dados do perfil (profile) ou os metadados do usuário
  const displayName = profile?.display_name || (supabaseUser.user_metadata as { name?: string })?.name || '';
  const fazenda = profile?.fazenda_nome || (supabaseUser.user_metadata as { fazenda?: string; fazenda_nome?: string })?.fazenda || (supabaseUser.user_metadata as { fazenda_nome?: string })?.fazenda_nome || '';
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    nome: displayName,
    name: displayName, // Alias para compatibilidade
    uid: supabaseUser.id, // Alias para compatibilidade
    telefone: profile?.telefone || (supabaseUser.user_metadata as { phone?: string })?.phone || '',
    fazenda: fazenda,
    avatar_url: profile?.avatar_url || (supabaseUser.user_metadata as { avatar_url?: string })?.avatar_url || '',
    created_at: profile?.created_at || supabaseUser.created_at || new Date().toISOString(),
    updated_at: profile?.updated_at || supabaseUser.updated_at || new Date().toISOString(),
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  
  const [state, setState] = useState<{
    user: AuthUser | null;
    loading: boolean;
    authChecked: boolean;
    error: string | null;
    isAuthReady: boolean;
    subscription: Subscription | null;
    loadingSubscription: boolean;
  }>({
    user: null,
    loading: true,
    authChecked: false,
    error: null,
    isAuthReady: false,
    subscription: null,
    loadingSubscription: false,
  });

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // 🔧 CORREÇÃO: Verificar se a tabela users existe antes de consultar
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Usar maybeSingle() ao invés de single() para evitar erro quando não encontrar
      
      if (error) {
        console.warn('[AuthContext] Perfil não encontrado ou tabela ausente:', error.message);
        // Se a tabela não existir, criar um perfil básico
        if (error.message.includes('relation "users" does not exist')) {
          console.log('[AuthContext] Tabela users não existe, usando perfil básico');
          return {
            id: userId,
            email: '',
            name: 'Usuário',
            created_at: new Date().toISOString()
          };
        }
        return null;
      }
      
      // Se não encontrou dados, buscar na tabela users do Supabase
      if (!data) {
        console.log('[AuthContext] Perfil não encontrado no profiles, buscando em users...');
        
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', userId)
            .maybeSingle();
            
          if (userError) {
            console.error('[AuthContext] Erro ao buscar em users:', userError);
          }
          
          if (userData) {
            console.log('[AuthContext] Perfil encontrado na tabela users:', userData);
            return {
              id: userData.id,
              firebase_uid: userData.firebase_uid,
              email: userData.email || '',
              name: userData.display_name || userData.fazenda_nome || 'Usuário',
              fazenda_nome: userData.fazenda_nome,
              subscription_plan: userData.subscription_plan || 'fazendeiro',
              created_at: userData.created_at || new Date().toISOString()
            };
          }
        } catch (e) {
          console.error('[AuthContext] Erro ao buscar perfil em users:', e);
        }
        
        // Se ainda não encontrou, retornar perfil básico
        console.log('[AuthContext] Perfil não encontrado, criando perfil básico');
        return {
          id: userId,
          email: '',
          name: 'Usuário',
          created_at: new Date().toISOString()
        };
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      // Retornar perfil básico em caso de erro
      return {
        id: userId,
        email: '',
        name: 'Usuário',
        created_at: new Date().toISOString()
      };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Autenticar diretamente via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message || 'Invalid login credentials');
      }

      const supaUser = data?.user || null;
      if (!supaUser) {
        throw new Error('Invalid login credentials');
      }

      // Buscar perfil e normalizar usuário
      const profile = await fetchUserProfile(supaUser.id);
      const normalized = normalizeUser(supaUser, profile);
      if (!normalized) {
        throw new Error('Erro ao carregar dados do usuário');
      }

      setState(prev => ({
        ...prev,
        user: normalized,
        loading: false,
        authChecked: true,
        isAuthReady: true,
        error: null,
      }));

      router.push('/dashboard');
    } catch (error: unknown) {
      const errObj = (typeof error === 'object' && error !== null) ? error as { message?: string } : {};
      setState(prev => ({
        ...prev,
        error: errObj.message || 'Erro ao fazer login',
        loading: false,
      }));
      throw error;
    }
  }, [router, fetchUserProfile]);

  const register = useCallback(async (email: string, password: string, nome: string, fazenda?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: nome,
            display_name: nome,
            fazenda: fazenda || '',
            fazenda_nome: fazenda || '',
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
      }

      const registeredUser = data?.user;
      if (!registeredUser) {
        throw new Error('Cadastro nao retornou usuario valido.');
      }

      // Criar perfil na tabela users (essencial para login e operacao)
      const timestamp = new Date().toISOString();
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: registeredUser.id,
          firebase_uid: registeredUser.id,
          email: email,
          display_name: nome,
          fazenda_nome: fazenda || '',
          subscription_plan: 'fazendeiro',
          subscription_status: 'active',
          created_at: timestamp,
          updated_at: timestamp,
        }, { onConflict: 'id' });

      if (profileError) {
        console.warn('[AuthContext] Erro ao criar perfil (nao bloqueante):', profileError.message);
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (error: unknown) {
      const msg = (typeof error === 'object' && error !== null && 'message' in error) ? String((error as { message?: string }).message) : '';
      const errorMessage = /email.*(uso|cadastrado|registered)/i.test(msg)
        ? 'Este email já está cadastrado'
        : (msg || 'Erro ao criar conta. Tente novamente.');
      setState(prev => ({
        ...prev,
        user: null,
        loading: false,
        authChecked: true,
        isAuthReady: true,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: null,
        loading: false,
        authChecked: true,
        isAuthReady: true,
      }));

      router.push('/auth/login');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        error: (typeof error === 'object' && error !== null && 'message' in error) ? String((error as { message?: string }).message) : 'Erro ao sair',
        loading: false,
      }));
    }
  }, [router]);

  const updateProfile = useCallback(async (updatedData: Partial<AuthUser>) => {
    if (!state.user) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      let supabaseFailed = false;
      try {
        // Tentar atualizar no Supabase, se configurado
        if (updatedData.email && updatedData.email !== state.user.email) {
          const { error: updateEmailError } = await supabase.auth.updateUser({
            email: updatedData.email,
            data: {
              name: updatedData.name || state.user.name,
              fazenda_nome: updatedData.fazenda || state.user.fazenda
            }
          });
          if (updateEmailError) throw updateEmailError;
        }
        const { error: updateProfileError } = await supabase
          .from('users')
          .update({
            name: updatedData.name || state.user.name,
            email: updatedData.email || state.user.email,
            fazenda_nome: updatedData.fazenda || state.user.fazenda,
            telefone: updatedData.telefone || state.user.telefone,
            avatar_url: updatedData.avatar_url || state.user.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', state.user.id);
        if (updateProfileError) throw updateProfileError;
      } catch (_e) {
        supabaseFailed = true;
      }

      // Fallback para API de perfil do backend
      if (supabaseFailed) {
        try {
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: updatedData.name || state.user.name,
              email: updatedData.email || state.user.email,
              fazenda_nome: updatedData.fazenda || state.user.fazenda,
              telefone: updatedData.telefone || state.user.telefone,
              avatar_url: updatedData.avatar_url || state.user.avatar_url,
            })
          });
        } catch (_err) {
          // Continua mesmo se falhar; estado local ainda será atualizado
        }
      }

      // 3. Atualizar estado local com os novos dados
      const updatedUser = {
        ...state.user,
        ...updatedData,
        updated_at: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false,
      }));

      return updatedUser;
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      setState(prev => ({
        ...prev,
        error: (typeof error === 'object' && error !== null && 'message' in error) ? String((error as { message?: string }).message) : 'Erro ao atualizar perfil',
        loading: false,
      }));
      throw error;
    }
  }, [state.user]);

  // Monitor auth state changes (Supabase)
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const supaUser = session?.user || null;
      if (supaUser) {
        const profile = await fetchUserProfile(supaUser.id);
        const user = normalizeUser(supaUser, profile);
        setState(prev => ({
          ...prev,
          user,
          loading: false,
          authChecked: true,
          isAuthReady: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          loading: false,
          authChecked: true,
          isAuthReady: true,
        }));
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe?.();
    };
  }, [fetchUserProfile]);

  // Initialize auth state on mount to avoid spinner lock on protected pages
  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const supaUser = sessionData?.session?.user || null;
        if (supaUser) {
          const profile = await fetchUserProfile(supaUser.id);
          const user = normalizeUser(supaUser, profile);
          setState(prev => ({
            ...prev,
            user,
            loading: false,
            authChecked: true,
            isAuthReady: true,
          }));
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            loading: false,
            authChecked: true,
            isAuthReady: true,
          }));
        }
      } catch (e) {
        setState(prev => ({
          ...prev,
          loading: false,
          authChecked: true,
          isAuthReady: true,
        }));
      }
    })();
  }, [fetchUserProfile]);

  const value: AuthContextType = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    authChecked: state.authChecked,
    error: state.error,
    login,
    register,
    logout,
    clearErrors,
    updateProfile,
    setUser: (user: AuthUser | null) => {
      setState(prev => ({ ...prev, user }));
    },
    isAuthReady: state.isAuthReady,
    subscription: state.subscription,
    loadingSubscription: state.loadingSubscription,
    supabase, // Add supabase client to context
  }), [
    state,
    login,
    register,
    logout,
    clearErrors,
    updateProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
