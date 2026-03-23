import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  FileText,
  PieChart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";

import { useAuth } from "../context/AuthContext";
import type { Transacao } from "../types/Transacao";
import { transacaoAPI } from "../services/api";

// Lazy load do gráfico para melhor performance
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transacao: Partial<Transacao>) => Promise<void>;
  transacao?: Transacao | null;
  mode: "create" | "edit" | "view";
}

const categorias = {
  receita: [
    "Venda de Gado",
    "Venda de Leite",
    "Venda de Produtos",
    "Serviços",
    "Subsídios",
    "Outros Rendimentos",
  ],
  despesa: [
    "Alimentação Animal",
    "Medicamentos",
    "Mão de Obra",
    "Manutenção",
    "Combustível",
    "Energia",
    "Impostos",
    "Outros Gastos",
  ],
  transferencia: ["Entre Contas", "Investimentos", "Reservas"],
};

function TransacaoModal({ isOpen, onClose, onSave, transacao, mode }: TransacaoModalProps) {
  const [formData, setFormData] = useState<Partial<Transacao>>({
    descricao: "",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    tipo: "receita",
    categoria: "",
    conta: "Conta Principal",
    observacao: "",
  });

  useEffect(() => {
    if (transacao) {
      const data = typeof transacao.data === "string" 
        ? transacao.data 
        : transacao.data.$date;
      
      setFormData({
        ...transacao,
        data: data.split("T")[0],
      });
    } else {
      setFormData({
        descricao: "",
        valor: 0,
        data: new Date().toISOString().split("T")[0],
        tipo: "receita",
        categoria: "",
        conta: "Conta Principal",
        observacao: "",
      });
    }
  }, [transacao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    await onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
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
              {mode === "create" ? "Nova Transação" : mode === "edit" ? "Editar Transação" : "Detalhes da Transação"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {mode === "view" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Descrição</label>
                  <p className="text-lg font-medium">{transacao?.descricao}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Valor</label>
                  <p className="text-lg font-medium">
                    R$ {transacao?.valor?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Data</label>
                  <p className="text-lg font-medium">
                    {transacao?.data && format(parseISO(typeof transacao.data === "string" ? transacao.data : transacao.data.$date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Tipo</label>
                  <p className="text-lg font-medium capitalize">{transacao?.tipo}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Categoria</label>
                  <p className="text-lg font-medium">{transacao?.categoria}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Conta</label>
                  <p className="text-lg font-medium">{transacao?.conta}</p>
                </div>
              </div>
              {transacao?.observacao && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Observações</label>
                  <p className="text-lg">{transacao.observacao}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Transação *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as "receita" | "despesa" | "transferencia", categoria: "" })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>

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
                    <option value="">Selecione uma categoria</option>
                    {formData.tipo && categorias[formData.tipo].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    placeholder="Ex: Venda de 10 bezerros"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={typeof formData.data === 'string' ? formData.data : formData.data?.$date || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conta
                  </label>
                  <select
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  >
                    <option value="Conta Principal">Conta Principal</option>
                    <option value="Conta Secundária">Conta Secundária</option>
                    <option value="Caixa">Caixa</option>
                    <option value="Banco">Banco</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  rows={3}
                  placeholder="Adicione observações relevantes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {mode === "create" ? "Criar Transação" : "Salvar Alterações"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Transacoes() {
  const { user: _user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | "receita" | "despesa" | "transferencia">("todos");
  const [filterPeriodo, setFilterPeriodo] = useState("mes-atual");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState<Transacao | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");

  // Buscar transações
  const fetchTransacoes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transacaoAPI.getAll();
      const data = response.data || response;
      setTransacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransacoes();
  }, [fetchTransacoes]);

  // Filtrar transações
  const filteredTransacoes = useMemo(() => {
    let filtered = [...transacoes];

    // Filtro por tipo
    if (filterTipo !== "todos") {
      filtered = filtered.filter((t) => t.tipo === filterTipo);
    }

    // Filtro por período
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    switch (filterPeriodo) {
      case "mes-atual":
        filtered = filtered.filter((t) => {
          const date = parseISO(typeof t.data === "string" ? t.data : t.data.$date);
          return date >= startOfCurrentMonth && date <= endOfCurrentMonth;
        });
        break;
      case "mes-passado": {
        const startOfLastMonth = startOfMonth(subMonths(now, 1));
        const endOfLastMonth = endOfMonth(subMonths(now, 1));
        filtered = filtered.filter((t) => {
          const date = parseISO(typeof t.data === "string" ? t.data : t.data.$date);
          return date >= startOfLastMonth && date <= endOfLastMonth;
        });
        break;
      }
      case "ultimos-3-meses": {
        const threeMonthsAgo = subMonths(now, 3);
        filtered = filtered.filter((t) => {
          const date = parseISO(typeof t.data === "string" ? t.data : t.data.$date);
          return date >= threeMonthsAgo;
        });
        break;
      }
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => {
      const dateA = parseISO(typeof a.data === "string" ? a.data : a.data.$date);
      const dateB = parseISO(typeof b.data === "string" ? b.data : b.data.$date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [transacoes, filterTipo, filterPeriodo, searchTerm]);

  // Calcular métricas
  const metricas = useMemo(() => {
    const receitas = filteredTransacoes
      .filter((t) => t.tipo === "receita")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const despesas = filteredTransacoes
      .filter((t) => t.tipo === "despesa")
      .reduce((sum, t) => sum + t.valor, 0);

    const saldo = receitas - despesas;

    // Agrupar por categoria
    const porCategoria = filteredTransacoes.reduce((acc, t) => {
      if (!acc[t.categoria]) {
        acc[t.categoria] = 0;
      }
      acc[t.categoria] += t.tipo === "despesa" ? -t.valor : t.valor;
      return acc;
    }, {} as Record<string, number>);

    return {
      receitas,
      despesas,
      saldo,
      totalTransacoes: filteredTransacoes.length,
      porCategoria,
    };
  }, [filteredTransacoes]);

  // Handlers
  const handleCreate = () => {
    setSelectedTransacao(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (transacao: Transacao) => {
    setSelectedTransacao(transacao);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (transacao: Transacao) => {
    setSelectedTransacao(transacao);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    
    try {
      await transacaoAPI.delete(id);
      toast.success("Transação excluída com sucesso");
      fetchTransacoes();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  const handleSave = async (transacao: Partial<Transacao>) => {
    try {
      if (modalMode === "edit" && selectedTransacao) {
        await transacaoAPI.update(selectedTransacao._id, transacao);
        toast.success("Transação atualizada com sucesso");
      } else {
        await transacaoAPI.create(transacao);
        toast.success("Transação criada com sucesso");
      }
      fetchTransacoes();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      toast.error("Erro ao salvar transação");
    }
  };

  const exportToCSV = () => {
    const headers = ["Data", "Tipo", "Categoria", "Descrição", "Valor", "Conta"];
    const rows = filteredTransacoes.map((t) => [
      format(parseISO(typeof t.data === "string" ? t.data : t.data.$date), "dd/MM/yyyy"),
      t.tipo,
      t.categoria,
      t.descricao,
      t.valor.toFixed(2),
      t.conta,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transacoes_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dados para o gráfico
  const chartData = {
    series: [
      {
        name: "Receitas",
        data: Object.entries(metricas.porCategoria)
          .filter(([_, value]) => value > 0)
          .map(([_, value]) => value),
      },
      {
        name: "Despesas",
        data: Object.entries(metricas.porCategoria)
          .filter(([_, value]) => value < 0)
          .map(([_, value]) => Math.abs(value)),
      },
    ],
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 4,
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: Object.keys(metricas.porCategoria),
      },
      yaxis: {
        title: { text: "R$ (Reais)" },
      },
      fill: { opacity: 1 },
      colors: ["#10b981", "#ef4444"],
      tooltip: {
        y: {
          formatter: (val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transações Financeiras
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie todas as movimentações financeiras da sua fazenda
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metricas.receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {metricas.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
                <p className={`text-2xl font-bold ${metricas.saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                  R$ {metricas.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-3 ${metricas.saldo >= 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-orange-100 dark:bg-orange-900/30"} rounded-lg`}>
                <DollarSign className={`w-6 h-6 ${metricas.saldo >= 0 ? "text-blue-600" : "text-orange-600"}`} />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Transações</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metricas.totalTransacoes}
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gráfico */}
        {Object.keys(metricas.porCategoria).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Análise por Categoria
            </h2>
            <Chart options={chartData.options} series={chartData.series} type="bar" height={350} />
          </motion.div>
        )}

        {/* Filtros e Ações */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar transação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                />
              </div>

              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value as typeof filterTipo)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
                <option value="transferencia">Transferências</option>
              </select>

              <select
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              >
                <option value="mes-atual">Mês Atual</option>
                <option value="mes-passado">Mês Passado</option>
                <option value="ultimos-3-meses">Últimos 3 Meses</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Transação
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando transações...</p>
            </div>
          ) : filteredTransacoes.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma transação encontrada
              </p>
              <button
                onClick={handleCreate}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Criar Primeira Transação
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransacoes.map((transacao) => (
                    <motion.tr
                      key={transacao._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(parseISO(typeof transacao.data === "string" ? transacao.data : transacao.data.$date), "dd/MM/yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transacao.tipo === "receita"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : transacao.tipo === "despesa"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {transacao.tipo === "receita" && <ArrowUpRight className="w-3 h-3" />}
                          {transacao.tipo === "despesa" && <ArrowDownRight className="w-3 h-3" />}
                          {transacao.tipo === "transferencia" && <RefreshCw className="w-3 h-3" />}
                          {transacao.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {transacao.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transacao.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transacao.tipo === "despesa" ? "text-red-600" : "text-green-600"}>
                          {transacao.tipo === "despesa" ? "-" : "+"}
                          R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(transacao)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(transacao)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transacao._id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <TransacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        transacao={selectedTransacao}
        mode={modalMode}
      />
    </div>
  );
}
