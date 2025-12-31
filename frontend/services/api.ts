import axios from 'axios';
import logger from '../utils/logger';

// import { createClient } from '@supabase/supabase-js'; // Removido temporariamente
import { supabase } from '../lib/supabaseClient';
import {
  // Transacao,
  // NovaTransacaoPayload,
  // AtualizarTransacaoPayload,
  // Investimento,
  Meta
} from "../types";
import { MarketData } from '../types/market';

const isProd = process.env.NODE_ENV === 'production';

// Supabase client for BOVINEXT
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey); // Removido temporariamente

// Chat types
interface ChatMessage {
  message: string;
  chatId: string;
  context?: Record<string, unknown>;
  history?: Array<{ role: string; content: string; }>;
}

interface AutomatedAction {
  action: string;
  payload: Record<string, unknown>;
  chatId?: string;
  message?: string; // 🔧 CORREÇÃO: Adicionar campo message
}

// Market data types
interface MarketDataResponse {
  symbols: Record<string, { price: number; change: number; }>;
  cryptos: Record<string, { price: number; change: number; }>;
  commodities: Record<string, { price: number; change: number; }>;
}

// Dashboard types
interface DashboardDataPayload {
  symbols: string[];
  timeframe?: string;
  indicators?: string[];
}

// Error response type
interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
}

// Card and Mileage types
// Unused interfaces commented out to reduce lint warnings
// interface CreditCard { ... }
// interface MileageCard { ... }
// interface MileageProgram { ... }
// interface MileageTransaction { ... }
// interface MileageCalculatorParams { ... }

export interface MarketDataRequest {
  symbols: string[];
  cryptos: string[];
  commodities: string[];
  fiis: string[];
  etfs: string[];
  currencies: string[];
  manualAssets: { symbol: string; price: number; change: number; }[];
  customIndicesList: string[];
}

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, ''),
  timeout: 30000, // 30s padrão; endpoints específicos podem ajustar
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticação BOVINEXT com Supabase
api.interceptors.request.use(async (config) => {
  if (!isProd) logger.log(`[api.ts] 🚀 Iniciando requisição BOVINEXT: ${config.method?.toUpperCase()} ${config.url}`);
  
  // Detectar mobile
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Obter sessão do Supabase
  let session = null as Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (e) {
    logger.warn('[api.ts] Não foi possível obter sessão do Supabase:', e);
  }

  if (!isProd) {
    logger.log(`[api.ts] 👤 Estado do usuário Supabase:`, {
      sessionExists: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      emailVerified: session?.user?.email_confirmed_at,
      isMobile,
    });
  }

  if (session?.user) {
    logger.log(`[api.ts] 🔑 Usuário Supabase encontrado (ID: ${session.user.id}). Obtendo token para: ${config.url}`);
    try {
      // Obter token de acesso do Supabase
      const accessToken = session.access_token;
      
      if (!isProd) logger.log(`[api.ts] ✅ Token Supabase obtido para: ${config.url} (mobile: ${isMobile})`);
      
      config.headers.Authorization = `Bearer ${accessToken}`;
      
      // Headers específicos para mobile
      if (isMobile) {
        config.headers['X-Mobile-Request'] = 'true';
        config.headers['X-User-Agent'] = navigator.userAgent;
      }
      
      if (!isProd) logger.log(`[api.ts] ✅ Header Authorization configurado para: ${config.url}`);
    } catch (error) {
      logger.error(`[api.ts] ❌ Erro ao obter token Supabase para: ${config.url} (mobile: ${isMobile})`, error);
      
      // Tratamento específico para mobile
      if (isMobile && error instanceof Error) {
        if (error.message.includes('network-request-failed')) {
          logger.error(`[api.ts] 📱 Erro de rede específico do mobile detectado`);
          throw new Error(`Mobile network error: ${error.message}`);
        }
      }
      
      throw new Error(`Failed to get authentication token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    logger.warn(`[api.ts] ⚠️ Nenhum usuário autenticado encontrado. Requisição para ${config.url} será não autenticada (mobile: ${isMobile}).`);
    logger.warn(`[api.ts] 📋 Headers da requisição:`, config.headers);
  }

  return config;
}, (error) => {
  logger.error('[api.ts] ❌ Erro no interceptor de requisição:', error);
  return Promise.reject(error);
});

// Interceptor para tratamento de erros com logs detalhados
api.interceptors.response.use(
  (response) => {
    const redactedHeaders = { ...(response.config.headers || {}) } as Record<string, unknown>;
    if (redactedHeaders['Authorization']) redactedHeaders['Authorization'] = 'REDACTED';
    logger.log(`[api.ts] ✅ Resposta bem-sucedida de ${response.config.url}`, {
      status: response.status,
      method: response.config.method,
      headers: redactedHeaders,
      data: response.data
    });
    return response;
  },
  (error) => {
    const redactedHeaders = { ...(error.config?.headers || {}) } as Record<string, unknown>;
    if (redactedHeaders['Authorization']) redactedHeaders['Authorization'] = 'REDACTED';
    logger.error(`[api.ts] ❌ Erro de resposta de ${error.config?.url || 'endpoint desconhecido'}:`, {
      code: error.code,
      status: error.response?.status,
      message: error.message,
      method: error.config?.method,
      responseData: error.response?.data,
      headers: redactedHeaders
    });

    if (error.code === 'ECONNABORTED') {
      logger.error('[api.ts] ⏰ Timeout da requisição');
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    if (error.response?.status === 401) {
      logger.warn('[api.ts] 🔒 401 Unauthorized - Redirecionando para login');
      logger.warn('[api.ts] 📋 Detalhes do erro 401:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: redactedHeaders,
        responseData: error.response?.data
      });
      const currentPath = window.location.pathname;
      const redirectPath = currentPath === '/' ? '' : currentPath;
      window.location.href = `/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
    }
    
    if (error.response?.status === 404) {
      logger.error('[api.ts] 🔍 404 Not Found - Recurso não disponível');
      return Promise.reject(new Error('The requested resource was not found.'));
    }
    
    if (error.response?.status >= 500) {
      logger.error('[api.ts] 💥 Erro do servidor');
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// --- MARKET DATA API ---
export const marketDataAPI = {
  getMarketData: async (requestBody: MarketDataRequest): Promise<MarketData> => {
    try {
      logger.log('[marketDataAPI] Buscando dados do mercado:', requestBody);
      const response = await api.post('/api/market-data', requestBody, {
        timeout: 30000 // Aumentando timeout para 30 segundos
      });
      logger.log('[marketDataAPI] Dados do mercado obtidos com sucesso:', response.data);
      
      // Garantir que lastUpdated seja sempre uma string
      const marketData: MarketData = {
        ...response.data,
        lastUpdated: typeof response.data.lastUpdated === 'string' 
          ? response.data.lastUpdated 
          : new Date().toISOString()
      };
      
      return marketData;
    } catch (error) {
      logger.error('[marketDataAPI] Erro ao buscar dados do mercado:', error);
      throw error;
    }
  }
};

// --- BOVI CHATBOT API ---
export const chatbotAPI = {
  healthCheck: async () => {
    try {
      const response = await api.get('/api/chatbot/health', { timeout: 10000 });
      logger.log('[chatbotAPI] ✅ BOVI health check:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] ❌ Erro no BOVI health check:', error);
      throw error;
    }
  },
  sendQuery: async (data: ChatMessage) => {
    try {
      logger.log('[chatbotAPI] 📤 Enviando consulta:', data);
      
      // ✅ CORREÇÃO: Usar endpoint correto que salva nas sessões
      const response = await api.post('/api/chatbot/query', {
        message: data.message,
        chatId: data.chatId
      });

      logger.log('[chatbotAPI] ✅ Resposta recebida com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] ❌ Erro ao enviar consulta:', error);
      logger.error('[chatbotAPI] ❌ Detalhes do erro:', {
        message: (error as ErrorResponse)?.response?.data?.message,
        status: (error as ErrorResponse)?.response?.status,
        statusText: (error as ErrorResponse)?.response?.statusText
      });
      throw error;
    }
  },
  openStream: async ({ message, chatId, extraParams }: { message: string; chatId: string; extraParams?: Record<string, string> }): Promise<EventSource> => {
    try {
      // Obter sessão do Supabase para autenticação
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      // Detectar mobile
      const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Usar token do Supabase se disponível
      const token = session?.access_token || '';

      const base = (api.defaults.baseURL || '').replace(/\/$/, '');
      
      // Construir URL com parâmetros extras
      const params = new URLSearchParams({
        message,
        chatId,
        token,
        mobile: String(isMobile),
        ...(extraParams || {})
      });
      
      const url = `${base}/api/chatbot/stream?${params.toString()}`;

      logger.log('[chatbotAPI] 🔌 Abrindo BOVI stream via EventSource:', { 
        url: `${base}/api/chatbot/stream?...`, 
        hasToken: !!token, 
        withCredentials: false,
        isMobile 
      });
      
      // Configurações específicas para EventSource em mobile
      const eventSourceConfig = {
        withCredentials: false,
        ...(isMobile && {
          // Configurações específicas para mobile se necessário
        })
      };
      
      return new EventSource(url, eventSourceConfig);
    } catch (error) {
      logger.error('[chatbotAPI] ❌ Erro ao abrir stream:', error);
      throw error;
    }
  },
  executeAction: async (actionData: AutomatedAction) => {
    logger.log('[chatbotAPI] BOVI executando ação:', actionData);
    try {
      const response = await api.post('/api/automated-actions/execute', actionData);
      logger.log('[chatbotAPI] BOVI ação executada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] BOVI erro ao executar ação:', error);
      throw error;
    }
  },
  getSessions: async () => {
    logger.log('[chatbotAPI] Buscando sessões');
    try {
      const response = await api.get('/api/chatbot/sessions', {
        timeout: 90000 // 90 segundos para sessões
      });
      logger.log('[chatbotAPI] Sessões obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] Erro ao buscar sessões:', error);
      throw error;
    }
  },
  startNewSession: async () => {
    logger.log('[chatbotAPI] Iniciando nova sessão');
    try {
      const response = await api.post('/api/chatbot/sessions');
      logger.log('[chatbotAPI] Nova sessão iniciada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] Erro ao iniciar nova sessão:', error);
      throw error;
    }
  },
  deleteSession: async (chatId: string) => {
    logger.log('[chatbotAPI] Deletando sessão:', chatId);
    try {
      const response = await api.delete(`/api/chatbot/sessions/${encodeURIComponent(chatId)}`);
      logger.log('[chatbotAPI] Sessão deletada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] Erro ao deletar sessão:', error);
      throw error;
    }
  },
  deleteAllSessions: async () => {
    logger.log('[chatbotAPI] Deletando todas as sessões do usuário logado');
    try {
      const response = await api.delete('/api/chatbot/sessions');
      logger.log('[chatbotAPI] Todas as sessões deletadas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] Erro ao deletar todas as sessões:', error);
      throw error;
    }
  },
  getSession: async (chatId: string) => {
    logger.log('[chatbotAPI] Buscando sessão:', chatId);
    try {
      const response = await api.get(`/api/chatbot/sessions/${chatId}`);
      logger.log('[chatbotAPI] Sessão obtida com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] Erro ao buscar sessão:', error);
      throw error;
    }
  },
  confirmAction: async (actionData: Record<string, unknown>, action: 'confirm' | 'cancel') => {
    logger.log('[chatbotAPI] Confirmando ação:', { actionData, action });
    try {
      const response = await api.post('/api/chatbot/confirm-action', {
        actionData,
        action
      });
      logger.log('[chatbotAPI] Ação confirmada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] Erro ao confirmar ação:', error);
      throw error;
    }
  },
  saveUserFeedback: async (feedback: {
    messageId: string;
    rating: number;
    helpful: boolean;
    comment?: string;
    category: 'accuracy' | 'helpfulness' | 'clarity' | 'relevance';
    context?: string;
  }) => {
    logger.log('[chatbotAPI] Enviando feedback:', feedback);
    try {
      const response = await api.post('/api/chatbot/feedback', feedback);
      logger.log('[chatbotAPI] Feedback enviado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[chatbotAPI] Erro ao enviar feedback:', error);
      throw error;
    }
  }
};

// --- SUBSCRIPTION API ---
// removed

// API para Investimentos com logs
// removed

// API para Transações com logs
// API para Transações
export const transacaoAPI = {
  getAll: async () => {
    logger.log('[transacaoAPI] Buscando todas as transações');
    try {
      const response = await api.get('/api/transacoes');
      logger.log('[transacaoAPI] Transações obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[transacaoAPI] Erro ao buscar transações:', error);
      throw error;
    }
  },
  
  create: async (transacao: Record<string, unknown>) => {
    logger.log('[transacaoAPI] Criando nova transação:', transacao);
    try {
      const response = await api.post('/api/transacoes', transacao);
      logger.log('[transacaoAPI] Transação criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[transacaoAPI] Erro ao criar transação:', error);
      throw error;
    }
  },
  
  update: async (id: string, transacao: Record<string, unknown>) => {
    logger.log(`[transacaoAPI] Atualizando transação ${id}:`, transacao);
    try {
      const response = await api.put(`/api/transacoes/${id}`, transacao);
      logger.log(`[transacaoAPI] Transação ${id} atualizada com sucesso:`, response.data);
      return response.data;
    } catch (error) {
      logger.error(`[transacaoAPI] Erro ao atualizar transação ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    logger.log(`[transacaoAPI] Excluindo transação ${id}`);
    try {
      await api.delete(`/api/transacoes/${id}`);
      logger.log(`[transacaoAPI] Transação ${id} excluída com sucesso`);
    } catch (error) {
      logger.error(`[transacaoAPI] Erro ao excluir transação ${id}:`, error);
      throw error;
    }
  }
};

// API para Investimentos
export const investimentoAPI = {
  getAll: async () => {
    logger.log('[investimentoAPI] Buscando todos os investimentos');
    try {
      const response = await api.get('/api/investimentos');
      logger.log('[investimentoAPI] Investimentos obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[investimentoAPI] Erro ao buscar investimentos:', error);
      throw error;
    }
  },
  
  create: async (investimento: Record<string, unknown>) => {
    logger.log('[investimentoAPI] Criando novo investimento:', investimento);
    try {
      const response = await api.post('/api/investimentos', investimento);
      logger.log('[investimentoAPI] Investimento criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[investimentoAPI] Erro ao criar investimento:', error);
      throw error;
    }
  },
  
  update: async (id: string, investimento: Record<string, unknown>) => {
    logger.log(`[investimentoAPI] Atualizando investimento ${id}:`, investimento);
    try {
      const response = await api.put(`/api/investimentos/${id}`, investimento);
      logger.log(`[investimentoAPI] Investimento ${id} atualizado com sucesso:`, response.data);
      return response.data;
    } catch (error) {
      logger.error(`[investimentoAPI] Erro ao atualizar investimento ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    logger.log(`[investimentoAPI] Excluindo investimento ${id}`);
    try {
      await api.delete(`/api/investimentos/${id}`);
      logger.log(`[investimentoAPI] Investimento ${id} excluído com sucesso`);
    } catch (error) {
      logger.error(`[investimentoAPI] Erro ao excluir investimento ${id}:`, error);
      throw error;
    }
  }
};

// API para Metas com logs
export const metaAPI = {
  getAll: async (): Promise<Meta[]> => {
    logger.log('[metaAPI] Fetching all goals');
    try {
      const response = await api.get("/api/goals");
      logger.log('[metaAPI] Successfully fetched goals', {
        count: response.data?.length || 0
      });
      
      const metas = response.data?.metas || response.data || [];
      const normalizedMetas = metas.map((meta: Partial<Meta>) => ({
        _id: meta._id,
        meta: meta.meta || '',
        valor_total: meta.valor_total || 0,
        valor_atual: meta.valor_atual || 0,
        data_conclusao: meta.data_conclusao || '',
        concluida: ((meta.valor_atual || 0) >= (meta.valor_total || 0)) || meta.concluida || false,
        categoria: meta.categoria,
        prioridade: meta.prioridade,
        createdAt: meta.createdAt,
        descricao: meta.descricao
        
      }));
      
      logger.log('[metaAPI] Normalized goals:', normalizedMetas);
      return normalizedMetas;
    } catch (error) {
      logger.error('[metaAPI] Error fetching goals:', error);
      throw error;
    }
  },
  create: async (meta: Omit<Meta, '_id' | 'concluida' | 'createdAt'>): Promise<Meta> => {
    logger.log('[metaAPI] Creating new goal:', meta);
    try {
      const response = await api.post("/api/goals", meta);
      logger.log('[metaAPI] Goal created successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[metaAPI] Error creating goal:', error);
      throw error;
    }
  },
  update: async (id: string, meta: Partial<Omit<Meta, '_id' | 'createdAt'>> & Record<string, unknown>): Promise<Meta> => {
    logger.log(`[metaAPI] Updating goal ${id}:`, meta);
    try {
      const response = await api.put(`/api/goals/${id}`, meta);
      logger.log(`[metaAPI] Goal ${id} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      logger.error(`[metaAPI] Error updating goal ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    logger.log(`[metaAPI] Deleting goal ${id}`);
    try {
      await api.delete(`/api/goals/${id}`);
      logger.log(`[metaAPI] Goal ${id} deleted successfully`);
    } catch (error) {
      logger.error(`[metaAPI] Error deleting goal ${id}:`, error);
      throw error;
    }
  }
};

// API para Dashboard com logs
export const dashboardAPI = {
  getMarketData: async (payload: DashboardDataPayload): Promise<MarketDataResponse> => {
    logger.log('[dashboardAPI] Buscando dados do mercado:', payload);
    try {
      const response = await api.post('/api/market-data', payload);
      logger.log('[dashboardAPI] Dados do mercado obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[dashboardAPI] Erro ao buscar dados do mercado:', error);
      throw error;
    }
  },
  
  // 🔧 NOVO: API para dados reais do dashboard BOVINEXT
  getKPIs: async () => {
    logger.log('[dashboardAPI] Buscando KPIs do dashboard');
    try {
      const response = await api.get('/api/dashboard/kpis');
      logger.log('[dashboardAPI] KPIs obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[dashboardAPI] Erro ao buscar KPIs:', error);
      throw error;
    }
  },
  
  getChartData: async (type: string, period?: string) => {
    logger.log('[dashboardAPI] Buscando dados do gráfico:', { type, period });
    try {
      const response = await api.get(`/api/dashboard/charts/${type}`, {
        params: { period }
      });
      logger.log('[dashboardAPI] Dados do gráfico obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[dashboardAPI] Erro ao buscar dados do gráfico:', error);
      throw error;
    }
  }
};

// 🔧 NOVO: API para animais/rebanho
export const animalsAPI = {
  getAll: async () => {
    logger.log('[animalsAPI] Buscando todos os animais');
    try {
      const response = await api.get('/api/animals');
      logger.log('[animalsAPI] Animais obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[animalsAPI] Erro ao buscar animais:', error);
      throw error;
    }
  },
  
  create: async (animalData: Record<string, unknown>) => {
    logger.log('[animalsAPI] Criando animal:', animalData);
    try {
      const response = await api.post('/api/animals', animalData);
      logger.log('[animalsAPI] Animal criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[animalsAPI] Erro ao criar animal:', error);
      throw error;
    }
  },
  
  update: async (id: string, animalData: Record<string, unknown>) => {
    logger.log('[animalsAPI] Atualizando animal:', { id, animalData });
    try {
      const response = await api.put(`/api/animals/${id}`, animalData);
      logger.log('[animalsAPI] Animal atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[animalsAPI] Erro ao atualizar animal:', error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    logger.log('[animalsAPI] Deletando animal:', id);
    try {
      const response = await api.delete(`/api/animals/${id}`);
      logger.log('[animalsAPI] Animal deletado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[animalsAPI] Erro ao deletar animal:', error);
      throw error;
    }
  }
};

// 🔧 NOVO: API para produção
export const producaoAPI = {
  getAll: async () => {
    logger.log('[producaoAPI] Buscando dados de produção');
    try {
      const response = await api.get('/api/producao');
      logger.log('[producaoAPI] Dados de produção obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[producaoAPI] Erro ao buscar dados de produção:', error);
      throw error;
    }
  },
  
  create: async (producaoData: Record<string, unknown>) => {
    logger.log('[producaoAPI] Criando registro de produção:', producaoData);
    try {
      const response = await api.post('/api/producao', producaoData);
      logger.log('[producaoAPI] Registro de produção criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[producaoAPI] Erro ao criar registro de produção:', error);
      throw error;
    }
  }
};

// 🔧 NOVO: API para manejo
export const manejoAPI = {
  getAll: async () => {
    logger.log('[manejoAPI] Buscando dados de manejo');
    try {
      const response = await api.get('/api/manejo');
      logger.log('[manejoAPI] Dados de manejo obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[manejoAPI] Erro ao buscar dados de manejo:', error);
      throw error;
    }
  },
  
  create: async (manejoData: Record<string, unknown>) => {
    logger.log('[manejoAPI] Criando registro de manejo:', manejoData);
    try {
      const response = await api.post('/api/manejo', manejoData);
      logger.log('[manejoAPI] Registro de manejo criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[manejoAPI] Erro ao criar registro de manejo:', error);
      throw error;
    }
  }
};

// 🔧 NOVO: API para vendas
export const vendasAPI = {
  getAll: async () => {
    logger.log('[vendasAPI] Buscando dados de vendas');
    try {
      const response = await api.get('/api/vendas');
      logger.log('[vendasAPI] Dados de vendas obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[vendasAPI] Erro ao buscar dados de vendas:', error);
      throw error;
    }
  },
  
  create: async (vendaData: Record<string, unknown>) => {
    logger.log('[vendasAPI] Criando venda:', vendaData);
    try {
      const response = await api.post('/api/vendas', vendaData);
      logger.log('[vendasAPI] Venda criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[vendasAPI] Erro ao criar venda:', error);
      throw error;
    }
  }
};

// 🔧 NOVO: API para perfil do usuário
export const profileAPI = {
  get: async () => {
    logger.log('[profileAPI] Buscando perfil do usuário');
    try {
      const response = await api.get('/api/profile');
      logger.log('[profileAPI] Perfil obtido com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[profileAPI] Erro ao buscar perfil:', error);
      throw error;
    }
  },
  
  update: async (profileData: Record<string, unknown>) => {
    logger.log('[profileAPI] Atualizando perfil:', profileData);
    try {
      const response = await api.put('/api/profile', profileData);
      logger.log('[profileAPI] Perfil atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[profileAPI] Erro ao atualizar perfil:', error);
      throw error;
    }
  }
};

export default api;