import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  PieChart,
  BarChart2,
  DollarSign,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Shield,
  Zap,
  Target,
  Activity,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";

import type { Investimento, TipoInvestimento } from "../types/Investimento";
import { investimentoAPI } from "../services/api";

// Lazy load dos gráficos
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface InvestimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investimento: Partial<Investimento>) => Promise<void>;
  investimento?: Investimento | null;
  mode: "create" | "edit" | "view";
}

const tiposInvestimento: TipoInvestimento[] = [
  "Poupança",
  "CDB",
  "LCI",
  "LCA",
  "Tesouro Direto",
  "Ações",
  "Fundos Imobiliários",
  "Fundos de Investimento",
  "Criptomoedas",
  "Previdência Privada",
  "ETF",
  "Debêntures",
  "CRA",
  "CRI",
];

const riscoColors = {
  Baixo: "text-green-600 bg-green-100 dark:bg-green-900/30",
  Médio: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
  Alto: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  "Muito Alto": "text-red-600 bg-red-100 dark:bg-red-900/30",
};

const liquidezInfo = {
  "D+0": "Liquidez diária",
  "D+1": "Liquidez em 1 dia útil",
  "D+30": "Liquidez em 30 dias",
  "D+60": "Liquidez em 60 dias",
  "D+90": "Liquidez em 90 dias",
  "D+180": "Liquidez em 180 dias",
  "D+365": "Liquidez em 1 ano",
  "Sem liquidez": "Resgate apenas no vencimento",
};

function InvestimentoModal({ isOpen, onClose, onSave, investimento, mode }: InvestimentoModalProps) {
  const [formData, setFormData] = useState<Partial<Investimento>>({
    nome: "",
    tipo: "CDB",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    instituicao: "",
    rentabilidade: 0,
    vencimento: "",
    liquidez: "D+1",
    risco: "Baixo",
    meta: 0,
  });

  useEffect(() => {
    if (investimento) {
      setFormData({
        ...investimento,
        data: investimento.data.split("T")[0],
        vencimento: investimento.vencimento?.split("T")[0] || "",
      });
    } else {
      setFormData({
        nome: "",
        tipo: "CDB",
        valor: 0,
        data: new Date().toISOString().split("T")[0],
        instituicao: "",
        rentabilidade: 0,
        vencimento: "",
        liquidez: "D+1",
        risco: "Baixo",
        meta: 0,
      });
    }
  }, [investimento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.valor || !formData.tipo) {
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
          className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === "create" ? "Novo Investimento" : mode === "edit" ? "Editar Investimento" : "Detalhes do Investimento"}
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
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Nome do Investimento</label>
                  <p className="text-lg font-medium">{investimento?.nome}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Tipo</label>
                  <p className="text-lg font-medium">{investimento?.tipo}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Valor Investido</label>
                  <p className="text-lg font-medium">
                    R$ {investimento?.valor?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Data do Investimento</label>
                  <p className="text-lg font-medium">
                    {investimento?.data && format(parseISO(investimento.data), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                {investimento?.instituicao && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Instituição</label>
                    <p className="text-lg font-medium">{investimento.instituicao}</p>
                  </div>
                )}
                {investimento?.rentabilidade !== undefined && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Rentabilidade</label>
                    <p className="text-lg font-medium">{investimento.rentabilidade}% ao ano</p>
                  </div>
                )}
                {investimento?.vencimento && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Vencimento</label>
                    <p className="text-lg font-medium">
                      {format(parseISO(investimento.vencimento), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
                {investimento?.liquidez && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Liquidez</label>
                    <p className="text-lg font-medium">{liquidezInfo[investimento.liquidez]}</p>
                  </div>
                )}
                {investimento?.risco && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Risco</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${riscoColors[investimento.risco]}`}>
                      {investimento.risco}
                    </span>
                  </div>
                )}
                {investimento?.meta !== undefined && investimento.meta > 0 && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Meta de Rendimento</label>
                    <p className="text-lg font-medium">
                      R$ {investimento.meta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>

              {/* Cálculo de rendimento estimado */}
              {investimento?.rentabilidade && investimento?.valor && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Projeção de Rendimento</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Em 1 ano</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">
                        R$ {(investimento.valor * (1 + investimento.rentabilidade / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Em 3 anos</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">
                        R$ {(investimento.valor * Math.pow(1 + investimento.rentabilidade / 100, 3)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Em 5 anos</p>
                      <p className="font-medium text-blue-900 dark:text-blue-300">
                        R$ {(investimento.valor * Math.pow(1 + investimento.rentabilidade / 100, 5)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Investimento *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    placeholder="Ex: CDB Banco XYZ 120% CDI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Investimento *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoInvestimento })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    required
                  >
                    {tiposInvestimento.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instituição Financeira
                  </label>
                  <input
                    type="text"
                    value={formData.instituicao}
                    onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    placeholder="Ex: Banco do Brasil, XP, Rico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor Investido (R$) *
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
                    Data do Investimento *
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rentabilidade (% ao ano)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rentabilidade}
                    onChange={(e) => setFormData({ ...formData, rentabilidade: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    placeholder="Ex: 12.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={formData.vencimento}
                    onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Liquidez
                  </label>
                  <select
                    value={formData.liquidez}
                    onChange={(e) => setFormData({ ...formData, liquidez: e.target.value as Investimento["liquidez"] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  >
                    <option value="D+0">D+0 - Liquidez diária</option>
                    <option value="D+1">D+1 - 1 dia útil</option>
                    <option value="D+30">D+30 - 30 dias</option>
                    <option value="D+60">D+60 - 60 dias</option>
                    <option value="D+90">D+90 - 90 dias</option>
                    <option value="D+180">D+180 - 180 dias</option>
                    <option value="D+365">D+365 - 1 ano</option>
                    <option value="Sem liquidez">Sem liquidez</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nível de Risco
                  </label>
                  <select
                    value={formData.risco}
                    onChange={(e) => setFormData({ ...formData, risco: e.target.value as Investimento["risco"] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  >
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                    <option value="Muito Alto">Muito Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta de Rendimento (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.meta}
                    onChange={(e) => setFormData({ ...formData, meta: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    placeholder="Valor esperado ao final"
                  />
                </div>
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
                  {mode === "create" ? "Criar Investimento" : "Salvar Alterações"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Investimentos() {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | TipoInvestimento>("todos");
  const [filterRisco, setFilterRisco] = useState<"todos" | "Baixo" | "Médio" | "Alto" | "Muito Alto">("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvestimento, setSelectedInvestimento] = useState<Investimento | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Buscar investimentos
  const fetchInvestimentos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await investimentoAPI.getAll();
      const data = response.data || response;
      setInvestimentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar investimentos:", error);
      toast.error("Erro ao carregar investimentos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestimentos();
  }, [fetchInvestimentos]);

  // Filtrar investimentos
  const filteredInvestimentos = useMemo(() => {
    let filtered = [...investimentos];

    if (filterTipo !== "todos") {
      filtered = filtered.filter((i) => i.tipo === filterTipo);
    }

    if (filterRisco !== "todos") {
      filtered = filtered.filter((i) => i.risco === filterRisco);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.instituicao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => parseISO(b.data).getTime() - parseISO(a.data).getTime());
  }, [investimentos, filterTipo, filterRisco, searchTerm]);

  // Calcular métricas
  const metricas = useMemo(() => {
    const totalInvestido = filteredInvestimentos.reduce((sum, i) => sum + i.valor, 0);
    
    const rendimentoEstimado = filteredInvestimentos.reduce((sum, i) => {
      if (i.rentabilidade && i.valor) {
        const diasInvestido = differenceInDays(new Date(), parseISO(i.data));
        const rendimentoDiario = (i.rentabilidade / 100) / 365;
        return sum + (i.valor * rendimentoDiario * diasInvestido);
      }
      return sum;
    }, 0);

    const valorAtual = totalInvestido + rendimentoEstimado;

    // Distribuição por tipo
    const porTipo = filteredInvestimentos.reduce((acc, i) => {
      if (!acc[i.tipo]) {
        acc[i.tipo] = 0;
      }
      acc[i.tipo] += i.valor;
      return acc;
    }, {} as Record<string, number>);

    // Distribuição por risco
    const porRisco = filteredInvestimentos.reduce((acc, i) => {
      const risco = i.risco || "Não definido";
      if (!acc[risco]) {
        acc[risco] = 0;
      }
      acc[risco] += i.valor;
      return acc;
    }, {} as Record<string, number>);

    // Rentabilidade média ponderada
    const rentabilidadeMedia = filteredInvestimentos.reduce((acc, i) => {
      if (i.rentabilidade && i.valor) {
        return acc + (i.rentabilidade * i.valor);
      }
      return acc;
    }, 0) / (totalInvestido || 1);

    return {
      totalInvestido,
      rendimentoEstimado,
      valorAtual,
      totalInvestimentos: filteredInvestimentos.length,
      porTipo,
      porRisco,
      rentabilidadeMedia,
    };
  }, [filteredInvestimentos]);

  // Handlers
  const handleCreate = () => {
    setSelectedInvestimento(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (investimento: Investimento) => {
    setSelectedInvestimento(investimento);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (investimento: Investimento) => {
    setSelectedInvestimento(investimento);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este investimento?")) return;
    
    try {
      await investimentoAPI.delete(id);
      toast.success("Investimento excluído com sucesso");
      fetchInvestimentos();
    } catch (error) {
      console.error("Erro ao excluir investimento:", error);
      toast.error("Erro ao excluir investimento");
    }
  };

  const handleSave = async (investimento: Partial<Investimento>) => {
    try {
      if (modalMode === "edit" && selectedInvestimento) {
        await investimentoAPI.update(selectedInvestimento._id, investimento);
        toast.success("Investimento atualizado com sucesso");
      } else {
        await investimentoAPI.create(investimento);
        toast.success("Investimento criado com sucesso");
      }
      fetchInvestimentos();
    } catch (error) {
      console.error("Erro ao salvar investimento:", error);
      toast.error("Erro ao salvar investimento");
    }
  };

  // Dados para os gráficos
  const pieChartData = {
    series: Object.values(metricas.porTipo),
    options: {
      chart: { type: "donut" as const },
      labels: Object.keys(metricas.porTipo),
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"],
      legend: { position: "bottom" as const },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  const barChartData = {
    series: [{
      name: "Valor Investido",
      data: Object.values(metricas.porRisco),
    }],
    options: {
      chart: {
        type: "bar" as const,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `R$ ${val.toLocaleString("pt-BR")}`,
      },
      xaxis: {
        categories: Object.keys(metricas.porRisco),
        labels: {
          formatter: (val: string) => `R$ ${parseFloat(val).toLocaleString("pt-BR")}`,
        },
      },
      colors: ["#10b981", "#f59e0b", "#ef4444", "#dc2626"],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Carteira de Investimentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie e acompanhe o desempenho dos seus investimentos
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Investido</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {metricas.totalInvestido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Rendimento Estimado</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metricas.rendimentoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metricas.rentabilidadeMedia.toFixed(2)}% a.a.
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
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valor Atual</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {metricas.valorAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center mt-1">
                  <ChevronUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">
                    {((metricas.rendimentoEstimado / metricas.totalInvestido) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Ativos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metricas.totalInvestimentos}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Object.keys(metricas.porTipo).length} tipos
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <BarChart2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {Object.keys(metricas.porTipo).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Distribuição por Tipo
              </h2>
              <Chart options={pieChartData.options} series={pieChartData.series} type="donut" height={300} />
            </motion.div>
          )}

          {Object.keys(metricas.porRisco).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Distribuição por Risco
              </h2>
              <Chart options={barChartData.options} series={barChartData.series} type="bar" height={300} />
            </motion.div>
          )}
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar investimento..."
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
                {tiposInvestimento.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>

              <select
                value={filterRisco}
                onChange={(e) => setFilterRisco(e.target.value as typeof filterRisco)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              >
                <option value="todos">Todos os Riscos</option>
                <option value="Baixo">Baixo</option>
                <option value="Médio">Médio</option>
                <option value="Alto">Alto</option>
                <option value="Muito Alto">Muito Alto</option>
              </select>
            </div>

            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Investimento
            </button>
          </div>
        </div>

        {/* Lista de Investimentos */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando investimentos...</p>
            </div>
          ) : filteredInvestimentos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum investimento encontrado
              </p>
              <button
                onClick={handleCreate}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Adicionar Primeiro Investimento
              </button>
            </div>
          ) : (
            filteredInvestimentos.map((investimento) => (
              <motion.div
                key={investimento._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {investimento.nome}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {investimento.tipo}
                            </span>
                            {investimento.instituicao && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {investimento.instituicao}
                                </span>
                              </>
                            )}
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {format(parseISO(investimento.data), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedCard(expandedCard === investimento._id ? null : investimento._id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          >
                            {expandedCard === investimento._id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleView(investimento)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(investimento)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(investimento._id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Valor Investido</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            R$ {investimento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        {investimento.rentabilidade !== undefined && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rentabilidade</p>
                            <p className="text-lg font-semibold text-green-600">
                              {investimento.rentabilidade}% a.a.
                            </p>
                          </div>
                        )}
                        {investimento.liquidez && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Liquidez</p>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-blue-500" />
                              <p className="text-sm font-medium">{investimento.liquidez}</p>
                            </div>
                          </div>
                        )}
                        {investimento.risco && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Risco</p>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${riscoColors[investimento.risco]}`}>
                              {investimento.risco}
                            </span>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {expandedCard === investimento._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                          >
                            {investimento.vencimento && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Vencimento</p>
                                <p className="text-sm font-medium">
                                  {format(parseISO(investimento.vencimento), "dd/MM/yyyy")} 
                                  <span className="text-gray-500 ml-2">
                                    ({differenceInDays(parseISO(investimento.vencimento), new Date())} dias)
                                  </span>
                                </p>
                              </div>
                            )}
                            {investimento.meta && investimento.meta > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Meta de Rendimento</p>
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-blue-500" />
                                  <p className="text-sm font-medium">
                                    R$ {investimento.meta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {investimento.rentabilidade && investimento.valor && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Projeção de Rendimento</p>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">1 ano</p>
                                    <p className="font-medium">
                                      R$ {(investimento.valor * (1 + investimento.rentabilidade / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">3 anos</p>
                                    <p className="font-medium">
                                      R$ {(investimento.valor * Math.pow(1 + investimento.rentabilidade / 100, 3)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">5 anos</p>
                                    <p className="font-medium">
                                      R$ {(investimento.valor * Math.pow(1 + investimento.rentabilidade / 100, 5)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <InvestimentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        investimento={selectedInvestimento}
        mode={modalMode}
      />
    </div>
  );
}
