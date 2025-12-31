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
  MoreVertical
} from 'lucide-react';

import { cn } from '../../lib/utils';

interface KPICardData {
  id: string;
  title: string;
  value: number;
  formattedValue?: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  changePeriod: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'indigo' | 'pink' | 'cyan';
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
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    progress: 'bg-emerald-500'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    progress: 'bg-blue-500'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    progress: 'bg-purple-500'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    progress: 'bg-amber-500'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'bg-red-100 dark:bg-red-900/50',
    iconColor: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    progress: 'bg-red-500'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: 'bg-indigo-100 dark:bg-indigo-900/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    progress: 'bg-indigo-500'
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    icon: 'bg-pink-100 dark:bg-pink-900/50',
    iconColor: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    progress: 'bg-pink-500'
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    icon: 'bg-cyan-100 dark:bg-cyan-900/50',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    progress: 'bg-cyan-500'
  }
};

function KPICard({ card, index }: { card: KPICardData; index: number }) {
  const colors = colorClasses[card.color];
  const progressPercentage = card.target ? (card.value / card.target) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="relative group h-full"
    >
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 h-full min-h-[200px] flex flex-col",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${card.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" className={colors.iconColor} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${card.id})`} />
          </svg>
        </div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-3 rounded-xl", colors.icon)}>
              <card.icon className={cn("h-6 w-6", colors.iconColor)} />
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider truncate">
            {card.title}
          </h3>

          {/* Value */}
          <div className="flex items-baseline space-x-2 mb-3 flex-wrap">
            <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
              {card.prefix}
              <CountUp
                end={card.value}
                decimals={card.decimals || 0}
                duration={2}
                separator="."
                decimal=","
              />
              <span className="text-lg lg:text-xl font-semibold text-gray-600 dark:text-gray-300 ml-1">{card.suffix}</span>
            </span>
          </div>

          {/* Change Badge */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-2">
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
                card.changeType === 'increase' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                card.changeType === 'decrease' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
              )}>
                {card.changeType === 'increase' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : card.changeType === 'decrease' ? (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                ) : (
                  <Minus className="h-3 w-3 mr-1" />
                )}
                {Math.abs(card.change)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {card.changePeriod}
              </span>
            </div>
          </div>

          {/* Progress Bar (if target exists) */}
          {card.target && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Meta</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={cn("h-full rounded-full", colors.progress)}
                />
              </div>
            </div>
          )}

          {/* Description */}
          {card.description && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function KPICards({ stats, loading = false }: KPICardsProps) {
  const kpiData: KPICardData[] = [
    {
      id: 'rebanho',
      title: 'REBANHO TOTAL',
      value: stats.totalAnimais,
      change: 2.3,
      changeType: 'increase',
      changePeriod: 'vs mês anterior',
      icon: Users,
      color: 'emerald',
      suffix: ' animais',
      target: 1500,
      description: 'Total de animais ativos na fazenda'
    },
    {
      id: 'receita',
      title: 'RECEITA MENSAL',
      value: stats.receitaMensal,
      formattedValue: `(R$ ${(stats.receitaMensal / 1000).toFixed(0)}k)`,
      change: 12.5,
      changeType: 'increase',
      changePeriod: 'vs mês anterior',
      icon: DollarSign,
      color: 'blue',
      prefix: 'R$ ',
      target: 1500000,
      description: 'Faturamento total do mês'
    },
    {
      id: 'gmd',
      title: 'GMD MÉDIO',
      value: stats.gmdMedio,
      change: 5.8,
      changeType: 'increase',
      changePeriod: 'últimos 30 dias',
      icon: TrendingUp,
      color: 'purple',
      suffix: ' kg/dia',
      decimals: 2,
      target: 1.5,
      description: 'Ganho médio diário do rebanho'
    },
    {
      id: 'arroba',
      title: 'PREÇO DA ARROBA',
      value: stats.precoArroba,
      change: 1.2,
      changeType: 'decrease',
      changePeriod: 'vs semana passada',
      icon: DollarSign,
      color: 'amber',
      prefix: 'R$ ',
      decimals: 2,
      description: 'Cotação atual do mercado'
    },
    {
      id: 'leite',
      title: 'PRODUÇÃO DE LEITE',
      value: stats.producaoLeite,
      formattedValue: `(${(stats.producaoLeite / 1000).toFixed(1)}k L)`,
      change: 8.3,
      changeType: 'increase',
      changePeriod: 'vs mês anterior',
      icon: Activity,
      color: 'cyan',
      suffix: ' litros',
      target: 20000,
      description: 'Produção mensal de leite'
    },
    {
      id: 'margem',
      title: 'MARGEM DE LUCRO',
      value: stats.margemLucro,
      change: 3.1,
      changeType: 'increase',
      changePeriod: 'vs trimestre',
      icon: TrendingUp,
      color: 'indigo',
      suffix: '%',
      decimals: 1,
      target: 35,
      description: 'Margem operacional líquida'
    },
    {
      id: 'eficiencia',
      title: 'EFICIÊNCIA REPRODUTIVA',
      value: stats.eficienciaReprodutiva,
      change: 2.5,
      changeType: 'increase',
      changePeriod: 'vs ano anterior',
      icon: Target,
      color: 'pink',
      suffix: '%',
      decimals: 1,
      target: 90,
      description: 'Taxa de prenhez do rebanho'
    },
    {
      id: 'alertas',
      title: 'ALERTAS ATIVOS',
      value: stats.alertasAtivos,
      change: stats.alertasAtivos > 0 ? 15 : 0,
      changeType: stats.alertasAtivos > 0 ? 'increase' : 'neutral',
      changePeriod: 'atenção necessária',
      icon: AlertTriangle,
      color: 'red',
      suffix: ' alertas',
      description: 'Situações que requerem atenção'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {kpiData.map((card, index) => (
        <KPICard key={card.id} card={card} index={index} />
      ))}
    </div>
  );
}
