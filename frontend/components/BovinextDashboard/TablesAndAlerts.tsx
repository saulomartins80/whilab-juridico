import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  DollarSign,
  Shield,
  Bell,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '../../lib/utils';

// Tipos
interface Animal {
  id: string;
  brinco: string;
  nome: string;
  categoria: string;
  idade: number;
  peso: number;
  status: 'saudável' | 'em tratamento' | 'quarentena';
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

// Dados mockados
const animalsData: Animal[] = [
  {
    id: '1',
    brinco: 'BR001',
    nome: 'Estrela',
    categoria: 'Vaca',
    idade: 48,
    peso: 520,
    status: 'saudável',
    ultimaVacinacao: new Date('2024-01-15'),
    gmd: 0.85
  },
  {
    id: '2',
    brinco: 'BR002',
    nome: 'Thor',
    categoria: 'Touro',
    idade: 36,
    peso: 780,
    status: 'saudável',
    ultimaVacinacao: new Date('2024-01-15'),
    gmd: 1.2
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
    gmd: 0.95
  },
  {
    id: '4',
    brinco: 'BR004',
    nome: 'Zeus',
    categoria: 'Boi',
    idade: 24,
    peso: 450,
    status: 'saudável',
    ultimaVacinacao: new Date('2024-01-20'),
    gmd: 1.15
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
    gmd: 0.75
  }
];

const alertsData: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Vacinação Urgente',
    description: '15 animais precisam ser vacinados nos próximos 3 dias',
    timestamp: new Date(),
    action: 'Ver lista',
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Estoque de Ração Baixo',
    description: 'Estoque atual durará apenas mais 5 dias',
    timestamp: new Date(Date.now() - 3600000),
    action: 'Fazer pedido',
    read: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Previsão de Chuva',
    description: 'Chuvas intensas previstas para os próximos 2 dias',
    timestamp: new Date(Date.now() - 7200000),
    read: true
  },
  {
    id: '4',
    type: 'success',
    title: 'Meta de GMD Atingida',
    description: 'GMD médio do mês superou a meta em 8%',
    timestamp: new Date(Date.now() - 86400000),
    read: true
  }
];

const activitiesData: Activity[] = [
  {
    id: '1',
    type: 'vacinacao',
    description: 'Vacinação em lote de 25 animais',
    user: 'João Silva',
    timestamp: new Date(),
    icon: Shield
  },
  {
    id: '2',
    type: 'pesagem',
    description: 'Pesagem mensal do rebanho concluída',
    user: 'Maria Santos',
    timestamp: new Date(Date.now() - 3600000),
    icon: Shield
  },
  {
    id: '3',
    type: 'venda',
    description: 'Venda de 10 bois para frigorífico',
    user: 'Pedro Costa',
    timestamp: new Date(Date.now() - 7200000),
    icon: DollarSign
  }
];

// Componente de Status Badge
function StatusBadge({ status }: { status: 'saudável' | 'em tratamento' | 'quarentena' }) {
  const statusConfig = {
    'saudável': { color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: CheckCircle },
    'em tratamento': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', icon: AlertTriangle },
    'quarentena': { color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: AlertTriangle }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['saudável'];
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium', config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {status}
    </span>
  );
}

// Componente de Alert Card
function AlertCard({ alert }: { alert: Alert }) {
  const typeConfig = {
    critical: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' }
  };

  const config = typeConfig[alert.type as keyof typeof typeConfig];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer',
        config.bg,
        alert.read ? 'opacity-60' : '',
        'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('h-5 w-5 mt-0.5', config.color)} />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {alert.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {alert.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {format(alert.timestamp, 'HH:mm', { locale: ptBR })}
            </span>
            {alert.action && (
              <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                {alert.action} →
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente Principal
export default function TablesAndAlerts() {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar animais
  const filteredAnimals = animalsData.filter(animal => {
    const matchesCategory = selectedCategory === 'todos' || animal.categoria.toLowerCase() === selectedCategory;
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.brinco.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tabela de Animais - 2 colunas */}
      <div className="lg:col-span-2 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex-1"
        >
          {/* Header da Tabela */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tabela operacional
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredAnimals.length} itens encontrados
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Adicionar</span>
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todos">Todas categorias</option>
                <option value="vaca">Vacas</option>
                <option value="touro">Touros</option>
                <option value="novilha">Novilhas</option>
                <option value="boi">Bois</option>
                <option value="bezerra">Bezerras</option>
              </select>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Métrica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {animal.nome}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {animal.brinco} • {animal.idade} meses
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {animal.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {animal.peso} kg
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          GMD: {animal.gmd} kg/dia
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={animal.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                          <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                          <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Coluna Lateral - Alertas e Atividades */}
      <div className="space-y-6 flex flex-col">
        {/* Alertas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alertas da operação
            </h3>
            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full text-xs font-medium">
              {alertsData.filter(a => !a.read).length} novos
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alertsData.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </motion.div>

        {/* Widget de Clima */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Clima Hoje</h3>
            <Bell className="h-8 w-8" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">28°C</span>
              <span className="text-sm opacity-90">Ensolarado</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
              <div className="text-center">
                <Bell className="h-4 w-4 mx-auto mb-1 opacity-80" />
                <span className="text-xs">65%</span>
              </div>
              <div className="text-center">
                <Bell className="h-4 w-4 mx-auto mb-1 opacity-80" />
                <span className="text-xs">12 km/h</span>
              </div>
              <div className="text-center">
                <Bell className="h-4 w-4 mx-auto mb-1 opacity-80" />
                <span className="text-xs">22°/31°</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline de Atividades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {activitiesData.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.user} • {format(activity.timestamp, 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
