import { Request, Response } from 'express';
import { User } from '../models/User';
import { Transacao } from '../models/Transacao';
import { Investimento } from '../models/Investimento';
import { Meta } from '../models/Meta';
import { EnterpriseAIEngine } from '../services/EnterpriseAIEngine';
import { v4 as uuidv4 } from 'uuid';
import { contextManager, ConversationState } from '../services/ContextManager';
import { AI_BRAND, BRAND_TEXT } from '../config/aiPrompts';

const aiService = new EnterpriseAIEngine();

// Interfaces para tipos de payload - ADAPTADO PARA WHILAB
interface TransactionPayload {
  valor: number;
  descricao: string;
  tipo: string;
  categoria: string;
  conta: string;
  data: string;
}

interface InvestmentPayload {
  nome: string;
  valor: number;
  tipo: string;
  data: string;
  instituicao?: string;
}

interface GoalPayload {
  nome_da_meta: string;
  descricao?: string;
  valor_total: number;
  data_conclusao: string;
  categoria: string;
}

interface AnalysisPayload {
  analysisType: string;
}

interface ReportPayload {
  reportType: string;
}

interface DetectedAction {
  type: 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT' | 'CREATE_GOAL' | 'ANALYZE_DATA' | 'GENERATE_REPORT' | 'UNKNOWN';
  payload: TransactionPayload | InvestmentPayload | GoalPayload | AnalysisPayload | ReportPayload | {};
  confidence: number;
  requiresConfirmation: boolean;
  successMessage: string;
  errorMessage: string;
  response: string;
  followUpQuestions?: string[];
}

// Cache para intents detectados
const intentCache = new Map<string, DetectedAction>();

// FunÃ§Ã£o para detectar intenÃ§Ã£o do usuÃ¡rio (OTIMIZADA) - ADAPTADO PARA WHILAB
interface UserContext {
  name: string;
  subscriptionPlan: string;
  userId?: string;
  [key: string]: any;
}

export async function detectUserIntent(message: string, userContext: UserContext, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    // 1. âš¡ Verificar cache primeiro (0.1ms)
    const cacheKey = `${message}_${userContext.name}_${userContext.subscriptionPlan}`;
    const cachedIntent = intentCache.get(cacheKey);
    if (cachedIntent) {
      return cachedIntent;
    }

    // 2. ðŸ†• VERIFICAR CONTEXTO ATIVO DA CONVERSA (OTIMIZADO)
    const chatId = conversationHistory?.[0]?.chatId;
    let contextIntent = null;
    
    if (chatId) {
      // âš¡ OTIMIZAÃ‡ÃƒO: ContextManager lookup mais rÃ¡pido
      const activeState = contextManager.getConversationState(chatId);
      if (activeState?.currentAction) {
        console.log(`[ContextManager] Active context found: ${activeState.currentAction} for ${chatId}`);
        
        // âš¡ OTIMIZAÃ‡ÃƒO: AnÃ¡lise local mais rÃ¡pida
        contextIntent = tryCompleteFromContext(message, activeState);
        if (contextIntent) {
          console.log(`[ContextManager] Completed action from context: ${contextIntent.type}`);
          // âš¡ OTIMIZAÃ‡ÃƒO: Atualizar contexto assincronamente
          setImmediate(() => {
            contextManager.updateConversationState(
              chatId,
              userContext.userId || 'anonymous',
              contextIntent.type,
              contextIntent.payload,
              contextIntent.requiresConfirmation
            );
          });
          return contextIntent;
        }
      }
    }

    // 3. âš¡ DetecÃ§Ã£o rÃ¡pida por palavras-chave (0.2ms) - ADAPTADO PARA PECUÃRIA
    const quickIntent = detectQuickIntent(message);
    if (quickIntent && quickIntent.confidence > 0.8) {
      // ðŸ†• ATUALIZAR CONTEXTO se nova aÃ§Ã£o detectada (ASSÃNCRONO)
      if (chatId) {
        setImmediate(() => {
          contextManager.updateConversationState(
            chatId, 
            userContext.userId || 'anonymous',
            quickIntent.type,
            quickIntent.payload,
            quickIntent.requiresConfirmation
          );
        });
      }
      
      intentCache.set(cacheKey, quickIntent);
      return quickIntent;
    }

    // 4. âš¡ AnÃ¡lise de contexto da conversa (0.3ms)
    const contextIntent2 = analyzeConversationContext(message, conversationHistory);
    if (contextIntent2 && contextIntent2.confidence > 0.7) {
      // ðŸ†• ATUALIZAR CONTEXTO se aÃ§Ã£o detectada do contexto (ASSÃNCRONO)
      if (chatId) {
        setImmediate(() => {
          contextManager.updateConversationState(
            chatId,
            userContext.userId || 'anonymous',
            contextIntent2.type,
            contextIntent2.payload,
            contextIntent2.requiresConfirmation
          );
        });
      }
      
      intentCache.set(cacheKey, contextIntent2);
      return contextIntent2;
    }

    // 5. âš¡ AnÃ¡lise completa com IA (0.5ms)
    const fullIntent = await detectFullIntent(message, userContext, conversationHistory);
    if (fullIntent) {
      // ðŸ†• ATUALIZAR CONTEXTO se aÃ§Ã£o detectada pela IA (ASSÃNCRONO)
      if (chatId) {
        setImmediate(() => {
          contextManager.updateConversationState(
            chatId,
            userContext.userId || 'anonymous',
            fullIntent.type,
            fullIntent.payload,
            fullIntent.requiresConfirmation
          );
        });
      }
      
      intentCache.set(cacheKey, fullIntent);
      return fullIntent;
    }

    // 6. âš¡ Resposta padrÃ£o - ADAPTADO PARA WHILAB
    const defaultIntent: DetectedAction = {
      type: 'UNKNOWN',
      payload: {},
      confidence: 0.0,
      requiresConfirmation: false,
      successMessage: '',
      errorMessage: '',
      response: BRAND_TEXT.welcomeMessage
    };
    intentCache.set(cacheKey, defaultIntent);
    return defaultIntent;
  } catch (error) {
    console.error('Erro ao detectar intenÃ§Ã£o:', error);
    return null;
  }
}

// âš¡ DETECÃ‡ÃƒO RÃPIDA POR PALAVRAS-CHAVE - ADAPTADO PARA PECUÃRIA
function detectQuickIntent(message: string): DetectedAction | null {
  const lowerMessage = message.toLowerCase();

  // Detectar criaÃ§Ã£o de transaÃ§Ã£o (mantÃ©m lÃ³gica financeira para custos da fazenda)
  if (lowerMessage.includes('criar transaÃ§Ã£o') || lowerMessage.includes('nova transaÃ§Ã£o') || 
      lowerMessage.includes('registrar transaÃ§Ã£o') || lowerMessage.includes('add transaÃ§Ã£o') ||
      lowerMessage.includes('gastei') || lowerMessage.includes('recebi') || lowerMessage.includes('paguei') ||
      lowerMessage.includes('comprei') || lowerMessage.includes('custo') || lowerMessage.includes('despesa')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair descriÃ§Ã£o se mencionado - ADAPTADO PARA PECUÃRIA
    let descricao = 'Despesa da fazenda';
    if (lowerMessage.includes('raÃ§Ã£o') || lowerMessage.includes('racao')) descricao = 'RaÃ§Ã£o';
    if (lowerMessage.includes('vacina') || lowerMessage.includes('vacinaÃ§Ã£o')) descricao = 'VacinaÃ§Ã£o';
    if (lowerMessage.includes('vermÃ­fugo') || lowerMessage.includes('vermifugo')) descricao = 'VermÃ­fugo';
    if (lowerMessage.includes('sal mineral')) descricao = 'Sal mineral';
    if (lowerMessage.includes('veterinÃ¡rio') || lowerMessage.includes('veterinario')) descricao = 'VeterinÃ¡rio';
    if (lowerMessage.includes('venda') || lowerMessage.includes('vendeu')) descricao = 'Venda de animais';

    return {
      type: 'CREATE_TRANSACTION',
      payload: {
        valor: valor || 0,
        descricao: descricao,
        tipo: lowerMessage.includes('recebi') || lowerMessage.includes('venda') ? 'receita' : 'despesa',
        categoria: lowerMessage.includes('raÃ§Ã£o') ? 'AlimentaÃ§Ã£o' : 
                  lowerMessage.includes('vacina') || lowerMessage.includes('veterinÃ¡rio') ? 'SaÃºde Animal' :
                  lowerMessage.includes('venda') ? 'Vendas' : 'Manejo',
        conta: 'Principal',
        data: new Date().toISOString().split('T')[0]
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `âœ… TransaÃ§Ã£o de R$ ${valor.toFixed(2)} criada com sucesso!` : 
        'Qual o valor da transaÃ§Ã£o?',
      errorMessage: 'Erro ao criar transaÃ§Ã£o',
      response: valor ? 
        `Perfeito! TransaÃ§Ã£o de R$ ${valor.toFixed(2)} registrada.` : 
        'Qual o valor da transaÃ§Ã£o?'
    };
  }

  // Detectar criaÃ§Ã£o de meta - ADAPTADO PARA METAS PECUÃRIAS
  if (lowerMessage.includes('criar meta') || lowerMessage.includes('nova meta') || 
      lowerMessage.includes('quero criar uma meta') || lowerMessage.includes('juntar dinheiro') ||
      lowerMessage.includes('economizar para') || lowerMessage.includes('meta de') ||
      lowerMessage.includes('objetivo') || lowerMessage.includes('planejar')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    let valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair meta se mencionado - ADAPTADO PARA PECUÃRIA
    let meta = 'Meta da fazenda';
    if (lowerMessage.includes('trator') || lowerMessage.includes('mÃ¡quina')) meta = 'Equipamento agrÃ­cola';
    if (lowerMessage.includes('pasto') || lowerMessage.includes('pastagem')) meta = 'Melhoria de pastagem';
    if (lowerMessage.includes('curral') || lowerMessage.includes('instalaÃ§Ã£o')) meta = 'Infraestrutura';
    if (lowerMessage.includes('reprodutor') || lowerMessage.includes('touro')) meta = 'Melhoramento genÃ©tico';
    if (lowerMessage.includes('expansÃ£o') || lowerMessage.includes('crescimento')) meta = 'ExpansÃ£o do rebanho';

    return {
      type: 'CREATE_GOAL',
      payload: {
        nome_da_meta: meta,
        descricao: `Meta para ${meta.toLowerCase()}`,
        valor_total: valor || 0,
        data_conclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        categoria: 'Fazenda'
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `ðŸŽ¯ Meta "${meta}" de R$ ${valor.toFixed(2)} criada com sucesso!` : 
        'Qual valor vocÃª quer investir nessa meta?',
      errorMessage: 'Erro ao criar meta',
      response: valor ? 
        `Perfeito! Meta "${meta}" de R$ ${valor.toFixed(2)} criada.` : 
        'Qual valor vocÃª quer investir nessa meta?'
    };
  }

  // Detectar criaÃ§Ã£o de investimento - ADAPTADO PARA INVESTIMENTOS RURAIS
  if (lowerMessage.includes('criar investimento') || lowerMessage.includes('novo investimento') || 
      lowerMessage.includes('quero investir') || lowerMessage.includes('aplicar dinheiro') ||
      lowerMessage.includes('investi') || lowerMessage.includes('investimento de') ||
      lowerMessage.includes('comprei') || lowerMessage.includes('adquiri')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair nome se mencionado - ADAPTADO PARA PECUÃRIA
    let nome = 'Investimento rural';
    if (lowerMessage.includes('gado') || lowerMessage.includes('animal')) nome = 'AquisiÃ§Ã£o de gado';
    if (lowerMessage.includes('terra') || lowerMessage.includes('hectare')) nome = 'AquisiÃ§Ã£o de terra';
    if (lowerMessage.includes('trator') || lowerMessage.includes('equipamento')) nome = 'Equipamentos';
    if (lowerMessage.includes('semente') || lowerMessage.includes('insumo')) nome = 'Insumos agrÃ­colas';
    if (lowerMessage.includes('cerca') || lowerMessage.includes('infraestrutura')) nome = 'Infraestrutura';

    return {
      type: 'CREATE_INVESTMENT',
      payload: {
        nome: nome,
        valor: valor || 0,
        tipo: lowerMessage.includes('gado') ? 'Rebanho' : 
              lowerMessage.includes('terra') ? 'ImÃ³vel Rural' : 
              lowerMessage.includes('trator') ? 'Equipamentos' : 
              lowerMessage.includes('insumo') ? 'Insumos' : 'Infraestrutura',
        data: new Date().toISOString().split('T')[0],
        instituicao: 'Fazenda'
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `ðŸ“ˆ Investimento "${nome}" de R$ ${valor.toFixed(2)} criado com sucesso!` : 
        'Qual valor vocÃª investiu?',
      errorMessage: 'Erro ao criar investimento',
      response: valor ? 
        `Perfeito! Investimento "${nome}" de R$ ${valor.toFixed(2)} registrado.` : 
        'Qual valor vocÃª investiu?'
    };
  }

  return null;
}

// âš¡ ANÃLISE DE CONTEXTO DA CONVERSA
function analyzeConversationContext(message: string, conversationHistory?: any[]): DetectedAction | null {
  if (!conversationHistory || conversationHistory.length === 0) return null;
  
  const lowerMessage = message.toLowerCase();
  const recentMessages = conversationHistory.slice(-3);
  
  // Verificar se Ã© continuaÃ§Ã£o de uma transaÃ§Ã£o
  if (lowerMessage.includes('valor') || lowerMessage.includes('reais') || lowerMessage.includes('Ã© uma despesa')) {
    const transactionContext = recentMessages.find((msg: any) => 
      msg.content.toLowerCase().includes('transaÃ§Ã£o') || 
      msg.content.toLowerCase().includes('gastei') || 
      msg.content.toLowerCase().includes('recebi')
    );
    
    if (transactionContext) {
      const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
      const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;

      return {
        type: 'CREATE_TRANSACTION',
        payload: {
          valor: valor || 0,
          descricao: 'TransaÃ§Ã£o da fazenda',
          tipo: lowerMessage.includes('despesa') ? 'despesa' : 'receita',
          categoria: 'Manejo',
          conta: 'Principal',
          data: new Date().toISOString().split('T')[0]
        },
        confidence: valor ? 0.8 : 0.6,
        requiresConfirmation: !valor,
        successMessage: 'TransaÃ§Ã£o criada com sucesso!',
        errorMessage: 'Erro ao criar transaÃ§Ã£o',
        response: valor ? 
          `Perfeito! TransaÃ§Ã£o de R$ ${valor.toFixed(2)} registrada. O que foi essa transaÃ§Ã£o?` : 
          'Qual o valor da transaÃ§Ã£o?'
      };
    }
  }
  
  return null;
}

// âš¡ ANÃLISE COMPLETA COM IA - ADAPTADO PARA WHILAB
async function detectFullIntent(message: string, userContext: UserContext, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    // Analisar contexto da conversa para entender melhor
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      conversationContext = `\n\nContexto da conversa recente:\n${recentMessages.map((msg: any, index: number) => 
        `${index + 1}. ${msg.sender === 'user' ? 'UsuÃ¡rio' : AI_BRAND.assistantName}: ${msg.content}`
      ).join('\n')}`;
    }

    const prompt = `Contexto do usuÃ¡rio pecuarista:
- Nome: ${userContext.name}
- Plano: ${userContext.subscriptionPlan}
- TransaÃ§Ãµes: ${userContext.totalTransacoes}
- Investimentos: ${userContext.totalInvestimentos}
- Metas: ${userContext.totalMetas}${conversationContext}
Mensagem do usuÃ¡rio: "${message}"

IMPORTANTE: VocÃª Ã© ${AI_BRAND.assistantName}, assistente especializado em pecuÃ¡ria. Analise se o usuÃ¡rio quer:
- Registrar custos da fazenda (raÃ§Ã£o, vacinas, veterinÃ¡rio, etc.)
- Criar metas para a fazenda (equipamentos, expansÃ£o, melhoramento)
- Registrar investimentos rurais (gado, terra, equipamentos)
- Analisar dados da propriedade
- Gerar relatÃ³rios

Analise a mensagem e retorne um JSON com:
- intent: tipo de aÃ§Ã£o (CREATE_TRANSACTION, CREATE_INVESTMENT, CREATE_GOAL, ANALYZE_DATA, GENERATE_REPORT, UNKNOWN)
- entities: dados extraÃ­dos (valor, descriÃ§Ã£o, categoria, prazo, etc.)
- confidence: confianÃ§a da detecÃ§Ã£o (0.0 a 1.0)
- response: resposta natural como ${AI_BRAND.assistantName}
- requiresConfirmation: se precisa confirmaÃ§Ã£o
JSON:`;

    const actionResult = await aiService.processEnterpriseRequest('automated_user', message, { type: 'automation_detection' });

    // Extract intent from actions array or reasoning
    const detectedAction = actionResult.actions?.[0] || {};
    const intent = detectedAction.type || detectedAction.intent || 'UNKNOWN';
    const entities = detectedAction.data || detectedAction.payload || {};
    const requiresConfirmation = detectedAction.requiresConfirmation || false;

    if (!actionResult || intent === 'UNKNOWN') {
      return {
        type: 'UNKNOWN',
        payload: {},
        confidence: actionResult?.confidence || 0.0,
        requiresConfirmation: false,
        successMessage: '',
        errorMessage: '',
        response: actionResult?.response || BRAND_TEXT.welcomeMessage
      };
    }

    return {
      type: intent as any,
      payload: entities || {},
      confidence: actionResult.confidence || 0.0,
      requiresConfirmation: requiresConfirmation,
      successMessage: '',
      errorMessage: '',
      response: actionResult.response || 'Entendi sua solicitaÃ§Ã£o. Como posso ajudar?'
    };
  } catch (error) {
    console.error('Erro na anÃ¡lise com IA:', error);
    return null;
  }
}

// FunÃ§Ã£o auxiliar para verificar se os dados necessÃ¡rios para a aÃ§Ã£o foram completos
function hasCompleteData(action: DetectedAction): boolean {
  const payload = action.payload as any;
  switch (action.type) {
    case 'CREATE_TRANSACTION':
      return payload.valor && payload.valor > 0;
    case 'CREATE_INVESTMENT':
      return payload.valor && payload.valor > 0;
    case 'CREATE_GOAL':
      return payload.valor_total && payload.valor_total > 0;
    case 'GENERATE_REPORT':
    case 'ANALYZE_DATA':
      return true;
    default:
      return false;
  }
}

// Type guards for validation
function isValidTransactionData(action: DetectedAction): action is DetectedAction & { payload: TransactionPayload } {
  const payload = action.payload as any;
  return action.type === 'CREATE_TRANSACTION' && payload.valor && payload.valor > 0 && payload.descricao;
}

function isValidInvestmentData(action: DetectedAction): action is DetectedAction & { payload: InvestmentPayload } {
  const payload = action.payload as any;
  return action.type === 'CREATE_INVESTMENT' && payload.valor && payload.valor > 0 && payload.nome && payload.tipo;
}

function isValidGoalData(action: DetectedAction): action is DetectedAction & { payload: GoalPayload } {
  const payload = action.payload as any;
  return action.type === 'CREATE_GOAL' && payload.valor_total && payload.valor_total > 0 && payload.nome_da_meta;
}

function isValidAnalysisData(action: DetectedAction): action is DetectedAction & { payload: AnalysisPayload } {
  return action.type === 'ANALYZE_DATA';
}

function isValidReportData(action: DetectedAction): action is DetectedAction & { payload: ReportPayload } {
  return action.type === 'GENERATE_REPORT';
}

// ===== FUNÃ‡ÃƒO PARA COMPLETAR AÃ‡ÃƒO DO CONTEXTO =====
function tryCompleteFromContext(message: string, activeState: ConversationState): DetectedAction | null {
  const lowerMessage = message.toLowerCase();
  
  // Se nÃ£o hÃ¡ aÃ§Ã£o ativa, nÃ£o pode completar
  if (!activeState.currentAction) return null;
  
  // Tentar extrair entidades da mensagem atual
  const extractedEntities = extractEntitiesFromMessage(message, activeState.currentAction);
  
  // Se extraiu algo Ãºtil, completar a aÃ§Ã£o
  if (Object.keys(extractedEntities).length > 0) {
    // Mesclar com entidades existentes
    const mergedEntities = { ...activeState.pendingEntities, ...extractedEntities };
    
    // Verificar se aÃ§Ã£o estÃ¡ completa
    const isComplete = isActionComplete(activeState.currentAction, mergedEntities);
    
    return {
      type: activeState.currentAction as any,
      payload: mergedEntities,
      confidence: isComplete ? 0.95 : 0.8,
      requiresConfirmation: !isComplete,
      successMessage: generateSuccessMessage(activeState.currentAction, mergedEntities),
      errorMessage: 'Erro ao completar aÃ§Ã£o',
      response: generateContextResponse(activeState.currentAction, mergedEntities, isComplete)
    };
  }
  
  return null;
}

function extractEntitiesFromMessage(message: string, actionType: string): any {
  const entities: any = {};
  const lowerMessage = message.toLowerCase();

  // PadrÃµes de data mais robustos
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
    /(hoje|amanhÃ£|ontem)/gi,
    /(prÃ³xim[ao]|prÃ³xim[ao]s?)\s+(semana|mÃªs|ano)/gi,
    /(janeiro|fevereiro|marÃ§o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/gi
  ];

  // PadrÃµes de valor mais robustos
  const valorPatterns = [
    /r?\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/gi,
    /(\d+(?:[.,]\d+)?)\s*(?:reais?|mil|k)/gi,
    /(\d+(?:[.,]\d+)?)\s*(?:milhÃµes?|mi)/gi
  ];

  switch (actionType) {
    case 'CREATE_GOAL':
      // Extrair valor com padrÃµes mais robustos
      for (const pattern of valorPatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          let valor = match[1].replace(/\./g, '').replace(',', '.');
          if (lowerMessage.includes('mil') || lowerMessage.includes('k')) {
            valor = (parseFloat(valor) * 1000).toString();
          } else if (lowerMessage.includes('milhÃµes') || lowerMessage.includes('mi')) {
            valor = (parseFloat(valor) * 1000000).toString();
          }
          entities.valor_total = parseFloat(valor);
          break;
        }
      }
      
      // Extrair metas com mais categorias - ADAPTADO PARA PECUÃRIA
      const goalKeywords = {
        'equipamento': ['trator', 'mÃ¡quina', 'equipamento', 'implemento'],
        'infraestrutura': ['curral', 'cerca', 'instalaÃ§Ã£o', 'galpÃ£o', 'bebedouro'],
        'pastagem': ['pasto', 'pastagem', 'capim', 'forragem'],
        'genÃ©tica': ['reprodutor', 'touro', 'matriz', 'melhoramento', 'genÃ©tica'],
        'expansÃ£o': ['expansÃ£o', 'crescimento', 'aumento', 'ampliar'],
        'tecnologia': ['software', 'sistema', 'tecnologia', 'automaÃ§Ã£o']
      };

      for (const [category, keywords] of Object.entries(goalKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          entities.nome_da_meta = category.charAt(0).toUpperCase() + category.slice(1);
          entities.categoria = category;
          break;
        }
      }

      // Extrair data de conclusÃ£o
      for (const pattern of datePatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          entities.data_conclusao = match[0];
          break;
        }
      }
      break;
      
    case 'CREATE_INVESTMENT':
      // Extrair valor com padrÃµes mais robustos
      for (const pattern of valorPatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          let valor = match[1].replace(/\./g, '').replace(',', '.');
          entities.valor = parseFloat(valor);
          break;
        }
      }
      
      // Tipos de investimento expandidos - ADAPTADO PARA PECUÃRIA
      const investmentTypes = {
        'Rebanho': ['gado', 'animal', 'boi', 'vaca', 'bezerro', 'novilho'],
        'ImÃ³vel Rural': ['terra', 'hectare', 'propriedade', 'fazenda', 'sÃ­tio'],
        'Equipamentos': ['trator', 'mÃ¡quina', 'equipamento', 'implemento'],
        'Infraestrutura': ['curral', 'cerca', 'galpÃ£o', 'instalaÃ§Ã£o'],
        'Insumos': ['raÃ§Ã£o', 'vacina', 'vermÃ­fugo', 'sal', 'semente'],
        'Tecnologia': ['software', 'sistema', 'sensor', 'automaÃ§Ã£o']
      };

      for (const [type, keywords] of Object.entries(investmentTypes)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          entities.tipo = type;
          break;
        }
      }

      // Extrair data
      for (const pattern of datePatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          entities.data = match[0];
          break;
        }
      }
      break;

    case 'CREATE_TRANSACTION':
      // Extrair valor
      for (const pattern of valorPatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          let valor = match[1].replace(/\./g, '').replace(',', '.');
          entities.valor = parseFloat(valor);
          break;
        }
      }

      // Categorias de transaÃ§Ã£o - ADAPTADO PARA PECUÃRIA
      const categories = {
        'AlimentaÃ§Ã£o': ['raÃ§Ã£o', 'racao', 'sal', 'mineral', 'suplemento', 'milho', 'soja'],
        'SaÃºde Animal': ['vacina', 'vacinaÃ§Ã£o', 'vermÃ­fugo', 'medicamento', 'veterinÃ¡rio'],
        'Manejo': ['manejo', 'castraÃ§Ã£o', 'marcaÃ§Ã£o', 'pesagem', 'separaÃ§Ã£o'],
        'Infraestrutura': ['cerca', 'curral', 'bebedouro', 'cocho', 'porteira'],
        'Equipamentos': ['trator', 'mÃ¡quina', 'implemento', 'ferramenta'],
        'Vendas': ['venda', 'vendeu', 'frigorÃ­fico', 'leilÃ£o', 'comercializaÃ§Ã£o'],
        'CombustÃ­vel': ['diesel', 'gasolina', 'combustÃ­vel', 'Ã³leo']
      };

      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          entities.categoria = category;
          break;
        }
      }

      // Tipo de transaÃ§Ã£o
      const expenseKeywords = ['gastei', 'paguei', 'comprei', 'despesa', 'custo'];
      const incomeKeywords = ['recebi', 'ganhei', 'venda', 'vendeu', 'renda'];
      
      if (expenseKeywords.some(keyword => lowerMessage.includes(keyword))) {
        entities.tipo = 'despesa';
      } else if (incomeKeywords.some(keyword => lowerMessage.includes(keyword))) {
        entities.tipo = 'receita';
      }

      // Extrair data
      for (const pattern of datePatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          entities.data = match[0];
          break;
        }
      }
      break;
  }

  return entities;
}

function isActionComplete(actionType: string, entities: any): boolean {
  const requiredFields = getRequiredFieldsForAction(actionType);
  return requiredFields.every(field => entities[field] !== undefined && entities[field] !== null);
}

function getRequiredFieldsForAction(actionType: string): string[] {
  const requirements: { [key: string]: string[] } = {
    'CREATE_GOAL': ['valor_total', 'nome_da_meta'],
    'CREATE_INVESTMENT': ['valor', 'nome'],
    'CREATE_TRANSACTION': ['valor']
  };
  
  return requirements[actionType] || [];
}

function generateSuccessMessage(actionType: string, entities: any): string {
  switch (actionType) {
    case 'CREATE_GOAL':
      return `ðŸŽ¯ Meta "${entities.nome_da_meta}" de R$ ${entities.valor_total} criada com sucesso!`;
    case 'CREATE_INVESTMENT':
      return `ðŸ“ˆ Investimento de R$ ${entities.valor} criado com sucesso!`;
    default:
      return 'AÃ§Ã£o executada com sucesso!';
  }
}

function generateContextResponse(actionType: string, entities: any, isComplete: boolean): string {
  if (isComplete) {
    return generateSuccessMessage(actionType, entities);
  }
  
  // Gerar resposta pedindo campos faltantes
  const missingFields = getRequiredFieldsForAction(actionType).filter(field => !entities[field]);
  
  switch (actionType) {
    case 'CREATE_GOAL':
      if (!entities.nome_da_meta) return 'Qual Ã© o objetivo da sua meta? (ex: comprar trator, melhorar pasto)';
      if (!entities.valor_total) return 'Qual o valor total que vocÃª quer investir?';
      break;
    case 'CREATE_INVESTMENT':
      if (!entities.valor) return 'Qual o valor do investimento?';
      if (!entities.nome) return 'Em que vocÃª investiu? (ex: gado, equipamento)';
      break;
  }
  
  return 'Preciso de mais informaÃ§Ãµes para completar essa aÃ§Ã£o.';
}

// âš¡ Controller principal para aÃ§Ãµes automatizadas - ADAPTADO PARA SUPABASE
export const processAutomatedAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const { message, chatId, context } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'UsuÃ¡rio nÃ£o autenticado' });
      return;
    }

    if (!message) {
      res.status(400).json({ success: false, message: 'Mensagem Ã© obrigatÃ³ria' });
      return;
    }

    // Buscar dados do usuÃ¡rio - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'UsuÃ¡rio nÃ£o encontrado' });
      return;
    }

    // Buscar dados financeiros do usuÃ¡rio - ADAPTADO PARA SUPABASE
    const [transacoes, investimentos, metas] = await Promise.all([
      Transacao.findByUserId(user.id!),
      Investimento.findByUserId(user.id!),
      Meta.findByUserId(user.id!)
    ]);

    const userContext = {
      name: user.display_name || 'Fazendeiro',
      email: user.email || '',
      subscriptionPlan: user.subscription_plan || 'fazendeiro',
      subscriptionStatus: user.subscription_status || 'active',
      hasTransactions: transacoes.length > 0,
      hasInvestments: investimentos.length > 0,
      hasGoals: metas.length > 0,
      totalTransacoes: transacoes.length,
      totalInvestimentos: investimentos.length,
      totalMetas: metas.length
    };

    // Detectar aÃ§Ã£o automatizada
    const detectedAction = await detectUserIntent(message, userContext);

    if (detectedAction && detectedAction.confidence && detectedAction.confidence > 0.1) {
      // Se for UNKNOWN, retornar resposta conversacional
      if (detectedAction.type === 'UNKNOWN') {
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.response || BRAND_TEXT.welcomeMessage,
          messageId: uuidv4()
        });
        return;
      }

      // Verificar se tem dados suficientes
      if (!hasCompleteData(detectedAction)) {
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.response || 'Preciso de mais detalhes para criar isso. Pode me informar os valores?',
          messageId: uuidv4()
        });
        return;
      }

      // Executar aÃ§Ã£o automaticamente
      try {
        let result;
        switch (detectedAction.type) {
          case 'CREATE_TRANSACTION':
            if (isValidTransactionData(detectedAction)) {
              result = await createTransaction(user.firebase_uid, detectedAction.payload);
            }
            break;
          case 'CREATE_INVESTMENT':
            if (isValidInvestmentData(detectedAction)) {
              result = await createInvestment(user.firebase_uid, detectedAction.payload);
            }
            break;
          case 'CREATE_GOAL':
            if (isValidGoalData(detectedAction)) {
              result = await createGoal(user.firebase_uid, detectedAction.payload);
            }
            break;
          case 'ANALYZE_DATA':
            if (isValidAnalysisData(detectedAction)) {
              result = await analyzeData(user.firebase_uid, detectedAction.payload);
            }
            break;
          case 'GENERATE_REPORT':
            if (isValidReportData(detectedAction)) {
              result = await generateReport(user.firebase_uid, detectedAction.payload);
            }
            break;
          default:
            throw new Error('AÃ§Ã£o nÃ£o suportada');
        }

        res.status(200).json({
          success: true,
          type: 'ACTION_EXECUTED',
          text: detectedAction.successMessage || 'AÃ§Ã£o executada com sucesso!',
          data: result,
          messageId: uuidv4()
        });
        return;
      } catch (error) {
        console.error('Erro ao executar aÃ§Ã£o:', error);
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.errorMessage || 'Desculpe, nÃ£o consegui executar essa aÃ§Ã£o. Pode tentar novamente?',
          messageId: uuidv4()
        });
        return;
      }
    } else {
      // Fallback para resposta simples
      res.status(200).json({
        success: true,
        type: 'TEXT_RESPONSE',
        text: BRAND_TEXT.welcomeMessage,
        messageId: uuidv4()
      });
      return;
    }
  } catch (error) {
    console.error('Erro ao processar aÃ§Ã£o automatizada:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar solicitaÃ§Ã£o' 
    });
    return;
  }
};

// FunÃ§Ãµes auxiliares para executar aÃ§Ãµes - ADAPTADAS PARA SUPABASE
export async function createTransaction(userId: string, payload: TransactionPayload): Promise<any> {
  try {
    // Buscar usuÃ¡rio pelo firebaseUid - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      throw new Error('UsuÃ¡rio nÃ£o encontrado');
    }

      const transactionData = {
        user_id: user.id!, // Usar ID do Supabase
        valor: payload.valor || 0,
        descricao: payload.descricao || 'TransaÃ§Ã£o da fazenda',
        tipo: (payload.tipo as 'receita' | 'despesa' | 'transferencia') || 'despesa',
        categoria: payload.categoria || 'Manejo',
        conta: payload.conta || 'Principal',
        data: payload.data || new Date().toISOString().split('T')[0]
      };

    console.log('[CreateTransaction] Criando transaÃ§Ã£o:', transactionData);
    const result = await Transacao.create(transactionData);
    console.log('[CreateTransaction] TransaÃ§Ã£o criada rapidamente:', result.id);
    return result;
  } catch (error) {
    console.error('[CreateTransaction] Erro ao criar transaÃ§Ã£o:', error);
    throw error;
  }
}

export async function createInvestment(userId: string, payload: InvestmentPayload): Promise<any> {
  try {
    // Buscar usuÃ¡rio pelo firebaseUid - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      throw new Error('UsuÃ¡rio nÃ£o encontrado');
    }

    const investmentData = {
      user_id: user.id!, // Usar ID do Supabase
      nome: payload.nome || 'Investimento rural',
      valor: payload.valor || 0,
      tipo: payload.tipo || 'Infraestrutura',
      data: payload.data || new Date().toISOString().split('T')[0],
      instituicao: payload.instituicao || 'Fazenda'
    };

    console.log('[CreateInvestment] Criando investimento:', investmentData);
    const result = await Investimento.create(investmentData);
    console.log('[CreateInvestment] Investimento criado com sucesso:', result.id);
    return result;
  } catch (error) {
    console.error('[CreateInvestment] Erro ao criar investimento:', error);
    throw error;
  }
}

export async function createGoal(userId: string, payload: GoalPayload): Promise<any> {
  try {
    // Buscar usuÃ¡rio pelo firebaseUid - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      throw new Error('UsuÃ¡rio nÃ£o encontrado');
    }

    const goalData = {
      user_id: user.id!, // Usar ID do Supabase
      nome_da_meta: payload.nome_da_meta || 'Meta da fazenda',
      descricao: payload.descricao || payload.nome_da_meta || 'Meta da fazenda',
      valor_total: payload.valor_total || 0,
      data_conclusao: payload.data_conclusao || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      categoria: payload.categoria || 'Fazenda',
      valor_atual: 0,
      prioridade: 'media' as const
    };

    console.log('[CreateGoal] Criando meta:', goalData);
    const result = await Meta.create(goalData);
    console.log('[CreateGoal] Meta criada com sucesso:', result.id);
    return result;
  } catch (error) {
    console.error('[CreateGoal] Erro ao criar meta:', error);
    throw error;
  }
}

export async function analyzeData(userId: string, payload: AnalysisPayload): Promise<any> {
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

    return {
      analysisType: payload.analysisType,
      summary: {
        totalTransacoes: transacoes.length,
        totalInvestimentos: investimentos.length,
        totalMetas: metas.length,
        valorTotalInvestido: investimentos.reduce((sum: number, inv: any) => sum + inv.valor, 0),
        valorTotalMetas: metas.reduce((sum: number, meta: any) => sum + meta.valor_total, 0),
        custoMensal: transacoes
          .filter(t => t.tipo === 'despesa' && new Date(t.data).getMonth() === new Date().getMonth())
          .reduce((sum, t) => sum + t.valor, 0),
        receitaMensal: transacoes
          .filter(t => t.tipo === 'receita' && new Date(t.data).getMonth() === new Date().getMonth())
          .reduce((sum, t) => sum + t.valor, 0)
      }
    };
  } catch (error) {
    console.error('Erro ao analisar dados:', error);
    throw error;
  }
}

export async function generateReport(userId: string, payload: ReportPayload): Promise<any> {
  const analysisPayload: AnalysisPayload = {
    analysisType: payload.reportType
  };
  const analysis = await analyzeData(userId, analysisPayload);
  return {
    reportId: uuidv4(),
    generatedAt: new Date(),
    type: payload.reportType || 'general',
    data: analysis
  };
}

// Additional exports for routes
export const handleAutomatedActions = processAutomatedAction;
export const executeAction = processAutomatedAction;

