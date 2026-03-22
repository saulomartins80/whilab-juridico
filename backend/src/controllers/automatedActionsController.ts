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

// Interfaces para tipos de payload - ADAPTADO PARA BOVINEXT
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

// Função para detectar intenção do usuário (OTIMIZADA) - ADAPTADO PARA BOVINEXT
interface UserContext {
  name: string;
  subscriptionPlan: string;
  userId?: string;
  [key: string]: any;
}

export async function detectUserIntent(message: string, userContext: UserContext, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    // 1. ⚡ Verificar cache primeiro (0.1ms)
    const cacheKey = `${message}_${userContext.name}_${userContext.subscriptionPlan}`;
    const cachedIntent = intentCache.get(cacheKey);
    if (cachedIntent) {
      return cachedIntent;
    }

    // 2. 🆕 VERIFICAR CONTEXTO ATIVO DA CONVERSA (OTIMIZADO)
    const chatId = conversationHistory?.[0]?.chatId;
    let contextIntent = null;
    
    if (chatId) {
      // ⚡ OTIMIZAÇÃO: ContextManager lookup mais rápido
      const activeState = contextManager.getConversationState(chatId);
      if (activeState?.currentAction) {
        console.log(`[ContextManager] Active context found: ${activeState.currentAction} for ${chatId}`);
        
        // ⚡ OTIMIZAÇÃO: Análise local mais rápida
        contextIntent = tryCompleteFromContext(message, activeState);
        if (contextIntent) {
          console.log(`[ContextManager] Completed action from context: ${contextIntent.type}`);
          // ⚡ OTIMIZAÇÃO: Atualizar contexto assincronamente
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

    // 3. ⚡ Detecção rápida por palavras-chave (0.2ms) - ADAPTADO PARA PECUÁRIA
    const quickIntent = detectQuickIntent(message);
    if (quickIntent && quickIntent.confidence > 0.8) {
      // 🆕 ATUALIZAR CONTEXTO se nova ação detectada (ASSÍNCRONO)
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

    // 4. ⚡ Análise de contexto da conversa (0.3ms)
    const contextIntent2 = analyzeConversationContext(message, conversationHistory);
    if (contextIntent2 && contextIntent2.confidence > 0.7) {
      // 🆕 ATUALIZAR CONTEXTO se ação detectada do contexto (ASSÍNCRONO)
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

    // 5. ⚡ Análise completa com IA (0.5ms)
    const fullIntent = await detectFullIntent(message, userContext, conversationHistory);
    if (fullIntent) {
      // 🆕 ATUALIZAR CONTEXTO se ação detectada pela IA (ASSÍNCRONO)
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

    // 6. ⚡ Resposta padrão - ADAPTADO PARA BOVINEXT
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
    console.error('Erro ao detectar intenção:', error);
    return null;
  }
}

// ⚡ DETECÇÃO RÁPIDA POR PALAVRAS-CHAVE - ADAPTADO PARA PECUÁRIA
function detectQuickIntent(message: string): DetectedAction | null {
  const lowerMessage = message.toLowerCase();

  // Detectar criação de transação (mantém lógica financeira para custos da fazenda)
  if (lowerMessage.includes('criar transação') || lowerMessage.includes('nova transação') || 
      lowerMessage.includes('registrar transação') || lowerMessage.includes('add transação') ||
      lowerMessage.includes('gastei') || lowerMessage.includes('recebi') || lowerMessage.includes('paguei') ||
      lowerMessage.includes('comprei') || lowerMessage.includes('custo') || lowerMessage.includes('despesa')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair descrição se mencionado - ADAPTADO PARA PECUÁRIA
    let descricao = 'Despesa da fazenda';
    if (lowerMessage.includes('ração') || lowerMessage.includes('racao')) descricao = 'Ração';
    if (lowerMessage.includes('vacina') || lowerMessage.includes('vacinação')) descricao = 'Vacinação';
    if (lowerMessage.includes('vermífugo') || lowerMessage.includes('vermifugo')) descricao = 'Vermífugo';
    if (lowerMessage.includes('sal mineral')) descricao = 'Sal mineral';
    if (lowerMessage.includes('veterinário') || lowerMessage.includes('veterinario')) descricao = 'Veterinário';
    if (lowerMessage.includes('venda') || lowerMessage.includes('vendeu')) descricao = 'Venda de animais';

    return {
      type: 'CREATE_TRANSACTION',
      payload: {
        valor: valor || 0,
        descricao: descricao,
        tipo: lowerMessage.includes('recebi') || lowerMessage.includes('venda') ? 'receita' : 'despesa',
        categoria: lowerMessage.includes('ração') ? 'Alimentação' : 
                  lowerMessage.includes('vacina') || lowerMessage.includes('veterinário') ? 'Saúde Animal' :
                  lowerMessage.includes('venda') ? 'Vendas' : 'Manejo',
        conta: 'Principal',
        data: new Date().toISOString().split('T')[0]
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `✅ Transação de R$ ${valor.toFixed(2)} criada com sucesso!` : 
        'Qual o valor da transação?',
      errorMessage: 'Erro ao criar transação',
      response: valor ? 
        `Perfeito! Transação de R$ ${valor.toFixed(2)} registrada.` : 
        'Qual o valor da transação?'
    };
  }

  // Detectar criação de meta - ADAPTADO PARA METAS PECUÁRIAS
  if (lowerMessage.includes('criar meta') || lowerMessage.includes('nova meta') || 
      lowerMessage.includes('quero criar uma meta') || lowerMessage.includes('juntar dinheiro') ||
      lowerMessage.includes('economizar para') || lowerMessage.includes('meta de') ||
      lowerMessage.includes('objetivo') || lowerMessage.includes('planejar')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    let valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair meta se mencionado - ADAPTADO PARA PECUÁRIA
    let meta = 'Meta da fazenda';
    if (lowerMessage.includes('trator') || lowerMessage.includes('máquina')) meta = 'Equipamento agrícola';
    if (lowerMessage.includes('pasto') || lowerMessage.includes('pastagem')) meta = 'Melhoria de pastagem';
    if (lowerMessage.includes('curral') || lowerMessage.includes('instalação')) meta = 'Infraestrutura';
    if (lowerMessage.includes('reprodutor') || lowerMessage.includes('touro')) meta = 'Melhoramento genético';
    if (lowerMessage.includes('expansão') || lowerMessage.includes('crescimento')) meta = 'Expansão do rebanho';

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
        `🎯 Meta "${meta}" de R$ ${valor.toFixed(2)} criada com sucesso!` : 
        'Qual valor você quer investir nessa meta?',
      errorMessage: 'Erro ao criar meta',
      response: valor ? 
        `Perfeito! Meta "${meta}" de R$ ${valor.toFixed(2)} criada.` : 
        'Qual valor você quer investir nessa meta?'
    };
  }

  // Detectar criação de investimento - ADAPTADO PARA INVESTIMENTOS RURAIS
  if (lowerMessage.includes('criar investimento') || lowerMessage.includes('novo investimento') || 
      lowerMessage.includes('quero investir') || lowerMessage.includes('aplicar dinheiro') ||
      lowerMessage.includes('investi') || lowerMessage.includes('investimento de') ||
      lowerMessage.includes('comprei') || lowerMessage.includes('adquiri')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair nome se mencionado - ADAPTADO PARA PECUÁRIA
    let nome = 'Investimento rural';
    if (lowerMessage.includes('gado') || lowerMessage.includes('animal')) nome = 'Aquisição de gado';
    if (lowerMessage.includes('terra') || lowerMessage.includes('hectare')) nome = 'Aquisição de terra';
    if (lowerMessage.includes('trator') || lowerMessage.includes('equipamento')) nome = 'Equipamentos';
    if (lowerMessage.includes('semente') || lowerMessage.includes('insumo')) nome = 'Insumos agrícolas';
    if (lowerMessage.includes('cerca') || lowerMessage.includes('infraestrutura')) nome = 'Infraestrutura';

    return {
      type: 'CREATE_INVESTMENT',
      payload: {
        nome: nome,
        valor: valor || 0,
        tipo: lowerMessage.includes('gado') ? 'Rebanho' : 
              lowerMessage.includes('terra') ? 'Imóvel Rural' : 
              lowerMessage.includes('trator') ? 'Equipamentos' : 
              lowerMessage.includes('insumo') ? 'Insumos' : 'Infraestrutura',
        data: new Date().toISOString().split('T')[0],
        instituicao: 'Fazenda'
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `📈 Investimento "${nome}" de R$ ${valor.toFixed(2)} criado com sucesso!` : 
        'Qual valor você investiu?',
      errorMessage: 'Erro ao criar investimento',
      response: valor ? 
        `Perfeito! Investimento "${nome}" de R$ ${valor.toFixed(2)} registrado.` : 
        'Qual valor você investiu?'
    };
  }

  return null;
}

// ⚡ ANÁLISE DE CONTEXTO DA CONVERSA
function analyzeConversationContext(message: string, conversationHistory?: any[]): DetectedAction | null {
  if (!conversationHistory || conversationHistory.length === 0) return null;
  
  const lowerMessage = message.toLowerCase();
  const recentMessages = conversationHistory.slice(-3);
  
  // Verificar se é continuação de uma transação
  if (lowerMessage.includes('valor') || lowerMessage.includes('reais') || lowerMessage.includes('é uma despesa')) {
    const transactionContext = recentMessages.find((msg: any) => 
      msg.content.toLowerCase().includes('transação') || 
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
          descricao: 'Transação da fazenda',
          tipo: lowerMessage.includes('despesa') ? 'despesa' : 'receita',
          categoria: 'Manejo',
          conta: 'Principal',
          data: new Date().toISOString().split('T')[0]
        },
        confidence: valor ? 0.8 : 0.6,
        requiresConfirmation: !valor,
        successMessage: 'Transação criada com sucesso!',
        errorMessage: 'Erro ao criar transação',
        response: valor ? 
          `Perfeito! Transação de R$ ${valor.toFixed(2)} registrada. O que foi essa transação?` : 
          'Qual o valor da transação?'
      };
    }
  }
  
  return null;
}

// ⚡ ANÁLISE COMPLETA COM IA - ADAPTADO PARA BOVINEXT
async function detectFullIntent(message: string, userContext: UserContext, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    // Analisar contexto da conversa para entender melhor
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      conversationContext = `\n\nContexto da conversa recente:\n${recentMessages.map((msg: any, index: number) => 
        `${index + 1}. ${msg.sender === 'user' ? 'Usuário' : AI_BRAND.assistantName}: ${msg.content}`
      ).join('\n')}`;
    }

    const prompt = `Contexto do usuário pecuarista:
- Nome: ${userContext.name}
- Plano: ${userContext.subscriptionPlan}
- Transações: ${userContext.totalTransacoes}
- Investimentos: ${userContext.totalInvestimentos}
- Metas: ${userContext.totalMetas}${conversationContext}
Mensagem do usuário: "${message}"

IMPORTANTE: Você é ${AI_BRAND.assistantName}, assistente especializado em pecuária. Analise se o usuário quer:
- Registrar custos da fazenda (ração, vacinas, veterinário, etc.)
- Criar metas para a fazenda (equipamentos, expansão, melhoramento)
- Registrar investimentos rurais (gado, terra, equipamentos)
- Analisar dados da propriedade
- Gerar relatórios

Analise a mensagem e retorne um JSON com:
- intent: tipo de ação (CREATE_TRANSACTION, CREATE_INVESTMENT, CREATE_GOAL, ANALYZE_DATA, GENERATE_REPORT, UNKNOWN)
- entities: dados extraídos (valor, descrição, categoria, prazo, etc.)
- confidence: confiança da detecção (0.0 a 1.0)
- response: resposta natural como ${AI_BRAND.assistantName}
- requiresConfirmation: se precisa confirmação
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
      response: actionResult.response || 'Entendi sua solicitação. Como posso ajudar?'
    };
  } catch (error) {
    console.error('Erro na análise com IA:', error);
    return null;
  }
}

// Função auxiliar para verificar se os dados necessários para a ação foram completos
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

// ===== FUNÇÃO PARA COMPLETAR AÇÃO DO CONTEXTO =====
function tryCompleteFromContext(message: string, activeState: ConversationState): DetectedAction | null {
  const lowerMessage = message.toLowerCase();
  
  // Se não há ação ativa, não pode completar
  if (!activeState.currentAction) return null;
  
  // Tentar extrair entidades da mensagem atual
  const extractedEntities = extractEntitiesFromMessage(message, activeState.currentAction);
  
  // Se extraiu algo útil, completar a ação
  if (Object.keys(extractedEntities).length > 0) {
    // Mesclar com entidades existentes
    const mergedEntities = { ...activeState.pendingEntities, ...extractedEntities };
    
    // Verificar se ação está completa
    const isComplete = isActionComplete(activeState.currentAction, mergedEntities);
    
    return {
      type: activeState.currentAction as any,
      payload: mergedEntities,
      confidence: isComplete ? 0.95 : 0.8,
      requiresConfirmation: !isComplete,
      successMessage: generateSuccessMessage(activeState.currentAction, mergedEntities),
      errorMessage: 'Erro ao completar ação',
      response: generateContextResponse(activeState.currentAction, mergedEntities, isComplete)
    };
  }
  
  return null;
}

function extractEntitiesFromMessage(message: string, actionType: string): any {
  const entities: any = {};
  const lowerMessage = message.toLowerCase();

  // Padrões de data mais robustos
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
    /(hoje|amanhã|ontem)/gi,
    /(próxim[ao]|próxim[ao]s?)\s+(semana|mês|ano)/gi,
    /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/gi
  ];

  // Padrões de valor mais robustos
  const valorPatterns = [
    /r?\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/gi,
    /(\d+(?:[.,]\d+)?)\s*(?:reais?|mil|k)/gi,
    /(\d+(?:[.,]\d+)?)\s*(?:milhões?|mi)/gi
  ];

  switch (actionType) {
    case 'CREATE_GOAL':
      // Extrair valor com padrões mais robustos
      for (const pattern of valorPatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          let valor = match[1].replace(/\./g, '').replace(',', '.');
          if (lowerMessage.includes('mil') || lowerMessage.includes('k')) {
            valor = (parseFloat(valor) * 1000).toString();
          } else if (lowerMessage.includes('milhões') || lowerMessage.includes('mi')) {
            valor = (parseFloat(valor) * 1000000).toString();
          }
          entities.valor_total = parseFloat(valor);
          break;
        }
      }
      
      // Extrair metas com mais categorias - ADAPTADO PARA PECUÁRIA
      const goalKeywords = {
        'equipamento': ['trator', 'máquina', 'equipamento', 'implemento'],
        'infraestrutura': ['curral', 'cerca', 'instalação', 'galpão', 'bebedouro'],
        'pastagem': ['pasto', 'pastagem', 'capim', 'forragem'],
        'genética': ['reprodutor', 'touro', 'matriz', 'melhoramento', 'genética'],
        'expansão': ['expansão', 'crescimento', 'aumento', 'ampliar'],
        'tecnologia': ['software', 'sistema', 'tecnologia', 'automação']
      };

      for (const [category, keywords] of Object.entries(goalKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          entities.nome_da_meta = category.charAt(0).toUpperCase() + category.slice(1);
          entities.categoria = category;
          break;
        }
      }

      // Extrair data de conclusão
      for (const pattern of datePatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          entities.data_conclusao = match[0];
          break;
        }
      }
      break;
      
    case 'CREATE_INVESTMENT':
      // Extrair valor com padrões mais robustos
      for (const pattern of valorPatterns) {
        const match = pattern.exec(lowerMessage);
        if (match) {
          let valor = match[1].replace(/\./g, '').replace(',', '.');
          entities.valor = parseFloat(valor);
          break;
        }
      }
      
      // Tipos de investimento expandidos - ADAPTADO PARA PECUÁRIA
      const investmentTypes = {
        'Rebanho': ['gado', 'animal', 'boi', 'vaca', 'bezerro', 'novilho'],
        'Imóvel Rural': ['terra', 'hectare', 'propriedade', 'fazenda', 'sítio'],
        'Equipamentos': ['trator', 'máquina', 'equipamento', 'implemento'],
        'Infraestrutura': ['curral', 'cerca', 'galpão', 'instalação'],
        'Insumos': ['ração', 'vacina', 'vermífugo', 'sal', 'semente'],
        'Tecnologia': ['software', 'sistema', 'sensor', 'automação']
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

      // Categorias de transação - ADAPTADO PARA PECUÁRIA
      const categories = {
        'Alimentação': ['ração', 'racao', 'sal', 'mineral', 'suplemento', 'milho', 'soja'],
        'Saúde Animal': ['vacina', 'vacinação', 'vermífugo', 'medicamento', 'veterinário'],
        'Manejo': ['manejo', 'castração', 'marcação', 'pesagem', 'separação'],
        'Infraestrutura': ['cerca', 'curral', 'bebedouro', 'cocho', 'porteira'],
        'Equipamentos': ['trator', 'máquina', 'implemento', 'ferramenta'],
        'Vendas': ['venda', 'vendeu', 'frigorífico', 'leilão', 'comercialização'],
        'Combustível': ['diesel', 'gasolina', 'combustível', 'óleo']
      };

      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          entities.categoria = category;
          break;
        }
      }

      // Tipo de transação
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
      return `🎯 Meta "${entities.nome_da_meta}" de R$ ${entities.valor_total} criada com sucesso!`;
    case 'CREATE_INVESTMENT':
      return `📈 Investimento de R$ ${entities.valor} criado com sucesso!`;
    default:
      return 'Ação executada com sucesso!';
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
      if (!entities.nome_da_meta) return 'Qual é o objetivo da sua meta? (ex: comprar trator, melhorar pasto)';
      if (!entities.valor_total) return 'Qual o valor total que você quer investir?';
      break;
    case 'CREATE_INVESTMENT':
      if (!entities.valor) return 'Qual o valor do investimento?';
      if (!entities.nome) return 'Em que você investiu? (ex: gado, equipamento)';
      break;
  }
  
  return 'Preciso de mais informações para completar essa ação.';
}

// ⚡ Controller principal para ações automatizadas - ADAPTADO PARA SUPABASE
export const processAutomatedAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const { message, chatId, context } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    if (!message) {
      res.status(400).json({ success: false, message: 'Mensagem é obrigatória' });
      return;
    }

    // Buscar dados do usuário - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      return;
    }

    // Buscar dados financeiros do usuário - ADAPTADO PARA SUPABASE
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

    // Detectar ação automatizada
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

      // Executar ação automaticamente
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
            throw new Error('Ação não suportada');
        }

        res.status(200).json({
          success: true,
          type: 'ACTION_EXECUTED',
          text: detectedAction.successMessage || 'Ação executada com sucesso!',
          data: result,
          messageId: uuidv4()
        });
        return;
      } catch (error) {
        console.error('Erro ao executar ação:', error);
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.errorMessage || 'Desculpe, não consegui executar essa ação. Pode tentar novamente?',
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
    console.error('Erro ao processar ação automatizada:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar solicitação' 
    });
    return;
  }
};

// Funções auxiliares para executar ações - ADAPTADAS PARA SUPABASE
export async function createTransaction(userId: string, payload: TransactionPayload): Promise<any> {
  try {
    // Buscar usuário pelo firebaseUid - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

      const transactionData = {
        user_id: user.id!, // Usar ID do Supabase
        valor: payload.valor || 0,
        descricao: payload.descricao || 'Transação da fazenda',
        tipo: (payload.tipo as 'receita' | 'despesa' | 'transferencia') || 'despesa',
        categoria: payload.categoria || 'Manejo',
        conta: payload.conta || 'Principal',
        data: payload.data || new Date().toISOString().split('T')[0]
      };

    console.log('[CreateTransaction] Criando transação:', transactionData);
    const result = await Transacao.create(transactionData);
    console.log('[CreateTransaction] Transação criada rapidamente:', result.id);
    return result;
  } catch (error) {
    console.error('[CreateTransaction] Erro ao criar transação:', error);
    throw error;
  }
}

export async function createInvestment(userId: string, payload: InvestmentPayload): Promise<any> {
  try {
    // Buscar usuário pelo firebaseUid - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
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
    // Buscar usuário pelo firebaseUid - ADAPTADO PARA SUPABASE
    const user = await User.findByFirebaseUid(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
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
      throw new Error('Usuário não encontrado');
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
