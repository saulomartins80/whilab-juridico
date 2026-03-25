import Head from 'next/head';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Database,
  Loader2,
  LucideIcon,
  RefreshCcw,
} from 'lucide-react';

import type {
  EncomendasResourceResult,
  EncomendasResourceStatus,
} from '../../types/encomendas';
import { dashboardBranding } from '../../config/branding';

const sectionLinks = [
  { href: '/encomendas', label: 'Overview' },
  { href: '/encomendas/clientes', label: 'Clientes' },
  { href: '/encomendas/catalogo', label: 'Catalogo' },
  { href: '/encomendas/cobrancas', label: 'Cobrancas' },
];

interface EncomendasPageFrameProps {
  title: string;
  description: string;
  activePath: string;
  eyebrow?: string;
  children: ReactNode;
}

interface MetricCardItem {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: 'emerald' | 'sky' | 'amber' | 'rose';
}

interface ResourceState<T> {
  loading: boolean;
  result: EncomendasResourceResult<T> | null;
  reload: () => Promise<void>;
}

export function useEncomendasResource<T>(
  loader: () => Promise<EncomendasResourceResult<T>>,
): ResourceState<T> {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<EncomendasResourceResult<T> | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      const nextResult = await loader();
      setResult(nextResult);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const nextResult = await loader();

        if (active) {
          setResult(nextResult);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [loader]);

  return { loading, result, reload };
}

export function EncomendasPageFrame({
  title,
  description,
  activePath,
  eyebrow = 'App de Encomendas',
  children,
}: EncomendasPageFrameProps) {
  return (
    <div className="flex flex-col gap-6">
      <Head>
        <title>{`${title} | ${dashboardBranding.brandName} Encomendas`}</title>
        <meta name="description" content={description} />
        <meta
          name="apple-mobile-web-app-title"
          content={`${dashboardBranding.brandName} Encomendas`}
        />
      </Head>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-surface overflow-hidden p-5 sm:p-6 lg:p-7"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="app-shell-chip">{eyebrow}</span>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              {description}
            </p>
          </div>

          <div className="dashboard-surface-muted flex flex-wrap gap-2 p-2">
            {sectionLinks.map((link) => {
              const isActive = link.href === activePath;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-950/60 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.section>

      {children}
    </div>
  );
}

export function EncomendasStatusBanner<T>({
  loading,
  result,
  onRetry,
}: {
  loading: boolean;
  result: EncomendasResourceResult<T> | null;
  onRetry: () => Promise<void> | void;
}) {
  if (loading) {
    return (
      <div className="dashboard-surface-soft flex items-center gap-3 p-5 text-sm text-slate-600 dark:text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
        Carregando dados do vertical de encomendas.
      </div>
    );
  }

  if (!result || result.status === 'ready') {
    return null;
  }

  const tone = getBannerTone(result.status);
  const Icon = result.status === 'schema-mismatch' ? Database : AlertTriangle;

  return (
    <div className={`dashboard-surface-soft border p-5 ${tone.container}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-2xl p-2.5 ${tone.iconWrap}`}>
            <Icon className={`h-5 w-5 ${tone.icon}`} />
          </div>

          <div className="space-y-1">
            <p className={`text-sm font-semibold ${tone.title}`}>{result.message}</p>
            <p className={`text-sm ${tone.text}`}>
              {result.status === 'empty'
                ? 'Nenhuma excecao ocorreu. O frontend so nao recebeu registros para exibir ainda.'
                : 'A tela foi mantida funcional para evitar quebra total enquanto o backend fica indisponivel ou incompleto.'}
            </p>
            {result.source ? (
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                origem {result.source}
              </p>
            ) : null}
          </div>
        </div>

        <button type="button" onClick={onRetry} className="dashboard-secondary-button gap-2">
          <RefreshCcw className="h-4 w-4" />
          Tentar de novo
        </button>
      </div>
    </div>
  );
}

export function EncomendasMetricsGrid({ items }: { items: MetricCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const tone = getMetricTone(item.tone ?? 'emerald');

        return (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="dashboard-surface-soft p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.hint}</p>
              </div>

              <div className={`rounded-2xl p-3 ${tone.wrap}`}>
                <item.icon className={`h-5 w-5 ${tone.icon}`} />
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

export function EncomendasCollectionCard({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="dashboard-surface-soft overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200/70 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-500"
          >
            Abrir pagina
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      {children}
    </section>
  );
}

export function EncomendasEmptyCollection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900/70">
        <Database className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function formatDate(value?: string): string {
  if (!value) {
    return 'Sem data';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sem data';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function humanizeStatus(status: string): string {
  return status
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getStatusBadge(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized.includes('pago') || normalized.includes('paid') || normalized.includes('entreg')) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
  }

  if (
    normalized.includes('venc') ||
    normalized.includes('cancel') ||
    normalized.includes('inadimpl') ||
    normalized.includes('blocked')
  ) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
  }

  if (
    normalized.includes('pend') ||
    normalized.includes('open') ||
    normalized.includes('aguard') ||
    normalized.includes('draft')
  ) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  }

  return 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300';
}

function getMetricTone(tone: MetricCardItem['tone']) {
  switch (tone) {
    case 'sky':
      return {
        wrap: 'bg-sky-100 dark:bg-sky-950/40',
        icon: 'text-sky-600 dark:text-sky-300',
      };
    case 'amber':
      return {
        wrap: 'bg-amber-100 dark:bg-amber-950/40',
        icon: 'text-amber-600 dark:text-amber-300',
      };
    case 'rose':
      return {
        wrap: 'bg-rose-100 dark:bg-rose-950/40',
        icon: 'text-rose-600 dark:text-rose-300',
      };
    default:
      return {
        wrap: 'bg-emerald-100 dark:bg-emerald-950/40',
        icon: 'text-emerald-600 dark:text-emerald-300',
      };
  }
}

function getBannerTone(status: EncomendasResourceStatus) {
  if (status === 'empty') {
    return {
      container: 'border-sky-200/70 dark:border-sky-900/60',
      iconWrap: 'bg-sky-100 dark:bg-sky-950/40',
      icon: 'text-sky-600 dark:text-sky-300',
      title: 'text-sky-900 dark:text-sky-100',
      text: 'text-sky-800/90 dark:text-sky-200/80',
    };
  }

  if (status === 'schema-mismatch') {
    return {
      container: 'border-amber-200/70 dark:border-amber-900/60',
      iconWrap: 'bg-amber-100 dark:bg-amber-950/40',
      icon: 'text-amber-600 dark:text-amber-300',
      title: 'text-amber-900 dark:text-amber-100',
      text: 'text-amber-800/90 dark:text-amber-200/80',
    };
  }

  return {
    container: 'border-rose-200/70 dark:border-rose-900/60',
    iconWrap: 'bg-rose-100 dark:bg-rose-950/40',
    icon: 'text-rose-600 dark:text-rose-300',
    title: 'text-rose-900 dark:text-rose-100',
    text: 'text-rose-800/90 dark:text-rose-200/80',
  };
}
