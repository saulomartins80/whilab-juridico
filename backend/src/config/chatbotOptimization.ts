// ✅ CONFIGURAÇÕES DE OTIMIZAÇÃO DO CHATBOT
export const CHATBOT_OPTIMIZATION_CONFIG = {
  // Performance
  MAX_RESPONSE_TIME: 5000, // 5 segundos máximo
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 50,
  MAX_HISTORY_MESSAGES: 5, // Últimas 5 mensagens apenas
  
  // IA
  MAX_TOKENS: 300,
  TEMPERATURE: 0.7,
  TIMEOUT: 5000, // 5 segundos
  
  // Contexto
  ENABLE_REAL_CONTEXT: true,
  ENABLE_CACHE: true,
  ENABLE_FALLBACK: true,
  
  // Logs
  ENABLE_DETAILED_LOGS: false, // Reduzir logs para performance
  LOG_RESPONSE_TIME: true,
  
  // Fallbacks
  FALLBACK_RESPONSES: [
    'Olá! Como posso te ajudar hoje?',
    'Entendi! Como posso te ajudar?',
    'Claro! Estou aqui para ajudar com suas finanças!',
    'Perfeito! O que você gostaria de fazer?'
  ]
};

// ✅ DETECÇÃO RÁPIDA DE INTENÇÕES
export const QUICK_INTENT_DETECTION = {
  GREETINGS: ['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem'],
  HELP: ['ajuda', 'ajudar', 'ajude', 'como', 'quero'],
  TRANSACTIONS: ['transação', 'transacao', 'gasto', 'receita', 'despesa'],
  INVESTMENTS: ['investimento', 'investir', 'ivestimento'],
  GOALS: ['meta', 'objetivo', 'sonho', 'juntar'],
  FRUSTRATION: ['cards', 'repetindo', 'mesma coisa', 'não sabe dialogar']
};

// ✅ RESPOSTAS PRÉ-DEFINIDAS PARA PERFORMANCE
export const QUICK_RESPONSES = {
  GREETING: 'Olá! Que bom te ver por aqui! 😊 Como posso te ajudar hoje?',
  HELP: 'Claro! Estou aqui para te ajudar com suas finanças! 💪',
  UNKNOWN: 'Entendi! Como posso te ajudar hoje?',
  ERROR: 'Desculpe, tive um problema técnico. Pode tentar novamente?'
}; 