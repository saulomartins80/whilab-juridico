import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { dashboardBranding } from '../config/branding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  '';

const noop = () => {};

const createFallbackAuth = () => ({
  getSession: async () => ({ data: { session: null }, error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  signInWithPassword: async () => ({
    data: { user: null, session: null },
    error: new Error('Supabase environment is not configured'),
  }),
  signOut: async () => ({ error: null }),
  signInWithOtp: async () => ({
    data: { user: null, session: null },
    error: new Error('Supabase environment is not configured'),
  }),
  resetPasswordForEmail: async () => ({
    data: {},
    error: new Error('Supabase environment is not configured'),
  }),
  updateUser: async () => ({
    data: { user: null },
    error: new Error('Supabase environment is not configured'),
  }),
  onAuthStateChange: (_callback: (...args: unknown[]) => void) => ({
    data: { subscription: { unsubscribe: noop } },
  }),
});

const createFallbackStorage = () => ({
  from: () => ({
    upload: async () => ({ data: null, error: new Error('Supabase environment is not configured') }),
    getPublicUrl: () => ({ data: { publicUrl: '' } }),
    remove: async () => ({ data: null, error: new Error('Supabase environment is not configured') }),
    list: async () => ({ data: [], error: new Error('Supabase environment is not configured') }),
  }),
});

const createFallbackClient = (): SupabaseClient =>
  ({
    auth: createFallbackAuth(),
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      insert: async () => ({ data: null, error: new Error('Supabase environment is not configured') }),
      update: async () => ({ data: null, error: new Error('Supabase environment is not configured') }),
      upsert: async () => ({ data: null, error: new Error('Supabase environment is not configured') }),
      delete: async () => ({ data: null, error: new Error('Supabase environment is not configured') }),
    }),
    storage: createFallbackStorage(),
    channel: () => ({ on: noop, subscribe: () => ({ unsubscribe: noop }) }),
    removeChannel: async () => ({ error: null }),
    removeAllChannels: async () => [],
    rpc: async () => ({ data: null, error: new Error('Supabase environment is not configured') }),
  } as unknown as SupabaseClient);

const buildSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabasePublishableKey) {
    // Evita quebrar o build local quando as variáveis não foram configuradas ainda.
    // eslint-disable-next-line no-console
    console.warn('[supabaseClient] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    return createFallbackClient();
  }

  try {
    return createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        storageKey: dashboardBranding.authStorageKey,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        detectSessionInUrl: true,
        flowType: 'pkce',
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[supabaseClient] Falling back to a safe stub client:', error);
    return createFallbackClient();
  }
};

export const supabase = buildSupabaseClient();

export default supabase;
