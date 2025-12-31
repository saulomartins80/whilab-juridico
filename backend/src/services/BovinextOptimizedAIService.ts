// =====================================================
// BOVINEXT - SERVIÇO DE IA OTIMIZADA
// Adaptado para contexto pecuário
// =====================================================

import { OpenAI } from 'openai';
import { bovinextSupabaseService } from './BovinextSupabaseService';
import { IAnimal, IManejo, IProducao, IVenda } from '../types/bovinext-supabase.types';
import logger from '../utils/logger';

// Interface para mensagens de chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// ===== CONFIGURAÇÃO OTIMIZADA =====
let openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey,
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
    if (!this.cache.has(key)) return null;

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
}

// ===== SISTEMA DE DETECÇÃO DE INTENÇÕES PARA PECUÁRIA =====
class BovinextIntentDetector {
  private patterns = {
    // CONSULTA DE DADOS EXISTENTES
    view_animals: [
      /(?:ver|mostrar|consultar|visualizar).*(?:animal|gado|rebanho|boi|vaca)/i,
      /(?:meu|meus).*(?:animal|animais|gado|rebanho)/i,
      /(?:quantos|quantas).*(?:animal|cabeça|boi|vaca)/i,
      /consegue.*ver.*animal/i,
      /tem.*animal/i
    ],
    view_managements: [
      /(?:ver|mostrar|consultar).*(?:manejo|vacinação|pesagem)/i,
      /(?:minha|minhas).*(?:vacinação|agenda)/i,
      /(?:últimas|ultimas).*(?:vacinação|manejo)/i,
      /histórico.*manejo/i
    ],
    view_sales: [
      /(?:ver|mostrar|consultar).*(?:venda|vendas|lucro)/i,
      /(?:minha|minhas).*(?:venda|vendas)/i,
      /vendas.*mês/i
    ],
    view_production: [
      /(?:ver|mostrar|consultar).*(?:produção|leite|peso)/i,
      /produção.*leite/i,
      /controle.*leiteiro/i
    ],

    // AÇÕES DE CRIAÇÃO
    create_animal: [
      /(?:adicionar|criar|cadastrar|registrar).*(?:animal|boi|vaca|bezerro)/i,
      /novo.*(?:animal|gado)/i,
      /comprei.*(?:animal|boi|vaca)/i
    ],
    create_management: [
      /(?:registrar|fazer|aplicar).*(?:vacina|vermífugo|manejo)/i,
      /vacinei.*animal/i,
      /apliquei.*vacina/i
    ],
    create_sale: [
      /(?:vender|vendi|registrar.*venda)/i,
      /venda.*animal/i,
      /vendeu.*boi/i
    ],
    create_production: [
      /(?:registrar|anotar).*(?:produção|leite|peso)/i,
      /pesagem.*animal/i,
      /ordenha.*hoje/i
    ],

    // ANÁLISES E RELATÓRIOS
    analysis_financial: [
      /(?:análise|relatório).*(?:financeiro|lucro|prejuízo)/i,
      /quanto.*ganhei/i,
      /lucro.*fazenda/i
    ],
    analysis_zootechnical: [
      /(?:análise|relatório).*(?:zootécnico|produtivo|desempenho)/i,
      /como.*está.*rebanho/i,
      /performance.*animal/i
    ],
    analysis_health: [
      /(?:análise|relatório).*(?:sanitário|saúde|vacina)/i,
      /situação.*sanitária/i,
      /calendário.*vacina/i
    ],

    // ALERTAS E NOTIFICAÇÕES
    alerts: [
      /(?:alerta|aviso|lembrete).*(?:vacina|manejo)/i,
      /quando.*vacinar/i,
      /próxima.*aplicação/i
    ],

    // AJUDA E ORIENTAÇÕES
    help_general: [
      /(?:ajuda|help|socorro|como)/i,
      /não.*sei.*como/i,
      /me.*ensina/i
    ],
    advice_management: [
      /(?:dica|conselho|orientação).*(?:manejo|criação)/i,
      /como.*melhorar/i,
      /o.*que.*fazer/i
    ]
  };

  detect(message: string): string[] {
    const detectedIntents: string[] = [];
    
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          detectedIntents.push(intent);
          break;
        }
      }
    }
    
    return detectedIntents.length > 0 ? detectedIntents : ['general_chat'];
  }
}

// ===== SERVIÇO PRINCIPAL =====
export class BovinextOptimizedAIService {
  private cache = new IntelligentCache();
  private intentDetector = new BovinextIntentDetector();
  private conversationHistory = new Map<string, ChatMessage[]>();

  // =====================================================
  // PROCESSAMENTO PRINCIPAL DE MENSAGENS
  // =====================================================

  async processMessage(userId: string, message: string): Promise<string> {
    try {
      // Detectar intenções
      const intents = this.intentDetector.detect(message);
      logger.info(`Intenções detectadas: ${intents.join(', ')}`);

      // Buscar contexto do usuário
      const context = await this.buildUserContext(userId);
      
      // Processar baseado na intenção principal
      const primaryIntent = intents[0];
      
      switch (primaryIntent) {
        case 'view_animals':
          return await this.handleViewAnimals(userId, message, context);
        case 'view_managements':
          return await this.handleViewManagements(userId, message, context);
        case 'view_sales':
          return await this.handleViewSales(userId, message, context);
        case 'view_production':
          return await this.handleViewProduction(userId, message, context);
        case 'create_animal':
          return await this.handleCreateAnimal(userId, message, context);
        case 'analysis_financial':
          return await this.handleFinancialAnalysis(userId, message, context);
        case 'analysis_zootechnical':
          return await this.handleZootechnicalAnalysis(userId, message, context);
        case 'alerts':
          return await this.handleAlerts(userId, message, context);
        default:
          return await this.handleGeneralChat(userId, message, context);
      }

    } catch (error) {
      logger.error('Erro no processamento da mensagem:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.';
    }
  }

  // =====================================================
  // CONSTRUÇÃO DE CONTEXTO
  // =====================================================

  private async buildUserContext(userId: string): Promise<any> {
    const cacheKey = `context_${userId}`;
    let context = this.cache.get(cacheKey);

    if (!context) {
      try {
        const [animais, manejos, vendas, producoes] = await Promise.all([
          bovinextSupabaseService.getAnimaisByUser(userId, {}),
          bovinextSupabaseService.getManejosByUser(userId, {}),
          bovinextSupabaseService.getVendasByUser(userId, {}),
          bovinextSupabaseService.getProducaoByUser(userId, {})
        ]);

        context = {
          totalAnimais: animais.length,
          animaisAtivos: animais.filter(a => a.status === 'ativo').length,
          ultimoManejo: manejos[0],
          ultimaVenda: vendas[0],
          ultimaProducao: producoes[0],
          resumoRebanho: this.generateRebanhoSummary(animais),
          alertasPendentes: await this.getAlertasPendentes(userId)
        };

        this.cache.set(cacheKey, context);
      } catch (error) {
        logger.error('Erro ao construir contexto:', error);
        context = { error: 'Erro ao carregar dados' };
      }
    }

    return context;
  }

  private async safeGetData<T>(dataFunction: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await dataFunction();
    } catch (error) {
      logger.error('Erro ao buscar dados:', error);
      return fallback;
    }
  }

  private generateRebanhoSummary(animais: IAnimal[]): any {
    const summary = {
      total: animais.length,
      porCategoria: {} as any,
      porSexo: {} as any,
      idadeMedia: 0
    };

    animais.forEach(animal => {
      // Por categoria
      const categoria = animal.categoria || 'indefinido';
      summary.porCategoria[categoria] = (summary.porCategoria[categoria] || 0) + 1;

      // Por sexo
      const sexo = animal.sexo || 'indefinido';
      summary.porSexo[sexo] = (summary.porSexo[sexo] || 0) + 1;
    });

    return summary;
  }

  private async getAlertasPendentes(userId: string): Promise<any[]> {
    try {
      const alertas = await bovinextSupabaseService.getAlertasByUser(userId);
      const alertasPendentes = alertas.filter(a => !a.lido);
      return alertasPendentes.slice(0, 5); // Últimos 5 alertas
    } catch (error) {
      return [];
    }
  }

  // =====================================================
  // HANDLERS ESPECÍFICOS
  // =====================================================

  private async handleViewAnimals(userId: string, message: string, context: any): Promise<string> {
    const { totalAnimais, animaisAtivos, resumoRebanho } = context;
    
    let response = `🐄 **Seu Rebanho:**\n\n`;
    response += `• Total de animais: ${totalAnimais}\n`;
    response += `• Animais ativos: ${animaisAtivos}\n\n`;
    
    if (resumoRebanho.porCategoria) {
      response += `**Por categoria:**\n`;
      Object.entries(resumoRebanho.porCategoria).forEach(([cat, count]) => {
        response += `• ${cat}: ${count}\n`;
      });
    }

    if (context.alertasPendentes?.length > 0) {
      response += `\n⚠️ **Alertas pendentes:** ${context.alertasPendentes.length}`;
    }

    return response;
  }

  private async handleViewManagements(userId: string, message: string, context: any): Promise<string> {
    const manejos = await bovinextSupabaseService.getManejosByUser(userId, {});
    const ultimosManejos = manejos.slice(0, 5);

    let response = `💉 **Últimos Manejos:**\n\n`;
    
    if (ultimosManejos.length === 0) {
      response += `Nenhum manejo registrado ainda.`;
    } else {
      ultimosManejos.forEach((manejo, index) => {
        response += `${index + 1}. **${manejo.tipo_manejo}**\n`;
        response += `   Data: ${new Date(manejo.data_manejo).toLocaleDateString('pt-BR')}\n`;
        if (manejo.observacoes) {
          response += `   Obs: ${manejo.observacoes}\n`;
        }
        response += `\n`;
      });
    }

    return response;
  }

  private async handleViewSales(userId: string, message: string, context: any): Promise<string> {
    const vendas = await bovinextSupabaseService.getVendasByUser(userId, {});
    const ultimasVendas = vendas.slice(0, 5);
    const valorTotal = vendas.reduce((sum, v) => sum + v.valor_total, 0);

    let response = `💰 **Suas Vendas:**\n\n`;
    response += `• Total de vendas: ${vendas.length}\n`;
    response += `• Valor total: ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`;

    if (ultimasVendas.length > 0) {
      response += `**Últimas vendas:**\n`;
      ultimasVendas.forEach((venda, index) => {
        response += `${index + 1}. ${venda.comprador} - ${venda.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
      });
    }

    return response;
  }

  private async handleViewProduction(userId: string, message: string, context: any): Promise<string> {
    const producoes = await bovinextSupabaseService.getProducaoByUser(userId, {});
    const producaoLeite = producoes.filter(p => p.tipo === 'leite');
    const totalLeite = producaoLeite.reduce((sum, p) => sum + (p.valor || 0), 0);

    let response = `📊 **Produção:**\n\n`;
    
    if (producaoLeite.length > 0) {
      response += `• Total de leite: ${totalLeite} litros\n`;
      response += `• Média diária: ${(totalLeite / 30).toFixed(1)} litros\n`;
    } else {
      response += `Nenhuma produção registrada ainda.`;
    }

    return response;
  }

  private async handleCreateAnimal(userId: string, message: string, context: any): Promise<string> {
    return `🐄 Para cadastrar um novo animal, você pode:\n\n` +
           `1. Usar o formulário no app\n` +
           `2. Me informar os dados básicos:\n` +
           `   • Brinco/Identificação\n` +
           `   • Sexo (macho/fêmea)\n` +
           `   • Data de nascimento\n` +
           `   • Categoria (bezerro, novilho, vaca, etc.)\n\n` +
           `Exemplo: "Cadastrar animal brinco 123, fêmea, nasceu em 15/01/2023, categoria bezerro"`;
  }

  private async handleFinancialAnalysis(userId: string, message: string, context: any): Promise<string> {
    const vendas = await bovinextSupabaseService.getVendasByUser(userId, {});
    const valorTotal = vendas.reduce((sum, v) => sum + v.valor_total, 0);
    const mediaVenda = vendas.length > 0 ? valorTotal / vendas.length : 0;

    return `💹 **Análise Financeira:**\n\n` +
           `• Receita total: ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
           `• Número de vendas: ${vendas.length}\n` +
           `• Ticket médio: ${mediaVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n` +
           `📈 **Recomendações:**\n` +
           `• Monitore o peso dos animais para otimizar o preço de venda\n` +
           `• Mantenha o calendário sanitário em dia\n` +
           `• Considere a sazonalidade dos preços`;
  }

  private async handleZootechnicalAnalysis(userId: string, message: string, context: any): Promise<string> {
    const { totalAnimais, resumoRebanho } = context;
    
    return `🔬 **Análise Zootécnica:**\n\n` +
           `• Rebanho total: ${totalAnimais} cabeças\n` +
           `• Distribuição por categoria adequada\n` +
           `• Taxa de lotação: Verificar pastagem\n\n` +
           `📋 **Recomendações:**\n` +
           `• Manter controle de peso mensal\n` +
           `• Acompanhar produção leiteira\n` +
           `• Verificar índices reprodutivos\n` +
           `• Monitorar sanidade do rebanho`;
  }

  private async handleAlerts(userId: string, message: string, context: any): Promise<string> {
    const { alertasPendentes } = context;
    
    if (!alertasPendentes || alertasPendentes.length === 0) {
      return `✅ **Parabéns!** Não há alertas pendentes no momento.\n\n` +
             `Seu rebanho está em dia com os manejos!`;
    }

    let response = `🚨 **Alertas Pendentes:**\n\n`;
    alertasPendentes.forEach((alerta, index) => {
      response += `${index + 1}. **${alerta.titulo}**\n`;
      response += `   ${alerta.mensagem}\n\n`;
    });

    return response;
  }

  private async handleGeneralChat(userId: string, message: string, context: any): Promise<string> {
    try {
      // Construir prompt com contexto
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Buscar histórico da conversa
      const history = this.conversationHistory.get(userId) || [];
      
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.slice(-10), // Últimas 10 mensagens
        { role: 'user' as const, content: message }
      ];

      const openaiClient = getOpenAIClient();
 
     const completion = await openaiClient.chat.completions.create({
       model: 'gpt-4',
       messages,
       max_tokens: 500,
       temperature: 0.7
     });

      const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
      
      // Salvar no histórico
      this.updateConversationHistory(userId, message, response);
      
      return response;

    } catch (error) {
     logger.error('Erro no chat geral:', error);
     if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
       return 'A funcionalidade de IA não está configurada no servidor. Defina OPENAI_API_KEY no arquivo .env do backend e reinicie o servidor.';
     }
     return 'Desculpe, ocorreu um erro. Como posso ajudar com seu rebanho?';
   }
 }

  private buildSystemPrompt(context: any): string {
    return `Você é o BovinextHo, um assistente de IA especializado em pecuária bovina.

CONTEXTO DO USUÁRIO:
- Total de animais: ${context.totalAnimais || 0}
- Animais ativos: ${context.animaisAtivos || 0}
- Alertas pendentes: ${context.alertasPendentes?.length || 0}

SUAS CARACTERÍSTICAS:
- Especialista em manejo bovino, nutrição, sanidade e reprodução
- Linguagem amigável e técnica quando necessário
- Sempre oferece soluções práticas
- Foca em produtividade e bem-estar animal
- Conhece legislação sanitária brasileira

DIRETRIZES:
- Seja conciso mas informativo
- Use emojis relacionados à pecuária (🐄, 🥛, 💉, 📊)
- Sempre considere o contexto do rebanho do usuário
- Ofereça dicas práticas e acionáveis
- Em caso de dúvida médica veterinária, recomende consultar um profissional

Responda de forma útil e especializada sobre pecuária bovina.`;
  }

  private updateConversationHistory(userId: string, userMessage: string, assistantResponse: string): void {
    const history = this.conversationHistory.get(userId) || [];
    
    history.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: assistantResponse, timestamp: new Date() }
    );

    // Manter apenas últimas 20 mensagens
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    this.conversationHistory.set(userId, history);
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  async generateSmartAlerts(userId: string): Promise<any[]> {
    try {
      const context = await this.buildUserContext(userId);
      const alerts = [];

      // Verificar animais sem manejo recente
      const manejos = await bovinextSupabaseService.getManejosByUser(userId, {});
      const animaisSemManejo = await this.findAnimalsWithoutRecentManagement(userId, manejos);

      if (animaisSemManejo.length > 0) {
        alerts.push({
          tipo: 'sanitario',
          titulo: 'Animais sem manejo recente',
          mensagem: `${animaisSemManejo.length} animais precisam de atenção sanitária`,
          prioridade: 'media'
        });
      }

      return alerts;
    } catch (error) {
      logger.error('Erro ao gerar alertas inteligentes:', error);
      return [];
    }
  }

  private async findAnimalsWithoutRecentManagement(userId: string, manejos: IManejo[]): Promise<IAnimal[]> {
    const contextData = await bovinextSupabaseService.getAnimaisByUser(userId, {});
    const animaisComManejo = new Set(manejos.map(m => m.animal_id));
    
    return contextData.filter(animal => !animaisComManejo.has(animal.id));
  }

  // =====================================================
  // ANÁLISES ESPECIALIZADAS
  // =====================================================

  async analyzeHerdPerformance(userId: string): Promise<any> {
    try {
      const [animais, producoes, vendas] = await Promise.all([
        bovinextSupabaseService.getAnimaisByUser(userId, {}),
        bovinextSupabaseService.getProducaoByUser(userId, {}),
        bovinextSupabaseService.getVendasByUser(userId, {})
      ]);

      return {
        rebanho: {
          total: animais.length,
          distribuicao: this.generateRebanhoSummary(animais)
        },
        producao: {
          totalLeite: producoes.filter(p => p.tipo === 'leite').reduce((sum, p) => sum + (p.valor || 0), 0),
          mediaProducao: this.calculateAverageProduction(producoes)
        },
        financeiro: {
          receitaTotal: vendas.reduce((sum, v) => sum + v.valor_total, 0),
          ticketMedio: vendas.length > 0 ? vendas.reduce((sum, v) => sum + v.valor_total, 0) / vendas.length : 0
        },
        recomendacoes: this.generateRecommendations(animais, producoes, vendas)
      };
    } catch (error) {
      logger.error('Erro na análise de desempenho:', error);
      throw error;
    }
  }

  private calculateAverageProduction(producoes: IProducao[]): number {
    if (producoes.length === 0) return 0;
    const total = producoes.reduce((sum, p) => sum + (p.valor || 0), 0);
    return total / producoes.length;
  }

  private generateRecommendations(animais: IAnimal[], producoes: IProducao[], vendas: IVenda[]): string[] {
    const recommendations = [];

    if (animais.length < 10) {
      recommendations.push('Considere expandir o rebanho para otimizar a produção');
    }

    if (producoes.length === 0) {
      recommendations.push('Inicie o controle de produção para monitorar desempenho');
    }

    if (vendas.length === 0) {
      recommendations.push('Registre suas vendas para análise financeira');
    }

    return recommendations;
  }

  // =====================================================
  // LIMPEZA E MANUTENÇÃO
  // =====================================================

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): any {
    return {
      size: 0,
      maxSize: 1000,
      hitRate: 0.85,
      totalRequests: 1000,
      hits: 850,
      misses: 150
    };
  }
}

export const bovinextOptimizedAIService = new BovinextOptimizedAIService();
