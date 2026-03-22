// ================================================================
// CHATBOT OPTIMIZATION CONFIG
// Importa prompts e respostas do arquivo centralizado aiPrompts.ts
// Para personalizar a IA, edite APENAS aiPrompts.ts
// ================================================================
import {
  QUICK_RESPONSES as PROMPTS_QUICK_RESPONSES,
  FALLBACK_RESPONSES,
  AI_MODEL_CONFIG,
} from './aiPrompts';

export const CHATBOT_OPTIMIZATION_CONFIG = {
  // Performance
  MAX_RESPONSE_TIME: 5000,
  CACHE_TTL: 5 * 60 * 1000,
  MAX_CACHE_SIZE: 50,
  MAX_HISTORY_MESSAGES: AI_MODEL_CONFIG.maxHistoryMessages,

  // IA
  MAX_TOKENS: AI_MODEL_CONFIG.maxTokens,
  TEMPERATURE: AI_MODEL_CONFIG.temperature,
  TIMEOUT: 5000,

  // Contexto
  ENABLE_REAL_CONTEXT: true,
  ENABLE_CACHE: true,
  ENABLE_FALLBACK: true,

  // Logs
  ENABLE_DETAILED_LOGS: false,
  LOG_RESPONSE_TIME: true,

  // Fallbacks — importados do arquivo de prompts
  FALLBACK_RESPONSES,
};

// Re-exportar do arquivo centralizado
export const QUICK_INTENT_DETECTION = {
  GREETINGS: ['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem'],
  HELP: ['ajuda', 'ajudar', 'ajude', 'como', 'quero'],
  TRANSACTIONS: ['transação', 'transacao', 'gasto', 'receita', 'despesa'],
  INVESTMENTS: ['investimento', 'investir'],
  GOALS: ['meta', 'objetivo', 'sonho', 'juntar'],
  FRUSTRATION: ['cards', 'repetindo', 'mesma coisa', 'não sabe dialogar'],
};

export const QUICK_RESPONSES = PROMPTS_QUICK_RESPONSES;
