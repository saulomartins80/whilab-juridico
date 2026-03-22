import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Package,
  Users,
  Calendar,
  Eye,
  ChevronDown,
  ArrowUpRight,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { vendasAPI } from '../services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Venda {
  id: string;
  user_id: string;
  tipo_venda?: string;
  comprador?: string;
  animais_ids?: string[];
  quantidade_animais?: number;
  peso_total?: number;
  preco_arroba?: number;
  valor_total?: number;
  data_venda?: string;
  data_entrega?: string;
  impostos_funrural?: number;
  impostos_icms?: number;
  impostos_outros?: number;
  lucro_liquido?: number;
  observacoes?: string;
  status?: string;
  created_at?: string;
}

type VendaFormData = Omit<Venda, 'id' | 'user_id' | 'created_at'>;

const EMPTY_FORM: VendaFormData = {
  tipo_venda: 'direto',
  comprador: '',
  quantidade_animais: 0,
  peso_total: 0,
  preco_arroba: 0,
  valor_total: 0,
  data_venda: new Date().toISOString().split('T')[0],
  data_entrega: '',
  impostos_funrural: 0,
  impostos_icms: 0,
  impostos_outros: 0,
  lucro_liquido: 0,
  observacoes: '',
  status: 'pendente',
};

const TIPO_OPTIONS = [
  { value: 'frigorifico', label: 'Frigorífico' },
  { value: 'leilao', label: 'Leilão' },
  { value: 'direto', label: 'Venda Direta' },
  { value: 'outro', label: 'Outro' },
];

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelada', label: 'Cancelada' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (value: number | undefined): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

const formatDate = (iso: string | undefined): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
};

const tipoLabel = (tipo: string | undefined): string =>
  TIPO_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo ?? '—';

const statusColor = (s: string | undefined): string => {
  switch (s) {
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'confirmada':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'entregue':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'cancelada':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const tipoColor = (t: string | undefined): string => {
  switch (t) {
    case 'frigorifico':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'leilao':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'direto':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VendasPage() {
  const { user, loading: authLoading } = useAuth();

  // Data
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [detailVenda, setDetailVenda] = useState<Venda | null>(null);
  const [deletingVenda, setDeletingVenda] = useState<Venda | null>(null);

  const [formData, setFormData] = useState<VendaFormData>({ ...EMPTY_FORM });

  // ------ Fetch ------
  const fetchVendas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await vendasAPI.getAll();
      if (res.success && Array.isArray(res.data)) {
        setVendas(res.data);
      } else if (Array.isArray(res.data)) {
        setVendas(res.data);
      } else {
        setVendas([]);
      }
    } catch {
      toast.error('Erro ao carregar vendas. Tente novamente.');
      setVendas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchVendas();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [authLoading, user, fetchVendas]);

  // ------ Filtered vendas ------
  const filtered = useMemo(() => {
    let list = vendas;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (v) =>
          (v.comprador ?? '').toLowerCase().includes(q) ||
          (v.observacoes ?? '').toLowerCase().includes(q)
      );
    }
    if (filterTipo) list = list.filter((v) => v.tipo_venda === filterTipo);
    if (filterStatus) list = list.filter((v) => v.status === filterStatus);
    return list;
  }, [vendas, searchTerm, filterTipo, filterStatus]);

  // ------ KPIs ------
  const kpis = useMemo(() => {
    const total = vendas.reduce((s, v) => s + (v.valor_total ?? 0), 0);
    const lucro = vendas.reduce((s, v) => s + (v.lucro_liquido ?? 0), 0);
    const arrobas = vendas.filter((v) => v.preco_arroba && v.preco_arroba > 0);
    const precoMedio = arrobas.length > 0 ? arrobas.reduce((s, v) => s + (v.preco_arroba ?? 0), 0) / arrobas.length : 0;
    const animais = vendas.reduce((s, v) => s + (v.quantidade_animais ?? 0), 0);
    return { total, lucro, precoMedio, animais };
  }, [vendas]);

  // ------ Auto-calc valor_total ------
  const recalcValorTotal = (data: VendaFormData): VendaFormData => {
    const peso = data.peso_total ?? 0;
    const preco = data.preco_arroba ?? 0;
    // 1 arroba = 15 kg
    const arrobas = peso / 15;
    const valorTotal = arrobas * preco;
    return { ...data, valor_total: Math.round(valorTotal * 100) / 100 };
  };

  const handleFormChange = (field: keyof VendaFormData, value: string | number) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'peso_total' || field === 'preco_arroba') {
        return recalcValorTotal(next);
      }
      return next;
    });
  };

  // ------ Open modals ------
  const openCreate = () => {
    setEditingVenda(null);
    setFormData({ ...EMPTY_FORM });
    setShowFormModal(true);
  };

  const openEdit = (v: Venda) => {
    setEditingVenda(v);
    setFormData({
      tipo_venda: v.tipo_venda ?? 'direto',
      comprador: v.comprador ?? '',
      quantidade_animais: v.quantidade_animais ?? 0,
      peso_total: v.peso_total ?? 0,
      preco_arroba: v.preco_arroba ?? 0,
      valor_total: v.valor_total ?? 0,
      data_venda: v.data_venda ? v.data_venda.split('T')[0] : '',
      data_entrega: v.data_entrega ? v.data_entrega.split('T')[0] : '',
      impostos_funrural: v.impostos_funrural ?? 0,
      impostos_icms: v.impostos_icms ?? 0,
      impostos_outros: v.impostos_outros ?? 0,
      lucro_liquido: v.lucro_liquido ?? 0,
      observacoes: v.observacoes ?? '',
      status: v.status ?? 'pendente',
    });
    setShowFormModal(true);
  };

  const openDetail = (v: Venda) => {
    setDetailVenda(v);
    setShowDetailModal(true);
  };

  const openDelete = (v: Venda) => {
    setDeletingVenda(v);
    setShowDeleteModal(true);
  };

  // ------ CRUD handlers ------
  const handleSave = async () => {
    if (!formData.comprador?.trim()) {
      toast.warn('Informe o comprador.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingVenda) {
        const res = await vendasAPI.update(editingVenda.id, formData as Record<string, unknown>);
        if (res.success !== false) {
          toast.success('Venda atualizada com sucesso!');
          setShowFormModal(false);
          fetchVendas();
        } else {
          toast.error('Erro ao atualizar venda.');
        }
      } else {
        const res = await vendasAPI.create(formData as Record<string, unknown>);
        if (res.success !== false) {
          toast.success('Venda criada com sucesso!');
          setShowFormModal(false);
          fetchVendas();
        } else {
          toast.error('Erro ao criar venda.');
        }
      }
    } catch {
      toast.error('Erro ao salvar venda. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVenda) return;
    setIsSaving(true);
    try {
      const res = await vendasAPI.delete(deletingVenda.id);
      if (res.success !== false) {
        toast.success('Venda excluída com sucesso!');
        setShowDeleteModal(false);
        setDeletingVenda(null);
        fetchVendas();
      } else {
        toast.error('Erro ao excluir venda.');
      }
    } catch {
      toast.error('Erro ao excluir venda. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // ------ Auth guard / loading ------
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-yellow-500" />
        <p className="text-gray-600 dark:text-gray-300 text-lg">Faca login para acessar as vendas.</p>
      </div>
    );
  }

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              Gestao de Vendas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Controle completo de vendas{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {vendas.length} {vendas.length === 1 ? 'venda' : 'vendas'}
              </span>
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Nova Venda
          </button>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI CARDS                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          {
            label: 'Total Vendas',
            value: formatCurrency(kpis.total),
            icon: <DollarSign className="h-6 w-6" />,
            color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
          },
          {
            label: 'Lucro Liquido',
            value: formatCurrency(kpis.lucro),
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
          },
          {
            label: 'Preco Medio/@',
            value: formatCurrency(kpis.precoMedio),
            icon: <ArrowUpRight className="h-6 w-6" />,
            color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
          },
          {
            label: 'Animais Vendidos',
            value: String(kpis.animais),
            icon: <Package className="h-6 w-6" />,
            color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{kpi.label}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg shrink-0 ${kpi.color}`}>{kpi.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FILTER BAR                                                          */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por comprador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Tipo filter */}
          <div className="relative min-w-[160px]">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="">Todos os tipos</option>
              {TIPO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative min-w-[160px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="">Todos os status</option>
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

      {/* ------------------------------------------------------------------ */}
      {/* VENDAS LIST                                                         */}
      {/* ------------------------------------------------------------------ */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
        >
          <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nenhuma venda encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {vendas.length === 0
              ? 'Registre sua primeira venda para acompanhar o desempenho financeiro do rebanho.'
              : 'Nenhuma venda corresponde aos filtros aplicados. Tente ajustar a busca.'}
          </p>
          {vendas.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Registrar Venda
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((venda, i) => (
              <motion.div
                key={venda.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                layout
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="p-5 md:p-6">
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {venda.comprador || 'Sem comprador'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {venda.quantidade_animais ?? 0} animais{' '}
                          {venda.peso_total ? `/ ${venda.peso_total} kg` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tipoColor(venda.tipo_venda)}`}>
                        {tipoLabel(venda.tipo_venda)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor(venda.status)}`}>
                        {venda.status ?? '—'}
                      </span>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Valor Total</p>
                      <p className="text-base font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(venda.valor_total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Preco/@</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {formatCurrency(venda.preco_arroba)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Data Venda</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(venda.data_venda)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lucro Liquido</p>
                      <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(venda.lucro_liquido)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => openDetail(venda)}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <Eye className="h-4 w-4" />
                      Detalhes
                    </button>
                    <button
                      onClick={() => openEdit(venda)}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => openDelete(venda)}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ================================================================== */}
      {/* CREATE / EDIT MODAL                                                 */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            key="form-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowFormModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingVenda ? 'Editar Venda' : 'Nova Venda'}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-5">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Venda
                    </label>
                    <select
                      value={formData.tipo_venda}
                      onChange={(e) => handleFormChange('tipo_venda', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      {TIPO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comprador *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.comprador}
                        onChange={(e) => handleFormChange('comprador', e.target.value)}
                        placeholder="Nome do comprador"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Qtd. Animais
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.quantidade_animais ?? 0}
                      onChange={(e) => handleFormChange('quantidade_animais', Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Peso Total (kg)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.peso_total ?? 0}
                      onChange={(e) => handleFormChange('peso_total', Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preco/@ (R$)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.preco_arroba ?? 0}
                      onChange={(e) => handleFormChange('preco_arroba', Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Valor Total (auto) */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">Valor Total (calculado)</p>
                    <p className="text-xs text-green-600 dark:text-green-500">peso / 15 * preco/@</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(formData.valor_total)}
                  </p>
                </div>

                {/* Row 3: Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data da Venda
                    </label>
                    <input
                      type="date"
                      value={formData.data_venda ?? ''}
                      onChange={(e) => handleFormChange('data_venda', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Entrega
                    </label>
                    <input
                      type="date"
                      value={formData.data_entrega ?? ''}
                      onChange={(e) => handleFormChange('data_entrega', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Row 4: Impostos */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Impostos (R$)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">FUNRURAL</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={formData.impostos_funrural ?? 0}
                        onChange={(e) => handleFormChange('impostos_funrural', Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">ICMS</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={formData.impostos_icms ?? 0}
                        onChange={(e) => handleFormChange('impostos_icms', Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Outros</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={formData.impostos_outros ?? 0}
                        onChange={(e) => handleFormChange('impostos_outros', Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 5: Status + Lucro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lucro Liquido (R$)
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      value={formData.lucro_liquido ?? 0}
                      onChange={(e) => handleFormChange('lucro_liquido', Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Observacoes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observacoes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.observacoes ?? ''}
                    onChange={(e) => handleFormChange('observacoes', e.target.value)}
                    placeholder="Notas adicionais sobre esta venda..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowFormModal(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {editingVenda ? 'Salvar Alteracoes' : 'Criar Venda'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* DETAIL MODAL                                                        */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showDetailModal && detailVenda && (
          <motion.div
            key="detail-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Detalhes da Venda
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${tipoColor(detailVenda.tipo_venda)}`}>
                    {tipoLabel(detailVenda.tipo_venda)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(detailVenda.status)}`}>
                    {detailVenda.status}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Informacoes
                    </h3>
                    <InfoRow label="Comprador" value={detailVenda.comprador ?? '—'} />
                    <InfoRow label="Qtd. Animais" value={String(detailVenda.quantidade_animais ?? 0)} />
                    <InfoRow label="Peso Total" value={`${detailVenda.peso_total ?? 0} kg`} />
                    <InfoRow label="Data Venda" value={formatDate(detailVenda.data_venda)} />
                    <InfoRow label="Data Entrega" value={formatDate(detailVenda.data_entrega)} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Valores
                    </h3>
                    <InfoRow label="Preco/@" value={formatCurrency(detailVenda.preco_arroba)} />
                    <InfoRow label="Valor Total" value={formatCurrency(detailVenda.valor_total)} highlight="green" />
                    <InfoRow label="Lucro Liquido" value={formatCurrency(detailVenda.lucro_liquido)} highlight="blue" />
                  </div>
                </div>

                {/* Impostos */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
                    Impostos
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'FUNRURAL', value: detailVenda.impostos_funrural },
                      { label: 'ICMS', value: detailVenda.impostos_icms },
                      { label: 'Outros', value: detailVenda.impostos_outros },
                    ].map((imp) => (
                      <div
                        key={imp.label}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400">{imp.label}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                          {formatCurrency(imp.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Total impostos: </span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(
                        (detailVenda.impostos_funrural ?? 0) +
                          (detailVenda.impostos_icms ?? 0) +
                          (detailVenda.impostos_outros ?? 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Observacoes */}
                {detailVenda.observacoes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Observacoes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 whitespace-pre-wrap">
                      {detailVenda.observacoes}
                    </p>
                  </div>
                )}

                {detailVenda.created_at && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Registrado em {formatDate(detailVenda.created_at)}
                  </p>
                )}
              </div>

              {/* Footer actions */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEdit(detailVenda);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* DELETE CONFIRMATION MODAL                                            */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showDeleteModal && deletingVenda && (
          <motion.div
            key="delete-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir Venda</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Tem certeza que deseja excluir a venda para
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  {deletingVenda.comprador || 'Sem comprador'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  no valor de {formatCurrency(deletingVenda.valor_total)}? Esta acao nao pode ser desfeita.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingVenda(null);
                    }}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition disabled:opacity-50 shadow-sm"
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

// ---------------------------------------------------------------------------
// Small helper component for detail modal
// ---------------------------------------------------------------------------

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'blue';
}) {
  const valueColor =
    highlight === 'green'
      ? 'text-green-600 dark:text-green-400 font-semibold'
      : highlight === 'blue'
      ? 'text-blue-600 dark:text-blue-400 font-semibold'
      : 'text-gray-900 dark:text-white';

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}
