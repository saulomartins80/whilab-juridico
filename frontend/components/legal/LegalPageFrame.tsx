import Head from 'next/head';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import { dashboardBranding } from '../../config/branding';

const sectionLinks = [
  { href: '/dashboard', label: 'Painel' },
  { href: '/crm', label: 'CRM' },
  { href: '/processos', label: 'Processos' },
  { href: '/peticoes', label: 'Peticoes' },
  { href: '/publicacoes', label: 'Publicacoes' },
  { href: '/cobrancas', label: 'Cobrancas' },
  { href: '/agenda', label: 'Agenda' },
];

export interface LegalMetricItem {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export function LegalPageFrame({
  title,
  description,
  activePath,
  children,
}: {
  title: string;
  description: string;
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Head>
        <title>{`${title} | ${dashboardBranding.brandName}`}</title>
        <meta name="description" content={description} />
      </Head>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-surface overflow-hidden p-5 sm:p-6 lg:p-7"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="app-shell-chip">WhiLab Juridico</span>
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

export function LegalMetricGrid({ items }: { items: LegalMetricItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
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
            <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-600 dark:bg-emerald-500/14 dark:text-emerald-300">
              <item.icon className="h-5 w-5" />
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export function LegalCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="dashboard-surface-soft overflow-hidden">
      <div className="border-b border-slate-200/70 px-5 py-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}
