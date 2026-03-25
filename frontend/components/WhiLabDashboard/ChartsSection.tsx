import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, Filter, Maximize2, Sparkles } from 'lucide-react';

import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

const colors = {
  primary: '#10b981',
  secondary: '#38bdf8',
  tertiary: '#8b5cf6',
  quaternary: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f97316',
  info: '#06b6d4',
};

const evolutionData = [
  { name: 'Jan', peso: 320, gmd: 0.95, producao: 12500 },
  { name: 'Fev', peso: 335, gmd: 1.02, producao: 13200 },
  { name: 'Mar', peso: 348, gmd: 1.08, producao: 13800 },
  { name: 'Abr', peso: 365, gmd: 1.12, producao: 14200 },
  { name: 'Mai', peso: 378, gmd: 1.15, producao: 14800 },
  { name: 'Jun', peso: 392, gmd: 1.18, producao: 15420 },
];

const categoryData = [
  { name: 'Bezerros', value: 285, percentage: 23 },
  { name: 'Novilhas', value: 342, percentage: 27 },
  { name: 'Vacas', value: 420, percentage: 34 },
  { name: 'Touros', value: 85, percentage: 7 },
  { name: 'Bois', value: 115, percentage: 9 },
];

const financialData = [
  { name: 'Jan', receita: 980000, despesa: 720000, lucro: 260000 },
  { name: 'Fev', receita: 1050000, despesa: 750000, lucro: 300000 },
  { name: 'Mar', receita: 1120000, despesa: 780000, lucro: 340000 },
  { name: 'Abr', receita: 1180000, despesa: 810000, lucro: 370000 },
  { name: 'Mai', receita: 1200000, despesa: 850000, lucro: 350000 },
  { name: 'Jun', receita: 1250000, despesa: 880000, lucro: 370000 },
];

const healthData = [
  { subject: 'Vacinacao', A: 95, fullMark: 100 },
  { subject: 'Vermifugacao', A: 88, fullMark: 100 },
  { subject: 'Nutricao', A: 92, fullMark: 100 },
  { subject: 'Reproducao', A: 87, fullMark: 100 },
  { subject: 'Bem-estar', A: 90, fullMark: 100 },
  { subject: 'Sanidade', A: 93, fullMark: 100 },
];

interface TooltipItem {
  color: string;
  name: string;
  value: string | number;
}

function CustomTooltip({
  active,
  payload,
  label,
  isDark,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
  isDark: boolean;
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-2xl ${
        isDark
          ? 'border-slate-700 bg-slate-950/95 text-slate-100'
          : 'border-slate-200 bg-white/95 text-slate-900'
      }`}
    >
      <p className="mb-2 text-sm font-semibold">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}:{' '}
          {typeof entry.value === 'number'
            ? entry.value.toLocaleString('pt-BR', {
                minimumFractionDigits: entry.name.includes('%') ? 1 : 0,
                maximumFractionDigits: entry.name.includes('%') ? 1 : 2,
              })
            : entry.value}
        </p>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  actions,
  fullWidth = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  fullWidth?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('dashboard-surface-soft overflow-hidden p-5', fullWidth ? 'col-span-full' : 'col-span-1')}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:text-white"
            aria-label="Expandir grafico"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={cn('transition-all duration-300', isExpanded ? 'h-[26rem]' : 'h-72')}>
        {children}
      </div>
    </motion.div>
  );
}

export default function ChartsSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const chartTick = { fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 };
  const gridColor = isDark ? 'rgba(71,85,105,0.26)' : 'rgba(148,163,184,0.22)';
  const axisColor = isDark ? 'rgba(71,85,105,0.34)' : 'rgba(148,163,184,0.28)';

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white lg:text-2xl">
              Analises da operacao
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Graficos com leitura mais limpa, espacamento melhor e contraste ajustado para o dark.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="dashboard-secondary-button">
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          <button type="button" className="app-shell-button-primary">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Evolucao do indicador principal" subtitle="Ultimos 6 meses" fullWidth>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={evolutionData}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTick} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={chartTick} />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={chartTick}
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend wrapperStyle={{ color: chartTick.fill }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="peso"
                stroke={colors.primary}
                fillOpacity={1}
                fill="url(#colorPeso)"
                name="Peso medio (kg)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="gmd"
                stroke={colors.secondary}
                strokeWidth={3}
                dot={{ fill: colors.secondary, strokeWidth: 0 }}
                name="GMD (kg/dia)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuicao por categoria" subtitle="Total monitorado: 1.247 ativos">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => {
                  const total = categoryData.reduce((accumulator, entry) => accumulator + entry.value, 0);
                  const safeName = typeof name === 'string' ? name : '';
                  const safeValue = typeof value === 'number' ? value : 0;
                  return `${safeName} ${Math.round((safeValue / total) * 100)}%`;
                }}
                outerRadius={86}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Analise financeira" subtitle="Receitas vs despesas vs lucro">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTick} />
              <YAxis axisLine={false} tickLine={false} tick={chartTick} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend wrapperStyle={{ color: chartTick.fill }} />
              <Bar dataKey="receita" fill={colors.success} radius={[8, 8, 0, 0]} name="Receita" />
              <Bar dataKey="despesa" fill={colors.danger} radius={[8, 8, 0, 0]} name="Despesa" />
              <Bar dataKey="lucro" fill={colors.info} radius={[8, 8, 0, 0]} name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Indicadores operacionais" subtitle="Score de estabilidade do processo">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={healthData}>
              <PolarGrid stroke={axisColor} />
              <PolarAngleAxis dataKey="subject" tick={chartTick} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={chartTick} />
              <Radar
                name="Score"
                dataKey="A"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.5}
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Custos por categoria" subtitle="Distribuicao de despesas">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Racao', value: 45000 },
                  { name: 'Medicamentos', value: 12000 },
                  { name: 'Mao de obra', value: 28000 },
                  { name: 'Manutencao', value: 8000 },
                  { name: 'Outros', value: 7000 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={78}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[colors.primary, colors.secondary, colors.tertiary, colors.quaternary, colors.warning].map(
                  (color, index) => (
                    <Cell key={`cost-cell-${index}`} fill={color} />
                  ),
                )}
              </Pie>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Producao operacional" subtitle="Evolucao mensal do volume" fullWidth>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={evolutionData}>
            <defs>
              <linearGradient id="colorProducao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.info} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.info} stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTick} />
            <YAxis axisLine={false} tickLine={false} tick={chartTick} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Area
              type="monotone"
              dataKey="producao"
              stroke={colors.info}
              fillOpacity={1}
              fill="url(#colorProducao)"
              name="Producao (L)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}
