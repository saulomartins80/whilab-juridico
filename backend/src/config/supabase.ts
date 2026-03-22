import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

let supabaseInstance: SupabaseClient<any> | null = null;
let supabaseClientInstance: SupabaseClient<any> | null = null;

const createSupabaseClient = (supabaseUrl: string, supabaseKey: string): SupabaseClient<any> =>
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

const getSupabaseInstance = (): SupabaseClient<any> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nao configuradas');
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey);
  }

  return supabaseInstance;
};

const getSupabaseClientInstance = (): SupabaseClient<any> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY nao configuradas');
  }

  if (!supabaseClientInstance) {
    supabaseClientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClientInstance;
};

export const getSupabaseAdminClient = (): SupabaseClient<any> => getSupabaseInstance();

export const getSupabaseAnonClient = (): SupabaseClient<any> => getSupabaseClientInstance();

export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
};

// Criar cliente tipado
export const supabase: SupabaseClient<any> = new Proxy({} as SupabaseClient<any>, {
  get(_target, prop) {
    const client = getSupabaseInstance();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
  set(_target, prop, value) {
    const client = getSupabaseInstance();
    (client as any)[prop] = value;
    return true;
  }
}) as SupabaseClient<any>;

// Cliente para operações do usuário (anon key) - opcional quando configurado
export const supabaseClient: SupabaseClient<any> | null = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  ? (new Proxy({} as SupabaseClient<any>, {
    get(_target, prop) {
      const client = getSupabaseClientInstance();
      const value = (client as any)[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
    set(_target, prop, value) {
      const client = getSupabaseClientInstance();
      (client as any)[prop] = value;
      return true;
    }
  }) as SupabaseClient<any>)
  : null;

export const supabaseAnonClient: SupabaseClient<any> | null = supabaseClient;

export default supabase;
