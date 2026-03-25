import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  TrendingUp,
  Minus,
  DollarSign,
  Activity,
  Users,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

import { cn } from '../../lib/utils';

interface KPICardData {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  changePeriod: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'violet' | 'amber' | 'red' | 'sky' | 'cyan' | 'slate';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  target?: number;
  description?: string;
}

interface KPICardsProps {
  stats: {
    totalAnimais: number;
    receitaMensal: number;
    gmdMedio: number;
    precoArroba: number;
    alertasAtivos: number;
    producaoLeite: number;
    custosOperacionais: number;
    margemLucro: number;
    eficienciaReprodutiva: number;
    mortalidade: number;
  };
  loading?: boolean;
}

const colorClasses = {
  emerald: {
    ring: 'border-emerald-400/20',
    icon: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
    meter: 'from-emerald-500 to-teal-500',
  },
  blue: {
    ring: 'border-blue-400/20',
    icon: 'bg-blue-500/12 text-blue-600 dark:text-blue-300',
    meter: 'from-blue-500 to-sky-500',
  },
  violet: {
    ring: 'border-violet-400/20',
    icon: 'bg-violet-500/12 text-violet-600 dark:text-violet-300',
    meter: 'from-violet-500 to-fuchsia-500',
  },
  amber: {
    ring: 'border-amber-400/20',
    icon: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
    meter: 'from-amber-500 to-orange-500',
  },
  red: {
    ring: 'border-red-400/20',
    icon: 'bg-red-500/12 text-red-600 dark:text-red-300',
    meter: 'from-red-500 to-rose-500',
  },
  sky: {
    ring: 'border-sky-400/20',
    icon: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
    meter: 'from-sky-500 to-cyan-500',
  },
  cyan: {
    ring: 'border-cyan-400/20',
    icon: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-300',
    meter: 'from-cyan-500 to-teal-500',
  },
  slate: {
    ring: 'border-slate-400/20',
    icon: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
    meter: 'from-slate-500 to-slate-400',
  },
};

function KPICard({ card, index }: { card: KPICardData; index: number }) {
  const colors = colorClasses[card.color];
  const progressPercentage = card.target ? Math.min((card.value / card.target) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div
        className={cn(
          'dashboard-surface-soft relative h-full min-h-[218px] overflow-hidden border p-5',
          colors.ring,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_28%)]" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-2xl', colors.icon)}>
              <card.icon className="h-5 w-5" />
            </div>

            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                card.changeType === 'increase'
                  ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300'
                  : card.changeType === 'decrease'
                    ? 'bg-red-500/12 text-red-600 dark:text-red-300'
                    : 'bg-slate-500/12 text-slate-500 dark:text-slate-300',
              )}
            >
              {card.changeType === 'increase' ? (
                <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              ) : card.changeType === 'decrease' ? (
                <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Minus className="mr-1 h-3.5 w-3.5" />
              )}
              {Math.abs(card.change)}%
            </span>
          </div>

          <div className="mt-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {card.title}
            </h3>

            <div className="mt-3 flex items-end gap-2">
              <div className="text-2xl font-semibold text-slate-950 dark:text-white lg:text-[2rem]">
                {card.prefix}
                <CountUp
                  end={card.value}
                  decimals={card.decimals || 0}
                  duration={1.8}
                  separator="."
                  decimal=","
                />
              </div>
              {card.suffix && (
                <span className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.suffix}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {card.description}
            </p>
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{card.changePeriod}</span>
              {card.target && <span>Meta {progressPercentage.toFixed(0)}%</span>}
            </div>

            {card.target && (
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/80">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + index * 0.04 }}
                  className={cn('h-full rounded-full bg-gradient-to-r', colors.meter)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function KPICards({ stats, loading = false }: KPICardsProps) {
  const kpiData: KPICardData[] = [
    {
      id: 'rebanho',
      title: 'Base ativa',
      value: stats.totalAnimais,
      change: 2.3,
      changeType: 'increase',
      changePeriod: 'vs mes anterior',
      icon: Users,
      color: 'emerald',
      suffix: 'animais',
      target: 1500,
      description: 'Total rastreado pela operacao e pronto para leitura por categoria.',
    },
    {
      id: 'receita',
      title: 'Receita mensal',
      value: stats.receitaMensal,
      change: 12.5,
      changeType: 'increase',
      changePeriod: 'vs mes anterior',
      icon: DollarSign,
      color: 'blue',
      prefix: 'R$ ',
      target: 1500000,
      description: 'Faturamento consolidado do periodo com foco comercial.',
    },
    {
      id: 'gmd',
      title: 'Indice medio',
      value: stats.gmdMedio,
      change: 5.8,
      changeType: 'increase',
      changePeriod: 'ultimos 30 dias',
      icon: TrendingUp,
      color: 'violet',
      suffix: 'kg/dia',
      decimals: 2,
      target: 1.5,
      description: 'Velocidade media do indicador principal acompanhada no dashboard.',
    },
    {
      id: 'arroba',
      title: 'Indice de mercado',
      value: stats.precoArroba,
      change: 1.2,
      changeType: 'decrease',
      changePeriod: 'vs semana passada',
      icon: DollarSign,
      color: 'amber',
      prefix: 'R$ ',
      decimals: 2,
      description: 'Referencia externa conectada ao contexto operacional.',
    },
    {
      id: 'leite',
      title: 'Volume operacional',
      value: stats.producaoLeite,
      change: 8.3,
      changeType: 'increase',
      changePeriod: 'vs mes anterior',
      icon: Activity,
      color: 'cyan',
      suffix: 'litros',
      target: 20000,
      description: 'Volume mensal acompanhado no fluxo de producao.',
    },
    {
      id: 'margem',
      title: 'Margem de lucro',
      value: stats.margemLucro,
      change: 3.1,
      changeType: 'increase',
      changePeriod: 'vs trimestre',
      icon: TrendingUp,
      color: 'sky',
      suffix: '%',
      decimals: 1,
      target: 35,
      description: 'Leitura liquida da operacao para tomada de decisao.',
    },
    {
      id: 'eficiencia',
      title: 'Eficiencia do processo',
      value: stats.eficienciaReprodutiva,
      change: 2.5,
      changeType: 'increase',
      changePeriod: 'vs ano anterior',
      icon: Target,
      color: 'slate',
      suffix: '%',
      decimals: 1,
      target: 90,
      description: 'Aderencia do fluxo operacional a meta planejada.',
    },
    {
      id: 'alertas',
      title: 'Alertas em foco',
      value: stats.alertasAtivos,
      change: stats.alertasAtivos > 0 ? 15 : 0,
      changeType: stats.alertasAtivos > 0 ? 'increase' : 'neutral',
      changePeriod: 'atencao necessaria',
      icon: AlertTriangle,
      color: 'red',
      suffix: 'itens',
      description: 'Situacoes que exigem resposta mais rapida do operador.',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="dashboard-surface-soft h-[218px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpiData.map((card, index) => (
        <KPICard key={card.id} card={card} index={index} />
      ))}
    </div>
  );
}
