import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit3, Trash2, MapPin,
  Eye, X, Check, Loader2, AlertCircle, Filter,
  Weight, Heart, DollarSign, Tag
} from 'lucide-react';
import { toast } from 'react-toastify';

import { animalsAPI } from '../services/api';
import { Animal } from '../types/whilab.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FilterState {
  categoria: string;
  status: string;
  lote: string;
  search: string;
}

type ModalMode = 'add' | 'edit' | 'detail' | null;

interface AnimalFormData {
  brinco: string;
  raca: string;
  sexo: 'macho' | 'femea';
  categoria: string;
  data_nascimento: string;
  peso_atual: number | '';
  lote: string;
  pasto: string;
  valor_compra: number | '';
  observacoes: string;
}

const EMPTY_FORM: AnimalFormData = {
  brinco: '',
  raca: '',
  sexo: 'macho',
  categoria: 'bezerro',
  data_nascimento: '',
  peso_atual: '',
  lote: '',
  pasto: '',
  valor_compra: '',
  observacoes: '',
};

const CATEGORIAS = [
  { value: 'bezerro', label: 'Bezerro' },
  { value: 'bezerra', label: 'Bezerra' },
  { value: 'novilho', label: 'Novilho' },
  { value: 'novilha', label: 'Novilha' },
  { value: 'boi', label: 'Boi' },
  { value: 'vaca', label: 'Vaca' },
];

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'morto', label: 'Morto' },
  { value: 'transferido', label: 'Transferido' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryColor(categoria?: string): string {
  const map: Record<string, string> = {
    boi: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    novilho: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    vaca: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
    novilha: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    bezerro: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    bezerra: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  };
  return map[(categoria ?? '').toLowerCase()] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function getStatusColor(status?: string): string {
  const map: Record<string, string> = {
    ativo: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    vendido: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    morto: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    transferido: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  };
  return map[(status ?? '').toLowerCase()] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function formatCurrency(value?: number): string {
  if (value == null) return 'R$ 0';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RebanhoPage() {
  // Data
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    categoria: '',
    status: '',
    lote: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState<AnimalFormData>(EMPTY_FORM);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // -----------------------------------------------------------------------
  // Load animals on mount
  // -----------------------------------------------------------------------
  const loadAnimals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await animalsAPI.getAll();
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setAnimals(data);
      } else {
        setAnimals([]);
      }
    } catch (error) {
      console.error('[RebanhoPage] Erro ao carregar animais:', error);
      toast.error('Erro ao carregar animais. Tente novamente.');
      setAnimals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  // -----------------------------------------------------------------------
  // Derived / filtered data
  // -----------------------------------------------------------------------
  const filteredAnimals = useMemo(() => {
    let result = animals;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.brinco?.toLowerCase().includes(q) ||
          a.raca?.toLowerCase().includes(q)
      );
    }
    if (filters.categoria) {
      result = result.filter((a) => a.categoria === filters.categoria);
    }
    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.lote) {
      result = result.filter((a) => a.lote === filters.lote);
    }
    return result;
  }, [animals, filters]);

  const uniqueLotes = useMemo(() => {
    const lotes = new Set(animals.map((a) => a.lote).filter(Boolean));
    return Array.from(lotes) as string[];
  }, [animals]);

  const kpis = useMemo(() => {
    const total = animals.length;
    const pesoTotal = animals.reduce((s, a) => s + (a.peso_atual ?? a.peso ?? 0), 0);
    const pesoMedio = total > 0 ? Math.round(pesoTotal / total) : 0;
    const valorTotal = animals.reduce((s, a) => s + (a.valor_compra ?? 0), 0);
    const ativos = animals.filter((a) => a.status === 'ativo').length;
    return { total, pesoMedio, valorTotal, ativos };
  }, [animals]);

  // -----------------------------------------------------------------------
  // CRUD handlers
  // -----------------------------------------------------------------------
  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setSelectedAnimal(null);
    setModalMode('add');
  };

  const openEditModal = (animal: Animal, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedAnimal(animal);
    setFormData({
      brinco: animal.brinco ?? '',
      raca: animal.raca ?? '',
      sexo: animal.sexo ?? 'macho',
      categoria: animal.categoria ?? 'bezerro',
      data_nascimento: animal.data_nascimento ?? '',
      peso_atual: animal.peso_atual ?? animal.peso ?? '',
      lote: animal.lote ?? '',
      pasto: animal.pasto ?? '',
      valor_compra: animal.valor_compra ?? '',
      observacoes: animal.observacoes ?? '',
    });
    setModalMode('edit');
  };

  const openDetailModal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setModalMode('detail');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAnimal(null);
    setFormData(EMPTY_FORM);
  };

  const handleFormChange = (
    field: keyof AnimalFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.brinco.trim()) {
      toast.warn('Informe o brinco do animal.');
      return;
    }
    if (!formData.raca.trim()) {
      toast.warn('Informe a raca do animal.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        brinco: formData.brinco.trim(),
        raca: formData.raca.trim(),
        sexo: formData.sexo,
        categoria: formData.categoria,
        data_nascimento: formData.data_nascimento || null,
        peso_atual: formData.peso_atual !== '' ? Number(formData.peso_atual) : null,
        lote: formData.lote.trim() || null,
        pasto: formData.pasto.trim() || null,
        valor_compra: formData.valor_compra !== '' ? Number(formData.valor_compra) : null,
        observacoes: formData.observacoes.trim() || null,
        status: 'ativo',
      };

      if (modalMode === 'add') {
        const res = await animalsAPI.create(payload);
        if (res.success) {
          toast.success('Animal cadastrado com sucesso!');
          await loadAnimals();
          closeModal();
        } else {
          toast.error('Erro ao cadastrar animal.');
        }
      } else if (modalMode === 'edit' && selectedAnimal) {
        const res = await animalsAPI.update(selectedAnimal.id, payload);
        if (res.success) {
          toast.success('Animal atualizado com sucesso!');
          await loadAnimals();
          closeModal();
        } else {
          toast.error('Erro ao atualizar animal.');
        }
      }
    } catch (error) {
      console.error('[RebanhoPage] Erro ao salvar animal:', error);
      toast.error('Erro ao salvar animal. Verifique os dados e tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (animal: Animal, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteTarget(animal);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await animalsAPI.delete(deleteTarget.id);
      if (res.success) {
        toast.success(`Animal ${deleteTarget.brinco} removido com sucesso!`);
        await loadAnimals();
      } else {
        toast.error('Erro ao remover animal.');
      }
    } catch (error) {
      console.error('[RebanhoPage] Erro ao deletar animal:', error);
      toast.error('Erro ao remover animal. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // -----------------------------------------------------------------------
  // Render: Loading state
  // -----------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Carregando rebanho...</p>
        </motion.div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Tag className="h-8 w-8 text-green-600" />
              Gestao do Rebanho
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Controle total dos seus animais &bull; {filteredAnimals.length} de{' '}
              {animals.length} animais
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20 font-medium"
          >
            <Plus className="h-5 w-5" />
            Novo Animal
          </button>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
      >
        {[
          {
            label: 'Total Animais',
            value: kpis.total.toString(),
            icon: <Tag className="h-7 w-7 text-blue-500" />,
            accent: 'blue',
          },
          {
            label: 'Peso Medio',
            value: `${kpis.pesoMedio} kg`,
            icon: <Weight className="h-7 w-7 text-green-500" />,
            accent: 'green',
          },
          {
            label: 'Valor Total',
            value: formatCurrency(kpis.valorTotal),
            icon: <DollarSign className="h-7 w-7 text-purple-500" />,
            accent: 'purple',
          },
          {
            label: 'Ativos',
            value: kpis.ativos.toString(),
            icon: <Heart className="h-7 w-7 text-emerald-500" />,
            accent: 'emerald',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ===== FILTER BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por brinco ou raca..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Categoria */}
          <select
            value={filters.categoria}
            onChange={(e) => setFilters((f) => ({ ...f, categoria: e.target.value }))}
            className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">Todas Categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">Todos Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Lote */}
          <select
            value={filters.lote}
            onChange={(e) => setFilters((f) => ({ ...f, lote: e.target.value }))}
            className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">Todos Lotes</option>
            {uniqueLotes.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Grade
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== EMPTY STATE ===== */}
      {filteredAnimals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <Tag className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum animal encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
            {animals.length === 0
              ? 'Comece cadastrando seu primeiro animal para gerenciar seu rebanho.'
              : 'Nenhum animal corresponde aos filtros selecionados. Tente ajustar os filtros.'}
          </p>
          {animals.length === 0 && (
            <button
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              Cadastrar Primeiro Animal
            </button>
          )}
        </motion.div>
      )}

      {/* ===== GRID VIEW ===== */}
      {filteredAnimals.length > 0 && viewMode === 'grid' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredAnimals.map((animal, idx) => (
              <motion.div
                key={animal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                onClick={() => openDetailModal(animal)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all cursor-pointer group"
              >
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                        <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {animal.brinco}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {animal.raca}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        animal.categoria
                      )}`}
                    >
                      {animal.categoria ?? '-'}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        animal.status
                      )}`}
                    >
                      {animal.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Peso</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {animal.peso_atual ?? animal.peso ?? '-'} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Idade</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {animal.idade != null ? `${animal.idade} meses` : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {(animal.lote || animal.pasto) && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {[animal.lote, animal.pasto].filter(Boolean).join(' - ')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(animal);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Detalhes
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => openEditModal(animal, e)}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => confirmDelete(animal, e)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remover"
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

      {/* ===== LIST VIEW ===== */}
      {filteredAnimals.length > 0 && viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Animal</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Peso</div>
            <div className="col-span-2">Localizacao</div>
            <div className="col-span-1">Valor</div>
            <div className="col-span-2 text-right">Acoes</div>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredAnimals.map((animal, idx) => (
              <motion.div
                key={animal.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                onClick={() => openDetailModal(animal)}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
              >
                {/* Animal info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {animal.brinco}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{animal.raca}</p>
                  </div>
                </div>

                {/* Categoria */}
                <div className="col-span-2 flex items-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      animal.categoria
                    )}`}
                  >
                    {animal.categoria ?? '-'}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      animal.status
                    )}`}
                  >
                    {animal.status}
                  </span>
                </div>

                {/* Peso */}
                <div className="col-span-1 flex items-center text-sm text-gray-700 dark:text-gray-300">
                  {animal.peso_atual ?? animal.peso ?? '-'} kg
                </div>

                {/* Localizacao */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {[animal.lote, animal.pasto].filter(Boolean).join(' - ') || '-'}
                  </span>
                </div>

                {/* Valor */}
                <div className="col-span-1 flex items-center text-sm text-gray-700 dark:text-gray-300">
                  {animal.valor_compra ? formatCurrency(animal.valor_compra) : '-'}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailModal(animal);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => openEditModal(animal, e)}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => confirmDelete(animal, e)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ===== ADD / EDIT MODAL ===== */}
      <AnimatePresence>
        {(modalMode === 'add' || modalMode === 'edit') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {modalMode === 'add' ? (
                      <>
                        <Plus className="h-5 w-5 text-green-600" />
                        Novo Animal
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-5 w-5 text-blue-600" />
                        Editar Animal
                      </>
                    )}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Brinco */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Brinco *
                    </label>
                    <input
                      type="text"
                      value={formData.brinco}
                      onChange={(e) => handleFormChange('brinco', e.target.value)}
                      placeholder="Ex: BR-001"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  {/* Raca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Raca *
                    </label>
                    <input
                      type="text"
                      value={formData.raca}
                      onChange={(e) => handleFormChange('raca', e.target.value)}
                      placeholder="Ex: Nelore"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  {/* Sexo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Sexo
                    </label>
                    <select
                      value={formData.sexo}
                      onChange={(e) =>
                        handleFormChange('sexo', e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="macho">Macho</option>
                      <option value="femea">Femea</option>
                    </select>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Categoria
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => handleFormChange('categoria', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    >
                      {CATEGORIAS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) =>
                        handleFormChange('data_nascimento', e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  {/* Peso Atual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Peso Atual (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.peso_atual}
                      onChange={(e) =>
                        handleFormChange(
                          'peso_atual',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="Ex: 450"
                      min={0}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  {/* Lote */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Lote
                    </label>
                    <input
                      type="text"
                      value={formData.lote}
                      onChange={(e) => handleFormChange('lote', e.target.value)}
                      placeholder="Ex: Lote A"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  {/* Pasto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Pasto
                    </label>
                    <input
                      type="text"
                      value={formData.pasto}
                      onChange={(e) => handleFormChange('pasto', e.target.value)}
                      placeholder="Ex: Pasto Norte"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  {/* Valor Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Valor de Compra (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.valor_compra}
                      onChange={(e) =>
                        handleFormChange(
                          'valor_compra',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="Ex: 3500"
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  {/* Observacoes - full width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Observacoes
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => handleFormChange('observacoes', e.target.value)}
                      placeholder="Observacoes adicionais..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={closeModal}
                    disabled={isSaving}
                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {modalMode === 'add' ? 'Cadastrar' : 'Salvar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DETAIL MODAL ===== */}
      <AnimatePresence>
        {modalMode === 'detail' && selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                      <Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedAnimal.brinco}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedAnimal.raca} &bull;{' '}
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedAnimal.status
                          )}`}
                        >
                          {selectedAnimal.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Informacoes Basicas
                    </h3>
                    <div className="space-y-3 text-sm">
                      <InfoRow label="Brinco" value={selectedAnimal.brinco} />
                      <InfoRow label="Raca" value={selectedAnimal.raca} />
                      <InfoRow label="Sexo" value={selectedAnimal.sexo === 'macho' ? 'Macho' : 'Femea'} />
                      <InfoRow label="Categoria" value={selectedAnimal.categoria ?? '-'} />
                      <InfoRow label="Data Nascimento" value={formatDate(selectedAnimal.data_nascimento)} />
                      <InfoRow
                        label="Idade"
                        value={selectedAnimal.idade != null ? `${selectedAnimal.idade} meses` : '-'}
                      />
                      <InfoRow
                        label="Peso Atual"
                        value={
                          selectedAnimal.peso_atual ?? selectedAnimal.peso
                            ? `${selectedAnimal.peso_atual ?? selectedAnimal.peso} kg`
                            : '-'
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localizacao e Financeiro
                    </h3>
                    <div className="space-y-3 text-sm">
                      <InfoRow label="Lote" value={selectedAnimal.lote || '-'} />
                      <InfoRow label="Pasto" value={selectedAnimal.pasto || '-'} />
                      <InfoRow label="Status" value={selectedAnimal.status} />
                      <InfoRow
                        label="Valor Compra"
                        value={
                          selectedAnimal.valor_compra != null
                            ? formatCurrency(selectedAnimal.valor_compra)
                            : '-'
                        }
                      />
                      <InfoRow
                        label="Custo Acumulado"
                        value={formatCurrency(selectedAnimal.custo_acumulado)}
                      />
                      <InfoRow
                        label="Cadastrado em"
                        value={formatDate(selectedAnimal.created_at)}
                      />
                    </div>
                  </div>
                </div>

                {/* Observacoes */}
                {selectedAnimal.observacoes && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-2">
                      Observacoes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {selectedAnimal.observacoes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      closeModal();
                      setTimeout(() => confirmDelete(selectedAnimal), 100);
                    }}
                    className="px-4 py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                  <button
                    onClick={() => {
                      const animal = selectedAnimal;
                      closeModal();
                      setTimeout(() => openEditModal(animal), 100);
                    }}
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Confirmar Remocao
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Esta acao nao pode ser desfeita.
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Tem certeza que deseja remover o animal{' '}
                  <strong className="text-gray-900 dark:text-white">
                    {deleteTarget.brinco}
                  </strong>{' '}
                  ({deleteTarget.raca})? Todos os dados relacionados serao perdidos.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Sim, Remover
                      </>
                    )}
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
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white text-right">
        {value}
      </span>
    </div>
  );
}
