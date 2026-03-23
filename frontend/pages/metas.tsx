import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Target,
  Trophy,
  Clock,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Star,
  Flag,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";
import { toast } from "react-hot-toast";

import { metaAPI } from "../services/api";
import type { Meta, Prioridade } from "../types/Meta";
import { useAuth } from "../context/AuthContext";


const categoriasMetas = [
  "Produção",
  "Vendas",
  "Rebanho",
  "Infraestrutura",
  "Tecnologia",
  "Sustentabilidade",
  "Financeiro",
  "Qualidade",
  "Expansão",
  "Outros",
];

const prioridadeConfig = {
  baixa: {
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    icon: Flag,
    label: "Baixa",
  },
  media: {
    color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    icon: Star,
    label: "Média",
  },
  alta: {
    color: "text-red-600 bg-red-100 dark:bg-red-900/30",
    icon: Zap,
    label: "Alta",
  },
};

export default function Metas() {
  const { user } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<"todas" | string>("todas");
  const [filterPrioridade, setFilterPrioridade] = useState<"todas" | Prioridade>("todas");
  const [filterStatus, setFilterStatus] = useState<"todas" | "concluidas" | "em-andamento" | "atrasadas">("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");

  const [formData, setFormData] = useState<Partial<Meta>>({
    meta: "",
    descricao: "",
    valor_total: 0,
    valor_atual: 0,
    data_conclusao: new Date().toISOString().split("T")[0],
    categoria: "Produção",
    prioridade: "media",
    userId: user?.id || "",
  });

  // Buscar metas
  const fetchMetas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await metaAPI.getAll();
      setMetas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      toast.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetas();
  }, [fetchMetas]);

  // Filtrar e categorizar metas
  const { filteredMetas, estatisticas } = useMemo(() => {
    let filtered = [...metas];
    const hoje = new Date();

    if (filterCategoria !== "todas") {
      filtered = filtered.filter((m) => m.categoria === filterCategoria);
    }

    if (filterPrioridade !== "todas") {
      filtered = filtered.filter((m) => m.prioridade === filterPrioridade);
    }

    switch (filterStatus) {
      case "concluidas":
        filtered = filtered.filter((m) => m.concluida);
        break;
      case "em-andamento":
        filtered = filtered.filter((m) => !m.concluida && isAfter(parseISO(m.data_conclusao), hoje));
        break;
      case "atrasadas":
        filtered = filtered.filter((m) => !m.concluida && isBefore(parseISO(m.data_conclusao), hoje));
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.meta.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const prioridadeOrder = { alta: 0, media: 1, baixa: 2 };
      const prioA = prioridadeOrder[a.prioridade || "media"];
      const prioB = prioridadeOrder[b.prioridade || "media"];
      
      if (prioA !== prioB) return prioA - prioB;
      
      return parseISO(a.data_conclusao).getTime() - parseISO(b.data_conclusao).getTime();
    });

    const totalMetas = metas.length;
    const concluidas = metas.filter((m) => m.concluida).length;
    const emAndamento = metas.filter((m) => !m.concluida && isAfter(parseISO(m.data_conclusao), hoje)).length;
    const atrasadas = metas.filter((m) => !m.concluida && isBefore(parseISO(m.data_conclusao), hoje)).length;
    
    const progressoMedio = metas.reduce((acc, m) => {
      const progresso = m.valor_total ? (m.valor_atual / m.valor_total) * 100 : 0;
      return acc + progresso;
    }, 0) / (totalMetas || 1);

    const valorTotalMetas = metas.reduce((sum, m) => sum + m.valor_total, 0);
    const valorAtualTotal = metas.reduce((sum, m) => sum + m.valor_atual, 0);

    return {
      filteredMetas: filtered,
      estatisticas: {
        totalMetas,
        concluidas,
        emAndamento,
        atrasadas,
        progressoMedio,
        valorTotalMetas,
        valorAtualTotal,
        taxaConclusao: totalMetas > 0 ? (concluidas / totalMetas) * 100 : 0,
      },
    };
  }, [metas, filterCategoria, filterPrioridade, filterStatus, searchTerm]);

  // Handlers
  const handleCreate = () => {
    setSelectedMeta(null);
    setModalMode("create");
    setFormData({
      meta: "",
      descricao: "",
      valor_total: 0,
      valor_atual: 0,
      data_conclusao: new Date().toISOString().split("T")[0],
      categoria: "Produção",
      prioridade: "media",
      userId: user?.id || "",
    });
    setModalOpen(true);
  };

  const handleView = (meta: Meta) => {
    setSelectedMeta(meta);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (meta: Meta) => {
    setSelectedMeta(meta);
    setModalMode("edit");
    setFormData({
      ...meta,
      data_conclusao: meta.data_conclusao.split("T")[0],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    
    try {
      await metaAPI.delete(id);
      toast.success("Meta excluída com sucesso");
      fetchMetas();
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      toast.error("Erro ao excluir meta");
    }
  };

  const handleToggleConcluida = async (meta: Meta) => {
    try {
      await metaAPI.update(meta._id, { concluida: !meta.concluida });
      toast.success(meta.concluida ? "Meta reaberta" : "Meta concluída! 🎉");
      fetchMetas();
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      toast.error("Erro ao atualizar meta");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.meta || !formData.descricao || !formData.valor_total) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (modalMode === "edit" && selectedMeta) {
        await metaAPI.update(selectedMeta._id, formData);
        toast.success("Meta atualizada com sucesso");
      } else {
        const novaMeta = {
          meta: formData.meta!,
          descricao: formData.descricao!,
          valor_total: formData.valor_total!,
          valor_atual: formData.valor_atual || 0,
          data_conclusao: formData.data_conclusao!,
          categoria: formData.categoria,
          prioridade: formData.prioridade,
          userId: user?.id || "",
        };
        await metaAPI.create(novaMeta);
        toast.success("Meta criada com sucesso");
      }
      fetchMetas();
      setModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast.error("Erro ao salvar meta");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Metas e Objetivos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Defina e acompanhe suas metas para o crescimento da fazenda
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Metas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estatisticas.totalMetas}
                </p>
                <span className="text-xs text-gray-500">
                  {estatisticas.concluidas} concluídas
                </span>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estatisticas.emAndamento}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {estatisticas.progressoMedio.toFixed(1)}% progresso
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {estatisticas.concluidas}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {estatisticas.taxaConclusao.toFixed(0)}% de conclusão
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {estatisticas.atrasadas}
                </p>
                {estatisticas.atrasadas > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Atenção necessária
                  </p>
                )}
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar meta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                />
              </div>

              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              >
                <option value="todas">Todas Categorias</option>
                {categoriasMetas.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filterPrioridade}
                onChange={(e) => setFilterPrioridade(e.target.value as typeof filterPrioridade)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              >
                <option value="todas">Todas Prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              >
                <option value="todas">Todos Status</option>
                <option value="em-andamento">Em Andamento</option>
                <option value="concluidas">Concluídas</option>
                <option value="atrasadas">Atrasadas</option>
              </select>
            </div>

            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Meta
            </button>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando metas...</p>
            </div>
          ) : filteredMetas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma meta encontrada
              </p>
              <button
                onClick={handleCreate}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Criar Primeira Meta
              </button>
            </div>
          ) : (
            filteredMetas.map((meta) => {
              const progresso = meta.valor_total ? (meta.valor_atual / meta.valor_total) * 100 : 0;
              const diasRestantes = differenceInDays(parseISO(meta.data_conclusao), new Date());
              const atrasada = diasRestantes < 0 && !meta.concluida;
              const PrioridadeIcon = prioridadeConfig[meta.prioridade || "media"].icon;

              return (
                <motion.div
                  key={meta._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${
                    meta.concluida ? "opacity-75" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${meta.concluida ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                            {meta.meta}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${prioridadeConfig[meta.prioridade || "media"].color}`}>
                            <PrioridadeIcon className="w-3 h-3" />
                            {prioridadeConfig[meta.prioridade || "media"].label}
                          </span>
                          {meta.categoria && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                              {meta.categoria}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {meta.descricao}
                        </p>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Progresso</span>
                              <span className="text-sm font-medium">
                                R$ {meta.valor_atual.toLocaleString("pt-BR")} / R$ {meta.valor_total.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, progresso)}%` }}
                                transition={{ duration: 0.5 }}
                                className={`h-2 rounded-full ${
                                  progresso >= 100
                                    ? "bg-green-500"
                                    : progresso >= 75
                                    ? "bg-blue-500"
                                    : progresso >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">{progresso.toFixed(1)}% completo</span>
                              {!meta.concluida && (
                                <span className={`text-xs ${atrasada ? "text-red-500" : "text-gray-500"}`}>
                                  {atrasada ? `${Math.abs(diasRestantes)} dias de atraso` : `${diasRestantes} dias restantes`}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Prazo: {format(parseISO(meta.data_conclusao), "dd/MM/yyyy")}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleConcluida(meta)}
                                className={`p-1.5 rounded transition ${
                                  meta.concluida
                                    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                                    : "hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                                }`}
                                title={meta.concluida ? "Reabrir meta" : "Marcar como concluída"}
                              >
                                {meta.concluida ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleView(meta)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(meta)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(meta._id)}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-red-600"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {modalMode === "create" ? "Nova Meta" : modalMode === "edit" ? "Editar Meta" : "Detalhes da Meta"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {modalMode === "view" && selectedMeta ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-xl text-white">
                    <h3 className="text-xl font-bold mb-2">{selectedMeta.meta}</h3>
                    <p className="text-white/90">{selectedMeta.descricao}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Valor Atual</label>
                      <p className="text-lg font-medium">
                        R$ {selectedMeta.valor_atual.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Valor Total</label>
                      <p className="text-lg font-medium">
                        R$ {selectedMeta.valor_total.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Prazo</label>
                      <p className="text-lg font-medium">
                        {format(parseISO(selectedMeta.data_conclusao), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Categoria</label>
                      <p className="text-lg font-medium">{selectedMeta.categoria}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Título da Meta *
                    </label>
                    <input
                      type="text"
                      value={formData.meta}
                      onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                      placeholder="Ex: Aumentar produção de leite em 20%"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                      rows={3}
                      placeholder="Descreva os detalhes e estratégias..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                        required
                      >
                        {categoriasMetas.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prioridade *
                      </label>
                      <select
                        value={formData.prioridade}
                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as Prioridade })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                        required
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor Total (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.valor_total}
                        onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor Atual (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.valor_atual}
                        onChange={(e) => setFormData({ ...formData, valor_atual: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data de Conclusão *
                      </label>
                      <input
                        type="date"
                        value={formData.data_conclusao}
                        onChange={(e) => setFormData({ ...formData, data_conclusao: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {modalMode === "create" ? "Criar Meta" : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
