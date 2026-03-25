import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  DollarSign,
  Download,
  Edit,
  Eye,
  Info,
  Plus,
  Search,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '../../lib/utils';

interface Animal {
  id: string;
  brinco: string;
  nome: string;
  categoria: string;
  idade: number;
  peso: number;
  status: 'saudavel' | 'em tratamento' | 'quarentena';
  ultimaVacinacao: Date;
  gmd: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  action?: string;
  read: boolean;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
}

const animalsData: Animal[] = [
  {
    id: '1',
    brinco: 'BR001',
    nome: 'Estrela',
    categoria: 'Vaca',
    idade: 48,
    peso: 520,
    status: 'saudavel',
    ultimaVacinacao: new Date('2024-01-15'),
    gmd: 0.85,
  },
  {
    id: '2',
    brinco: 'BR002',
    nome: 'Thor',
    categoria: 'Touro',
    idade: 36,
    peso: 780,
    status: 'saudavel',
    ultimaVacinacao: new Date('2024-01-15'),
    gmd: 1.2,
  },
  {
    id: '3',
    brinco: 'BR003',
    nome: 'Luna',
    categoria: 'Novilha',
    idade: 18,
    peso: 320,
    status: 'em tratamento',
    ultimaVacinacao: new Date('2024-02-10'),
    gmd: 0.95,
  },
  {
    id: '4',
    brinco: 'BR004',
    nome: 'Zeus',
    categoria: 'Boi',
    idade: 24,
    peso: 450,
    status: 'saudavel',
    ultimaVacinacao: new Date('2024-01-20'),
    gmd: 1.15,
  },
  {
    id: '5',
    brinco: 'BR005',
    nome: 'Mel',
    categoria: 'Bezerra',
    idade: 6,
    peso: 180,
    status: 'quarentena',
    ultimaVacinacao: new Date('2024-03-01'),
    gmd: 0.75,
  },
];

const alertsData: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Vacinacao urgente',
    description: '15 animais precisam ser vacinados nos proximos 3 dias.',
    timestamp: new Date(),
    action: 'Ver lista',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Estoque de racao baixo',
    description: 'O estoque atual dura apenas mais 5 dias.',
    timestamp: new Date(Date.now() - 3600000),
    action: 'Fazer pedido',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Previsao de chuva',
    description: 'Chuva intensa prevista para os proximos 2 dias.',
    timestamp: new Date(Date.now() - 7200000),
    read: true,
  },
  {
    id: '4',
    type: 'success',
    title: 'Meta de GMD atingida',
    description: 'A meta mensal foi superada em 8%.',
    timestamp: new Date(Date.now() - 86400000),
    read: true,
  },
];

const activitiesData: Activity[] = [
  {
    id: '1',
    type: 'vacinacao',
    description: 'Vacinacao em lote de 25 animais.',
    user: 'Joao Silva',
    timestamp: new Date(),
    icon: Shield,
  },
  {
    id: '2',
    type: 'pesagem',
    description: 'Pesagem mensal do rebanho concluida.',
    user: 'Maria Santos',
    timestamp: new Date(Date.now() - 3600000),
    icon: Shield,
  },
  {
    id: '3',
    type: 'venda',
    description: 'Venda de 10 bois para frigorifico.',
    user: 'Pedro Costa',
    timestamp: new Date(Date.now() - 7200000),
    icon: DollarSign,
  },
];

function StatusBadge({ status }: { status: 'saudavel' | 'em tratamento' | 'quarentena' }) {
  const statusConfig = {
    saudavel: {
      color: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
      icon: CheckCircle,
      label: 'Saudavel',
    },
    'em tratamento': {
      color: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
      icon: AlertTriangle,
      label: 'Tratamento',
    },
    quarentena: {
      color: 'bg-red-500/12 text-red-600 dark:text-red-300',
      icon: AlertTriangle,
      label: 'Quarentena',
    },
  };

  const config = statusConfig[status] || statusConfig.saudavel;
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', config.color)}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const typeConfig = {
    critical: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/8' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/8' },
    info: { icon: Info, color: 'text-sky-500', bg: 'bg-sky-500/8' },
    success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/8' },
  };

  const config = typeConfig[alert.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'rounded-2xl border border-slate-200/80 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800',
        config.bg,
        alert.read ? 'opacity-70' : '',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/6 dark:bg-white/6">
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-950 dark:text-white">{alert.title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{alert.description}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {format(alert.timestamp, 'HH:mm', { locale: ptBR })}
            </span>
            {alert.action && (
              <button type="button" className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                {alert.action}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TablesAndAlerts() {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnimals = animalsData.filter((animal) => {
    const matchesCategory =
      selectedCategory === 'todos' || animal.categoria.toLowerCase() === selectedCategory;
    const matchesSearch =
      animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.brinco.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_380px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-surface-soft overflow-hidden">
        <div className="border-b border-slate-200/80 p-6 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Radar operacional</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {filteredAnimals.length} itens filtrados com leitura pronta para acao.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="app-shell-button-primary">
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
              <button type="button" className="dashboard-secondary-button">
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou codigo..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
            >
              <option value="todos">Todas as categorias</option>
              <option value="vaca">Vacas</option>
              <option value="touro">Touros</option>
              <option value="novilha">Novilhas</option>
              <option value="boi">Bois</option>
              <option value="bezerra">Bezerras</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-100/70 dark:bg-slate-950/50">
              <tr>
                {['Item', 'Categoria', 'Metricas', 'Status', 'Acoes'].map((label) => (
                  <th
                    key={label}
                    className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {filteredAnimals.map((animal) => (
                <tr key={animal.id} className="dashboard-table-row transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-950 dark:text-white">
                        {animal.nome}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {animal.brinco} - {animal.idade} meses
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                    {animal.categoria}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">
                      {animal.peso} kg
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      GMD {animal.gmd} kg/dia
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={animal.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {[Eye, Edit, Trash2].map((Icon, index) => (
                        <button
                          key={`${animal.id}-${index}`}
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:text-white"
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="dashboard-surface-soft p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Alertas da operacao</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Controle de prioridade com leitura imediata.
              </p>
            </div>
            <span className="inline-flex rounded-full bg-red-500/12 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-300">
              {alertsData.filter((alert) => !alert.read).length} novos
            </span>
          </div>

          <div className="space-y-3">
            {alertsData.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="dashboard-surface-soft overflow-hidden p-5"
        >
          <div className="absolute" />
          <div className="rounded-[1.75rem] bg-gradient-to-br from-sky-500 via-sky-500 to-emerald-500 p-5 text-white shadow-[0_28px_70px_rgba(14,165,233,0.25)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Clima hoje</h3>
              <Bell className="h-7 w-7" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <span className="text-4xl font-semibold">28C</span>
              <span className="text-sm text-white/85">Ensolarado</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-center">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/70">Umidade</div>
                <div className="mt-2 text-sm font-semibold">65%</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/70">Vento</div>
                <div className="mt-2 text-sm font-semibold">12 km/h</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/70">Faixa</div>
                <div className="mt-2 text-sm font-semibold">22C / 31C</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="dashboard-surface-soft p-5"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Atividades recentes</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Linha do tempo com contexto do operador.
            </p>
          </div>

          <div className="space-y-4">
            {activitiesData.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/6 text-slate-600 dark:bg-white/6 dark:text-slate-300">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {activity.user} - {format(activity.timestamp, 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
