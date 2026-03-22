import { supabase } from '../config/supabase';
import { AuthUser } from '../types/auth';

type HeaderValue = string | string[] | undefined;

export interface RequestLike {
  headers?: Record<string, HeaderValue>;
  query?: Record<string, unknown>;
  body?: unknown;
  cookies?: Record<string, string | undefined>;
}

export interface ResolvedAuthContext {
  token: string;
  userId: string;
  email: string;
  user: AuthUser;
  profile: Record<string, unknown> | null;
}

const normalizeHeaderValue = (value: HeaderValue): string | undefined => {
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return undefined;
};

const extractBearerToken = (value?: string): string | undefined => {
  if (!value) return undefined;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim();
};

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const extractTokenFromCookies = (cookies?: Record<string, string | undefined>): string | undefined => {
  if (!cookies) return undefined;

  return pickString(
    cookies['sb-access-token'],
    cookies['sb:token'],
    cookies['supabase-auth-token'],
    cookies['access_token']
  );
};

export const extractRequestToken = (req: RequestLike): string | undefined => {
  const authHeader = normalizeHeaderValue(req.headers?.authorization);
  return (
    extractBearerToken(authHeader) ||
    pickString(
      req.headers?.['x-auth-token'],
      req.headers?.['x-supabase-access-token'],
      req.query?.token,
      (req.body as any)?.token,
      extractTokenFromCookies(req.cookies)
    )
  );
};

export const resolveRequestAuthContext = async (req: RequestLike): Promise<ResolvedAuthContext | null> => {
  const token = extractRequestToken(req);
  if (!token) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', user.id)
      .maybeSingle();

    if (profileError && (profileError as any)?.code !== 'PGRST116') {
      console.warn('[authContext] Falha ao carregar perfil do Supabase:', profileError);
    }

    const displayName = (profile as any)?.display_name || user.user_metadata?.name || user.user_metadata?.full_name || undefined;
    const subscriptionPlan = (profile as any)?.subscription_plan;
    const subscriptionStatus = (profile as any)?.subscription_status;

    return {
      token,
      userId: user.id,
      email: user.email || '',
      profile: (profile as Record<string, unknown>) || null,
      user: {
        _id: user.id,
        id: user.id,
        uid: user.id,
        firebaseUid: user.id,
        email: user.email || '',
        name: displayName,
        display_name: (profile as any)?.display_name,
        fazenda_nome: (profile as any)?.fazenda_nome,
        subscription_plan: subscriptionPlan,
        subscription_status: subscriptionStatus
      } as AuthUser
    };
  } catch {
    return null;
  }
};

export async function resolveRequestUserId(req: RequestLike): Promise<string | null> {
  const context = await resolveRequestAuthContext(req);
  return context?.userId || null;
}
