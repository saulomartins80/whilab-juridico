import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
];

const trim = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const splitList = (value?: string | null): string[] => {
  const raw = trim(value);
  if (!raw) return [];
  return raw
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const toOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const unique = (values: Array<string | undefined | null>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = trim(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = trimTrailingSlash(
  trim(process.env.APP_PUBLIC_URL) ||
  trim(process.env.FRONTEND_URL) ||
  'http://localhost:3001'
);
const backendUrl = trimTrailingSlash(
  trim(process.env.APP_BACKEND_URL) ||
  trim(process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000'
);

const allowedOrigins = unique(
  [
    ...splitList(process.env.ALLOWED_ORIGINS),
    process.env.APP_PUBLIC_URL,
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ALT_URL,
    ...(isProduction ? [] : DEFAULT_DEVELOPMENT_ORIGINS)
  ]
    .map((value) => trim(value))
    .map((value) => (value ? toOrigin(value) : null))
);

export const runtimeConfig = {
  projectKey: trim(process.env.APP_PROJECT_KEY) || trim(process.env.NEXT_PUBLIC_APP_KEY) || 'bovinext',
  brandName: trim(process.env.APP_BRAND_NAME) || trim(process.env.NEXT_PUBLIC_BRAND_NAME) || 'BoviNext',
  backendUrl,
  frontendUrl,
  allowedOrigins,
  isProduction
};

export const buildFrontendUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${runtimeConfig.frontendUrl}${cleanPath}`;
};

export const validateRuntimeConfig = (): void => {
  if (!runtimeConfig.projectKey) {
    throw new Error('APP_PROJECT_KEY ou NEXT_PUBLIC_APP_KEY precisa ser definido');
  }

  if (isProduction) {
    const missing: string[] = [];
    const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY'];
    for (const key of required) {
      if (!trim(process.env[key])) {
        missing.push(key);
      }
    }

    const authSecret = trim(process.env.APP_JWT_SECRET) || trim(process.env.JWT_SECRET) || trim(process.env.NEXTAUTH_SECRET);
    if (!authSecret) {
      missing.push('APP_JWT_SECRET (ou JWT_SECRET / NEXTAUTH_SECRET)');
    }

    if (!runtimeConfig.allowedOrigins.length) {
      missing.push('ALLOWED_ORIGINS, FRONTEND_URL ou APP_PUBLIC_URL');
    }

    if (missing.length) {
      throw new Error(`[config] Variaveis obrigatorias ausentes em producao: ${missing.join(', ')}`);
    }
  }
};
