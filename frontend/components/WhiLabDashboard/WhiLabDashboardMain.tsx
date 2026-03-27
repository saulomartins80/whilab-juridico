import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Building,
  Clock3,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

import { dashboardBranding } from '../../config/branding';

const highlights = [
  {
    label: 'Clientes ativos',
    value: '128',
    helper: 'carteira entre consultivo e contencioso',
    icon: Users,
  },
  {
    label: 'Processos em acompanhamento',
    value: '342',
    helper: 'ownership distribuido por responsavel',
    icon: Building,
  },
  {
    label: 'Prazos sensiveis',
    value: '14',
    helper: 'janela de acao nas proximas 48h',
    icon: Clock3,
  },
  {
    label: 'A receber',
    value: 'R$ 54,8 mil',
    helper: 'honorarios e recorrencias do mes',
    icon: CreditCard,
  },
];

const workstreams = [
  {
    title: 'CRM juridico',
    description: 'Leads, clientes, funil e relacionamento comercial do escritorio.',
    href: '/crm',
  },
  {
    title: 'Processos',
    description: 'Carteira processual, ownership, etapas e documentos vinculados.',
    href: '/processos',
  },
  {
    title: 'Peticoes com IA',
    description: 'Rascunhos, revisoes e historico inicial de producao juridica.',
    href: '/peticoes',
  },
  {
    title: 'Cobrancas',
    description: 'Honorarios, pendencias e automacoes financeiras por cliente.',
    href: '/cobrancas',
  },
];

const nextSteps = [
  'Concluir multi-tenant real por escritorio no backend',
  'Subir schema juridico base no Supabase',
  'Ligar CRM, processos e arquivos a dados reais',
  'Ativar automacoes de publicacoes e cobrancas',
];

export default function WhiLabDashboard() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-surface relative overflow-hidden p-5 sm:p-6 lg:p-7"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_28%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="app-shell-chip border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                kickoff juridico
              </span>
              <span className="app-shell-chip">
                <ShieldCheck className="h-3.5 w-3.5" />
                estrutura SaaS preservada
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
                painel juridico
              </p>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl lg:text-[2.15rem]">
                {dashboardBranding.brandName}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Primeira leitura executiva da vertical juridica: CRM, processos, cobrancas,
                documentos e IA aplicada em uma unica base.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {highlights.map(({ label, value, helper, icon: Icon }) => (
                <div key={label} className="dashboard-surface-soft p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                        {value}
                      </p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-600 dark:bg-emerald-500/14 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/crm" className="app-shell-button-primary">
                Abrir CRM
              </Link>
              <Link href="/processos" className="dashboard-secondary-button">
                Revisar processos
              </Link>
              <Link href="/peticoes" className="dashboard-secondary-button">
                Nova peticao
              </Link>
            </div>
          </div>

          <div className="dashboard-surface-soft p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  proximo passo
                </div>
                <div className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                  Fechar a camada multi-tenant por escritorio
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="mt-4 space-y-3">
              {nextSteps.map((step) => (
                <div key={step} className="rounded-2xl border border-slate-200/70 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 xl:grid-cols-2">
        {workstreams.map((item) => (
          <div key={item.title} className="dashboard-surface-soft p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <Link href={item.href} className="dashboard-secondary-button mt-5">
              Abrir modulo
            </Link>
          </div>
        ))}
      </section>

      <section className="dashboard-surface-soft p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-600 dark:bg-emerald-500/14 dark:text-emerald-300">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              Direcao desta sprint
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Organizar a base juridica visivel no frontend, enquanto o backend sobe o tenant por
              escritorio, schema juridico e rotas reais de CRM, processos e documentos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
