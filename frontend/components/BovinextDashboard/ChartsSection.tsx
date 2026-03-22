import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import {
  Filter,
  Download,
  Maximize2
} from 'lucide-react';

import { cn } from '../../lib/utils';

// Cores do tema
const colors = {
  primary: '#10b981',
  secondary: '#3b82f6',
  tertiary: '#8b5cf6',
  quaternary: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f97316',
  info: '#06b6d4'
};

// Dados mockados (serão substituídos por dados reais)
const evolutionData = [
  { name: 'Jan', peso: 320, gmd: 0.95, producao: 12500 },
  { name: 'Fev', peso: 335, gmd: 1.02, producao: 13200 },
  { name: 'Mar', peso: 348, gmd: 1.08, producao: 13800 },
  { name: 'Abr', peso: 365, gmd: 1.12, producao: 14200 },
  { name: 'Mai', peso: 378, gmd: 1.15, producao: 14800 },
  { name: 'Jun', peso: 392, gmd: 1.18, producao: 15420 }
];

const categoryData = [
  { name: 'Bezerros', value: 285, percentage: 23 },
  { name: 'Novilhas', value: 342, percentage: 27 },
  { name: 'Vacas', value: 420, percentage: 34 },
  { name: 'Touros', value: 85, percentage: 7 },
  { name: 'Bois', value: 115, percentage: 9 }
];

const financialData = [
  { name: 'Jan', receita: 980000, despesa: 720000, lucro: 260000 },
  { name: 'Fev', receita: 1050000, despesa: 750000, lucro: 300000 },
  { name: 'Mar', receita: 1120000, despesa: 780000, lucro: 340000 },
  { name: 'Abr', receita: 1180000, despesa: 810000, lucro: 370000 },
  { name: 'Mai', receita: 1200000, despesa: 850000, lucro: 350000 },
  { name: 'Jun', receita: 1250000, despesa: 880000, lucro: 370000 }
];

const healthData = [
  { subject: 'Vacinação', A: 95, fullMark: 100 },
  { subject: 'Vermifugação', A: 88, fullMark: 100 },
  { subject: 'Nutrição', A: 92, fullMark: 100 },
  { subject: 'Reprodução', A: 87, fullMark: 100 },
  { subject: 'Bem-estar', A: 90, fullMark: 100 },
  { subject: 'Sanidade', A: 93, fullMark: 100 }
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: string | number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: { color: string; name: string; value: string | number }, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? 
              entry.value.toLocaleString('pt-BR', {
                minimumFractionDigits: entry.name.includes('%') ? 1 : 0,
                maximumFractionDigits: entry.name.includes('%') ? 1 : 2
              }) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ChartCard({ 
  title, 
  subtitle, 
  children, 
  actions,
  fullWidth = false 
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
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700",
        fullWidth ? "col-span-full" : "col-span-1",
        "hover:shadow-lg transition-shadow duration-300"
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Maximize2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className={cn(
        "transition-all duration-300",
        isExpanded ? "h-96" : "h-64"
      )}>
        {children}
      </div>
    </motion.div>
  );
}

export default function ChartsSection() {

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            Análises da operação
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visualize a leitura da demo vertical em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filtros</span>
          </button>
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span className="text-sm">Exportar</span>
          </button>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução do indicador principal - ocupa 2 colunas */}
        <ChartCard 
          title="Evolução do indicador principal" 
          subtitle="Últimos 6 meses"
          fullWidth={true}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={evolutionData}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="peso"
                stroke={colors.primary}
                fillOpacity={1}
                fill="url(#colorPeso)"
                name="Peso Médio (kg)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="gmd"
                stroke={colors.secondary}
                strokeWidth={3}
                dot={{ fill: colors.secondary }}
                name="GMD (kg/dia)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Distribuição da operação */}
        <ChartCard 
          title="Distribuição por Categoria" 
          subtitle="Total: 1.247 ativos"
          fullWidth={false}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => {
                  const total = categoryData.reduce((a, b) => a + b.value, 0);
                  const safeName = typeof name === 'string' ? name : '';
                  const safeValue = typeof value === 'number' ? value : 0;
                  return `${safeName} (${Math.round((safeValue / total) * 100)}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Análise Financeira */}
        <ChartCard 
          title="Análise Financeira" 
          subtitle="Receitas vs Despesas"
          fullWidth={false}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="receita" fill={colors.success} name="Receita" />
              <Bar dataKey="despesa" fill={colors.danger} name="Despesa" />
              <Bar dataKey="lucro" fill={colors.info} name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Indicadores operacionais */}
        <ChartCard 
          title="Indicadores operacionais" 
          subtitle="Score de estabilidade"
          fullWidth={false}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={healthData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="A"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.6}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Resumo de Custos */}
        <ChartCard 
          title="Custos por Categoria" 
          subtitle="Distribuição de despesas"
          fullWidth={false}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Ração', value: 45000 },
                  { name: 'Medicamentos', value: 12000 },
                  { name: 'Mão de Obra', value: 28000 },
                  { name: 'Manutenção', value: 8000 },
                  { name: 'Outros', value: 7000 }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[colors.primary, colors.secondary, colors.tertiary, colors.quaternary, colors.warning].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Gráfico de Produção de Leite (Full Width) */}
      <ChartCard 
        title="Produção operacional" 
        subtitle="Evolução mensal do volume"
        fullWidth
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={evolutionData}>
            <defs>
              <linearGradient id="colorProducao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.info} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors.info} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="producao"
              stroke={colors.info}
              fillOpacity={1}
              fill="url(#colorProducao)"
              name="Produção (L)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
