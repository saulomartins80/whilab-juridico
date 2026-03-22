import { bovinextSupabaseService } from './BovinextSupabaseService';
import { supabaseWrapper } from './SupabaseWrapper';
import logger from '../utils/logger';

type ListOptions = {
  userId?: string;
  filters?: Record<string, any>;
  search?: string;
  limit?: number;
  offset?: number;
};

const normalizeLimit = (limit?: number, fallback = 50): number => {
  if (!Number.isFinite(limit as number) || !limit || limit <= 0) return fallback;
  return Math.min(limit, 500);
};

const applySearch = <T extends Record<string, any>>(rows: T[], search?: string, fields: string[] = []) => {
  if (!search?.trim()) return rows;
  const needle = search.trim().toLowerCase();

  return rows.filter((row) =>
    fields.some((field) => String(row?.[field] ?? '').toLowerCase().includes(needle)),
  );
};

const applyPagination = <T>(rows: T[], limit?: number, offset?: number) => {
  const start = Math.max(offset || 0, 0);
  const end = start + normalizeLimit(limit, rows.length || 50);
  return rows.slice(start, end);
};

const normalizeLegacyAnimal = (animalData: Record<string, any>, userId: string) => {
  return {
    ...animalData,
    user_id: userId,
    brinco: animalData.brinco || animalData.identificacao,
    raca: animalData.raca,
    sexo: String(animalData.sexo || animalData.gender || 'macho').toLowerCase(),
    data_nascimento: animalData.data_nascimento || animalData.dataEntrada || animalData.data_entrada || new Date().toISOString().split('T')[0],
    peso_nascimento: animalData.peso_nascimento ?? animalData.peso,
    peso_atual: animalData.peso_atual ?? animalData.peso,
    status: String(animalData.status || 'ativo').toLowerCase(),
    lote: animalData.lote,
    pasto: animalData.pasto,
    categoria: typeof animalData.categoria === 'string' ? animalData.categoria.toLowerCase() : animalData.categoria,
    valor_compra: animalData.valor_compra,
    observacoes: animalData.observacoes
  };
};

const normalizeLegacyManejo = (manejoData: Record<string, any>, userId: string) => {
  const animalId = manejoData.animal_id || manejoData.animal || manejoData.animais?.[0];
  return {
    ...manejoData,
    user_id: userId,
    animal_id: animalId,
    tipo_manejo: String(manejoData.tipo_manejo || manejoData.tipo || 'vacinacao').toLowerCase(),
    data_manejo: manejoData.data_manejo || manejoData.data || new Date().toISOString().split('T')[0],
    observacoes: manejoData.observacoes,
    custo: manejoData.custo,
    veterinario: manejoData.veterinario || manejoData.responsavel,
    produto_usado: manejoData.produto_usado || manejoData.produto,
    dosagem: manejoData.dosagem,
    proxima_aplicacao: manejoData.proxima_aplicacao
  };
};

const normalizeLegacyVenda = (vendaData: Record<string, any>, userId: string, animaisIds: string[] = []) => {
  const impostos = vendaData.impostos || {};
  const quantidadeAnimais = vendaData.quantidade_animais ?? animaisIds.length ?? (Array.isArray(vendaData.animais) ? vendaData.animais.length : undefined);
  return {
    ...vendaData,
    user_id: userId,
    comprador: vendaData.comprador || vendaData.buyer || 'Comprador',
    cpf_comprador: vendaData.cpf_comprador,
    tipo_venda: String(vendaData.tipo_venda || vendaData.tipoVenda || 'direto').toLowerCase(),
    peso_total: Number(vendaData.peso_total ?? vendaData.pesoTotal ?? 0),
    preco_arroba: Number(vendaData.preco_arroba ?? vendaData.precoArroba ?? 0),
    valor_total: Number(vendaData.valor_total ?? vendaData.valorTotal ?? vendaData.valor ?? 0),
    quantidade_animais: quantidadeAnimais,
    data_venda: vendaData.data_venda || vendaData.dataVenda || new Date().toISOString().split('T')[0],
    data_entrega: vendaData.data_entrega || vendaData.dataEntrega,
    funrural: Number(vendaData.funrural ?? impostos.funrural ?? 0),
    icms: Number(vendaData.icms ?? impostos.icms ?? 0),
    outros_impostos: Number(vendaData.outros_impostos ?? impostos.outros ?? 0),
    lucro_liquido: Number(vendaData.lucro_liquido ?? vendaData.lucroLiquido ?? 0),
    observacoes: vendaData.observacoes
  };
};

const normalizeLegacyProducao = (producaoData: Record<string, any>, userId: string) => {
  return {
    ...producaoData,
    user_id: userId,
    animal_id: producaoData.animal_id || producaoData.animal,
    tipo: String(producaoData.tipo || producaoData.tipo_producao || 'peso').toLowerCase(),
    data_producao: producaoData.data_producao || producaoData.data || new Date().toISOString().split('T')[0],
    valor: Number(producaoData.valor ?? producaoData.quantidade ?? 0),
    peso: producaoData.peso,
    ganho_medio_diario: producaoData.ganho_medio_diario ?? producaoData.ganhoMedio,
    custo_producao: Number(producaoData.custo_producao ?? producaoData.custoProducao ?? 0),
    receita: producaoData.receita,
    margem_lucro: producaoData.margem_lucro ?? producaoData.margemLucro,
    observacoes: producaoData.observacoes
  };
};

export class SupabaseService {
  async getAnimais(options: ListOptions = {}): Promise<any[]> {
    const userId = options.userId;
    if (!userId) return [];

    const filters = {
      ...options.filters,
      status: typeof options.filters?.status === 'string' ? options.filters.status.toLowerCase() : options.filters?.status,
      categoria: typeof options.filters?.categoria === 'string' ? options.filters.categoria.toLowerCase() : options.filters?.categoria
    };

    const rows = await bovinextSupabaseService.getAnimaisByUser(userId, filters);
    const filtered = applySearch(rows, options.search, ['brinco', 'raca', 'lote', 'pasto', 'categoria']);
    return applyPagination(filtered, options.limit, options.offset);
  }

  async createAnimal(animalData: any): Promise<any> {
    const userId = animalData.user_id || animalData.userId;
    if (!userId) {
      throw new Error('user_id é obrigatório para criar animal');
    }

    return bovinextSupabaseService.createAnimal(String(userId), normalizeLegacyAnimal(animalData, String(userId)) as any);
  }

  async getAnimalById(id: string): Promise<any | null> {
    return supabaseWrapper.selectAnimalById(id);
  }

  async updateAnimal(id: string, updateData: any): Promise<any> {
    return supabaseWrapper.updateAnimal(id, updateData);
  }

  async deleteAnimal(id: string): Promise<boolean> {
    return supabaseWrapper.deleteAnimal(id);
  }

  async getManejos(options: ListOptions = {}): Promise<any[]> {
    const userId = options.userId;
    if (!userId) return [];

    const filters = {
      ...options.filters,
      tipoManejo: typeof options.filters?.tipoManejo === 'string' ? options.filters.tipoManejo.toLowerCase() : options.filters?.tipoManejo
    };

    const rows = await bovinextSupabaseService.getManejosByUser(userId, filters);
    const filtered = applySearch(rows, options.search, ['tipo_manejo', 'observacoes', 'produto_usado', 'veterinario']);
    return applyPagination(filtered, options.limit, options.offset);
  }

  async createManejo(manejoData: any): Promise<any> {
    const userId = manejoData.user_id || manejoData.userId;
    if (!userId) {
      throw new Error('user_id é obrigatório para criar manejo');
    }

    return bovinextSupabaseService.createManejo(String(userId), normalizeLegacyManejo(manejoData, String(userId)) as any);
  }

  async getManejoById(id: string): Promise<any | null> {
    return supabaseWrapper.selectManejoById(id);
  }

  async updateManejo(id: string, updateData: any): Promise<any> {
    return supabaseWrapper.updateManejo(id, updateData);
  }

  async deleteManejo(id: string): Promise<boolean> {
    return supabaseWrapper.deleteManejo(id);
  }

  async getVendas(options: ListOptions = {}): Promise<any[]> {
    const userId = options.userId;
    if (!userId) return [];

    const filters = {
      ...options.filters,
      tipoVenda: typeof options.filters?.tipoVenda === 'string' ? options.filters.tipoVenda.toLowerCase() : options.filters?.tipoVenda
    };

    const rows = await bovinextSupabaseService.getVendasByUser(userId, filters);
    const filtered = applySearch(rows, options.search, ['comprador', 'observacoes', 'tipo_venda']);
    return applyPagination(filtered, options.limit, options.offset);
  }

  async createVenda(vendaData: any): Promise<any> {
    const userId = vendaData.user_id || vendaData.userId;
    if (!userId) {
      throw new Error('user_id é obrigatório para criar venda');
    }

    const animaisIds = Array.isArray(vendaData.animais_ids) ? vendaData.animais_ids : Array.isArray(vendaData.animaisIds) ? vendaData.animaisIds : [];
    return bovinextSupabaseService.createVenda(String(userId), normalizeLegacyVenda(vendaData, String(userId), animaisIds) as any, animaisIds);
  }

  async getVendaById(id: string): Promise<any | null> {
    return supabaseWrapper.selectVendaById(id);
  }

  async updateVenda(id: string, updateData: any): Promise<any> {
    return supabaseWrapper.updateVenda(id, updateData);
  }

  async deleteVenda(id: string): Promise<boolean> {
    return supabaseWrapper.deleteVenda(id);
  }

  async getProducoes(options: ListOptions = {}): Promise<any[]> {
    const userId = options.userId;
    if (!userId) return [];

    const filters = {
      ...options.filters,
      tipoProducao: typeof options.filters?.tipoProducao === 'string' ? options.filters.tipoProducao.toLowerCase() : options.filters?.tipoProducao
    };

    const rows = await bovinextSupabaseService.getProducaoByUser(userId, filters);
    const filtered = applySearch(rows, options.search, ['tipo', 'tipo_producao', 'observacoes']);
    return applyPagination(filtered, options.limit, options.offset);
  }

  async createProducao(producaoData: any): Promise<any> {
    const userId = producaoData.user_id || producaoData.userId;
    if (!userId) {
      throw new Error('user_id é obrigatório para criar produção');
    }

    return bovinextSupabaseService.createProducao(String(userId), normalizeLegacyProducao(producaoData, String(userId)) as any);
  }

  async getProducaoById(id: string): Promise<any | null> {
    return supabaseWrapper.selectProducaoById(id);
  }

  async updateProducao(id: string, updateData: any): Promise<any> {
    return supabaseWrapper.updateProducao(id, updateData);
  }

  async deleteProducao(id: string): Promise<boolean> {
    return supabaseWrapper.deleteProducao(id);
  }

  async getDashboardKPIs(userId: string): Promise<any> {
    const [stats, animais, vendas, producoes, alertas, precos] = await Promise.all([
      bovinextSupabaseService.getEstatisticasDashboard(userId),
      bovinextSupabaseService.getAnimaisByUser(userId),
      bovinextSupabaseService.getVendasByUser(userId),
      bovinextSupabaseService.getProducaoByUser(userId),
      bovinextSupabaseService.getAlertasByUser(userId).catch(() => []),
      bovinextSupabaseService.getPrecosMercado().catch(() => [])
    ]);

    const totalAnimais = animais.length;
    const receitaMensal = vendas.reduce((acc, venda: any) => acc + Number(venda.valor_total || 0), 0);
    const lucroMensal = vendas.reduce((acc, venda: any) => acc + Number(venda.lucro_liquido || 0), 0);
    const gmdMedio = producoes.length
      ? producoes.reduce((acc: number, prod: any) => acc + Number(prod.ganho_medio_diario || prod.gmd || 0), 0) / producoes.length
      : 0;
    const custoPorCabeca = totalAnimais
      ? animais.reduce((acc: number, animal: any) => acc + Number(animal.custo_acumulado || 0), 0) / totalAnimais
      : 0;
    const precoArroba = Array.isArray(precos) && precos.length > 0 ? Number(precos[0]?.preco_arroba || 0) : 0;

    return {
      totalAnimais,
      receitaMensal,
      lucroMensal,
      gmdMedio: Number(gmdMedio.toFixed(2)),
      precoArroba,
      alertasAtivos: alertas.filter((alerta: any) => !alerta.lido).length,
      custoPorCabeca: Number(custoPorCabeca.toFixed(2)),
      margemLucro: receitaMensal > 0 ? Number(((lucroMensal / receitaMensal) * 100).toFixed(2)) : 0,
      tendencias: {
        animais: totalAnimais > 0 ? 'ALTA' : 'ESTAVEL',
        receita: receitaMensal > 0 ? 'ALTA' : 'ESTAVEL',
        gmd: gmdMedio > 0 ? 'ALTA' : 'ESTAVEL',
        lucro: lucroMensal > 0 ? 'ALTA' : 'ESTAVEL'
      },
      base: stats
    };
  }

  async getAlertas(userId: string): Promise<any[]> {
    return bovinextSupabaseService.getAlertasByUser(userId);
  }
}

export const supabaseService = new SupabaseService();
