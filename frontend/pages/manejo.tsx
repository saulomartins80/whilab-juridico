import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Check,
  X,
  Edit3,
  Trash2,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Plus,
  Syringe,
  Activity,
  Weight,
  Heart,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';
import { manejoAPI } from '../services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Manejo {
  id: string;
  user_id: string;
  tipo: string;
  animal_id?: string;
  brinco?: string;
  data_manejo: string;
  produto?: string;
  dosagem?: string;
  custo?: number;
  responsavel?: string;
  observacoes?: string;
  proxima_aplicacao?: string;
  status?: string;
  created_at?: string;
}

type ManejoFormData = Omit<Manejo, 'id' | 'user_id' | 'created_at'>;

interface FilterState {
  search: string;
  tipo: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIPO_OPTIONS = [
  { value: 'vacinacao', label: 'Vacinacao' },
  { value: 'vermifugacao', label: 'Vermifugacao' },
  { value: 'pesagem', label: 'Pesagem' },
  { value: 'reproducao', label: 'Reproducao' },
  { value: 'tratamento', label: 'Tratamento' },
];

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'concluido', label: 'Concluido' },
  { value: 'atrasado', label: 'Atrasado' },
];

const EMPTY_FORM: ManejoFormData = {
  tipo: 'vacinacao',
  brinco: '',
  data_manejo: new Date().toISOString().split('T')[0],
  produto: '',
  dosagem: '',
  custo: 0,
  responsavel: '',
  observacoes: '',
  status: 'pendente',
  proxima_aplicacao: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTipoIcon(tipo: string) {
  switch (tipo) {
    case 'vacinacao':
      return <Syringe className="h-5 w-5" />;
    case 'vermifugacao':
      return <Activity className="h-5 w-5" />;
    case 'pesagem':
      return <Weight className="h-5 w-5" />;
    case 'reproducao':
      return <Heart className="h-5 w-5" />;
    case 'tratamento':
      return <Activity className="h-5 w-5" />;
    default:
      return <Calendar className="h-5 w-5" />;
  }
}

function getTipoColor(tipo: string) {
  const map: Record<string, string> = {
    vacinacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    vermifugacao: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    pesagem: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    reproducao: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
    tratamento: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function getTipoIconBg(tipo: string) {
  const map: Record<string, string> = {
    vacinacao: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    vermifugacao: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    pesagem: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    reproducao: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
    tratamento: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  };
  return map[tipo] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    concluido: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    atrasado: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'concluido':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'atrasado':
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
}

function formatDate(iso: string | undefined) {
  if (!iso) return '-';
  const d = new Date(iso + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function formatCurrency(value: number | undefined) {
  if (value === undefined || value === null) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function tipoLabel(tipo: string) {
  return TIPO_OPTIONS.find((o) => o.value === tipo)?.label || tipo;
}

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ManejoPage() {
  const { user, loading: authLoading } = useAuth();

  // Data
  const [manejos, setManejos] = useState<Manejo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tipo: '',
    status: '',
  });

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected / editing
  const [selectedManejo, setSelectedManejo] = useState<Manejo | null>(null);
  const [editingManejo, setEditingManejo] = useState<Manejo | null>(null);
  const [deletingManejo, setDeletingManejo] = useState<Manejo | null>(null);
  const [formData, setFormData] = useState<ManejoFormData>({ ...EMPTY_FORM });

  // ------- Fetch -------
  const fetchManejos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await manejoAPI.getAll();
      if (res.success && Array.isArray(res.data)) {
        setManejos(res.data);
      } else if (Array.isArray(res.data)) {
        setManejos(res.data);
      } else if (Array.isArray(res)) {
        setManejos(res as unknown as Manejo[]);
      } else {
        setManejos([]);
      }
    } catch {
      toast.error('Erro ao carregar dados de manejo.');
      setManejos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchManejos();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [authLoading, user, fetchManejos]);

  // ------- Filtered data -------
  const filteredManejos = useMemo(() => {
    let list = manejos;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (m) =>
          (m.brinco || '').toLowerCase().includes(q) ||
          (m.produto || '').toLowerCase().includes(q) ||
          (m.responsavel || '').toLowerCase().includes(q) ||
          (m.observacoes || '').toLowerCase().includes(q)
      );
    }
    if (filters.tipo) {
      list = list.filter((m) => m.tipo === filters.tipo);
    }
    if (filters.status) {
      list = list.filter((m) => m.status === filters.status);
    }
    return list;
  }, [manejos, filters]);

  // ------- KPIs -------
  const kpis = useMemo(() => {
    const pendentes = manejos.filter((m) => m.status === 'pendente').length;
    const concluidas = manejos.filter((m) => m.status === 'concluido').length;
    const atrasadas = manejos.filter((m) => m.status === 'atrasado').length;
    const custoTotal = manejos.reduce((acc, m) => acc + (m.custo || 0), 0);
    return { pendentes, concluidas, atrasadas, custoTotal };
  }, [manejos]);

  // ------- Handlers -------
  const handleOpenCreate = () => {
    setEditingManejo(null);
    setFormData({ ...EMPTY_FORM });
    setShowFormModal(true);
  };

  const handleOpenEdit = (manejo: Manejo) => {
    setEditingManejo(manejo);
    setFormData({
      tipo: manejo.tipo,
      brinco: manejo.brinco || '',
      data_manejo: manejo.data_manejo ? manejo.data_manejo.split('T')[0] : '',
      produto: manejo.produto || '',
      dosagem: manejo.dosagem || '',
      custo: manejo.custo || 0,
      responsavel: manejo.responsavel || '',
      observacoes: manejo.observacoes || '',
      status: manejo.status || 'pendente',
      proxima_aplicacao: manejo.proxima_aplicacao
        ? manejo.proxima_aplicacao.split('T')[0]
        : '',
    });
    setShowFormModal(true);
  };

  const handleOpenDetail = (manejo: Manejo) => {
    setSelectedManejo(manejo);
    setShowDetailModal(true);
  };

  const handleOpenDelete = (manejo: Manejo) => {
    setDeletingManejo(manejo);
    setShowDeleteModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'custo' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipo || !formData.data_manejo) {
      toast.error('Preencha os campos obrigatorios (tipo e data).');
      return;
    }
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = { ...formData };
      // Remove empty strings
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '') delete payload[k];
      });

      if (editingManejo) {
        const res = await manejoAPI.update(editingManejo.id, payload);
        if (res.success !== false) {
          toast.success('Manejo atualizado com sucesso!');
          setShowFormModal(false);
          fetchManejos();
        } else {
          toast.error('Erro ao atualizar manejo.');
        }
      } else {
        const res = await manejoAPI.create(payload);
        if (res.success !== false) {
          toast.success('Manejo criado com sucesso!');
          setShowFormModal(false);
          fetchManejos();
        } else {
          toast.error('Erro ao criar manejo.');
        }
      }
    } catch {
      toast.error('Erro ao salvar manejo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingManejo) return;
    setIsSaving(true);
    try {
      const res = await manejoAPI.delete(deletingManejo.id);
      if (res.success !== false) {
        toast.success('Manejo excluido com sucesso!');
        setShowDeleteModal(false);
        setDeletingManejo(null);
        fetchManejos();
      } else {
        toast.error('Erro ao excluir manejo.');
      }
    } catch {
      toast.error('Erro ao excluir manejo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkComplete = async (manejo: Manejo) => {
    try {
      const res = await manejoAPI.update(manejo.id, { status: 'concluido' });
      if (res.success !== false) {
        toast.success('Manejo marcado como concluido!');
        fetchManejos();
      } else {
        toast.error('Erro ao atualizar status.');
      }
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  // ------- Auth loading -------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ------- Render -------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      {/* ============ HEADER ============ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              Gestao de Manejo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Controle de atividades de manejo &bull;{' '}
              {filteredManejos.length} atividade{filteredManejos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Nova Atividade
          </button>
        </div>
      </motion.div>

      {/* ============ KPI CARDS ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
      >
        {[
          {
            label: 'Pendentes',
            value: kpis.pendentes,
            icon: <Clock className="h-7 w-7 text-yellow-500" />,
            color: 'text-yellow-600 dark:text-yellow-400',
          },
          {
            label: 'Concluidas',
            value: kpis.concluidas,
            icon: <CheckCircle className="h-7 w-7 text-green-500" />,
            color: 'text-green-600 dark:text-green-400',
          },
          {
            label: 'Atrasadas',
            value: kpis.atrasadas,
            icon: <AlertCircle className="h-7 w-7 text-red-500" />,
            color: 'text-red-600 dark:text-red-400',
          },
          {
            label: 'Custo Total',
            value: formatCurrency(kpis.custoTotal),
            icon: <DollarSign className="h-7 w-7 text-purple-500" />,
            color: 'text-gray-900 dark:text-white',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {kpi.label}
                </p>
                <p className={`text-xl sm:text-2xl font-bold mt-1 ${kpi.color}`}>
                  {kpi.value}
                </p>
              </div>
              {kpi.icon}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ============ FILTER BAR ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar brinco, produto, responsavel..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Tipo */}
          <div className="relative">
            <select
              value={filters.tipo}
              onChange={(e) => setFilters((f) => ({ ...f, tipo: e.target.value }))}
              className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Todos os Tipos</option>
              {TIPO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Todos os Status</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* ============ CONTENT ============ */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-sm">Carregando atividades de manejo...</p>
        </div>
      ) : filteredManejos.length === 0 ? (
        /* ---- Empty state ---- */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md text-sm">
            {manejos.length === 0
              ? 'Voce ainda nao registrou nenhuma atividade de manejo. Comece adicionando uma nova atividade.'
              : 'Nenhum resultado corresponde aos filtros selecionados. Tente ajustar os filtros.'}
          </p>
          {manejos.length === 0 && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nova Atividade
            </button>
          )}
        </motion.div>
      ) : (
        /* ---- Cards list ---- */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredManejos.map((manejo, idx) => (
              <motion.div
                key={manejo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="p-5 sm:p-6">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex-shrink-0 p-2.5 rounded-lg ${getTipoIconBg(manejo.tipo)}`}
                      >
                        {getTipoIcon(manejo.tipo)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {tipoLabel(manejo.tipo)}
                        </h3>
                        {manejo.brinco && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Brinco: {manejo.brinco}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTipoColor(manejo.tipo)}`}
                      >
                        {tipoLabel(manejo.tipo)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(manejo.status || 'pendente')}`}
                      >
                        {getStatusIcon(manejo.status || 'pendente')}
                        {statusLabel(manejo.status || 'pendente')}
                      </span>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(manejo.data_manejo)}</span>
                    </div>
                    {manejo.responsavel && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{manejo.responsavel}</span>
                      </div>
                    )}
                    {manejo.produto && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Syringe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {manejo.produto}
                          {manejo.dosagem ? ` (${manejo.dosagem})` : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>{formatCurrency(manejo.custo)}</span>
                    </div>
                  </div>

                  {/* Observacoes */}
                  {manejo.observacoes && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Obs:</span> {manejo.observacoes}
                      </p>
                    </div>
                  )}

                  {/* Proxima aplicacao */}
                  {manejo.proxima_aplicacao && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/40">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <span className="font-medium">Proxima aplicacao:</span>{' '}
                        {formatDate(manejo.proxima_aplicacao)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      {manejo.status !== 'concluido' && (
                        <button
                          onClick={() => handleMarkComplete(manejo)}
                          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Concluir
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenDetail(manejo)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        Detalhes
                      </button>
                      <button
                        onClick={() => handleOpenEdit(manejo)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(manejo)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ============ CREATE / EDIT MODAL ============ */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowFormModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingManejo ? 'Editar Atividade' : 'Nova Atividade'}
                  </h2>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo *
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {TIPO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brinco */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brinco do Animal
                    </label>
                    <input
                      type="text"
                      name="brinco"
                      value={formData.brinco || ''}
                      onChange={handleFormChange}
                      placeholder="Ex: BV001"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data do Manejo *
                    </label>
                    <input
                      type="date"
                      name="data_manejo"
                      value={formData.data_manejo || ''}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  {/* Produto & Dosagem */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Produto
                      </label>
                      <input
                        type="text"
                        name="produto"
                        value={formData.produto || ''}
                        onChange={handleFormChange}
                        placeholder="Ex: Vacina Aftosa"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dosagem
                      </label>
                      <input
                        type="text"
                        name="dosagem"
                        value={formData.dosagem || ''}
                        onChange={handleFormChange}
                        placeholder="Ex: 5ml"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Custo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custo (R$)
                    </label>
                    <input
                      type="number"
                      name="custo"
                      value={formData.custo || 0}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  {/* Responsavel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Responsavel
                    </label>
                    <input
                      type="text"
                      name="responsavel"
                      value={formData.responsavel || ''}
                      onChange={handleFormChange}
                      placeholder="Nome do responsavel"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || 'pendente'}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Proxima aplicacao */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Proxima Aplicacao
                    </label>
                    <input
                      type="date"
                      name="proxima_aplicacao"
                      value={formData.proxima_aplicacao || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  {/* Observacoes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Observacoes
                    </label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes || ''}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="Informacoes adicionais..."
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowFormModal(false)}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {editingManejo ? 'Salvar Alteracoes' : 'Criar Atividade'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ DETAIL MODAL ============ */}
      <AnimatePresence>
        {showDetailModal && selectedManejo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Detalhes do Manejo
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Tipo badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-lg ${getTipoIconBg(selectedManejo.tipo)}`}>
                    {getTipoIcon(selectedManejo.tipo)}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(selectedManejo.tipo)}`}
                    >
                      {tipoLabel(selectedManejo.tipo)}
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedManejo.status || 'pendente')}`}
                    >
                      {getStatusIcon(selectedManejo.status || 'pendente')}
                      {statusLabel(selectedManejo.status || 'pendente')}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="space-y-4">
                  {[
                    { label: 'Brinco', value: selectedManejo.brinco },
                    { label: 'Data do Manejo', value: formatDate(selectedManejo.data_manejo) },
                    { label: 'Produto', value: selectedManejo.produto },
                    { label: 'Dosagem', value: selectedManejo.dosagem },
                    { label: 'Custo', value: formatCurrency(selectedManejo.custo) },
                    { label: 'Responsavel', value: selectedManejo.responsavel },
                    {
                      label: 'Proxima Aplicacao',
                      value: formatDate(selectedManejo.proxima_aplicacao),
                    },
                  ]
                    .filter((item) => item.value && item.value !== '-')
                    .map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}

                  {selectedManejo.observacoes && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Observacoes
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        {selectedManejo.observacoes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenEdit(selectedManejo);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenDelete(selectedManejo);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <AnimatePresence>
        {showDeleteModal && deletingManejo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Confirmar Exclusao
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Tem certeza que deseja excluir a atividade de{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {tipoLabel(deletingManejo.tipo)}
                  </span>
                  {deletingManejo.brinco
                    ? ` (Brinco: ${deletingManejo.brinco})`
                    : ''}
                  ? Esta acao nao pode ser desfeita.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingManejo(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
