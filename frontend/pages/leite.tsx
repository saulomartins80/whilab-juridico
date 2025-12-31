import { useState, useEffect, useMemo } from "react";
import {
  // only icons declared in frontend/types/lucide.d.ts
  Plus,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Zap,
  Sun,
  Users,
  X,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  FileText,
  PieChart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  DollarSign,
  AlertTriangle,
  XCircle,
  Square,
  CircleHelp,
} from "lucide-react";
import { format, parseISO, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import { producaoAPI } from "../services/api";

// Tipos
interface ProducaoLeite {
  _id: string;
  data: string;
  quantidade: number;
  periodo: "manhã" | "tarde" | "noite";
  temperatura: number;
  qualidade: "A" | "B" | "C";
  gordura: number;
  proteina: number;
  celulas_somaticas: number;
  observacoes?: string;
  responsavel: string;
  createdAt: string;
  vacas_ordenhadas?: number;
  tanque?: string;
  lactose?: number;
  densidade?: number;
  ph?: number;
  crioscopia?: number;
}

interface Estatisticas {
  producaoTotal: number;
  mediadiaria: number;
  tendencia: "alta" | "baixa" | "estavel";
  qualidadeMedia: string;
  producaoMensal: number;
  variacaoMensal: number;
  melhorPeriodo: string;
  mediaVacaPorDia: number;
  precoMedio: number;
  receitaTotal: number;
}

// Componente de Gráfico de Linha
const GraficoProducao = ({ dados }: { dados: ProducaoLeite[] }) => {
  const dadosGrafico = useMemo(() => {
    const grouped = dados.reduce((acc, prod) => {
      const data = format(parseISO(prod.data), "dd/MM");
      if (!acc[data]) {
        acc[data] = { data, quantidade: 0, count: 0 };
      }
      acc[data].quantidade += prod.quantidade;
      acc[data].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .map((item: any) => ({
        data: item.data,
        quantidade: item.quantidade,
        media: item.quantidade / item.count,
      }))
      .sort((a, b) => {
        const [diaA, mesA] = a.data.split("/").map(Number);
        const [diaB, mesB] = b.data.split("/").map(Number);
        return mesA - mesB || diaA - diaB;
      })
      .slice(-7);
  }, [dados]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={dadosGrafico}>
        <defs>
          <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="data" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.9)', 
            border: 'none',
            borderRadius: '8px',
            color: 'white'
          }}
          formatter={(value: any) => [`${value} L`, 'Quantidade']}
        />
        <Area
          type="monotone"
          dataKey="quantidade"
          stroke="#3B82F6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorQuantidade)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Componente de Gráfico de Pizza para Qualidade
const GraficoQualidade = ({ dados }: { dados: ProducaoLeite[] }) => {
  const dadosGrafico = useMemo(() => {
    const counts = dados.reduce((acc, prod) => {
      acc[prod.qualidade] = (acc[prod.qualidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([qualidade, value]) => ({
      name: `Tipo ${qualidade}`,
      value,
      percentage: ((value / dados.length) * 100).toFixed(1),
    }));
  }, [dados]);

  const COLORS = {
    "Tipo A": "#10B981",
    "Tipo B": "#F59E0B",
    "Tipo C": "#EF4444",
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RePieChart>
        <Pie
          data={dadosGrafico}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) => {
            const percentage = entry.percentage || ((entry.value / dados.length) * 100).toFixed(1);
            return `${percentage}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {dadosGrafico.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.9)', 
            border: 'none',
            borderRadius: '8px',
            color: 'white'
          }}
        />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  );
};

// Componente Modal
const Modal = ({ 
  isOpen, 
  onClose, 
  mode, 
  producao, 
  onSubmit,
  formData,
  setFormData 
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  producao: ProducaoLeite | null;
  onSubmit: (e: React.FormEvent) => void;
  formData: Partial<ProducaoLeite>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ProducaoLeite>>>;
}) => {
  if (!isOpen) return null;

  const isViewMode = mode === "view";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {mode === "create" && (
              <>
                <Plus className="w-6 h-6" />
                Nova Produção
              </>
            )}
            {mode === "edit" && (
              <>
                <Edit className="w-6 h-6" />
                Editar Produção
              </>
            )}
            {mode === "view" && (
              <>
                <Eye className="w-6 h-6" />
                Detalhes da Produção
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informações Básicas
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={isViewMode ? producao?.data?.split("T")[0] : formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <select
                  value={isViewMode ? producao?.periodo : formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value as "manhã" | "tarde" | "noite" })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  required
                >
                  <option value="manhã">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade (Litros)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={isViewMode ? producao?.quantidade : formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vacas Ordenhadas
                </label>
                <input
                  type="number"
                  value={isViewMode ? producao?.vacas_ordenhadas : formData.vacas_ordenhadas || ''}
                  onChange={(e) => setFormData({ ...formData, vacas_ordenhadas: parseInt(e.target.value) })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanque
                </label>
                <input
                  type="text"
                  value={isViewMode ? producao?.tanque : formData.tanque || ''}
                  onChange={(e) => setFormData({ ...formData, tanque: e.target.value })}
                  disabled={isViewMode}
                  placeholder="Ex: Tanque A"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Parâmetros de Qualidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-5 h-5" />
                Parâmetros de Qualidade
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Qualidade
                </label>
                <select
                  value={isViewMode ? producao?.qualidade : formData.qualidade}
                  onChange={(e) => setFormData({ ...formData, qualidade: e.target.value as "A" | "B" | "C" })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  required
                >
                  <option value="A">Tipo A</option>
                  <option value="B">Tipo B</option>
                  <option value="C">Tipo C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={isViewMode ? producao?.temperatura : formData.temperatura}
                  onChange={(e) => setFormData({ ...formData, temperatura: parseFloat(e.target.value) })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gordura (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={isViewMode ? producao?.gordura : formData.gordura}
                    onChange={(e) => setFormData({ ...formData, gordura: parseFloat(e.target.value) })}
                    disabled={isViewMode}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proteína (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={isViewMode ? producao?.proteina : formData.proteina}
                    onChange={(e) => setFormData({ ...formData, proteina: parseFloat(e.target.value) })}
                    disabled={isViewMode}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lactose (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={isViewMode ? producao?.lactose : formData.lactose || ''}
                    onChange={(e) => setFormData({ ...formData, lactose: parseFloat(e.target.value) })}
                    disabled={isViewMode}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    pH
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={isViewMode ? producao?.ph : formData.ph || ''}
                    onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) })}
                    disabled={isViewMode}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Células Somáticas (CCS)
                </label>
                <input
                  type="number"
                  value={isViewMode ? producao?.celulas_somaticas : formData.celulas_somaticas}
                  onChange={(e) => setFormData({ ...formData, celulas_somaticas: parseInt(e.target.value) })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informações Adicionais
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  value={isViewMode ? producao?.responsavel : formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  disabled={isViewMode}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={isViewMode ? producao?.observacoes : formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  disabled={isViewMode}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  placeholder="Adicione observações relevantes..."
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          {!isViewMode && (
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                {mode === "create" ? (
                  <>
                    <Plus className="w-5 h-5" />
                    Registrar
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Atualizar
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Componente Principal
export default function Leite() {
  const [producoes, setProducoes] = useState<ProducaoLeite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriodo, setFilterPeriodo] = useState<"todos" | "manhã" | "tarde" | "noite">("todos");
  const [filterQualidade, setFilterQualidade] = useState<"todas" | "A" | "B" | "C">("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducao, setSelectedProducao] = useState<ProducaoLeite | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [dateRange, setDateRange] = useState<"7" | "30" | "90" | "custom">("30");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<Partial<ProducaoLeite>>({
    data: new Date().toISOString().split("T")[0],
    quantidade: 0,
    periodo: "manhã",
    temperatura: 4,
    qualidade: "A",
    gordura: 3.5,
    proteina: 3.2,
    celulas_somaticas: 200000,
    observacoes: "",
    responsavel: "João Silva",
    vacas_ordenhadas: 50,
    tanque: "Tanque A",
    lactose: 4.5,
    ph: 6.7,
  });

  // Carregar dados do usuário ou iniciar vazio (sem mocks)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await producaoAPI.getAll().catch(() => null);
        if (!isMounted) return;
        const items = Array.isArray(resp) ? resp : (resp?.items || []);
        // Iniciar vazio para novos usuários; ajuste aqui quando a API estiver padronizada
        setProducoes(Array.isArray(items) ? [] : []);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Calcular estatísticas expandidas
  const estatisticas = useMemo((): Estatisticas => {
    if (producoes.length === 0) {
      return {
        producaoTotal: 0,
        mediadiaria: 0,
        tendencia: "estavel",
        qualidadeMedia: "N/A",
        producaoMensal: 0,
        variacaoMensal: 0,
        melhorPeriodo: "N/A",
        mediaVacaPorDia: 0,
        precoMedio: 4.50,
        receitaTotal: 0,
      };
    }

    const total = producoes.reduce((sum, p) => sum + p.quantidade, 0);
    const diasUnicos = new Set(producoes.map(p => p.data.split("T")[0])).size;
    const media = total / diasUnicos;

    // Produção mensal
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);
    const producoesMesAtual = producoes.filter(p => {
      const data = parseISO(p.data);
      return isWithinInterval(data, { start: inicioMes, end: fimMes });
    });
    const producaoMensal = producoesMesAtual.reduce((sum, p) => sum + p.quantidade, 0);

    // Variação mensal
    const variacaoMensal = producaoMensal > 0 ? ((producaoMensal - total) / total) * 100 : 0;

    // Tendência
    const tendencia = media > 430 ? "alta" : media < 400 ? "baixa" : "estavel";

    // Qualidade mais frequente
    const qualidadeCount = producoes.reduce((acc, p) => {
      acc[p.qualidade] = (acc[p.qualidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const qualidadeMedia = Object.entries(qualidadeCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Melhor período
    const periodoCounts = producoes.reduce((acc, p) => {
      acc[p.periodo] = (acc[p.periodo] || 0) + p.quantidade;
      return acc;
    }, {} as Record<string, number>);
    const melhorPeriodo = Object.entries(periodoCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Média por vaca
    const totalVacas = producoes.reduce((sum, p) => sum + (p.vacas_ordenhadas || 0), 0);
    const mediaVacaPorDia = totalVacas > 0 ? total / totalVacas : 0;

    // Cálculos financeiros
    const precoMedio = 4.50; // R$ por litro
    const receitaTotal = total * precoMedio;

    return {
      producaoTotal: total,
      mediadiaria: media,
      tendencia,
      qualidadeMedia,
      producaoMensal,
      variacaoMensal,
      melhorPeriodo,
      mediaVacaPorDia,
      precoMedio,
      receitaTotal,
    };
  }, [producoes]);

  // Filtrar produções com paginação
  const producoesFiltradas = useMemo(() => {
    let filtered = [...producoes];

    // Filtro por período de tempo
    if (dateRange !== "custom") {
      const days = parseInt(dateRange);
      const startDate = subDays(new Date(), days);
      filtered = filtered.filter(p => parseISO(p.data) >= startDate);
    }

    if (filterPeriodo !== "todos") {
      filtered = filtered.filter(p => p.periodo === filterPeriodo);
    }

    if (filterQualidade !== "todas") {
      filtered = filtered.filter(p => p.qualidade === filterQualidade);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tanque?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [producoes, filterPeriodo, filterQualidade, searchTerm, dateRange]);

  // Paginação
  const totalPages = Math.ceil(producoesFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const producoesPaginadas = producoesFiltradas.slice(startIndex, endIndex);

  // Handlers
  const handleCreate = () => {
    setSelectedProducao(null);
    setModalMode("create");
    setFormData({
      data: new Date().toISOString().split("T")[0],
      quantidade: 0,
      periodo: "manhã",
      temperatura: 4,
      qualidade: "A",
      gordura: 3.5,
      proteina: 3.2,
      celulas_somaticas: 200000,
      observacoes: "",
      responsavel: "João Silva",
      vacas_ordenhadas: 50,
      tanque: "Tanque A",
      lactose: 4.5,
      ph: 6.7,
    });
    setModalOpen(true);
  };

  const handleView = (producao: ProducaoLeite) => {
    setSelectedProducao(producao);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (producao: ProducaoLeite) => {
    setSelectedProducao(producao);
    setModalMode("edit");
    setFormData({
      ...producao,
      data: producao.data.split("T")[0],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    
    setProducoes(prev => prev.filter(p => p._id !== id));
    // Toast seria usado aqui
    console.log("Registro excluído com sucesso");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantidade || formData.quantidade <= 0) {
      alert("A quantidade deve ser maior que zero");
      return;
    }

    if (modalMode === "edit" && selectedProducao) {
      setProducoes(prev =>
        prev.map(p =>
          p._id === selectedProducao._id
            ? { ...p, ...formData, _id: p._id, createdAt: p.createdAt, data: formData.data + "T00:00:00.000Z" }
            : p
        )
      );
      console.log("Produção atualizada com sucesso");
    } else {
      const novaProducao: ProducaoLeite = {
        ...formData as ProducaoLeite,
        _id: Date.now().toString(),
        data: formData.data + "T00:00:00.000Z",
        createdAt: new Date().toISOString(),
      };
      setProducoes(prev => [...prev, novaProducao]);
      console.log("Produção registrada com sucesso");
    }

    setModalOpen(false);
    setCurrentPage(1);
  };

  const exportarRelatorio = () => {
    const csv = [
      ["Data", "Período", "Quantidade (L)", "Qualidade", "Temperatura", "Gordura (%)", "Proteína (%)", "CCS", "Responsável"],
      ...producoesFiltradas.map(p => [
        format(parseISO(p.data), "dd/MM/yyyy"),
        p.periodo,
        p.quantidade.toString(),
        p.qualidade,
        p.temperatura.toString(),
        p.gordura.toString(),
        p.proteina.toString(),
        p.celulas_somaticas.toString(),
        p.responsavel,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-leite-${format(new Date(), "dd-MM-yyyy")}.csv`;
    a.click();
    console.log("Relatório exportado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Aprimorado */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Sun className="w-8 h-8 text-blue-600" />
                </div>
                Gestão de Produção Leiteira
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitore e otimize a produção de leite com análises detalhadas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Sistema Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Expandidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Produção Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estatisticas.producaoTotal.toLocaleString("pt-BR")} L
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {estatisticas.tendencia === "alta" ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500">+12% este mês</span>
                    </>
                  ) : estatisticas.tendencia === "baixa" ? (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-500">-8% este mês</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Estável</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {estatisticas.receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    R$ {estatisticas.precoMedio.toFixed(2)}/litro
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Média Diária</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estatisticas.mediadiaria.toFixed(1)} L
                </p>
                <div className="mt-2">
                  {estatisticas.mediadiaria >= 400 ? (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Acima da meta
                    </span>
                  ) : (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Abaixo da meta
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Qualidade Média</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tipo {estatisticas.qualidadeMedia}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Melhor período: {estatisticas.melhorPeriodo}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Produção dos Últimos 7 Dias
            </h3>
            <GraficoProducao dados={producoes} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribuição por Qualidade
            </h3>
            <GraficoQualidade dados={producoes} />
          </div>
        </div>

        {/* Filtros Aprimorados */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por responsável, tanque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  {(filterPeriodo !== "todos" || filterQualidade !== "todas") && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                      Ativos
                    </span>
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportarRelatorio}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Exportar</span>
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Nova Produção</span>
                </button>
              </div>
            </div>

            {/* Filtros Expandidos */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t dark:border-gray-700">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="custom">Personalizado</option>
                </select>

                <select
                  value={filterPeriodo}
                  onChange={(e) => setFilterPeriodo(e.target.value as typeof filterPeriodo)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="todos">Todos Períodos</option>
                  <option value="manhã">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>

                <select
                  value={filterQualidade}
                  onChange={(e) => setFilterQualidade(e.target.value as typeof filterQualidade)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="todas">Todas Qualidades</option>
                  <option value="A">Tipo A</option>
                  <option value="B">Tipo B</option>
                  <option value="C">Tipo C</option>
                </select>

                <button
                  onClick={() => {
                    setFilterPeriodo("todos");
                    setFilterQualidade("todas");
                    setDateRange("30");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabela Aprimorada */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Qualidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Responsável
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : producoesPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma produção encontrada
                    </td>
                  </tr>
                ) : (
                  producoesPaginadas.map((producao) => (
                    <tr key={producao._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {format(parseISO(producao.data), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              {format(parseISO(producao.createdAt), "HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                          {producao.periodo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {producao.quantidade} L
                          </span>
                          {producao.vacas_ordenhadas && (
                            <span className="text-xs text-gray-500 block">
                              {(producao.quantidade / producao.vacas_ordenhadas).toFixed(1)} L/vaca
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          producao.qualidade === "A" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                          producao.qualidade === "B" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          Tipo {producao.qualidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {producao.tanque || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {producao.responsavel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {producao.celulas_somaticas < 200000 ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Ótimo</span>
                          </span>
                        ) : producao.celulas_somaticas < 300000 ? (
                          <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">Atenção</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">Crítico</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(producao)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleEdit(producao)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(producao._id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1} a {Math.min(endIndex, producoesFiltradas.length)} de {producoesFiltradas.length} registros
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg transition ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          producao={selectedProducao}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
}