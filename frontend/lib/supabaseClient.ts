import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { dashboardBranding } from '../config/branding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
const supabaseClientKey = supabaseAnonKey || supabasePublishableKey || '';
const supabaseKeyMode = supabaseAnonKey ? 'anon' : supabasePublishableKey ? 'publishable' : 'missing';
const missingSupabaseEnvVars = [
  !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
  !supabaseClientKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)' : null,
].filter(Boolean) as string[];

const noop = () => {};

const createFallbackAuth = () => ({
  getSession: async () => ({ data: { session: null }, error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  signUp: async () => ({
    data: { user: null, session: null },
    error: new Error('Supabase auth is unavailable'),
  }),
  signInWithPassword: async () => ({
    data: { user: null, session: null },
    error: new Error('Supabase auth is unavailable'),
  }),
  signOut: async () => ({ error: null }),
  signInWithOtp: async () => ({
    data: { user: null, session: null },
    error: new Error('Supabase auth is unavailable'),
  }),
  resetPasswordForEmail: async () => ({
    data: {},
    error: new Error('Supabase auth is unavailable'),
  }),
  exchangeCodeForSession: async () => ({
    data: { session: null, user: null },
    error: new Error('Supabase auth is unavailable'),
  }),
  setSession: async () => ({
    data: { session: null, user: null },
    error: new Error('Supabase auth is unavailable'),
  }),
  updateUser: async () => ({
    data: { user: null },
    error: new Error('Supabase auth is unavailable'),
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
  if (!supabaseUrl || !supabaseClientKey) {
    // Evita quebrar o build local quando as variáveis não foram configuradas ainda.
    // eslint-disable-next-line no-console
    console.warn(`[supabaseClient] Missing public config: ${missingSupabaseEnvVars.join(', ')}`);
    return createFallbackClient();
  }

  try {
    if (!supabaseAnonKey && supabasePublishableKey) {
      // eslint-disable-next-line no-console
      console.warn('[supabaseClient] NEXT_PUBLIC_SUPABASE_ANON_KEY not set; falling back to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    }

    return createClient(supabaseUrl, supabaseClientKey, {
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

export const supabaseRuntime = {
  isConfigured: Boolean(supabaseUrl && supabaseClientKey),
  keyMode: supabaseKeyMode,
  missingPublicConfig: missingSupabaseEnvVars,
};

export const supabase = buildSupabaseClient();

export default supabase;
