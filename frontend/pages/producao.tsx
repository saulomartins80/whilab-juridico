import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Download,
  Activity,
  Target,
  PieChart,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  Loader2,
  Calendar,
  Weight,
  Baby,
  Heart,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';
import { producaoAPI } from '../services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Producao {
  id: string;
  user_id: string;
  tipo_producao?: string;
  animal_id?: string;
  brinco?: string;
  data_registro?: string;
  peso?: number;
  ganho_medio_diario?: number;
  custo_producao?: number;
  receita?: number;
  margem_lucro?: number;
  observacoes?: string;
  created_at?: string;
}

type TipoProducao = 'nascimento' | 'desmame' | 'engorda' | 'reproducao' | 'abate';

const TIPOS: { value: TipoProducao; label: string }[] = [
  { value: 'nascimento', label: 'Nascimento' },
  { value: 'desmame', label: 'Desmame' },
  { value: 'engorda', label: 'Engorda' },
  { value: 'reproducao', label: 'Reprodução' },
  { value: 'abate', label: 'Abate' },
];

const EMPTY_FORM = {
  tipo_producao: '' as string,
  brinco: '',
  data_registro: '',
  peso: '',
  ganho_medio_diario: '',
  custo_producao: '',
  receita: '',
  observacoes: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTipoIcon(tipo?: string) {
  switch (tipo) {
    case 'nascimento':
      return <Baby className="h-5 w-5" />;
    case 'desmame':
      return <Activity className="h-5 w-5" />;
    case 'engorda':
      return <Weight className="h-5 w-5" />;
    case 'reproducao':
      return <Heart className="h-5 w-5" />;
    case 'abate':
      return <Target className="h-5 w-5" />;
    default:
      return <Activity className="h-5 w-5" />;
  }
}

function getTipoColor(tipo?: string) {
  const map: Record<string, string> = {
    nascimento: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    desmame: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    engorda: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    reproducao: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
    abate: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return map[tipo ?? ''] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function getTipoLabel(tipo?: string) {
  return TIPOS.find((t) => t.value === tipo)?.label ?? tipo ?? '—';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function formatCurrency(value?: number) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value?: number, decimals = 2) {
  if (value == null) return '—';
  return value.toFixed(decimals);
}

function isWithinDays(iso?: string, days?: number) {
  if (!iso || !days) return true;
  const diff = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProducaoPage() {
  const { user, loading: authLoading } = useAuth();

  // Data
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Producao | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Producao | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<Producao | null>(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await producaoAPI.getAll();
      if (res.success && Array.isArray(res.data)) {
        setProducoes(res.data);
      } else if (Array.isArray(res.data)) {
        setProducoes(res.data);
      } else {
        setProducoes([]);
      }
    } catch {
      toast.error('Erro ao carregar registros de produção.');
      setProducoes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) fetchData();
    else if (!authLoading && !user) setIsLoading(false);
  }, [authLoading, user, fetchData]);

  // -----------------------------------------------------------------------
  // Filtered data
  // -----------------------------------------------------------------------

  const filtered = useMemo(() => {
    return producoes.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          (p.brinco ?? '').toLowerCase().includes(q) ||
          (p.tipo_producao ?? '').toLowerCase().includes(q) ||
          (p.observacoes ?? '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterTipo && p.tipo_producao !== filterTipo) return false;
      if (selectedPeriod && !isWithinDays(p.data_registro, Number(selectedPeriod))) return false;
      return true;
    });
  }, [producoes, searchTerm, filterTipo, selectedPeriod]);

  // -----------------------------------------------------------------------
  // KPI calculations from real data
  // -----------------------------------------------------------------------

  const kpis = useMemo(() => {
    const items = filtered;
    const count = items.length || 1;

    const gmdValues = items.filter((p) => p.ganho_medio_diario != null).map((p) => p.ganho_medio_diario!);
    const pesoValues = items.filter((p) => p.peso != null).map((p) => p.peso!);
    const nascimentos = items.filter((p) => p.tipo_producao === 'nascimento').length;
    const custoSum = items.reduce((s, p) => s + (p.custo_producao ?? 0), 0);
    const receitaSum = items.reduce((s, p) => s + (p.receita ?? 0), 0);

    const gmdMedio = gmdValues.length ? gmdValues.reduce((a, b) => a + b, 0) / gmdValues.length : 0;
    const pesoMedio = pesoValues.length ? pesoValues.reduce((a, b) => a + b, 0) / pesoValues.length : 0;
    const taxaNatalidade = items.length ? (nascimentos / count) * 100 : 0;
    const margemLucro = receitaSum > 0 ? ((receitaSum - custoSum) / receitaSum) * 100 : 0;

    return { gmdMedio, pesoMedio, taxaNatalidade, custoSum, receitaSum, margemLucro };
  }, [filtered]);

  // -----------------------------------------------------------------------
  // CRUD handlers
  // -----------------------------------------------------------------------

  function openCreate() {
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setShowFormModal(true);
  }

  function openEdit(record: Producao) {
    setEditingRecord(record);
    setForm({
      tipo_producao: record.tipo_producao ?? '',
      brinco: record.brinco ?? '',
      data_registro: record.data_registro ? record.data_registro.substring(0, 10) : '',
      peso: record.peso != null ? String(record.peso) : '',
      ganho_medio_diario: record.ganho_medio_diario != null ? String(record.ganho_medio_diario) : '',
      custo_producao: record.custo_producao != null ? String(record.custo_producao) : '',
      receita: record.receita != null ? String(record.receita) : '',
      observacoes: record.observacoes ?? '',
    });
    setShowFormModal(true);
  }

  function openDetail(record: Producao) {
    setViewingRecord(record);
    setShowDetailModal(true);
  }

  function openDelete(record: Producao) {
    setDeletingRecord(record);
    setShowDeleteModal(true);
  }

  async function handleSave() {
    if (!form.tipo_producao) {
      toast.warn('Selecione o tipo de produção.');
      return;
    }

    setIsSaving(true);
    const payload: Record<string, unknown> = {
      tipo_producao: form.tipo_producao,
      brinco: form.brinco || undefined,
      data_registro: form.data_registro || new Date().toISOString().substring(0, 10),
      peso: form.peso ? parseFloat(form.peso) : undefined,
      ganho_medio_diario: form.ganho_medio_diario ? parseFloat(form.ganho_medio_diario) : undefined,
      custo_producao: form.custo_producao ? parseFloat(form.custo_producao) : undefined,
      receita: form.receita ? parseFloat(form.receita) : undefined,
      observacoes: form.observacoes || undefined,
    };

    try {
      if (editingRecord) {
        const res = await producaoAPI.update(editingRecord.id, payload);
        if (res.success !== false) {
          toast.success('Registro atualizado com sucesso!');
          setShowFormModal(false);
          fetchData();
        } else {
          toast.error('Erro ao atualizar registro.');
        }
      } else {
        const res = await producaoAPI.create(payload);
        if (res.success !== false) {
          toast.success('Registro criado com sucesso!');
          setShowFormModal(false);
          fetchData();
        } else {
          toast.error('Erro ao criar registro.');
        }
      }
    } catch {
      toast.error('Erro ao salvar registro de produção.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingRecord) return;
    setIsSaving(true);
    try {
      const res = await producaoAPI.delete(deletingRecord.id);
      if (res.success !== false) {
        toast.success('Registro excluído com sucesso!');
        setShowDeleteModal(false);
        setDeletingRecord(null);
        fetchData();
      } else {
        toast.error('Erro ao excluir registro.');
      }
    } catch {
      toast.error('Erro ao excluir registro de produção.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleFormChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* ============================================================== */}
      {/* HEADER                                                         */}
      {/* ============================================================== */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart2 className="h-8 w-8 text-purple-600" />
              Analytics de Produção
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Performance e indicadores zootécnicos &bull; Período: {selectedPeriod} dias
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="7">7 dias</option>
                <option value="30">30 dias</option>
                <option value="90">90 dias</option>
                <option value="365">1 ano</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={openCreate}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Novo Registro
            </button>

            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
              <Download className="h-4 w-4" />
              Relatório
            </button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================== */}
      {/* KPI CARDS                                                      */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
      >
        {[
          {
            icon: <TrendingUp className="h-6 w-6 text-green-500" />,
            label: 'GMD Médio',
            value: `${formatNumber(kpis.gmdMedio)} kg/dia`,
            color: 'green',
          },
          {
            icon: <Weight className="h-6 w-6 text-blue-500" />,
            label: 'Peso Médio',
            value: `${formatNumber(kpis.pesoMedio, 0)} kg`,
            color: 'blue',
          },
          {
            icon: <Baby className="h-6 w-6 text-pink-500" />,
            label: 'Taxa Natalidade',
            value: `${formatNumber(kpis.taxaNatalidade, 1)}%`,
            color: 'pink',
          },
          {
            icon: <DollarSign className="h-6 w-6 text-red-500" />,
            label: 'Custo Produção',
            value: formatCurrency(kpis.custoSum),
            color: 'red',
          },
          {
            icon: <TrendingUp className="h-6 w-6 text-emerald-500" />,
            label: 'Receita Mensal',
            value: formatCurrency(kpis.receitaSum),
            color: 'emerald',
          },
          {
            icon: <Target className="h-6 w-6 text-purple-500" />,
            label: 'Margem Lucro',
            value: `${formatNumber(kpis.margemLucro, 1)}%`,
            color: 'purple',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              {kpi.icon}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{kpi.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ============================================================== */}
      {/* CHARTS                                                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Evolução GMD - Últimos 12 meses</h2>
            <BarChart2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Gráfico GMD Evolution</p>
              <p className="text-sm text-gray-500">
                Meta: 1.20 kg/dia | Atual: {formatNumber(kpis.gmdMedio)} kg/dia
              </p>
              <div className="mt-4 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  GMD Atual
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  Meta
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance por Categoria</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Distribuição por Tipo</p>
              <div className="mt-4 space-y-2 text-sm">
                {TIPOS.map((t) => {
                  const count = filtered.filter((p) => p.tipo_producao === t.value).length;
                  return (
                    <div key={t.value} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          t.value === 'nascimento' ? 'bg-green-500'
                          : t.value === 'desmame' ? 'bg-blue-500'
                          : t.value === 'engorda' ? 'bg-purple-500'
                          : t.value === 'reproducao' ? 'bg-pink-500'
                          : 'bg-red-500'
                        }`} />
                        {t.label}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================================== */}
      {/* FILTER BAR                                                     */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por brinco, tipo, observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm min-w-[160px]"
            >
              <option value="">Todos os tipos</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* ============================================================== */}
      {/* HISTORICO DE PRODUCAO                                          */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Produção
            <span className="ml-2 text-sm font-normal text-gray-500">({filtered.length})</span>
          </h2>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <BarChart2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {producoes.length === 0
                ? 'Comece adicionando seu primeiro registro de produção para acompanhar os indicadores do rebanho.'
                : 'Nenhum registro corresponde aos filtros selecionados. Tente ajustar a busca ou o período.'}
            </p>
            {producoes.length === 0 && (
              <button
                onClick={openCreate}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Novo Registro
              </button>
            )}
          </div>
        )}

        {/* Record list */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-3"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-2.5 rounded-lg shrink-0 ${getTipoColor(record.tipo_producao)}`}>
                    {getTipoIcon(record.tipo_producao)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {getTipoLabel(record.tipo_producao)}
                      {record.brinco && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">
                          — Brinco: {record.brinco}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      <Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                      {formatDate(record.data_registro)}
                      {record.peso != null && ` | ${record.peso} kg`}
                      {record.ganho_medio_diario != null && ` | GMD: ${record.ganho_medio_diario} kg/dia`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:ml-4">
                  <div className="text-right mr-2 hidden md:block">
                    {record.custo_producao != null && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Custo: {formatCurrency(record.custo_producao)}
                      </p>
                    )}
                    {record.receita != null && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Receita: {formatCurrency(record.receita)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openDetail(record)}
                    title="Ver detalhes"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEdit(record)}
                    title="Editar"
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDelete(record)}
                    title="Excluir"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ============================================================== */}
      {/* ADD / EDIT MODAL                                               */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFormModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingRecord ? 'Editar Registro' : 'Novo Registro de Produção'}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-4">
                {/* Tipo Producao */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Produção <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.tipo_producao}
                    onChange={(e) => handleFormChange('tipo_producao', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">Selecione...</option>
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brinco */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brinco</label>
                  <input
                    type="text"
                    value={form.brinco}
                    onChange={(e) => handleFormChange('brinco', e.target.value)}
                    placeholder="Ex: BOV-001"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>

                {/* Data Registro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data do Registro
                  </label>
                  <input
                    type="date"
                    value={form.data_registro}
                    onChange={(e) => handleFormChange('data_registro', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>

                {/* Peso + GMD row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.peso}
                      onChange={(e) => handleFormChange('peso', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GMD (kg/dia)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.ganho_medio_diario}
                      onChange={(e) => handleFormChange('ganho_medio_diario', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Custo + Receita row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.custo_producao}
                      onChange={(e) => handleFormChange('custo_producao', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Receita (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.receita}
                      onChange={(e) => handleFormChange('receita', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Observacoes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                  <textarea
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => handleFormChange('observacoes', e.target.value)}
                    placeholder="Notas adicionais..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm resize-none"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {editingRecord ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* DETAIL MODAL                                                   */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showDetailModal && viewingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${getTipoColor(viewingRecord.tipo_producao)}`}>
                    {getTipoIcon(viewingRecord.tipo_producao)}
                  </div>
                  Detalhes do Registro
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { label: 'Tipo', value: getTipoLabel(viewingRecord.tipo_producao) },
                  { label: 'Brinco', value: viewingRecord.brinco || '—' },
                  { label: 'Data', value: formatDate(viewingRecord.data_registro) },
                  { label: 'Peso', value: viewingRecord.peso != null ? `${viewingRecord.peso} kg` : '—' },
                  {
                    label: 'GMD',
                    value:
                      viewingRecord.ganho_medio_diario != null
                        ? `${viewingRecord.ganho_medio_diario} kg/dia`
                        : '—',
                  },
                  { label: 'Custo Produção', value: formatCurrency(viewingRecord.custo_producao) },
                  { label: 'Receita', value: formatCurrency(viewingRecord.receita) },
                  {
                    label: 'Margem Lucro',
                    value: viewingRecord.margem_lucro != null ? `${viewingRecord.margem_lucro}%` : '—',
                  },
                  { label: 'Observações', value: viewingRecord.observacoes || '—' },
                  { label: 'Criado em', value: formatDate(viewingRecord.created_at) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEdit(viewingRecord);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL                                      */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showDeleteModal && deletingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm"
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deseja realmente excluir o registro de{' '}
                  <strong>{getTipoLabel(deletingRecord.tipo_producao)}</strong>
                  {deletingRecord.brinco && (
                    <>
                      {' '}
                      (Brinco: <strong>{deletingRecord.brinco}</strong>)
                    </>
                  )}
                  ? Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex items-center gap-3 p-6 pt-0">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
