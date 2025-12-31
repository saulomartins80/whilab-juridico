import { OpenAI } from 'openai';
import { contextManager } from './ContextManager';
import { User } from '../models/User';
import { Transacao } from '../models/Transacao';
import { Meta } from '../models/Meta';
import { Investimento } from '../models/Investimento';
import { EventEmitter } from 'events';
import { bovinextSupabaseService } from './BovinextSupabaseService';

// Interface para mensagens de chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// ===== CONFIGURAÇÃO OTIMIZADA =====
let openai: OpenAI | null = null;

const getDeepSeekClient = (): OpenAI => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY não configurada');
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com/v1',
      timeout: 30000,
    });
  }

  return openai;
};

// ===== SISTEMA DE CACHE INTELIGENTE =====
class IntelligentCache {
  private cache = new Map<string, any>();
  private accessCount = new Map<string, number>();
  private lastAccess = new Map<string, number>();
  private readonly MAX_SIZE = 100;
  private readonly TTL = 30 * 60 * 1000; // 30 minutos

  set(key: string, value: any): void {
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastUsed();
    }

    this.cache.set(key, value);
    this.accessCount.set(key, 1);
    this.lastAccess.set(key, Date.now());
  }

  get(key: string): any {
    const value = this.cache.get(key);
    if (!value) return null;

    const lastAccess = this.lastAccess.get(key) || 0;
    if (Date.now() - lastAccess > this.TTL) {
      this.delete(key);
      return null;
    }

    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    
    return value;
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastCount = Infinity;

    for (const [key, count] of this.accessCount) {
      if (count < leastCount) {
        leastCount = count;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.delete(leastUsedKey);
    }
  }

  private delete(key: string): void {
    this.cache.delete(key);
    this.accessCount.delete(key);
    this.lastAccess.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      mostAccessed: this.getMostAccessed()
    };
  }

  private calculateHitRate(): number {
    const total = Array.from(this.accessCount.values()).reduce((a, b) => a + b, 0);
    return total > 0 ? (this.cache.size / total) * 100 : 0;
  }

  private getMostAccessed(): Array<{key: string, count: number}> {
    return Array.from(this.accessCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ key: key.substring(0, 50), count }));
  }
}

// ===== SISTEMA DE DETECÇÃO DE INTENÇÕES RÁPIDO ADAPTADO PARA PECUÁRIA =====
class FastIntentDetector {
  private patterns = {
    // CONSULTA DE DADOS EXISTENTES - ADAPTADO PARA PECUÁRIA
    view_animals: [
      /(?:ver|mostrar|consultar|visualizar).*(?:animal|gado|rebanho)/i,
      /(?:meu|meus).*(?:animal|gado|rebanho)/i,
      /(?:quantos|quantas).*(?:animal|cabeça|gado)/i,
      /consegue.*ver.*rebanho/i,
      /tem.*animal/i
    ],
    view_management: [
      /(?:ver|mostrar|consultar).*(?:manejo|vacinação|tratamento)/i,
      /(?:minha|minhas).*(?:atividade|manejo)/i,
      /(?:últimas|ultimas).*(?:vacinação|manejo)/i,
      /histórico.*manejo/i
    ],
    view_investments: [
      /(?:ver|mostrar|consultar).*(?:investimento|equipamento)/i,
      /(?:meu|meus).*(?:investimento|equipamento)/i,
      /(?:o que|que).*comprei/i
    ],
    view_summary: [
      /(?:saldo|resumo|situação).*(?:atual|fazenda)/i,
      /como.*(?:está|esta).*(?:situação|fazenda)/i,
      /balanço.*fazenda/i
    ],
    create_goal: [
      /(?:criar|registrar|cadastrar).*(?:meta|objetivo|plano)/i,
      /(?:quero|vou).*(?:comprar|adquirir|investir)/i,
      /meta.*(?:de|para)/i,
      /quero.*comprar|preciso.*comprar|vamos.*comprar/i,
      /plano.*fazenda|planejamento/i,
      /trator|equipamento|cerca|curral|pasto/i,
      /até.*\d+\/\d+|prazo.*\d+/i
    ],
    create_investment: [
      /invest[ir]|comprar|adquirir|equipamento|trator|gado/i,
      /terra|hectare|propriedade|fazenda/i,
      /máquina|implemento|cerca|curral/i,
      /registrar.*investimento|novo.*investimento/i,
      /comprei.*trator|comprei.*gado/i
    ],
    create_transaction: [
      /gast[ei]|comprei|paguei|despesa|custo|ração|vacina/i,
      /registr[ao].*transação|adicionar.*transação|nova.*transação/i,
      /ração|vacina|vermífugo|sal.*mineral/i,
      /veterinário|veterinario|consulta/i,
      /combustível|diesel|gasolina/i,
      /\d+\s*reais?/i,
      /r\$\s*\d+/i,
      /valor.*\d+/i,
      /pode.*registrar/i,
      /quero.*registrar/i
    ],
    analyze_data: [
      /analis[ae]|relatório|gráfico|dashboard/i,
      /como.*gast[oa]|onde.*gast[oa]/i,
      /resumo|balanço|situação.*fazenda/i,
      /performance|produtividade|gmd/i
    ],
    help: [
      /ajuda|help|como.*usar|não.*sei/i,
      /tutorial|explicar|ensinar/i,
      /o que.*posso|funcionalidades/i
    ],
    greeting: [
      /oi|olá|hey|bom.*dia|boa.*tarde|boa.*noite/i,
      /tudo.*bem|como.*vai|beleza/i,
      /bovi|bovino/i
    ]
  };

  detect(message: string): { intent: string; confidence: number; entities: any } {
    const lowerMessage = message.toLowerCase();
    let bestMatch = { intent: 'UNKNOWN', confidence: 0.0, entities: {} };

    console.log(`[FastIntentDetector] 🔍 Analisando mensagem: "${message}"`);

    // PRIORIZAR INTENTS DE CONSULTA SOBRE CRIAÇÃO
    const consultaIntents = ['view_animals', 'view_management', 'view_investments', 'view_summary'];
    const criacaoIntents = ['create_goal', 'create_transaction', 'create_investment'];
    
    // Verificar primeiro se é consulta
    for (const intent of consultaIntents) {
      const patterns = this.patterns[intent] || [];
      let matches = 0;
      
      console.log(`[FastIntentDetector] 🎯 Testando intent de consulta: ${intent}`);
      
      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          matches++;
          console.log(`[FastIntentDetector] ✅ Pattern match consulta: ${pattern} para intent: ${intent}`);
        }
      }
      
      if (matches > 0) {
        const confidence = Math.min(matches / patterns.length + 0.3, 1.0);
        console.log(`[FastIntentDetector] 🎯 CONSULTA detectada: ${intent} com confiança: ${confidence}`);
        return { intent, confidence, entities: {} };
      }
    }

    // Se não é consulta, verificar criação
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      if (consultaIntents.includes(intent)) continue; // Já verificado
      
      let matches = 0;
      const entities: any = {};

      console.log(`[FastIntentDetector] 🎯 Testando intent de criação: ${intent}`);

      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          matches++;
          console.log(`[FastIntentDetector] ✅ Pattern match criação: ${pattern} para intent: ${intent}`);
        }
      }

      // Extrair entidades específicas para TRANSAÇÃO - ADAPTADO PARA PECUÁRIA
      if (intent === 'create_transaction') {
        // Extrair descrição primeiro
        let descricao = '';
        const pattern1 = message.match(/(?:comprei|gastei|paguei)\s+(?:um|uma|o|a)?\s*([^0-9,]+?)(?:\s+(?:de|por|no valor|hoje|ontem|na|no)\s*|$)/i);
        if (pattern1) {
          descricao = pattern1[1].trim();
        }
        
        entities.descricao = descricao || 'Despesa da fazenda';
        
        // Extrair valor
        const valueMatch = message.match(/(\d+(?:[.,]\d+)?)/);
        if (valueMatch) {
          entities.valor = parseFloat(valueMatch[1].replace(',', '.'));
          matches += 2;
        }
        
        // Data
        entities.data = new Date().toISOString().split('T')[0];
        
        // Categoria - ADAPTADO PARA PECUÁRIA
        if (lowerMessage.includes('ração') || lowerMessage.includes('racao') || lowerMessage.includes('milho') || lowerMessage.includes('soja')) {
          entities.categoria = 'Alimentação';
        } else if (lowerMessage.includes('vacina') || lowerMessage.includes('vacinação') || lowerMessage.includes('vermífugo') || lowerMessage.includes('veterinário')) {
          entities.categoria = 'Saúde Animal';
        } else if (lowerMessage.includes('combustível') || lowerMessage.includes('diesel') || lowerMessage.includes('gasolina')) {
          entities.categoria = 'Combustível';
        } else if (lowerMessage.includes('cerca') || lowerMessage.includes('curral') || lowerMessage.includes('instalação')) {
          entities.categoria = 'Infraestrutura';
        } else if (lowerMessage.includes('trator') || lowerMessage.includes('máquina') || lowerMessage.includes('equipamento')) {
          entities.categoria = 'Equipamentos';
        } else if (lowerMessage.includes('venda') || lowerMessage.includes('vendeu') || lowerMessage.includes('frigorífico')) {
          entities.categoria = 'Vendas';
        } else {
          entities.categoria = 'Manejo';
        }
        
        // Tipo
        if (lowerMessage.includes('recebi') || lowerMessage.includes('venda') || lowerMessage.includes('vendeu') || lowerMessage.includes('renda')) {
          entities.tipo = 'receita';
        } else {
          entities.tipo = 'despesa';
        }
        
        // Conta padrão
        entities.conta = 'Principal';
        
        // Extrair descrição mais específica baseada na categoria
        if (lowerMessage.includes('ração')) {
          entities.descricao = 'Ração para gado';
        } else if (lowerMessage.includes('vacina')) {
          entities.descricao = 'Vacinação do rebanho';
        } else if (lowerMessage.includes('vermífugo')) {
          entities.descricao = 'Vermifugação';
        } else if (lowerMessage.includes('sal')) {
          entities.descricao = 'Sal mineral';
        } else if (lowerMessage.includes('veterinário')) {
          entities.descricao = 'Consulta veterinária';
        } else if (lowerMessage.includes('combustível') || lowerMessage.includes('diesel')) {
          entities.descricao = 'Combustível';
        } else if (lowerMessage.includes('venda')) {
          entities.descricao = 'Venda de animais';
        }
      }

      // Extrair entidades para META - ADAPTADO PARA METAS PECUÁRIAS
      if (intent === 'create_goal') {
        const valuePatterns = [
          /meta.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /objetivo.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /comprar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)\s*reais?/i
        ];
        
        for (const pattern of valuePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.valor_total = parseFloat(match[1].replace(',', '.'));
            break;
          }
        }
        
        // Extrair nome da meta - ADAPTADO PARA PECUÁRIA
        const metaPatterns = [
          /meta.*?(?:de|para)\s+([^0-9r$]+?)(?:\s+(?:de|no valor|até)|$)/i,
          /comprar.*?(?:um|uma)?\s*([^0-9r$]+?)(?:\s+(?:de|no valor|até)|$)/i,
          /adquirir.*?(?:um|uma)?\s*([^0-9r$]+?)(?:\s+(?:de|no valor|até)|$)/i,
          /(trator|equipamento|máquina|cerca|curral|pasto|gado|reprodutor|matriz)/i
        ];
        
        for (const pattern of metaPatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.nome_da_meta = match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1);
            break;
          }
        }
        
        // Extrair descrição
        entities.descricao = entities.nome_da_meta || 'Meta da fazenda';
        
        // Extrair prazo para data_conclusao
        const prazoPatterns = [
          /(\d+)\s*meses?/i,
          /(\d+)\s*anos?/i,
          /dezembro|final.*ano/i
        ];
        
        for (const pattern of prazoPatterns) {
          const match = message.match(pattern);
          if (match) {
            if (pattern.source.includes('meses')) {
              const months = parseInt(match[1]);
              const targetDate = new Date();
              targetDate.setMonth(targetDate.getMonth() + months);
              entities.data_conclusao = targetDate.toISOString().split('T')[0];
            } else if (pattern.source.includes('anos')) {
              const years = parseInt(match[1]);
              const targetDate = new Date();
              targetDate.setFullYear(targetDate.getFullYear() + years);
              entities.data_conclusao = targetDate.toISOString().split('T')[0];
            } else if (pattern.source.includes('dezembro')) {
              const currentYear = new Date().getFullYear();
              entities.data_conclusao = `${currentYear}-12-31`;
            }
            break;
          }
        }
        
        // Campos obrigatórios com valores padrão
        entities.nome_da_meta = entities.nome_da_meta || 'Meta da fazenda';
        entities.descricao = entities.descricao || 'Meta para desenvolvimento da fazenda';
        if (!entities.valor_total) entities.valor_total = 0;
        if (!entities.data_conclusao) {
          const targetDate = new Date();
          targetDate.setFullYear(targetDate.getFullYear() + 1);
          entities.data_conclusao = targetDate.toISOString().split('T')[0];
        }
        
        entities.valor_atual = 0;
        entities.prioridade = 'media';
        entities.categoria = 'Fazenda';
      }

      // Extrair entidades para INVESTIMENTO - ADAPTADO PARA INVESTIMENTOS RURAIS
      if (intent === 'create_investment') {
        const valuePatterns = [
          /invest.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /comprar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)\s*reais?/i
        ];
        
        for (const pattern of valuePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.valor = parseFloat(match[1].replace(',', '.'));
            break;
          }
        }
        
        // Detectar tipo de investimento - ADAPTADO PARA PECUÁRIA
        if (lowerMessage.includes('gado') || lowerMessage.includes('animal') || lowerMessage.includes('boi') || lowerMessage.includes('vaca')) {
          entities.tipo = 'Rebanho';
        } else if (lowerMessage.includes('trator') || lowerMessage.includes('máquina') || lowerMessage.includes('equipamento')) {
          entities.tipo = 'Equipamentos';
        } else if (lowerMessage.includes('terra') || lowerMessage.includes('hectare') || lowerMessage.includes('propriedade')) {
          entities.tipo = 'Imóvel Rural';
        } else if (lowerMessage.includes('cerca') || lowerMessage.includes('curral') || lowerMessage.includes('instalação')) {
          entities.tipo = 'Infraestrutura';
        } else if (lowerMessage.includes('ração') || lowerMessage.includes('vacina') || lowerMessage.includes('insumo')) {
          entities.tipo = 'Insumos';
        } else {
          entities.tipo = 'Outros';
        }
        
        // Extrair nome do investimento - MANTER NOMES ESPECÍFICOS
        if (entities.tipo === 'Equipamentos') {
          if (lowerMessage.includes('trator')) {
            entities.nome = 'Trator';
          } else if (lowerMessage.includes('roçadeira')) {
            entities.nome = 'Roçadeira';
          } else if (lowerMessage.includes('plantadeira')) {
            entities.nome = 'Plantadeira';
          } else {
            entities.nome = 'Equipamento agrícola';
          }
        } else if (entities.tipo === 'Rebanho') {
          if (lowerMessage.includes('reprodutor') || lowerMessage.includes('touro')) {
            entities.nome = 'Reprodutor';
          } else if (lowerMessage.includes('matriz') || lowerMessage.includes('vaca')) {
            entities.nome = 'Matriz';
          } else {
            entities.nome = 'Gado';
          }
        } else {
          entities.nome = entities.tipo;
        }
        
        // Instituição/Fornecedor
        entities.instituicao = 'Fazenda';
        entities.data = new Date().toISOString().split('T')[0];
      }

      // Calcular confiança de forma mais inteligente
      let confidence = 0;
      
      if (intent === 'create_goal') {
        confidence = matches >= 1 ? 0.9 : 0;
        if (entities.valor_total && entities.valor_total > 0) {
          confidence = Math.min(confidence + 0.1, 1.0);
        }
        if (lowerMessage.includes('meta') || lowerMessage.includes('comprar') || lowerMessage.includes('trator')) {
          confidence = Math.min(confidence + 0.1, 1.0);
        }
      } else if (intent === 'create_transaction') {
        confidence = matches >= 1 ? 0.6 : 0;
        if (entities.valor && entities.valor > 0 && (lowerMessage.includes('gastei') || lowerMessage.includes('paguei') || lowerMessage.includes('comprei'))) {
          confidence = Math.min(confidence + 0.2, 1.0);
        }
      } else if (intent === 'create_investment') {
        confidence = matches >= 1 ? 0.7 : 0;
        if (entities.valor && entities.valor > 0) {
          confidence = Math.min(confidence + 0.2, 1.0);
        }
      } else {
        confidence = matches / Math.max(patterns.length, 1);
      }
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence, entities };
      }
    }

    return bestMatch;
  }
}

// ===== SISTEMA DE CONTEXTO OTIMIZADO =====
class OptimizedContext {
  private userContexts = new Map<string, any>();

  // Buscar dados do usuário no Supabase
  async getUserFarmData(userId: string): Promise<any> {
    try {
      const user = await User.findByFirebaseUid(userId);
      if (!user) {
        return {
          goals: [],
          animals: [],
          manejos: [],
          vendas: [],
          producao: [],
          transactions: [],
          investments: [],
          stats: { totalAnimals: 0, totalTransactions: 0, totalInvestments: 0, hasData: false }
        };
      }

      // Buscar dados em paralelo - incluindo dados pecuários
      const [metas, transacoes, investimentos, animais, manejos, vendas, producao] = await Promise.all([
        Meta.findByUserId(user.id!),
        Transacao.findByUserId(user.id!),
        Investimento.findByUserId(user.id!),
        bovinextSupabaseService.getAnimaisByUser(user.id!).catch(() => []),
        bovinextSupabaseService.getManejosByUser(user.id!).catch(() => []),
        bovinextSupabaseService.getVendasByUser(user.id!).catch(() => []),
        bovinextSupabaseService.getProducaoByUser(user.id!).catch(() => [])
      ]);

      // Calcular estatísticas básicas
      const totalTransactions = transacoes.length;
      const totalGoals = metas.length;
      const totalInvestments = investimentos.reduce((sum, inv) => sum + inv.valor, 0);
      const monthlyExpenses = transacoes
        .filter(t => t.tipo === 'despesa' && new Date(t.data).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.valor, 0);

      // Estatísticas pecuárias
      const totalAnimais = animais.length;
      const animaisAtivos = animais.filter((a: any) => a.status === 'ativo').length;
      const totalManejos = manejos.length;
      const totalVendas = vendas.length;
      const valorTotalVendas = (vendas as any[]).reduce((acc: number, v: any) => acc + (v.valor || 0), 0);
      const totalProducao = producao.length;

      console.log(`[OptimizedContext] 📊 Dados carregados: ${totalAnimais} animais, ${totalManejos} manejos, ${totalVendas} vendas, ${totalProducao} produções`);

      return {
        goals: metas,
        transactions: transacoes,
        investments: investimentos,
        animals: animais,
        manejos: manejos,
        vendas: vendas,
        producao: producao,
        stats: {
          totalTransactions,
          totalGoals,
          totalInvestments,
          monthlyExpenses,
          totalAnimais,
          animaisAtivos,
          totalManejos,
          totalVendas,
          valorTotalVendas,
          totalProducao,
          hasData: totalTransactions > 0 || totalGoals > 0 || investimentos.length > 0 || totalAnimais > 0 || totalManejos > 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados da fazenda:', error);
      return {
        goals: [],
        transactions: [],
        investments: [],
        animals: [],
        manejos: [],
        vendas: [],
        producao: [],
        stats: { totalTransactions: 0, totalGoals: 0, totalInvestments: 0, monthlyExpenses: 0, totalAnimais: 0, hasData: false }
      };
    }
  }

  updateContext(userId: string, message: string, response: string): void {
    const existing = this.userContexts.get(userId) || {
      recentTopics: [],
      preferences: { style: 'balanced' },
      lastInteraction: Date.now(),
      messageCount: 0
    };

    existing.recentTopics.unshift(this.extractTopic(message));
    existing.recentTopics = existing.recentTopics.slice(0, 5);
    existing.lastInteraction = Date.now();
    existing.messageCount++;

    this.userContexts.set(userId, existing);
  }

  getContext(userId: string): any {
    return this.userContexts.get(userId) || {
      recentTopics: [],
      preferences: { style: 'balanced' },
      lastInteraction: Date.now(),
      messageCount: 0
    };
  }

  private extractTopic(message: string): string {
    const topics = {
      'rebanho': /gado|animal|boi|vaca|rebanho/i,
      'manejo': /manejo|vacinação|vermífugo|tratamento/i,
      'investimento': /invest|comprar|equipamento|trator/i,
      'vendas': /venda|vendeu|frigorífico|preço/i,
      'análise': /analis|relatório|gráfico|performance/i
    };

    for (const [topic, pattern] of Object.entries(topics)) {
      if (pattern.test(message)) {
        return topic;
      }
    }

    return 'geral';
  }
}

// ===== CLASSE PRINCIPAL OTIMIZADA ADAPTADA PARA BOVINEXT =====
export class OptimizedAIService {
  private cache = new IntelligentCache();
  private intentDetector = new FastIntentDetector();
  private contextManager = new OptimizedContext();
  private responseCount = 0;

  // Sistema de prompts adaptado para BOVINEXT
  private SYSTEM_PROMPTS = {
    BOVI_CORE: `Você é BOVI, o assistente pecuário inteligente do BOVINEXT. Seja natural, amigável e especializado em pecuária.

Suas principais funções:
- Registrar custos e receitas da fazenda
- Acompanhar metas e investimentos rurais
- Analisar performance do rebanho
- Dar insights sobre mercado bovino
- Ajudar com planejamento da fazenda

CONHECIMENTO ESPECIALIZADO:
- Zootecnia e manejo de gado de corte
- Mercado bovino e preços da arroba
- Equipamentos e tecnologia rural
- Nutrição e saúde animal
- Reprodução e melhoramento genético

Sempre seja:
✅ Conciso e objetivo
✅ Amigável mas profissional
✅ Focado em soluções práticas para fazenda
✅ Proativo em sugerir melhorias

❌ Não seja verboso ou repetitivo
❌ Não mencione limitações técnicas
❌ Não peça desculpas desnecessárias
❌ Não use termos financeiros genéricos - use termos rurais`
  };

  constructor() {
    // Inicializar prompts
  }

  async generateResponse(
    userId: string,
    message: string,
    conversationHistory: ChatMessage[] = [],
    userContext?: any
  ): Promise<{
    text: string;
    intent?: string;
    confidence?: number;
    requiresConfirmation?: boolean;
    entities?: any;
    responseTime: number;
    cached?: boolean;
    actionData?: any;
  }> {
    const startTime = Date.now();
    
    try {
      // 1. Verificar cache primeiro
      const historyKey = (conversationHistory || [])
        .slice(-3)
        .map(m => (typeof m.content === 'string' ? m.content : ''))
        .join('|')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .substring(0, 120);
      const cacheKey = this.getCacheKey(userId, message, historyKey);
      const cached = this.cache.get(cacheKey);
      
      if (false && cached) { // Desabilitado para debug
        console.log(`[AI] Cache hit for key: ${cacheKey.substring(0, 50)}...`);
        return { ...cached, cached: true };
      }

      // 2. Processar mensagem com IA
      console.log(`🤖 BOVI processando mensagem: "${message}"`);
      
      // 3. Atualizar contexto
      this.contextManager.updateContext(userId, message, '');

      // 4. BUSCAR DADOS REAIS DO USUÁRIO ANTES DE RESPONDER
      let userData = null;
      try {
        userData = await this.contextManager.getUserFarmData(userId);
        console.log(`[BOVI] Dados da fazenda carregados:`, {
          metas: userData?.goals?.length || 0,
          transacoes: userData?.transactions?.length || 0,
          investimentos: userData?.investments?.length || 0
        });
      } catch (error) {
        console.error('[BOVI] Erro ao carregar dados da fazenda:', error);
      }

      // 5. Gerar contexto com dados reais do usuário
      const context = await this.buildContextPrompt(conversationHistory, userContext);
      
      let userDataContext = '';
      if (userData) {
        const goals = Array.isArray(userData.goals) ? userData.goals : [];
        const transactions = Array.isArray(userData.transactions) ? userData.transactions : [];
        const investments = Array.isArray(userData.investments) ? userData.investments : [];
        const animals = Array.isArray(userData.animals) ? userData.animals : [];
        const manejosData = Array.isArray(userData.manejos) ? userData.manejos : [];
        const vendasData = Array.isArray(userData.vendas) ? userData.vendas : [];
        const producaoData = Array.isArray(userData.producao) ? userData.producao : [];

        userDataContext = `

DADOS REAIS DA FAZENDA (CONSULTE SEMPRE ANTES DE CRIAR NOVOS):

🐂 REBANHO (${animals.length} animais):
${animals.slice(0, 10).map((a: any) => `- ${a.identificacao || a.brinco || 'Animal'}: ${a.raca || ''} - ${a.categoria || ''} - ${a.status || 'ativo'} - Peso: ${a.peso_atual || 'N/A'}kg`).join('\n') || 'Nenhum animal cadastrado'}

🧪 MANEJOS (${manejosData.length} registros):
${manejosData.slice(0, 5).map((m: any) => `- ${m.tipo_manejo || 'Manejo'}: ${m.data_manejo || ''} - ${m.produto_usado || ''}`).join('\n') || 'Nenhum manejo registrado'}

💰 VENDAS (${vendasData.length} vendas):
${vendasData.slice(0, 5).map((v: any) => `- R$ ${v.valor || 0} - ${v.comprador || 'Comprador'} - ${v.data_venda || ''}`).join('\n') || 'Nenhuma venda registrada'}

🥛 PRODUÇÃO (${producaoData.length} registros):
${producaoData.slice(0, 5).map((p: any) => `- ${p.tipo || 'Produção'}: ${p.quantidade || 0} ${p.unidade || ''}`).join('\n') || 'Nenhuma produção registrada'}

🎯 METAS (${goals.length}):
${goals.map(g => `- ${g.nome_da_meta}: R$ ${g.valor_atual || 0}/${g.valor_total || 0}`).join('\n') || 'Nenhuma meta'}

📊 TRANSAÇÕES (${transactions.length}):
${transactions.slice(0, 5).map(t => `- ${t.descricao || 'Transação'}: R$ ${t.valor || 0} (${t.tipo || ''})`).join('\n') || 'Nenhuma transação'}

🏦 INVESTIMENTOS (${investments.length}):
${investments.slice(0, 5).map(i => `- ${i.nome || 'Investimento'}: R$ ${i.valor || 0}`).join('\n') || 'Nenhum investimento'}`;
      }

      const prompt = `${this.SYSTEM_PROMPTS.BOVI_CORE}

IMPORTANTE PARA BOVI: 
1. SEMPRE consulte os dados reais da fazenda antes de responder
2. Se o usuário pergunta sobre rebanho/animais/manejos/vendas/produção, mostre os dados reais
3. Se não existir o que ele está perguntando, informe que não encontrou
4. A fazenda JÁ TEM DADOS - use-os nas respostas!
5. Use terminologia pecuária adequada (arroba, GMD, UA/ha, etc.)

Contexto: ${context}${userDataContext}
Usuário: ${message}
BOVI:`;

      const openaiClient = getDeepSeekClient();

      const completion = await openaiClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || 'Como posso ajudar com sua fazenda?';

      // 6. Detectar intenção
      const intentResult = this.intentDetector.detect(message);
      console.log(`[BOVI] Intent detectado: ${intentResult.intent}, confiança: ${intentResult.confidence}`);
      
      // Sistema simplificado - sem botões de confirmação
      const validActionIntents = ['create_investment', 'create_goal', 'create_transaction'];
      const shouldExecuteDirectly = validActionIntents.includes(intentResult.intent) && 
                                   intentResult.confidence > 0.6 &&
                                   intentResult.entities && 
                                   Object.keys(intentResult.entities).length > 0;
      
      console.log(`[BOVI] Execução direta: ${shouldExecuteDirectly}`);
      
      let actionData = null;
      const requiresConfirmation = false; // DESABILITADO

      // 7. Pós-processamento
      const finalResponse = this.postProcessResponse(response, userContext);

      // 8. Salvar no cache
      const result = {
        text: finalResponse,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        requiresConfirmation,
        actionData,
        responseTime: Date.now() - startTime
      };

      this.cache.set(cacheKey, result);
      this.responseCount++;

      return result;

    } catch (error) {
      console.error('[BOVI] Error generating response:', error);
      return {
        text: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        responseTime: Date.now() - startTime,
        confidence: 0.0,
        actionData: null
      };
    }
  }

  analyzeIntent(message: string): { intent: string; confidence: number; entities: any } {
    return this.intentDetector.detect(message);
  }

  async streamResponse(
    userId: string,
    message: string,
    onChunk: (chunk: string) => void,
    userContext?: any,
    conversationHistory: ChatMessage[] = [],
    options?: { signal?: AbortSignal }
  ): Promise<string> {
    const startTime = Date.now();
    let fullResponse = '';

    try {
      console.log(`🤖 BOVI streaming mensagem: "${message}"`);

      this.contextManager.updateContext(userId, message, '');

      let userData = null;
      try {
        userData = await this.contextManager.getUserFarmData(userId);
      } catch (error) {
        console.error('[BOVI] Erro ao carregar dados da fazenda:', error);
      }

      const context = await this.buildContextPrompt(conversationHistory, userContext);

      let userDataContext = '';
      if (userData) {
        const goals = Array.isArray(userData.goals) ? userData.goals : [];
        const transactions = Array.isArray(userData.transactions) ? userData.transactions : [];
        const investments = Array.isArray(userData.investments) ? userData.investments : [];
        const animals = Array.isArray(userData.animals) ? userData.animals : [];
        const manejosArr = Array.isArray(userData.manejos) ? userData.manejos : [];
        const vendasArr = Array.isArray(userData.vendas) ? userData.vendas : [];
        const producaoArr = Array.isArray(userData.producao) ? userData.producao : [];

        userDataContext = `

DADOS REAIS DA FAZENDA (CONSULTE SEMPRE ANTES DE CRIAR NOVOS):

🐂 REBANHO (${animals.length} animais):
${animals.slice(0, 10).map((a: any) => `- ${a.identificacao || a.brinco || 'Animal'}: ${a.raca || ''} - ${a.categoria || ''} - ${a.status || 'ativo'} - Peso: ${a.peso_atual || 'N/A'}kg`).join('\n') || 'Nenhum animal cadastrado'}

🧪 MANEJOS (${manejosArr.length} registros):
${manejosArr.slice(0, 5).map((m: any) => `- ${m.tipo_manejo || 'Manejo'}: ${m.data_manejo || ''} - ${m.produto_usado || ''}`).join('\n') || 'Nenhum manejo registrado'}

💰 VENDAS (${vendasArr.length} vendas):
${vendasArr.slice(0, 5).map((v: any) => `- R$ ${v.valor || 0} - ${v.comprador || 'Comprador'} - ${v.data_venda || ''}`).join('\n') || 'Nenhuma venda registrada'}

🥛 PRODUÇÃO (${producaoArr.length} registros):
${producaoArr.slice(0, 5).map((p: any) => `- ${p.tipo || 'Produção'}: ${p.quantidade || 0} ${p.unidade || ''}`).join('\n') || 'Nenhuma produção registrada'}

🎯 METAS (${goals.length}):
${goals.map(g => `- ${g.nome_da_meta}: R$ ${g.valor_atual || 0}/${g.valor_total || 0}`).join('\n') || 'Nenhuma meta'}

📊 TRANSAÇÕES (${transactions.length}):
${transactions.slice(0, 5).map(t => `- ${t.descricao || 'Transação'}: R$ ${t.valor || 0} (${t.tipo || ''})`).join('\n') || 'Nenhuma transação'}

🏦 INVESTIMENTOS (${investments.length}):
${investments.slice(0, 5).map(i => `- ${i.nome || 'Investimento'}: R$ ${i.valor || 0}`).join('\n') || 'Nenhum investimento'}`;
      }

      const prompt = `${this.SYSTEM_PROMPTS.BOVI_CORE}

IMPORTANTE PARA BOVI: 
1. SEMPRE consulte os dados reais da fazenda antes de responder
2. Se o usuário pergunta sobre rebanho/animais/manejos/vendas/produção, mostre os dados reais
3. Se não existir o que ele está perguntando, informe que não encontrou
4. A fazenda JÁ TEM DADOS - use-os nas respostas!
5. Use terminologia pecuária adequada (arroba, GMD, UA/ha, etc.)

Contexto: ${context}${userDataContext}
Usuário: ${message}
BOVI:`;

      const openaiClient = getDeepSeekClient();

      const stream = await openaiClient.chat.completions.create(
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
          stream: true,
        },
        options?.signal ? { signal: options.signal } : undefined,
      );

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      console.log(`[BOVI] Streaming concluído em ${Date.now() - startTime}ms`);
      return fullResponse;
    } catch (error) {
      console.error('[BOVI] Error streaming response:', error);
      throw error;
    }
  }

  private async buildContextPrompt(conversationHistory: ChatMessage[], userContext?: any): Promise<string> {
    let context = '';
    
    if (userContext?.userId) {
      context += `[CONTEXTO DA FAZENDA]\n`;
      context += `Fazendeiro: ${userContext.nome || 'Fazendeiro'}\n`;
      context += `Fazenda: ${userContext.fazenda_nome || 'Propriedade Rural'}\n`;
      context += `[FIM CONTEXTO]\n\n`;
    }
    
    if (conversationHistory.length > 0) {
      context += 'HISTÓRICO COMPLETO DA CONVERSA:\n';
      conversationHistory.forEach((msg) => {
        const roleValue = (msg as any).role || (msg as any).sender;
        const role = roleValue === 'user' ? 'Fazendeiro' : 'BOVI';
        context += `${role}: ${msg.content}\n`;
      });
    }
    
    return context;
  }

  private postProcessResponse(response: string, userContext?: any): string {
    // Remover formatação excessiva e limitar tamanho
    let cleanResponse = response
      .replace(/\*\*/g, '') // Remove ** 
      .replace(/\n\n+/g, '\n') // Remove quebras duplas
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();

    // Limitar tamanho da resposta (máximo 600 caracteres)
    if (cleanResponse.length > 600) {
      const sentences = cleanResponse.split(/[.!?]/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence + '.').length <= 597) {
          truncated += sentence + '.';
        } else {
          break;
        }
      }
      cleanResponse = truncated || cleanResponse.substring(0, 597) + '...';
    }

    return cleanResponse;
  }

  private getCacheKey(userId: string, message: string, historyKey: string = ''): string {
    const base = `${userId}_${message.substring(0, 50).toLowerCase().replace(/\s+/g, '_')}`;
    if (!historyKey) return base;
    const hist = historyKey.substring(0, 80).replace(/\s+/g, '_');
    return `${base}__h:${hist}`;
  }

  getCacheStats() {
    return {
      ...this.cache.getStats(),
      totalResponses: this.responseCount
    };
  }

  clearCache() {
    this.cache.clear();
  }

  // Método para compatibilidade com o sistema existente
  async generateContextualResponse(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext?: any
  ) {
    const userId = userContext?.userId || 'anonymous';
    const result = await this.generateResponse(userId, userMessage, conversationHistory, userContext);
    
    return {
      text: result.text,
      analysisData: {
        responseTime: result.responseTime,
        engine: 'optimized-bovinext',
        confidence: result.confidence || 0.8,
        cached: result.cached || false
      }
    };
  }
}

export default OptimizedAIService;
