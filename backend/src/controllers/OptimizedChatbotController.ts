import { Request, Response } from 'express';
import { OptimizedAIService } from '../services/OptimizedAIService';
import { ChatHistoryService } from '../services/chatHistoryService';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { Meta } from '../models/Meta';
import { Transacao } from '../models/Transacao';
import { Investimento } from '../models/Investimento';
import { User } from '../models/User';
import { contextManager } from '../services/ContextManager';
import { whilabSupabaseService } from '../services/WhiLabSupabaseService';
import { AI_BRAND, BRAND_TEXT } from '../config/aiPrompts';

// ===== SISTEMA DE STREAMING PARA SSE =====
class StreamingController extends EventEmitter {
  private activeStreams = new Map<string, Response>();

  startStream(streamId: string, res: Response): void {
    // Configurar SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    this.activeStreams.set(streamId, res);

    // Heartbeat para manter conexÃ£o viva
    const heartbeat = setInterval(() => {
      if (this.activeStreams.has(streamId)) {
        res.write('event: heartbeat\ndata: {}\n\n');
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);

    // Cleanup quando cliente desconectar
    res.on('close', () => {
      this.activeStreams.delete(streamId);
      clearInterval(heartbeat);
    });
  }

  sendChunk(streamId: string, chunk: string, isComplete = false): void {
    const res = this.activeStreams.get(streamId);
    if (res) {
      const data = JSON.stringify({ 
        chunk, 
        isComplete,
        timestamp: Date.now()
      });
      
      res.write(`event: chunk\ndata: ${data}\n\n`);
      
      if (isComplete) {
        res.write(`event: complete\ndata: ${JSON.stringify({ complete: true })}\n\n`);
        res.end();
        this.activeStreams.delete(streamId);
      }
    }
  }

  sendError(streamId: string, error: string): void {
    const res = this.activeStreams.get(streamId);
    if (res) {
      res.write(`event: error\ndata: ${JSON.stringify({ error })}\n\n`);
      res.end();
      this.activeStreams.delete(streamId);
    }
  }
}

// ===== SISTEMA DE AUTOMAÃ‡ÃƒO INTELIGENTE ADAPTADO PARA WHILAB =====
class AutomationEngine {
  private actionHandlers = new Map<string, Function>();

  constructor() {
    this.setupActionHandlers();
  }

  private setupActionHandlers(): void {
    this.actionHandlers.set('create_transaction', this.handleCreateTransaction.bind(this));
    this.actionHandlers.set('CREATE_TRANSACTION', this.handleCreateTransaction.bind(this));
    this.actionHandlers.set('create_goal', this.handleCreateGoal.bind(this));
    this.actionHandlers.set('CREATE_GOAL', this.handleCreateGoal.bind(this));
    this.actionHandlers.set('create_investment', this.handleCreateInvestment.bind(this));
    this.actionHandlers.set('CREATE_INVESTMENT', this.handleCreateInvestment.bind(this));
    this.actionHandlers.set('ANALYZE_DATA', this.handleAnalyzeData.bind(this));
    // Novas aÃ§Ãµes operacionais do WHILAB
    this.actionHandlers.set('create_animal', this.handleCreateAnimal.bind(this));
    this.actionHandlers.set('CREATE_ANIMAL', this.handleCreateAnimal.bind(this));
    this.actionHandlers.set('create_manejo', this.handleCreateManejo.bind(this));
    this.actionHandlers.set('CREATE_MANEJO', this.handleCreateManejo.bind(this));
    this.actionHandlers.set('create_venda', this.handleCreateVenda.bind(this));
    this.actionHandlers.set('CREATE_VENDA', this.handleCreateVenda.bind(this));
  }

  async executeAction(intent: string, entities: any, userId: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    console.log(`[AutomationEngine] ðŸš€ Executando aÃ§Ã£o: ${intent}`);
    console.log(`[AutomationEngine] ðŸ“Š Entidades recebidas:`, JSON.stringify(entities, null, 2));
    console.log(`[AutomationEngine] ðŸ‘¤ UserId:`, userId);
    
    const handler = this.actionHandlers.get(intent);
    console.log(`[AutomationEngine] ðŸ” Handler encontrado:`, !!handler);
    
    if (!handler) {
      console.log(`[AutomationEngine] âŒ Handler nÃ£o encontrado para intent: ${intent}`);
      return {
        success: false,
        message: 'AÃ§Ã£o nÃ£o reconhecida. Como posso ajudar com sua fazenda?'
      };
    }

    try {
      console.log(`[AutomationEngine] âš¡ Chamando handler para: ${intent}`);
      const result = await handler(entities, userId);
      console.log(`[AutomationEngine] âœ… Resultado do handler:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error: any) {
      console.error(`[AutomationEngine] âŒ Error executing ${intent}:`, error);
      return {
        success: false,
        message: 'Ops! Tive um problema ao executar essa aÃ§Ã£o. Pode tentar novamente?'
      };
    }
  }

  private async handleCreateTransaction(entities: any, userId: string): Promise<any> {
    const valor = entities.valor;
    const descricao = entities.descricao;
    
    if (!valor) {
      return {
        success: false,
        message: `Para registrar a transaÃ§Ã£o da fazenda, preciso do valor. Qual foi o valor?`,
        requiresInput: true,
        missingFields: ['valor']
      };
    }

    if (!descricao) {
      return {
        success: false,
        message: `Para registrar a transaÃ§Ã£o, preciso saber o que foi comprado. O que vocÃª comprou?`,
        requiresInput: true,
        missingFields: ['descricao']
      };
    }

    try {
      // Buscar usuÃ¡rio pelo firebaseUid - ADAPTADO PARA SUPABASE
      const user = await User.findByFirebaseUid(userId);
      if (!user) {
        throw new Error('UsuÃ¡rio nÃ£o encontrado');
      }

      // CRIAR TRANSAÃ‡ÃƒO REAL NO SUPABASE
      const transactionData = {
        user_id: user.id!, // Usar ID do Supabase
        valor: parseFloat(entities.valor),
        descricao: entities.descricao || 'TransaÃ§Ã£o da fazenda',
        tipo: entities.tipo || 'despesa',
        categoria: entities.categoria || 'Manejo',
        conta: entities.conta || 'Principal',
        data: entities.data || new Date().toISOString().split('T')[0]
      };

      console.log('[AutomationEngine] Saving transaction to Supabase:', transactionData);
      const savedTransaction = await Transacao.create(transactionData);
      console.log('[AutomationEngine] Transaction saved successfully:', savedTransaction.id);

      return {
        success: true,
        message: `âœ… TransaÃ§Ã£o de R$ ${entities.valor} criada com sucesso! JÃ¡ estÃ¡ no histÃ³rico da fazenda.`,
        data: savedTransaction
      };
    } catch (error: any) {
      console.error('[AutomationEngine] Error saving transaction:', error);
      return {
        success: false,
        message: 'Erro ao criar a transaÃ§Ã£o. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleCreateGoal(entities: any, userId: string): Promise<any> {
    console.log('[AutomationEngine] ðŸŽ¯ Processando criaÃ§Ã£o de META');
    console.log('[AutomationEngine] ðŸ“Š Entidades para meta:', JSON.stringify(entities, null, 2));
    
    const valor = entities.valor_total || entities.valor;
    if (!valor || valor <= 0) {
      console.log('[AutomationEngine] âŒ Valor da meta nÃ£o encontrado ou invÃ¡lido');
      return {
        success: false,
        requiresInput: true,
        message: `Para criar uma meta para a fazenda, preciso saber o valor objetivo. Exemplo: "Quero comprar um trator de R$ 150.000". Pode me informar?`,
        missingFields: ['valor_total']
      };
    }

    try {
      // Buscar usuÃ¡rio no Supabase
      const user = await User.findByFirebaseUid(userId);
      if (!user) {
        throw new Error('UsuÃ¡rio nÃ£o encontrado');
      }

      console.log('[AutomationEngine] ðŸ‘¤ UsuÃ¡rio encontrado:', user.id);

      const goalData = {
        user_id: user.id!, // Usar ID do Supabase
        nome_da_meta: entities.nome_da_meta || entities.nome || entities.meta || 'Meta da fazenda',
        descricao: entities.descricao || entities.nome_da_meta || entities.nome || BRAND_TEXT.newGoalLabel,
        valor_total: valor,
        valor_atual: 0,
        categoria: entities.categoria || 'Fazenda',
        data_conclusao: entities.data_conclusao || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        prioridade: entities.prioridade || 'media'
      };

      console.log('[AutomationEngine] ðŸ’¾ Salvando meta no Supabase:', goalData);
      const savedGoal = await Meta.create(goalData);
      console.log('[AutomationEngine] âœ… Meta salva com sucesso:', savedGoal.id);

      return {
        success: true,
        message: `ðŸŽ¯ Meta de R$ ${valor.toFixed(2)} criada com sucesso! JÃ¡ estÃ¡ no planejamento da fazenda.`,
        data: savedGoal
      };
    } catch (error: any) {
      console.error('[AutomationEngine] âŒ Erro ao salvar meta:', error);
      return {
        success: false,
        message: 'Erro ao criar a meta. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleCreateInvestment(entities: any, userId: string): Promise<any> {
    console.log('[AutomationEngine] ðŸ“ˆ Processando criaÃ§Ã£o de INVESTIMENTO');
    console.log('[AutomationEngine] ðŸ“Š Entidades para investimento:', JSON.stringify(entities, null, 2));
    
    if (!entities.valor || entities.valor <= 0) {
      console.log('[AutomationEngine] âŒ Valor do investimento nÃ£o encontrado ou invÃ¡lido');
      return {
        success: false,
        requiresInput: true,
        message: `Para registrar um investimento na fazenda, preciso saber o valor. Exemplo: "Comprei um trator por R$ 150.000". Pode me informar?`,
        missingFields: ['valor']
      };
    }

    try {
      // Buscar usuÃ¡rio no Supabase
      const user = await User.findByFirebaseUid(userId);
      if (!user) {
        throw new Error('UsuÃ¡rio nÃ£o encontrado');
      }

      console.log('[AutomationEngine] ðŸ‘¤ UsuÃ¡rio encontrado:', user.id);

      const investmentData = {
        user_id: user.id!,
        nome: entities.nome || entities.ativo || entities.descricao || 'Investimento rural',
        tipo: entities.tipo || 'Equipamentos',
        valor: parseFloat(entities.valor),
        data: entities.data || new Date().toISOString().split('T')[0],
        instituicao: entities.instituicao || entities.corretora || 'Fazenda'
      };

      console.log('[AutomationEngine] ðŸ’¾ Salvando investimento no Supabase:', investmentData);
      const savedInvestment = await Investimento.create(investmentData);
      console.log('[AutomationEngine] âœ… Investimento salvo com sucesso:', savedInvestment.id);

      return {
        success: true,
        message: `ðŸ“ˆ Investimento de R$ ${entities.valor.toFixed(2)} em ${entities.tipo} registrado com sucesso! JÃ¡ estÃ¡ no patrimÃ´nio da fazenda.`,
        data: savedInvestment
      };
    } catch (error: any) {
      console.error('[AutomationEngine] âŒ Erro ao salvar investimento:', error);
      return {
        success: false,
        message: 'Erro ao registrar o investimento. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleAnalyzeData(entities: any, userId: string): Promise<any> {
    try {
      const user = await User.findByFirebaseUid(userId);
      if (!user) {
        throw new Error('UsuÃ¡rio nÃ£o encontrado');
      }

      const [transacoes, investimentos, metas] = await Promise.all([
        Transacao.findByUserId(user.id!),
        Investimento.findByUserId(user.id!),
        Meta.findByUserId(user.id!)
      ]);

      // AnÃ¡lise especÃ­fica para fazenda
      const analysisData = {
        totalCustos: transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0),
        totalReceitas: transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0),
        saldo: 0,
        categoriaMaisCusto: 'AlimentaÃ§Ã£o',
        tendencia: 'estÃ¡vel',
        investimentoTotal: investimentos.reduce((sum, inv) => sum + inv.valor, 0),
        metasTotal: metas.reduce((sum, meta) => sum + meta.valor_total, 0),
        recomendacoes: [
          'Continue monitorando os custos com raÃ§Ã£o',
          'Considere investir em melhoramento de pastagem',
          'Sua fazenda estÃ¡ com boa performance!'
        ]
      };

      analysisData.saldo = analysisData.totalReceitas - analysisData.totalCustos;

      return {
        success: true,
        message: `ðŸ“Š AnÃ¡lise da fazenda concluÃ­da!\n\nðŸ’° Receitas: R$ ${analysisData.totalReceitas.toLocaleString()}\nðŸ’¸ Custos: R$ ${analysisData.totalCustos.toLocaleString()}\nðŸ“ˆ Saldo: R$ ${analysisData.saldo.toLocaleString()}\n\nðŸŽ¯ Investimentos: R$ ${analysisData.investimentoTotal.toLocaleString()}\n\nâœ¨ RecomendaÃ§Ãµes:\n${analysisData.recomendacoes.map(r => `â€¢ ${r}`).join('\n')}`,
        data: analysisData
      };
    } catch (error: any) {
      console.error('[AutomationEngine] Error analyzing farm data:', error);
      return {
        success: false,
        message: 'Erro ao analisar dados da fazenda.',
        error: error.message
      };
    }
  }

  private async handleCreateAnimal(entities: any, userId: string): Promise<any> {
    try {
      const required = ['brinco', 'raca', 'sexo', 'data_nascimento'];
      const missing = required.filter((k) => !entities[k]);
      if (missing.length) {
        return {
          success: false,
          requiresInput: true,
          message: `Para cadastrar um animal, preciso de: ${required.join(', ')}. Campos faltando: ${missing.join(', ')}.`,
          missingFields: missing
        };
      }

      const user = await User.findByFirebaseUid(userId);
      if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado');

      const animalPayload = {
        brinco: String(entities.brinco),
        raca: String(entities.raca),
        sexo: String(entities.sexo).toLowerCase(),
        data_nascimento: String(entities.data_nascimento),
        peso_nascimento: entities.peso_nascimento ? Number(entities.peso_nascimento) : undefined,
        lote: entities.lote,
        pasto: entities.pasto
      } as any;

      const created = await whilabSupabaseService.createAnimal(user.id!, animalPayload);
      return {
        success: true,
        message: `ðŸ® Animal ${animalPayload.brinco} cadastrado com sucesso!`,
        data: created
      };
    } catch (error: any) {
      console.error('[AutomationEngine] âŒ Erro ao criar animal:', error);
      return {
        success: false,
        message: 'Erro ao cadastrar animal. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleCreateManejo(entities: any, userId: string): Promise<any> {
    try {
      const required = ['animal_id', 'tipo_manejo', 'data_manejo'];
      const missing = required.filter((k) => !entities[k]);
      if (missing.length) {
        return {
          success: false,
          requiresInput: true,
          message: `Para registrar manejo, preciso de: ${required.join(', ')}. Faltando: ${missing.join(', ')}.`,
          missingFields: missing
        };
      }

      const user = await User.findByFirebaseUid(userId);
      if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado');

      const manejoPayload = {
        animal_id: String(entities.animal_id),
        tipo_manejo: String(entities.tipo_manejo),
        data_manejo: String(entities.data_manejo),
        produto_usado: entities.produto_usado,
        dosagem: entities.dosagem,
        observacoes: entities.observacoes,
        custo: entities.custo ? Number(entities.custo) : undefined
      } as any;

      const created = await whilabSupabaseService.createManejo(user.id!, manejoPayload);
      return {
        success: true,
        message: `ðŸ§ª Manejo (${manejoPayload.tipo_manejo}) registrado com sucesso!`,
        data: created
      };
    } catch (error: any) {
      console.error('[AutomationEngine] âŒ Erro ao registrar manejo:', error);
      return {
        success: false,
        message: 'Erro ao registrar manejo. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleCreateVenda(entities: any, userId: string): Promise<any> {
    try {
      const required = ['valor'];
      const missing = required.filter((k) => !entities[k]);
      if (missing.length) {
        return {
          success: false,
          requiresInput: true,
          message: `Para registrar uma venda, preciso do valor (e idealmente animais_ids).`,
          missingFields: missing
        };
      }

      const user = await User.findByFirebaseUid(userId);
      if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado');

      const vendaPayload = {
        valor: Number(entities.valor),
        comprador: entities.comprador || 'Comprador',
        data_venda: entities.data_venda || new Date().toISOString().split('T')[0],
        observacoes: entities.observacoes
      } as any;
      const animaisIds: string[] = Array.isArray(entities.animais_ids) ? entities.animais_ids : [];

      const created = await whilabSupabaseService.createVenda(user.id!, vendaPayload, animaisIds);
      return {
        success: true,
        message: `ðŸ’¸ Venda registrada com sucesso (R$ ${vendaPayload.valor.toFixed(2)}).`,
        data: created
      };
    } catch (error: any) {
      console.error('[AutomationEngine] âŒ Erro ao registrar venda:', error);
      return {
        success: false,
        message: 'Erro ao registrar venda. Tente novamente.',
        error: error.message
      };
    }
  }
}

// ===== CONTROLADOR PRINCIPAL OTIMIZADO ADAPTADO PARA WHILAB =====
export class OptimizedChatbotController {
  private static instance: OptimizedChatbotController;
  private aiService: OptimizedAIService;
  private chatHistoryService: ChatHistoryService;
  private streamingController: StreamingController;
  private automationEngine: AutomationEngine;
  private responseCache = new Map<string, any>();

  private constructor() {
    this.aiService = new OptimizedAIService();
    this.chatHistoryService = new ChatHistoryService();
    this.streamingController = new StreamingController();
    this.automationEngine = new AutomationEngine();
  }

  static getInstance(): OptimizedChatbotController {
    if (!OptimizedChatbotController.instance) {
      OptimizedChatbotController.instance = new OptimizedChatbotController();
    }
    return OptimizedChatbotController.instance;
  }

  // ===== MÃ‰TODO PRINCIPAL OTIMIZADO =====
  async processMessage(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { message, chatId } = req.body;
      const userId = (req as any).user?.uid || 'anonymous';
      
      console.log(`[OptimizedChatbot] ${AI_BRAND.logTag} processing: "${message}" from user: ${userId}`);
      
      // ValidaÃ§Ã£o rÃ¡pida
      if (!message?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Mensagem nÃ£o pode estar vazia'
        });
        return;
      }

      // Obter contexto do usuÃ¡rio (paralelo)
      const [userContext, conversationHistory] = await Promise.all([
        this.getUserContext(userId),
        this.getConversationHistory(chatId, userId)
      ]);

      // Verificar contexto ativo da conversa
      let contextState = null;
      if (chatId) {
        contextState = contextManager.getConversationState(chatId);
        if (contextState) {
          console.log(`[OptimizedChatbot] Active context: ${contextState.currentAction} for ${chatId}`);
          
          // Verificar se Ã© uma confirmaÃ§Ã£o (sim/nÃ£o)
          const isConfirmation = /^(sim|yes|confirmar|confirmo|ok|pode|vai)$/i.test(message.trim());
          const isCancellation = /^(nÃ£o|no|nao|cancelar|cancelo|para)$/i.test(message.trim());
          
          if (isConfirmation && contextState.awaitingConfirmation) {
            console.log(`[OptimizedChatbot] ðŸŽ¯ CONFIRMAÃ‡ÃƒO RECEBIDA - Executando aÃ§Ã£o: ${contextState.currentAction}`);
            
            const automationResult = await this.automationEngine.executeAction(
              contextState.currentAction,
              contextState.entities,
              userId
            );
            
            if (automationResult?.success) {
              contextManager.clearConversationState(chatId);
              
              this.saveMessageToHistory(chatId, userId, message, automationResult.message)
                .catch((error: any) => console.error('[OptimizedChatbot] Error saving to history:', error));
              
              res.status(200).json({
                success: true,
                message: automationResult.message,
                actionExecuted: true,
                data: automationResult.data
              });
              return;
            }
          } else if (isCancellation && contextState.awaitingConfirmation) {
            console.log(`[OptimizedChatbot] âŒ AÃ‡ÃƒO CANCELADA pelo usuÃ¡rio`);
            contextManager.clearConversationState(chatId);
            
            const cancelMessage = 'AÃ§Ã£o cancelada. Como posso ajudar com sua fazenda?';
            this.saveMessageToHistory(chatId, userId, message, cancelMessage)
              .catch((error: any) => console.error('[OptimizedChatbot] Error saving to history:', error));
            
            res.status(200).json({
              success: true,
              message: cancelMessage,
              actionExecuted: false
            });
            return;
          }
        }
      }

      // Gerar resposta com IA otimizada
      const aiResult = await this.aiService.generateResponse(
        userId,
        message,
        conversationHistory,
        userContext
      );

      // Verificar se precisa executar automaÃ§Ã£o
      let automationResult = null;
      let needsConfirmation = false;
      
      if (aiResult.intent && aiResult.confidence && aiResult.confidence > 0.5) {
        console.log(`[OptimizedChatbot] ðŸŽ¯ Intent detectado: ${aiResult.intent} (confianÃ§a: ${aiResult.confidence})`);
        
        // Executar automaticamente (sistema de confirmaÃ§Ã£o desabilitado)
        console.log(`[OptimizedChatbot] ðŸš€ EXECUTANDO AÃ‡ÃƒO AUTOMATICAMENTE: ${aiResult.intent}`);
        
        automationResult = await this.automationEngine.executeAction(
          aiResult.intent,
          aiResult.entities || {},
          userId
        );
        
        console.log(`[OptimizedChatbot] âœ… Resultado da automaÃ§Ã£o:`, JSON.stringify(automationResult, null, 2));
        
        if (automationResult?.success && chatId) {
          contextManager.clearConversationState(chatId);
        }
      }

      // Preparar resposta final
      let finalResponse = aiResult.text;
      let actionExecuted = false;

      if (automationResult?.success) {
        finalResponse = automationResult.message;
        actionExecuted = true;
      } else if (automationResult?.requiresInput) {
        finalResponse = automationResult.message;
      }

      // Salvar no histÃ³rico
      this.saveMessageToHistory(chatId, userId, message, finalResponse)
        .catch((error: any) => console.error('[OptimizedChatbot] Error saving to history:', error));

      // Resposta otimizada
      const response = {
        success: true,
        message: finalResponse,
        messageId: uuidv4(),
        metadata: {
          intent: aiResult.intent,
          confidence: aiResult.confidence,
          responseTime: Date.now() - startTime,
          cached: aiResult.cached,
          actionExecuted,
          automationData: automationResult?.data,
          requiresConfirmation: needsConfirmation,
          entities: aiResult.entities,
          contextActive: contextState?.currentAction || null,
          contextMissingFields: contextState?.missingFields || [],
          actionData: needsConfirmation ? {
            type: aiResult.intent,
            entities: aiResult.entities,
            userId: userId
          } : null
        }
      };

      res.status(200).json(response);

    } catch (error: any) {
      console.error('[OptimizedChatbot] Error processing message:', error);
      
      res.status(500).json({
        success: false,
        message: 'NÃ£o consegui processar isso agora. Tente novamente em instantes ou reformule a pergunta.',
        metadata: {
          responseTime: Date.now() - startTime,
          error: true
        }
      });
    }
  }

  // ===== MÃ‰TODOS DE UTILIDADE =====
  private async getUserContext(userId: string): Promise<any> {
    try {
      const cacheKey = `user_context_${userId}`;
      const cached = this.responseCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 60000) {
        return cached.data;
      }

      // Buscar dados reais do usuÃ¡rio - ADAPTADO PARA SUPABASE
      const user = await User.findByFirebaseUid(userId);
      
      // Buscar dados da fazenda em paralelo
      let animais: any[] = [];
      let manejos: any[] = [];
      let vendas: any[] = [];
      let producao: any[] = [];
      let metas: any[] = [];
      
      if (user?.id) {
        try {
          const [animaisData, manejosData, vendasData, producaoData, metasData] = await Promise.all([
            whilabSupabaseService.getAnimaisByUser(user.id).catch(() => []),
            whilabSupabaseService.getManejosByUser(user.id).catch(() => []),
            whilabSupabaseService.getVendasByUser(user.id).catch(() => []),
            whilabSupabaseService.getProducaoByUser(user.id).catch(() => []),
            whilabSupabaseService.getMetasByUser(user.id).catch(() => [])
          ]);
          animais = animaisData || [];
          manejos = manejosData || [];
          vendas = vendasData || [];
          producao = producaoData || [];
          metas = metasData || [];
        } catch (err) {
          console.error('[OptimizedChatbot] Erro ao buscar dados da fazenda:', err);
        }
      }

      // Calcular resumos
      const totalAnimais = animais.length;
      const animaisAtivos = animais.filter((a: any) => a.status === 'ativo').length;
      const totalManejos = manejos.length;
      const totalVendas = vendas.length;
      const valorTotalVendas = vendas.reduce((acc: number, v: any) => acc + (v.valor || 0), 0);
      const totalProducao = producao.length;
      const producaoLeite = producao.filter((p: any) => p.tipo === 'leite').reduce((acc: number, p: any) => acc + (p.quantidade || 0), 0);

      const userContext = {
        userId,
        firebaseUid: userId,
        subscriptionPlan: user?.subscription_plan || 'fazendeiro',
        fazenda_nome: user?.fazenda_nome || 'Fazenda',
        // Dados do rebanho
        totalAnimais,
        animaisAtivos,
        rebanhoResumo: totalAnimais > 0 ? `${totalAnimais} animais cadastrados (${animaisAtivos} ativos)` : 'Nenhum animal cadastrado',
        // Dados de manejo
        totalManejos,
        manejosResumo: totalManejos > 0 ? `${totalManejos} manejos registrados` : 'Nenhum manejo registrado',
        // Dados de vendas
        totalVendas,
        valorTotalVendas,
        vendasResumo: totalVendas > 0 ? `${totalVendas} vendas (R$ ${valorTotalVendas.toFixed(2)} total)` : 'Nenhuma venda registrada',
        // Dados de produÃ§Ã£o
        totalProducao,
        producaoLeite,
        producaoResumo: totalProducao > 0 ? `${totalProducao} registros de produÃ§Ã£o` : 'Nenhuma produÃ§Ã£o registrada',
        // Metas
        totalMetas: metas.length,
        metasResumo: metas.length > 0 ? `${metas.length} metas cadastradas` : 'Nenhuma meta cadastrada',
        // Contexto completo para IA
        dadosFazenda: {
          animais: animais.slice(0, 10), // Ãšltimos 10 animais
          manejos: manejos.slice(0, 5),  // Ãšltimos 5 manejos
          vendas: vendas.slice(0, 5),    // Ãšltimas 5 vendas
          producao: producao.slice(0, 5), // Ãšltimas 5 produÃ§Ãµes
          metas: metas.slice(0, 5)       // Ãšltimas 5 metas
        },
        ultimaAtividade: new Date().toISOString()
      };

      // Salvar no cache
      this.responseCache.set(cacheKey, {
        data: userContext,
        timestamp: Date.now()
      });

      console.log(`[OptimizedChatbot] ðŸ“Š Contexto carregado: ${totalAnimais} animais, ${totalManejos} manejos, ${totalVendas} vendas, ${totalProducao} produÃ§Ãµes`);

      return userContext;
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error getting user context:', error);
      return { userId };
    }
  }

  private async getConversationHistory(chatId: string, userId?: string): Promise<any[]> {
    if (!chatId) return [];
    
    try {
      const conversation = await this.chatHistoryService.getConversation(chatId, userId);
      return conversation.messages;
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error getting conversation history:', error);
      return [];
    }
  }

  private async saveMessageToHistory(
    chatId: string,
    userId: string,
    userMessage: string,
    botResponse: string
  ): Promise<void> {
    try {
      if (!chatId) return;

      await Promise.all([
        this.chatHistoryService.addMessage({
          chatId,
          sender: 'user',
          content: userMessage,
          timestamp: new Date(),
          userId,
          metadata: {}
        }),
        this.chatHistoryService.addMessage({
          chatId,
          sender: 'assistant',
          content: botResponse,
          timestamp: new Date(),
          userId,
          metadata: { isBot: true }
        })
      ]);
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error saving to history:', error);
    }
  }

  // ===== MÃ‰TODOS PARA COMPATIBILIDADE =====
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid || 'anonymous';
      const conversation = await this.chatHistoryService.startNewConversation(userId);
      
      res.status(200).json({
        success: true,
        chatId: conversation.chatId,
        message: 'Nova sessÃ£o criada com sucesso!'
      });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error creating session:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar nova sessÃ£o'
      });
    }
  }

  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid || 'anonymous';
      const sessions = await this.chatHistoryService.getSessions(userId);
      
      res.status(200).json({
        success: true,
        sessions: sessions.slice(0, 10)
      });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error getting sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar sessÃµes',
        error: error.message
      });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params as { chatId?: string };
      if (!chatId) {
        res.status(400).json({ success: false, message: 'chatId Ã© obrigatÃ³rio' });
        return;
      }

      const deleted = await this.chatHistoryService.deleteConversation(chatId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'SessÃ£o nÃ£o encontrada' });
        return;
      }

      res.status(200).json({ success: true, message: 'SessÃ£o deletada com sucesso', chatId });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error deleting session:', error);
      res.status(500).json({ success: false, message: 'Erro ao deletar sessÃ£o' });
    }
  }

  async deleteAllSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid || 'anonymous';
      const result = await this.chatHistoryService.deleteAllUserConversations(userId);
      res.status(200).json({
        success: true,
        message: 'Todas as sessÃµes do usuÃ¡rio foram deletadas',
        deletedCount: result
      });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error deleting all sessions:', error);
      res.status(500).json({ success: false, message: 'Erro ao deletar todas as sessÃµes' });
    }
  }

  async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.aiService.getCacheStats();
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estatÃ­sticas'
      });
    }
  }

  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      this.aiService.clearCache();
      this.responseCache.clear();
      
      res.status(200).json({
        success: true,
        message: 'Cache limpo com sucesso!'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar cache'
      });
    }
  }

  async streamResponse(req: Request, res: Response): Promise<void> {
    console.log(`[StreamResponse] ðŸš€ INICIANDO ${AI_BRAND.logTag} STREAM RESPONSE`);
    
    try {
      const { message, chatId } = req.method === 'GET' ? req.query : req.body;
      const userId = (req as any).user?.uid || 'anonymous';

      console.log(`[StreamResponse] ðŸ“ Message: "${message}"`);
      console.log(`[StreamResponse] ðŸ‘¤ UserId: ${userId}`);
      console.log(`[StreamResponse] ðŸ’¬ ChatId: ${chatId}`);

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Mensagem Ã© obrigatÃ³ria'
        });
        return;
      }

      // Configurar headers para Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      res.flushHeaders?.();

      // FunÃ§Ã£o para enviar dados via SSE
      const sendSSE = (event: string, data: any) => {
        try {
          const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[SSE] Sending: ${event}`, data);
          } else if (event !== 'chunk') {
            console.log(`[SSE] Sending: ${event}`);
          }
          res.write(eventData);
          res.flush?.();
        } catch (error: any) {
          console.error('[SSE] Error sending data:', error);
        }
      };

      // Enviar evento de conexÃ£o inicial
      sendSSE('connected', { message: BRAND_TEXT.streamStartedMessage });

      const abortController = new AbortController();
      const heartbeat = setInterval(() => {
        sendSSE('heartbeat', {});
      }, 30000);

      const handleClose = () => {
        clearInterval(heartbeat);
        abortController.abort();
      };

      req.on('close', handleClose);
      res.on('close', handleClose);

      try {
        // Obter contexto e histÃ³rico reais
        const realChatId = (chatId as string) || this.generateChatId();
        const [userContext, conversationHistory] = await Promise.all([
          this.getUserContext(userId),
          this.getConversationHistory(realChatId)
        ]);

        const intentResult = this.aiService.analyzeIntent(message as string);

        // Executar automaÃ§Ã£o se necessÃ¡rio
        let automationResult = null;
        if (intentResult.intent && intentResult.confidence && intentResult.confidence > 0.5) {
          console.log(`[OptimizedChatbot] ðŸš€ EXECUTANDO AÃ‡ÃƒO NO STREAMING: ${intentResult.intent} com confianÃ§a: ${intentResult.confidence}`);

          if (realChatId) {
            contextManager.updateConversationState(
              realChatId,
              userId,
              intentResult.intent,
              intentResult.entities || {},
              false
            );
          }

          automationResult = await this.automationEngine.executeAction(
            intentResult.intent,
            intentResult.entities || {},
            userId
          );

          if (automationResult?.success && realChatId) {
            contextManager.clearConversationState(realChatId);
          }
        }

        let totalChunks = 0;
        let finalText = '';

        if (automationResult?.success || automationResult?.requiresInput) {
          finalText = automationResult?.message || '';
          totalChunks = 1;
          sendSSE('chunk', { chunk: finalText, isComplete: false });
        } else {
          finalText = await this.aiService.streamResponse(
            userId,
            message as string,
            (chunk: string) => {
              totalChunks += 1;
              sendSSE('chunk', { chunk, isComplete: false });
            },
            userContext,
            conversationHistory,
            { signal: abortController.signal }
          );
        }

        // Enviar metadados finais
        if (intentResult.confidence && intentResult.confidence > 0.5) {
          const metadataPayload = {
            intent: intentResult.intent,
            entities: intentResult.entities,
            confidence: intentResult.confidence,
            actionExecuted: automationResult?.success || false,
            automationData: automationResult?.data || null,
            requiresInput: automationResult?.requiresInput || false,
            missingFields: automationResult?.missingFields || [],
            requiresConfirmation: false, // SEMPRE FALSE
            actionData: null
          };

          sendSSE('metadata', metadataPayload);
        }

        // Finalizar stream
        sendSSE('complete', {
          success: true,
          totalChunks
        });

        // Salvar no histÃ³rico
        await this.saveMessageToHistory(realChatId, userId, message as string, finalText);

      } catch (error: any) {
        console.error('[OptimizedChatbot] Streaming error:', error);
        sendSSE('error', {
          success: false,
          message: 'Erro ao processar mensagem'
        });
      }

      res.end();

    } catch (error: any) {
      console.error('[OptimizedChatbot] Stream setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao inicializar stream'
      });
    }
  }

  private generateChatId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // MÃ©todo para executar aÃ§Ãµes confirmadas pelo usuÃ¡rio
  async executeConfirmedAction(req: Request, res: Response): Promise<void> {
    try {
      const { actionData, action } = req.body;
      const userId = (req as any).user?.uid;

      if (!userId || !actionData || action !== 'confirm') {
        res.status(400).json({ success: false, message: 'Dados invÃ¡lidos' });
        return;
      }

      console.log(`[ACTION] Executando aÃ§Ã£o confirmada:`, { type: actionData.type, userId });

      let result = null;

      switch (actionData.type) {
        case 'create_goal':
          result = await this.createGoal(actionData.entities, userId);
          break;
        case 'create_transaction':
          result = await this.createTransaction(actionData.entities, userId);
          break;
        case 'create_investment':
          result = await this.createInvestment(actionData.entities, userId);
          break;
        default:
          throw new Error(`Tipo de aÃ§Ã£o nÃ£o suportado: ${actionData.type}`);
      }

      res.json({
        success: true,
        message: 'AÃ§Ã£o executada com sucesso!',
        data: result
      });

    } catch (error: any) {
      console.error('[ACTION] âŒ Erro ao executar aÃ§Ã£o:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao executar aÃ§Ã£o',
        error: error.message
      });
    }
  }

  private async createGoal(entities: any, userId: string) {
    const user = await User.findByFirebaseUid(userId);
    if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado');

    const goalData = {
      user_id: user.id!,
      nome_da_meta: entities.nome_da_meta || entities.descricao || 'Meta da fazenda',
      descricao: entities.descricao || BRAND_TEXT.newGoalLabel,
      valor_total: entities.valor_total || entities.valor || 0,
      valor_atual: entities.valor_atual || 0,
      data_conclusao: entities.data_conclusao || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prioridade: entities.prioridade || 'media',
      categoria: entities.categoria || 'Fazenda'
    };

    const savedGoal = await Meta.create(goalData);
    console.log(`[DB] Meta salva no Supabase:`, savedGoal.id);
    return savedGoal;
  }

  private async createTransaction(entities: any, userId: string) {
    const user = await User.findByFirebaseUid(userId);
    if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado');

    const transactionData = {
      user_id: user.id!,
      descricao: entities.descricao || 'TransaÃ§Ã£o da fazenda',
      valor: entities.valor || 0,
      data: entities.data || new Date().toISOString().split('T')[0],
      categoria: entities.categoria || 'Manejo',
      tipo: entities.tipo || 'despesa',
      conta: entities.conta || 'Principal'
    };

    const savedTransaction = await Transacao.create(transactionData);
    console.log(`[DB] TransaÃ§Ã£o salva no Supabase:`, savedTransaction.id);
    return savedTransaction;
  }

  private async createInvestment(entities: any, userId: string) {
    const user = await User.findByFirebaseUid(userId);
    if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado');

    const investmentData = {
      user_id: user.id!,
      nome: entities.nome || entities.ativo || entities.descricao || 'Investimento rural',
      tipo: entities.tipo || 'Equipamentos',
      valor: parseFloat(entities.valor),
      data: entities.data || new Date().toISOString().split('T')[0],
      instituicao: entities.instituicao || entities.corretora || 'Fazenda'
    };

    const savedInvestment = await Investimento.create(investmentData);
    console.log(`[DB] Investimento salvo no Supabase:`, savedInvestment.id);
    return savedInvestment;
  }
}

// InstÃ¢ncia singleton
const optimizedChatbotController = OptimizedChatbotController.getInstance();

// Exports para compatibilidade com rotas existentes
export const handleChatQuery = optimizedChatbotController.processMessage.bind(optimizedChatbotController);
export const streamChatResponse = optimizedChatbotController.streamResponse.bind(optimizedChatbotController);
export const startNewSession = optimizedChatbotController.createSession.bind(optimizedChatbotController);
export const getSessions = optimizedChatbotController.getSessions.bind(optimizedChatbotController);
export const getCacheStats = optimizedChatbotController.getCacheStats.bind(optimizedChatbotController);
export const clearCache = optimizedChatbotController.clearCache.bind(optimizedChatbotController);
export const deleteSession = optimizedChatbotController.deleteSession.bind(optimizedChatbotController);
export const executeConfirmedAction = optimizedChatbotController.executeConfirmedAction.bind(optimizedChatbotController);
export const deleteAllSessions = optimizedChatbotController.deleteAllSessions.bind(optimizedChatbotController);

export default optimizedChatbotController;

