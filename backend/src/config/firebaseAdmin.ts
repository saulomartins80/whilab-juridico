import { createClient, SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { supabase } from './supabase';
import { runtimeConfig } from './runtime';

let supabaseAdminInstance: SupabaseClient | null = null;

const getSupabaseAdminInstance = (): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas');
  }

  if (!supabaseAdminInstance) {
    console.log(`[SupabaseAdmin] Inicializando Admin para ${runtimeConfig.brandName}...`);

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[SupabaseAdmin] Admin inicializado com sucesso');
    console.log(`[SupabaseAdmin] URL: ${supabaseUrl}`);
  }

  return supabaseAdminInstance;
};

// Cliente Supabase com service role para operações administrativas
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminInstance();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
  set(_target, prop, value) {
    const client = getSupabaseAdminInstance();
    (client as any)[prop] = value;
    return true;
  }
}) as SupabaseClient;

// Função para verificar conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('[SupabaseAdmin] Tabela usuarios ainda nao existe - sera criada automaticamente');
      return true;
    }
    
    console.log('[SupabaseAdmin] Conexao com Supabase testada com sucesso');
    return true;
  } catch (error) {
    console.error('[SupabaseAdmin] Erro na conexao com Supabase:', error);
    return false;
  }
};

const getAuthSecret = (): string | null => {
  return process.env.APP_JWT_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || null;
};

const normalizeUserUpdate = (payload: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = {};

  if (payload.email !== undefined) normalized.email = payload.email;
  if (payload.name !== undefined) normalized.display_name = payload.name;
  if (payload.display_name !== undefined) normalized.display_name = payload.display_name;
  if (payload.fazenda_nome !== undefined) normalized.fazenda_nome = payload.fazenda_nome;
  if (payload.updatedAt !== undefined) normalized.updated_at = payload.updatedAt;

  return normalized;
};

// Compatibilidade com código legado que usa Firebase Admin
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    if (!token) {
      throw new Error('Token não fornecido');
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return { uid: user.id, email: user.email || '' };
      }
    } catch {
      // segue para fallback JWT
    }

    const secret = getAuthSecret();
    if (!secret) {
      throw new Error('Não foi possível validar o token sem APP_JWT_SECRET, JWT_SECRET ou Supabase Auth');
    }

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    const uid = typeof decoded.sub === 'string' ? decoded.sub : (decoded.uid as string | undefined);

    if (!uid) {
      throw new Error('Token inválido: uid ausente');
    }

    return { uid, email: typeof decoded.email === 'string' ? decoded.email : '' };
  },

  createCustomToken: async (uid: string) => {
    const secret = getAuthSecret();
    if (!secret) {
      throw new Error('Não foi possível emitir token sem APP_JWT_SECRET, JWT_SECRET ou NEXTAUTH_SECRET');
    }

    return jwt.sign({ uid }, secret, {
      subject: uid,
      expiresIn: '1h'
    });
  }
};

class LegacyFirestoreDoc {
  constructor(private readonly collectionName: string, private readonly docId: string) {}

  async set(data: Record<string, unknown>, options?: { merge?: boolean }) {
    if (this.collectionName !== 'users') {
      throw new Error(`Coleção não suportada: ${this.collectionName}`);
    }

    const payload = normalizeUserUpdate(data);
    const { error } = await supabase
      .from('users')
      .upsert({
        firebase_uid: this.docId,
        email: typeof payload.email === 'string' ? payload.email : '',
        display_name: typeof payload.display_name === 'string' ? payload.display_name : '',
        fazenda_nome: typeof payload.fazenda_nome === 'string' && payload.fazenda_nome.trim()
          ? payload.fazenda_nome
          : (typeof payload.display_name === 'string' && payload.display_name.trim() ? payload.display_name : 'Fazenda'),
        subscription_plan: 'fazendeiro',
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'firebase_uid',
        ignoreDuplicates: false
      });

    if (error) {
      throw error;
    }

    return { merge: !!options?.merge };
  }

  async get() {
    if (this.collectionName !== 'users') {
      return { exists: false };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', this.docId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return {
      exists: !!data,
      data: () => data
    };
  }
}

class LegacyFirestoreCollection {
  constructor(private readonly collectionName: string) {}

  doc(docId: string) {
    return new LegacyFirestoreDoc(this.collectionName, docId);
  }
}

export const adminFirestore = {
  collection: (name: string) => new LegacyFirestoreCollection(name)
};

export const adminStorage = {
  bucket: () => ({
    file: () => ({
      getSignedUrl: async () => {
        throw new Error(`Storage legacy adapter nao implementado no backend ${runtimeConfig.brandName}`);
      }
    })
  })
};
