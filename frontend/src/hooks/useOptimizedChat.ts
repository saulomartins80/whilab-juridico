import { useState, useCallback, useRef, useEffect } from 'react';
import { chatbotAPI } from '../../services/api';
import { useBusiness } from '../../context/BusinessContext';

// ===== TIPOS OTIMIZADOS =====
interface BusinessData {
  metrics?: Record<string, number>;
  alerts?: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    category: string;
    title: string;
    description: string;
    impact?: string;
    suggestedAction?: string;
    value?: number;
  }>;
  insights?: string[];
  visualizations?: {
    cashFlowChart?: { type: string; data: Array<Record<string, unknown>> };
    revenueExpenseChart?: { type: string; data: Record<string, number> };
    liquidityGauge?: { type: string; value: number; min: number; max: number; zones: Array<{ value: number; color: string }> };
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    business?: boolean;
    companyId?: string;
    companyName?: string;
    businessData?: BusinessData;
    intent?: string;
    confidence?: number;
    responseTime?: number;
    cached?: boolean;
    actionExecuted?: boolean;
    automationData?: {
      type: string;
      success: boolean;
      data: Record<string, unknown>;
    };
    requiresConfirmation?: boolean;
    actionData?: {
      type: string;
      entities: Record<string, unknown>;
      userId: string;
    };
    entities?: Record<string, unknown>;
    isStreaming?: boolean;
    isComplete?: boolean;
    // Enterprise AI Engine properties 
    reasoning?: string;
    actions?: Array<{
      type: string;
      description: string;
      executed: boolean;
      data?: Record<string, unknown>;
    }>;
    insights?: {
      type: string;
      content: string;
      confidence: number;
    };
    complexity?: number;
    personalityAdaptation?: {
      level: string;
      adjustments: string[];
    };
    userSophistication?: number;
    businessImpact?: number;
    automationSuccess?: boolean;
    roiProjection?: {
      value: number;
      timeframe: string;
    };
    richAttachments?: Array<{
      type: 'image' | 'audio';
      url: string;
      alt?: string;
      title?: string;
      mimeType?: string;
    }>;
    source?: string;
  };
}

// Tipo para correção de dados
export interface DataCorrectionRequest {
  action: 'edit' | 'delete' | 'convert';
  fromType?: 'transaction' | 'goal' | 'investment' | 'schedule' | 'card';
  fromId?: string;
  fromSku?: string;
  toType?: 'transaction' | 'goal' | 'investment' | 'schedule' | 'card';
  suggestedData?: Record<string, unknown>;
  reason?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  chatId: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  pendingAction?: { action: string; payload: Record<string, unknown>; autoExecute?: boolean; executed?: boolean } | null;
  // NOVO: Status das ações em tempo real
  actionStatus?: {
    isActive: boolean;
    currentAction: string;
    progress: Array<{
      step: string;
      status: 'pending' | 'running' | 'completed' | 'error';
      timestamp: number;
    }>;
  };
  // NOVO: Modal de correção de dados
  dataCorrectionModal?: {
    isOpen: boolean;
    data: DataCorrectionRequest | null;
  };
}

interface SendMessageOptions {
  useStreaming?: boolean;
  priority?: 'high' | 'normal' | 'low';
  // Quando true, o hook não cria automaticamente a bolha de mensagem do usuário
  // (útil quando o componente de UI já adicionou a mensagem, ex.: envio de imagem)
  skipUserMessage?: boolean;
}

// ===== SISTEMA DE CACHE INTELIGENTE =====
class MessageCache {
  private cache = new Map<string, ChatMessage[]>();
  private maxSize = 10; // Máximo 10 conversas em cache
  private ttl = 30 * 60 * 1000; // 30 minutos

  set(chatId: string, messages: ChatMessage[]): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(chatId, messages);
  }

  get(chatId: string): ChatMessage[] | null {
    return this.cache.get(chatId) || null;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(chatId: string): void {
    this.cache.delete(chatId);
  }
}

// ===== HOOK PRINCIPAL OTIMIZADO =====
export const useOptimizedChat = () => {
  const { mode, currentCompany } = useBusiness();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    chatId: null,
    connectionStatus: 'connected', // Iniciar como conectado
    pendingAction: null,
    actionStatus: {
      isActive: false,
      currentAction: '',
      progress: []
    }
  });

  // Refs para performance
  const messageCache = useRef(new MessageCache());
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContextKeyRef = useRef<string | null>(null);

  // Utilitário de atualização de estado deve vir antes de efeitos que o usam
  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ===== VERIFICAÇÃO DE SAÚDE DO BACKEND =====
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        // Evitar checar enquanto há streaming ativo para não gerar falso negativo
        const es = eventSourceRef.current;
        if (es && es.readyState !== EventSource.CLOSED) {
          return;
        }
        const res = await chatbotAPI.healthCheck();
        if (res) {
          updateState({ connectionStatus: 'connected' });
        } else {
          // Retorno null (timeout/alto tráfego): não alterar status para evitar flicker
        }
      } catch (error) {
        console.warn('[useOptimizedChat] Backend health check failed:', error);
        // Só marcar como desconectado se não houver stream ativo
        const es = eventSourceRef.current;
        if (!es || es.readyState === EventSource.CLOSED) {
          updateState({ connectionStatus: 'disconnected' });
        }
      }
    };

    // Verificar saúde na inicialização
    checkBackendHealth();
    
    // Verificar saúde periodicamente (a cada 30 segundos)
    const healthInterval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(healthInterval);
  }, [updateState]);

  // ===== UTILITÁRIOS =====
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    console.log('[useOptimizedChat] Adding message:', message);
    setState(prev => {
      const newMessages = [...prev.messages, message];
      console.log('[useOptimizedChat] New messages array:', newMessages);
      
      // Cache das mensagens
      if (prev.chatId) {
        messageCache.current.set(prev.chatId, newMessages);
      }
      
      return { ...prev, messages: newMessages };
    });
  }, []);

  const updateMessageById = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    if (!messageId) return;
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => (msg.id === messageId ? { ...msg, ...updates } : msg))
    }));
  }, []);

  const addCustomMessage = useCallback((
    sender: 'user' | 'assistant',
    content: string,
    options?: {
      attachments?: NonNullable<ChatMessage['metadata']>['richAttachments'];
      metadata?: ChatMessage['metadata'];
    }
  ) => {
    const baseMetadata = options?.metadata ?? {};
    const metadataWithAttachments = options?.attachments?.length
      ? { ...baseMetadata, richAttachments: options.attachments }
      : baseMetadata;

    const message: ChatMessage = {
      id: generateMessageId(),
      sender,
      content,
      timestamp: new Date(),
      ...(Object.keys(metadataWithAttachments).length ? { metadata: metadataWithAttachments } : {})
    };

    addMessage(message);
    return message.id;
  }, [addMessage, generateMessageId]);

  const addAssistantMessage = useCallback((content: string, options?: {
    attachments?: NonNullable<ChatMessage['metadata']>['richAttachments'];
    metadata?: ChatMessage['metadata'];
  }) => {
    addCustomMessage('assistant', content, options);
  }, [addCustomMessage]);

  const showLimitExceededMessage = useCallback(() => {
    setState(prev => {
      const alreadyShown = prev.messages.some(
        (m: ChatMessage) => m.metadata?.source === 'limit_exceeded'
      );

      if (alreadyShown) {
        return {
          ...prev,
          isLoading: false,
          isStreaming: false,
          error: null
        };
      }

      const ctaContent = [
        '⚠️ Você atingiu o limite de uso de IA do seu plano atual.',
        '',
        'Para continuar conversando comigo, acesse a página de assinaturas e escolha um plano que libera mais mensagens:',
        '',
        '👉 [Ver planos de assinatura](/assinaturas)'
      ].join('\n');

      const message: ChatMessage = {
        id: generateMessageId(),
        sender: 'assistant',
        content: ctaContent,
        timestamp: new Date(),
        metadata: {
          source: 'limit_exceeded'
        }
      };

      return {
        ...prev,
        messages: [...prev.messages, message],
        isLoading: false,
        isStreaming: false,
        error: null
      };
    });
  }, [generateMessageId]);

  // ===== GERENCIAMENTO DE STATUS DAS AÇÕES EM TEMPO REAL =====
  const startActionTracking = useCallback((actionName: string) => {
    updateState({
      actionStatus: {
        isActive: true,
        currentAction: actionName,
        progress: [{
          step: 'Iniciando ' + actionName,
          status: 'running',
          timestamp: Date.now()
        }]
      }
    });
  }, [updateState]);

  const addActionStep = useCallback((step: string, status: 'pending' | 'running' | 'completed' | 'error' = 'running') => {
    setState(prev => {
      if (!prev.actionStatus?.isActive) return prev;
      
      const newProgress = [...prev.actionStatus.progress, {
        step,
        status,
        timestamp: Date.now()
      }];

      return {
        ...prev,
        actionStatus: {
          ...prev.actionStatus,
          progress: newProgress
        }
      };
    });
  }, []);

  const finishActionTracking = useCallback((success: boolean = true) => {
    setState(prev => {
      if (!prev.actionStatus?.isActive) return prev;
      
      const finalStep = success ? 'Ação concluída com sucesso' : 'Erro na execução';
      const newProgress = [...prev.actionStatus.progress, {
        step: finalStep,
        status: (success ? 'completed' : 'error') as 'pending' | 'running' | 'completed' | 'error',
        timestamp: Date.now()
      }];

      // Limpar o status após 3 segundos
      setTimeout(() => {
        updateState({
          actionStatus: {
            isActive: false,
            currentAction: '',
            progress: []
          }
        });
      }, 3000);

      return {
        ...prev,
        actionStatus: {
          ...prev.actionStatus,
          progress: newProgress
        }
      };
    });
  }, [updateState]);

  // Helper: extrair dados de transação do texto do streaming
  const extractTransactionFromText = (text: string): Record<string, unknown> | null => {
    try {
      const clean = text.replace(/\u00a0/g, ' ');
      // Valor: aceita com ou sem R$
      const valorMatch = clean.match(/R\$\s*([0-9]{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)/i) ||
                         clean.match(/\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)\b/);
      const valor = valorMatch ? Number(valorMatch[1].replace('.', '').replace(',', '.')) : undefined;
      // Categoria gasolina/transporte
      let categoria: string | undefined;
      if (/gasolin|etanol|combust/i.test(clean)) categoria = 'Transporte';
      // Forma de pagamento
      const formaPagamento = /cr[ée]dito/i.test(clean)
        ? 'cartao_credito'
        : (/d[ée]bito/i.test(clean) ? 'cartao_debito' : (/pix/i.test(clean) ? 'pix' : (/dinheiro/i.test(clean) ? 'dinheiro' : undefined)));
      // Descrição
      let descricao: string | undefined;
      if (/gasolin|etanol/i.test(clean)) descricao = 'Gasto com combustível';

      if (valor !== undefined) {
        return {
          valor,
          tipo: 'despesa',
          categoria: categoria || 'Outros',
          descricao: descricao || 'Transação registrada via assistente',
          data: new Date().toISOString(),
          forma_pagamento: formaPagamento
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper: extrair dados de meta do texto do streaming
  const extractGoalFromText = (text: string, entities?: Record<string, unknown>): Record<string, unknown> | null => {
    try {
      const clean = String(text || '').replace(/\u00a0/g, ' ');
      const valorMatch = clean.match(/R\$\s*([0-9]+(?:[.,][0-9]{1,2})?)/i);
      const valor_total = valorMatch ? Number(valorMatch[1].replace('.', '').replace(',', '.')) : undefined;

      // Meta/objetivo
      let meta: string | undefined = undefined;
      const objetivos = ['viagem', 'celular', 'tv', 'carro', 'casa', 'curso', 'computador', 'notebook'];
      for (const alvo of objetivos) {
        if (new RegExp(alvo, 'i').test(clean)) { meta = `Comprar/Planejar ${alvo}`; break; }
      }
      if (!meta) meta = 'Meta do usuário';

      // Prazos "em X meses"
      const prazoMatch = clean.match(/em\s+(\d{1,2})\s+mes/i);
      let data_conclusao: string | undefined = undefined;
      if (prazoMatch) {
        const meses = parseInt(prazoMatch[1], 10);
        const dt = new Date();
        dt.setMonth(dt.getMonth() + (isNaN(meses) ? 0 : meses));
        data_conclusao = dt.toISOString();
      }

      const merged: Record<string, unknown> = {
        valor_total,
        meta,
        valor_atual: 0,
        data_conclusao
      };

      // Mesclar entities se fornecidas pelo backend
      if (entities && typeof entities === 'object') {
        Object.assign(merged, entities);
      }

      if (merged.valor_total || merged.meta) {
        return merged;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper: extrair dados de investimento do texto do streaming
  const extractInvestmentFromText = (text: string, entities?: Record<string, unknown>): Record<string, unknown> | null => {
    try {
      const clean = String(text || '').replace(/\u00a0/g, ' ');
      const valorMatch = clean.match(/R\$\s*([0-9]+(?:[.,][0-9]{1,2})?)/i);
      const valor = valorMatch ? Number(valorMatch[1].replace('.', '').replace(',', '.')) : undefined;
      // Nome do ativo: palavras comuns
      const papeis = ['tesouro', 'cdb', 'poupan', 'fundo', 'ações', 'acao', 'ETF'];
      let nome: string | undefined;
      for (const k of papeis) {
        if (new RegExp(k, 'i').test(clean)) { nome = k.toUpperCase(); break; }
      }
      // Ticker simples (ex: PETR4, VALE3)
      const tickerMatch = clean.match(/\b[A-Z]{4}\d\b/);
      if (tickerMatch) nome = tickerMatch[0];

      const merged: Record<string, unknown> = { valor, nome, tipo: 'aporte' };
      if (entities && typeof entities === 'object') Object.assign(merged, entities);

      if (merged.valor || merged.nome) {
        return merged;
      }
      return null;
    } catch {
      return null;
    }
  };

  // ===== CRIAÇÃO DE SESSÃO OTIMIZADA =====
  const createSession = useCallback(async (): Promise<string> => {
    try {
      updateState({ isLoading: true, error: null });
      const data = await chatbotAPI.startNewSession();
      if (!data?.success || !data?.chatId) {
        throw new Error(data?.message || 'Erro ao criar sessão');
      }
      const newChatId = data.chatId as string;
      console.log('[useOptimizedChat] Nova sessão criada:', newChatId);
      updateState({ chatId: newChatId, isLoading: false });
      return newChatId;
    } catch (error) {
      console.error('[useOptimizedChat] Error creating session:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao criar sessão',
        isLoading: false 
      });
      throw error;
    }
  }, [updateState]);

  // Executa ação pendente e envia feedback ao chat
  const executePendingAction = useCallback(async () => {
    if (!state.pendingAction || state.pendingAction.executed) return;
    
    try {
      const { action, payload } = state.pendingAction;
      console.log('[useOptimizedChat] Executing pending action:', action, payload);
      
      // Executar ação baseada no tipo
      switch (action) {
        case 'CREATE_TRANSACTION':
          // Implementar criação de transação
          break;
        case 'CREATE_GOAL':
          // Implementar criação de meta
          break;
        case 'CREATE_INVESTMENT':
          // Implementar criação de investimento
          break;
      }
      
      // Marcar como executada
      setState(prev => ({
        ...prev,
        pendingAction: prev.pendingAction ? { ...prev.pendingAction, executed: true } : null
      }));
    } catch (error) {
      console.error('[useOptimizedChat] Error executing pending action:', error);
    }
  }, [state.pendingAction]);

  // ===== EXECUÇÃO PRINCIPAL =====
  const sendMessage = useCallback(async (
    content: string, 
    options: SendMessageOptions = {}
  ): Promise<void> => {
    const { useStreaming = false, skipUserMessage = false } = options;
    
    if (!content.trim()) return;

    // ===== ESCOLHA DO MÉTODO DE ENVIO =====

    // ===== STREAMING OTIMIZADO =====
    const sendStreamingMessage = async (
      content: string, 
      chatId: string
    ): Promise<void> => {
      return new Promise<void>((resolve) => {
        // Fechar conexão anterior se existir
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // NÃO mudar para 'connecting' - manter sempre 'connected' se estiver online
        // updateState({ connectionStatus: 'connecting' }); // REMOVIDO - causa impressão de desconexão

        // Garantir que não exista nenhuma bolha de streaming antiga
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(m => !(m.sender !== 'user' && m.metadata?.isStreaming && m.metadata?.source === 'assistant_stream'))
        }));

        // ===== DETECTAR TIPO DE AÇÃO E INICIAR TRACKING =====
        const enableLocalProgress = false;
        if (enableLocalProgress) {
          if (/(?:buscar|pesquisar|procurar).*(?:sobre|concorrente|informação|dados)/i.test(content)) {
            startActionTracking('Busca na Internet');
            addActionStep('🔍 Analisando termos de busca...', 'running');
          } else if (/(?:criar|registrar|adicionar).*(?:meta|objetivo)/i.test(content)) {
            startActionTracking('Criação de Meta');
            addActionStep('🎯 Preparando nova meta...', 'running');
          } else if (/(?:criar|registrar|adicionar).*(?:transação|gasto|receita)/i.test(content)) {
            startActionTracking('Registro de Transação');
            addActionStep('💰 Processando dados financeiros...', 'running');
          } else if (/(?:criar|registrar|adicionar).*(?:investimento|aplicação)/i.test(content)) {
            startActionTracking('Registro de Investimento');
            addActionStep('📈 Analisando dados de investimento...', 'running');
          }
        }

        // Criar bolha inicial com feedback imediato
        const streamingMessage: ChatMessage | null = {
          id: generateMessageId(),
          sender: 'assistant',
          content: '🤔 Analisando...',
          timestamp: new Date(),
          metadata: { isStreaming: true, isComplete: false, source: 'assistant_stream' }
        };
        let hasStarted = false; // torna-se true ao receber o primeiro chunk
        let isCompleted = false; // marca quando recebemos o evento 'complete'
        let timeoutId: NodeJS.Timeout;

        // Adicionar imediatamente a bolha vazia; conteúdo chegará por chunks
        addMessage(streamingMessage);
        // Sinalizar estado global de streaming
        updateState({ isStreaming: true });

        const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';

        // Iniciar stream via service centralizado, enviando contexto de negócio
        const extraParams: Record<string, string> = {
          mode,
          ...(mode === 'business'
            ? {
                companyId: currentCompany?.id || '',
                companyName: currentCompany?.name || '',
              }
            : {}),
          persona: mode === 'business' ? 'business_senior_expert' : 'personal_assistant',
          expertise: mode === 'business'
            ? 'erp,finance,accounting,inventory,manufacturing,crm,hr,compliance,bi,analytics,integrations,apis,data_modeling,sql,nosql,project_management,ads(google,meta,tiktok,linkedin,x,youtube)'
            : 'personal_finance,productivity,general_assistant',
          locale: 'pt-BR',
          currentRoute
        };
        console.log('[useOptimizedChat] Abrindo stream com chatId:', chatId);
        console.log('[useOptimizedChat] Estado atual:', { chatId: state.chatId, messages: state.messages.length });
        
        // IMPORTANTE: Garantir que o chatId seja persistido no estado
        if (!state.chatId && chatId) {
          console.log('[useOptimizedChat] Atualizando chatId no estado:', chatId);
          updateState({ chatId });
        }
        
        chatbotAPI.openStream({ message: content, chatId, extraParams }).then((eventSource) => {
          eventSourceRef.current = eventSource;
          console.log('[useOptimizedChat] EventSource created, readyState:', eventSource.readyState);

          // Timeout para detectar se não recebemos dados
          const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
              if (!hasStarted) {
                console.warn('[useOptimizedChat] No data received within timeout, closing connection');
                eventSource.close();
                setState(prev => ({
                  ...prev,
                  isStreaming: false,
                  isLoading: false,
                  messages: streamingMessage ? prev.messages.filter(m => m.id !== streamingMessage.id) : prev.messages
                }));
                // Fallback automático para query
                try {
                  const response = await chatbotAPI.sendQuery({
                    message: content,
                    chatId: chatId || '',
                    context: {
                      mode,
                      companyId: currentCompany?.id,
                      companyName: currentCompany?.name,
                      currentRoute,
                      persona: mode === 'business' ? 'business_senior_expert' : 'personal_assistant',
                      expertise: mode === 'business'
                        ? ['erp','finance','accounting','inventory','manufacturing','crm','hr','compliance','bi','analytics','integrations','apis','data_modeling','sql','nosql','project_management','ads_google','ads_meta','ads_tiktok','ads_linkedin','ads_x','ads_youtube']
                        : ['personal_finance','productivity','general_assistant'],
                      locale: 'pt-BR'
                    }
                  });
                  const responseText = response.message || response.text || response.response || 'Erro ao obter resposta';
                  const botMessage: ChatMessage = {
                    id: generateMessageId(),
                    sender: 'assistant',
                    content: responseText,
                    timestamp: new Date(),
                    metadata: response.metadata || {}
                  };
                  addMessage(botMessage);
                } catch (e) {
                  console.error('[useOptimizedChat] Fallback query failed:', e);
                  const msg = e instanceof Error ? e.message : String(e ?? '');
                  const normalized = msg.toLowerCase();
                  if (normalized.includes('limite de uso de ia') || normalized.includes('limit_exceeded')) {
                    showLimitExceededMessage();
                  }
                }
                resolve();
              }
            }, 8000);
          };

          // Iniciar timeout imediatamente para resposta rápida
          if (!hasStarted && eventSource.readyState !== 2) { // 2 = CLOSED
            resetTimeout();
          }

          eventSource.onopen = () => {
            console.log('[useOptimizedChat] EventSource opened, readyState:', eventSource.readyState);
            updateState({ connectionStatus: 'connected', isLoading: false });
            // Não altera hasStarted aqui; apenas marca conexão aberta
            if (timeoutId) clearTimeout(timeoutId);
          };

          // Adicionar log de estado da conexão
          const checkConnectionState = setInterval(() => {
            console.log('[useOptimizedChat] EventSource readyState:', eventSource.readyState, {
              CONNECTING: 0,
              OPEN: 1,
              CLOSED: 2,
              current: eventSource.readyState
            });
            
            if (eventSource.readyState === EventSource.CLOSED) {
              console.error('[useOptimizedChat] EventSource closed unexpectedly');
              clearInterval(checkConnectionState);
            } else if (eventSource.readyState === EventSource.OPEN && !hasStarted) {
              console.log('[useOptimizedChat] EventSource is OPEN but no data received yet');
            }
          }, 2000);

          // Limpar interval após um tempo
          setTimeout(() => {
            clearInterval(checkConnectionState);
          }, 5000); // Reduzido para 5 segundos

          // Listener para evento de conexão inicial
          eventSource.onerror = (error) => {
            console.error('[useOptimizedChat] Stream error:', error);
            if (timeoutId) clearTimeout(timeoutId);

            // Se já iniciou (ou já completou), tratar como fechamento gracioso
            if (hasStarted || isCompleted) {
              eventSource.close();
              // Manter conexão como conectada para UX e encerrar estados de loading
              updateState({ connectionStatus: 'connected', isStreaming: false, isLoading: false });

              if (state.actionStatus?.isActive) {
                addActionStep(isCompleted ? '✅ Resposta finalizada' : 'ℹ️ Conexão encerrada após iniciar', 'completed');
                setTimeout(() => finishActionTracking(true), 2000);
              }
              // Importante: NÃO rejeitar para evitar mostrar "Stream error" quando o servidor fecha a conexão normalmente
              resolve();
              return;
            }

            // Se não houve início, fazer fallback silencioso para query + enviar query
            eventSource.close();
            setState(prev => ({
              ...prev,
              connectionStatus: 'disconnected',
              isStreaming: false,
              isLoading: false,
              messages: streamingMessage ? prev.messages.filter(m => m.id !== streamingMessage.id) : prev.messages
            }));

            if (state.actionStatus?.isActive) {
              addActionStep('❌ Erro na comunicação', 'error');
              setTimeout(() => finishActionTracking(false), 2000);
            }

            console.log('[useOptimizedChat] Stream failed before starting, falling back to query');
            void (async () => {
              try {
                const response = await chatbotAPI.sendQuery({
                  message: content,
                  chatId: chatId || '',
                  context: {
                    mode,
                    companyId: currentCompany?.id,
                    companyName: currentCompany?.name,
                    currentRoute,
                    persona: mode === 'business' ? 'business_senior_expert' : 'personal_assistant',
                    expertise: mode === 'business'
                      ? ['erp','finance','accounting','inventory','manufacturing','crm','hr','compliance','bi','analytics','integrations','apis','data_modeling','sql','nosql','project_management','ads_google','ads_meta','ads_tiktok','ads_linkedin','ads_x','ads_youtube']
                      : ['personal_finance','productivity','general_assistant'],
                    locale: 'pt-BR'
                  }
                });
                const responseText = response.message || response.text || response.response || 'Erro ao obter resposta';
                const botMessage: ChatMessage = {
                  id: generateMessageId(),
                  sender: 'assistant',
                  content: responseText,
                  timestamp: new Date(),
                  metadata: response.metadata || {}
                };
                addMessage(botMessage);
              } catch (e) {
                console.error('[useOptimizedChat] Fallback query on onerror failed:', e);
                const msg = e instanceof Error ? e.message : String(e ?? '');
                const normalized = msg.toLowerCase();
                if (normalized.includes('limite de uso de ia') || normalized.includes('limit_exceeded')) {
                  showLimitExceededMessage();
                }
              } finally {
                resolve();
              }
            })();
          };

          // Listener para evento de conexão inicial
          eventSource.addEventListener('connected', (event) => {
            console.log('[useOptimizedChat] Stream connected:', event.data);
            if (timeoutId) clearTimeout(timeoutId);
            const timeoutMs = mode === 'business' ? 60000 : 15000;
            // AUMENTAR timeout para 10 segundos - IA pode demorar mais
            timeoutId = setTimeout(async () => {
              if (!hasStarted) {
                console.warn('[useOptimizedChat] No chunks after connected (10s timeout)');
                eventSource.close();
                setState(prev => ({
                  ...prev,
                  isStreaming: false,
                  isLoading: false,
                  messages: prev.messages.filter(m => m.id !== streamingMessage.id)
                }));
                // Mostrar mensagem amigável ao invés de tentar fallback
                const timeoutMessage: ChatMessage = {
                  id: generateMessageId(),
                  sender: 'assistant',
                  content: 'A resposta está demorando mais que o esperado. Por favor, tente novamente em alguns segundos. 🔄',
                  timestamp: new Date(),
                  metadata: {}
                };
                addMessage(timeoutMessage);
                resolve();
              }
            }, timeoutMs); // 15 segundos após conectar - mais tempo para IA processar
          });

          const handleIncoming = (raw: MessageEvent) => {
            try {
              let data: Record<string, unknown>;
              try {
                data = JSON.parse(raw.data as string);
              } catch {
                data = { chunk: String((raw.data ?? '')), isComplete: false };
              }
              if (typeof data?.chunk !== 'string') {
                data.chunk = String(data?.chunk ?? '');
              }
              
              // Já adicionamos a bolha de análise
              if (!hasStarted) {
                hasStarted = true;
                if (timeoutId) clearTimeout(timeoutId);
                updateState({ connectionStatus: 'connected', isLoading: false });
                
                // Adicionar step de início do processamento
                if (state.actionStatus?.isActive) {
                  addActionStep('🧠 IA iniciando processamento...', 'running');
                }
              }

              if (data.chunk) {
                // Limpar "Analisando..." no primeiro chunk
                if (streamingMessage && streamingMessage.content === '🤔 Analisando...') {
                  streamingMessage.content = '';
                }
                streamingMessage.content += data.chunk;
                
                // Usar requestAnimationFrame para animação mais suave
                // Evita múltiplas re-renderizações por frame
                requestAnimationFrame(() => {
                  setState(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg => 
                      streamingMessage && msg.id === streamingMessage.id 
                        ? { ...streamingMessage, metadata: { ...streamingMessage.metadata, isStreaming: true, isComplete: false } }
                        : msg
                    )
                  }));
                });
              }

              if (data.isComplete) {
                if (streamingMessage) {
                  streamingMessage.metadata = { ...streamingMessage.metadata, isStreaming: false, isComplete: true };
                  setState(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg => (msg.id === streamingMessage!.id ? { ...streamingMessage! } : msg))
                  }));
                }
                if (timeoutId) clearTimeout(timeoutId);
                updateState({ isStreaming: false, isLoading: false });
                
                // Adicionar step de conclusão da resposta
                if (state.actionStatus?.isActive) {
                  addActionStep('✅ Resposta gerada com sucesso', 'completed');
                  // Limpar action status após 3 segundos
                  setTimeout(() => {
                    finishActionTracking(true);
                  }, 3000);
                }
                
                // NÃO FECHAR AINDA - aguardar metadados
                // eventSource.close();
                // resolve();
              }
            } catch (error) {
              console.error('[useOptimizedChat] Error handling stream data:', error);
            }
          };

          eventSource.addEventListener('chunk', handleIncoming);
          eventSource.onmessage = handleIncoming;

          // Log básico de erro
          eventSource.addEventListener('error', (error) => {
            console.log('[useOptimizedChat] EventSource error:', error);
          });
          
          // Capturar eventos de progresso (desativado para evitar UI duplicada)
          eventSource.addEventListener('progress', (event) => {
            try {
              const progressData = JSON.parse((event as MessageEvent).data as string);
              console.log('[useOptimizedChat] Progress event (ignored for UI):', progressData);
            } catch (e) {
              console.warn('[useOptimizedChat] Failed to parse progress data:', e);
            }
          });

          // Capturar metadados de intenção/ações
          eventSource.addEventListener('metadata', (event) => {
            try {
              const meta = JSON.parse((event as MessageEvent).data as string);
              console.log('[useOptimizedChat] ===== METADATA EVENT RECEIVED =====');
              console.log('[useOptimizedChat] Raw event:', event);
              console.log('[useOptimizedChat] Event data:', (event as MessageEvent).data);
              console.log('[useOptimizedChat] Parsed metadata:', meta);
              console.log('[useOptimizedChat] requiresConfirmation:', meta?.requiresConfirmation);
              console.log('[useOptimizedChat] actionData:', meta?.actionData);
              console.log('[useOptimizedChat] businessData:', meta?.businessData);
              
              // Processar dados do Business Mode (gráficos e métricas)
              if (streamingMessage && (meta?.business || meta?.businessData)) {
                console.log('[useOptimizedChat]  BUSINESS DATA RECEIVED!');
                const businessMetadata = {
                  ...streamingMessage.metadata,
                  business: Boolean(meta?.business),
                  companyId: meta?.companyId,
                  companyName: meta?.companyName,
                  businessData: meta?.businessData
                };

                streamingMessage.metadata = businessMetadata;
                console.log('[useOptimizedChat]  Updated metadata with businessData:', businessMetadata);

                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === streamingMessage.id
                      ? { ...streamingMessage, metadata: businessMetadata }
                      : msg
                  )
                }));
              }

              // Processar ação executada automaticamente (novo: actionExecuted)
              if (meta?.actionExecuted && meta?.automationData && streamingMessage) {
                console.log('[useOptimizedChat]  AÇÃO EXECUTADA AUTOMATICAMENTE!');
                console.log('[useOptimizedChat] Intent:', meta.intent);
                console.log('[useOptimizedChat] AutomationData:', meta.automationData);
                console.log('[useOptimizedChat] Entities:', meta.entities);
                
                // Extrair dados do automationData (pode vir como {deleted: {...}} ou direto)
                const actionData = meta.automationData.deleted || 
                                   meta.automationData.updated || 
                                   meta.automationData.created ||
                                   meta.automationData;
                
                // Atualizar mensagem com dados da ação executada
                const updatedMetadata = {
                  ...streamingMessage.metadata,
                  actionExecuted: true,
                  intent: meta.intent,
                  entities: meta.entities,
                  confidence: meta.confidence,
                  automationData: {
                    type: meta.intent,
                    success: true,
                    data: actionData
                  },
                  actions: [{
                    type: meta.intent,
                    description: `${meta.intent} executado com sucesso`,
                    executed: true,
                    data: actionData
                  }]
                };
                
                streamingMessage.metadata = updatedMetadata;
                
                console.log('[useOptimizedChat] 📦 Updated metadata with actions:', updatedMetadata);
                
                // FORÇAR ATUALIZAÇÃO IMEDIATA DO ESTADO
                setState(prev => {
                  const updatedMessages = prev.messages.map(msg => 
                    msg.id === streamingMessage.id 
                      ? { ...streamingMessage, metadata: updatedMetadata }
                      : msg
                  );
                  console.log('[useOptimizedChat] 📊 State updated, messages count:', updatedMessages.length);
                  return {
                    ...prev,
                    messages: updatedMessages
                  };
                });
              }
              // Processar actionData do backend (novo formato) - requer confirmação
              else if (meta?.requiresConfirmation && meta?.actionData) {
                console.log('[useOptimizedChat] Processing actionData:', meta.actionData);
                console.log('[useOptimizedChat] SETTING PENDING ACTION NOW!');
                
                // Adicionar step de ação pendente
                if (state.actionStatus?.isActive) {
                  addActionStep(`⚡ Ação ${meta.actionData.type} detectada, aguardando confirmação...`, 'completed');
                  finishActionTracking(true);
                }
                
                // ATUALIZAR A MENSAGEM COM OS METADADOS CORRETOS
                if (streamingMessage) {
                  streamingMessage.metadata = {
                    ...streamingMessage.metadata,
                    requiresConfirmation: true,
                    actionData: meta.actionData,
                    intent: meta.intent,
                    entities: meta.entities,
                    confidence: meta.confidence
                  };
                  console.log('[useOptimizedChat] Updated streamingMessage.metadata:', streamingMessage.metadata);
                  
                  // FORÇAR ATUALIZAÇÃO IMEDIATA DO ESTADO
                  setState(prev => {
                    const newState = {
                      ...prev,
                      pendingAction: { 
                        action: meta.actionData.type, 
                        payload: meta.actionData.entities || {}, 
                        autoExecute: false, 
                        executed: false 
                      },
                      // ATUALIZAR MENSAGENS COM METADADOS
                      messages: prev.messages.map(msg => 
                        streamingMessage && msg.id === streamingMessage.id 
                          ? { ...streamingMessage }
                          : msg
                      )
                    };
                    console.log('[useOptimizedChat] New state with pendingAction:', newState.pendingAction);
                    console.log('[useOptimizedChat] Updated message with metadata:', newState.messages.find(m => m.id === streamingMessage?.id));
                    return newState;
                  });
                }
              }
              // Fallback para formato antigo
              else if (meta?.intent && typeof streamingMessage?.content === 'string') {
                const intent = String(meta.intent);
                if (['CREATE_TRANSACTION', 'CREATE_GOAL', 'CREATE_INVESTMENT'].includes(intent)) {
                  let payload: Record<string, unknown> | null = null;
                  if (intent === 'CREATE_TRANSACTION') {
                    payload = extractTransactionFromText(streamingMessage.content);
                  } else if (intent === 'CREATE_GOAL') {
                    payload = extractGoalFromText(streamingMessage.content, meta.entities);
                  } else if (intent === 'CREATE_INVESTMENT') {
                    payload = extractInvestmentFromText(streamingMessage.content, meta.entities);
                  }
                  setState(prev => ({
                    ...prev,
                    pendingAction: { action: intent, payload: payload || {}, autoExecute: false, executed: false }
                  }));
                }
              }
            } catch (e) {
              console.warn('[useOptimizedChat] Failed to parse metadata:', e);
            }
          });

          eventSource.addEventListener('complete', async () => {
            console.log('[useOptimizedChat] Stream completed');
            console.log('[useOptimizedChat] 📦 streamingMessage.metadata at complete:', streamingMessage?.metadata);
            isCompleted = true;
            
            // Aguardar um pouco para garantir que metadados foram processados
            setTimeout(() => {
              setState(prev => {
                // Encontrar a mensagem atual no estado para preservar metadata
                const currentMessage = prev.messages.find(m => m.id === streamingMessage?.id);
                const currentMetadata = currentMessage?.metadata || streamingMessage?.metadata || {};
                
                console.log('[useOptimizedChat] 🔄 Complete - current metadata:', currentMetadata);
                console.log('[useOptimizedChat] 🔄 Complete - actions:', currentMetadata.actions);
                
                return {
                  ...prev,
                  messages: prev.messages.map(msg => 
                    msg.id === streamingMessage?.id 
                      ? { 
                          ...msg, // Preservar a mensagem atual do state
                          content: streamingMessage?.content || msg.content,
                          metadata: {
                            ...currentMetadata, // Preservar metadata existente (incluindo actions)
                            isStreaming: false,
                            isComplete: true
                          }
                        }
                      : msg
                  )
                };
              });
              
              updateState({ 
                isStreaming: false, 
                isLoading: false,
                connectionStatus: 'connected'
              });
              
              try {
                const currentState = { ...state };
                const shouldAuto = currentState.pendingAction?.autoExecute && !currentState.pendingAction?.executed;
                if (shouldAuto && currentState.chatId) {
                  executePendingAction();
                }
              } finally {
                eventSource.close();
                resolve();
              }
            }, 500); // Aguardar 500ms para metadados
          });

          // Tratamento de erro mais específico: não acionar fallback prematuro
          eventSource.addEventListener('error', (event) => {
            console.warn('[useOptimizedChat] EventSource error (não crítico, aguardando reconexão/timeout):', {
              event,
              readyState: eventSource.readyState
            });
            // Não rejeitar aqui; deixar o timeout cuidar do fallback
          });
        });
      });
    };

    try {
      // Confirmação de ação pendente: se usuário disser "sim"
      const isConfirm = /^(sim|pode confirmar|confirmo|ok|pode|confirma)$/i.test(content.trim());
      if (isConfirm && state.pendingAction && (state.chatId || null)) {
        const action = state.pendingAction;
        try {
          updateState({ isLoading: true });
          const result = await chatbotAPI.executeAction({ 
            action: action.action, 
            payload: action.payload, 
            chatId: state.chatId as string,
            message: content // 🔧 CORREÇÃO: Adicionar mensagem para evitar erro "Mensagem é obrigatória"
          });
          const successText = result?.text || '✅ Ação executada com sucesso!';
          const botMessage: ChatMessage = {
            id: generateMessageId(),
            sender: 'assistant',
            content: successText,
            timestamp: new Date(),
            metadata: { actions: [{ type: action.action, description: 'Executada', executed: true }] }
          };
          addMessage(botMessage);
          updateState({ isLoading: false, pendingAction: null });
          return;
        } catch (error) {
          console.error('[useOptimizedChat] Error executing action:', error);
          updateState({ isLoading: false, error: 'Erro ao executar ação' });
          return;
        }
      }

      // Adicionar mensagem do usuário IMEDIATAMENTE (a não ser que o caller já tenha adicionado)
      if (!skipUserMessage) {
        const userMessage: ChatMessage = {
          id: generateMessageId(),
          sender: 'user',
          content,
          timestamp: new Date()
        };
        addMessage(userMessage);
      }
      updateState({ isLoading: !useStreaming, error: null });

      // Garantir chatId localmente (evita esperar para exibir a mensagem)
      let activeChatId = state.chatId;
      if (!activeChatId) {
        console.log('[useOptimizedChat] Criando nova sessão pois chatId está vazio');
        activeChatId = await createSession();
        console.log('[useOptimizedChat] Usando chatId:', activeChatId);
      } else {
        console.log('[useOptimizedChat] Reutilizando chatId existente:', activeChatId);
      }

      // IMPORTANTE: Garantir que o chatId seja salvo no estado
      if (activeChatId && !state.chatId) {
        console.log('[useOptimizedChat] Salvando chatId no estado:', activeChatId);
        updateState({ chatId: activeChatId });
      }
      
      // Usar streaming se disponível, com contexto de negócio
      if (useStreaming) {
        console.log('[useOptimizedChat] Usando streaming com chatId:', activeChatId);
        await sendStreamingMessage(content, activeChatId || '');
      } else {
        // Fallback to regular message - implement basic message sending
        // Adicionar mensagem temporária "Analisando..."
        const tempMessageId = generateMessageId();
        const tempMessage: ChatMessage = {
          id: tempMessageId,
          sender: 'assistant',
          content: '🤔 Analisando sua mensagem...',
          timestamp: new Date(),
          metadata: { isStreaming: true }
        };
        addMessage(tempMessage);
        
        const response = await chatbotAPI.sendQuery({
          message: content,
          chatId: activeChatId || '',
          context: {
            mode,
            companyId: currentCompany?.id,
            companyName: currentCompany?.name,
            currentRoute: typeof window !== 'undefined' ? window.location.pathname : '',
            persona: mode === 'business' ? 'business_senior_expert' : 'personal_assistant',
            expertise: mode === 'business'
              ? ['erp','finance','accounting','inventory','manufacturing','crm','hr','compliance','bi','analytics','integrations','apis','data_modeling','sql','nosql','project_management','ads_google','ads_meta','ads_tiktok','ads_linkedin','ads_x','ads_youtube']
              : ['personal_finance','productivity','general_assistant'],
            locale: 'pt-BR'
          }
        });
        
        // Substituir a mensagem temporária pela resposta real e limpar flags
        const responseText = response.message || response.text || response.response || 'Erro ao obter resposta';
        const botMessage: ChatMessage = {
          id: generateMessageId(),
          sender: 'assistant',
          content: responseText,
          timestamp: new Date(),
          metadata: response.metadata || {}
        };
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === tempMessageId ? botMessage : m),
          isLoading: false,
          isStreaming: false,
          error: null
        }));
    }
  } catch (error) {
    console.error('[useOptimizedChat] Error sending message:', error);
    const rawMessage = error instanceof Error ? error.message : String(error ?? '');
    const normalized = rawMessage.toLowerCase();
    if (normalized.includes('limite de uso de ia') || normalized.includes('limit_exceeded')) {
      showLimitExceededMessage();
      return;
    }
    updateState({
      error: rawMessage || 'Erro ao enviar mensagem',
      isLoading: false,
      isStreaming: false
    });
  }
  }, [state, createSession, addMessage, updateState, generateMessageId, executePendingAction, mode, currentCompany?.id, currentCompany?.name, startActionTracking, addActionStep, finishActionTracking, showLimitExceededMessage]);

  // Atualizar refs quando as funções mudarem
  useEffect(() => {
    // sendRegularMessageRef.current = sendRegularMessage; // This line is removed as per the edit hint
  }, []); // Empty dependency array as sendRegularMessage and sendStreamingMessage are now defined inline

  useEffect(() => {
    // sendStreamingMessageRef.current = sendStreamingMessage; // This line is removed as per the edit hint
  }, []); // Empty dependency array as sendRegularMessage and sendStreamingMessage are now defined inline

  // ===== LIMPEZA E UTILITÁRIOS =====
  const clearMessages = useCallback(() => {
    console.log('[useOptimizedChat] Limpando mensagens e chatId');
    setState(prev => ({
      ...prev,
      messages: [],
      chatId: null, // IMPORTANTE: Limpar chatId para forçar nova sessão
      error: null,
      pendingAction: null,
      actionStatus: {
        isActive: false,
        currentAction: '',
        progress: []
      },
      dataCorrectionModal: { isOpen: false, data: null }
    }));
    messageCache.current.clear();
  }, []);

  const clearPendingAction = useCallback(() => {
    setState(prev => ({ ...prev, pendingAction: null }));
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = state.messages.filter(msg => msg.sender === 'user').pop();
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, sendMessage]);

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    updateState({ 
      isLoading: false, 
      isStreaming: false 
    });
  }, [updateState]);

  useEffect(() => {
    const companyId = typeof currentCompany?.id === 'string' ? currentCompany.id : '';
    const nextContextKey = mode === 'business' ? `business:${companyId}` : 'personal';

    if (chatContextKeyRef.current === null) {
      chatContextKeyRef.current = nextContextKey;
      return;
    }

    if (chatContextKeyRef.current !== nextContextKey) {
      console.log('[useOptimizedChat] Contexto mudou, resetando conversa:', {
        from: chatContextKeyRef.current,
        to: nextContextKey
      });

      chatContextKeyRef.current = nextContextKey;
      cancelCurrentRequest();
      clearMessages();
    }
  }, [mode, currentCompany?.id, cancelCurrentRequest, clearMessages]);

  const deleteSession = useCallback(async (sessionId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== sessionId)
    }));
    messageCache.current.remove(sessionId);
  }, []);

  const deleteAllSessions = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      chatId: null
    }));
    messageCache.current.clear();
  }, []);

  const getSessions = useCallback(() => {
    return Array.from(new Set(state.messages.map(msg => msg.id).filter(Boolean)));
  }, [state.messages]);

  // Função para carregar uma sessão específica com suas mensagens
  const loadChatSession = useCallback(async (chatId: string) => {
    try {
      updateState({ isLoading: true, error: null });
      console.log('[useOptimizedChat] Carregando sessão:', chatId);

      const sessionData = await chatbotAPI.getSession(chatId);
      console.log('[useOptimizedChat] Dados da sessão recebidos:', sessionData);

      if (sessionData?.messages && Array.isArray(sessionData.messages)) {
        const formattedMessages = sessionData.messages.map((msg: Record<string, unknown>) => {
          const baseMetadata = (msg.metadata as Record<string, unknown>) || {};
          const attachments = (msg.attachments as Array<{
            type?: string;
            url?: string;
            mime?: string;
            size?: number;
            transcript?: string;
            ocrText?: string;
          }>) || [];

          let richMetadata = baseMetadata;
          if (attachments.length) {
            const richAttachments = attachments
              .filter(att => !!att && typeof att.url === 'string' && typeof att.type === 'string')
              .map(att => ({
                type: att.type === 'audio' ? 'audio' as const : 'image' as const,
                url: att.url as string,
                title: att.type === 'audio' ? 'Áudio enviado' : 'Imagem enviada',
                alt: att.ocrText,
              }));

            if (richAttachments.length) {
              richMetadata = {
                ...baseMetadata,
                richAttachments,
              };
            }
          }

          const formatted: ChatMessage = {
            id: (msg._id as string) || (msg.id as string) || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sender: (msg.sender as 'user' | 'assistant') || ((msg.role as string) === 'user' ? 'user' : 'assistant'),
            content: (msg.content as string) || (msg.message as string) || '',
            timestamp: msg.timestamp
              ? new Date(msg.timestamp as string | number)
              : new Date((msg.createdAt as string | number) || Date.now()),
            metadata: richMetadata as ChatMessage['metadata'],
          };

          return formatted;
        });

        console.log('[useOptimizedChat] Mensagens formatadas:', formattedMessages.length);

        messageCache.current.clear();

        updateState({
          chatId,
          messages: formattedMessages,
          isLoading: false,
          error: null
        });

        messageCache.current.set(chatId, formattedMessages);

        return formattedMessages;
      }

      console.warn('[useOptimizedChat] Sessão sem mensagens ou formato inválido');
      updateState({
        chatId,
        messages: [],
        isLoading: false,
        error: null
      });
      return [];
    } catch (error) {
      console.error('[useOptimizedChat] Erro ao carregar sessão:', error);
      updateState({
        isLoading: false,
        error: 'Erro ao carregar conversa'
      });
      throw error;
    }
  }, [updateState]);

  // Cleanup on unmount
  useEffect(() => {
    const eventSource = eventSourceRef.current;
    const abortController = abortControllerRef.current;

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  // Funções para modal de correção de dados
  const openDataCorrectionModal = useCallback((data: DataCorrectionRequest) => {
    setState(prev => ({
      ...prev,
      dataCorrectionModal: { isOpen: true, data }
    }));
  }, []);

  const closeDataCorrectionModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      dataCorrectionModal: { isOpen: false, data: null }
    }));
  }, []);

  return {
    // Estado
    messages: state.messages,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    chatId: state.chatId,
    connectionStatus: state.connectionStatus,
    pendingAction: state.pendingAction,
    actionStatus: state.actionStatus,
    dataCorrectionModal: state.dataCorrectionModal,

    // Ações
    sendMessage,
    createSession,
    retryLastMessage,
    cancelCurrentRequest,
    clearMessages,
    clearPendingAction,
    deleteSession,
    deleteAllSessions,
    getSessions,
    loadChatSession,
    addAssistantMessage,
    addCustomMessage,
    updateMessageById,

    // Ações em tempo real
    startActionTracking,
    addActionStep,
    finishActionTracking,

    // Modal de correção
    openDataCorrectionModal,
    closeDataCorrectionModal,

    // Utilitários
    hasMessages: state.messages.length > 0,
    lastMessage: state.messages[state.messages.length - 1] || null,
    messageCount: state.messages.length
  };
};

export default useOptimizedChat;