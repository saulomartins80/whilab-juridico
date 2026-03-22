import { runtimeConfig } from './runtime';

const trim = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
};

const buildAssistantName = (value: string): string => {
  const compact = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '');

  return compact.slice(0, 4).toUpperCase() || 'AI';
};

const defaultProductName = runtimeConfig.brandName || 'BoviNext';
const defaultAssistantName = buildAssistantName(defaultProductName);
const defaultVertical = 'pecuaria';
const defaultOperationLabel = 'fazenda';

const assistantName =
  trim(process.env.APP_AI_ASSISTANT_NAME) ||
  trim(process.env.NEXT_PUBLIC_ASSISTANT_NAME) ||
  defaultAssistantName;

const productName =
  trim(process.env.APP_AI_PRODUCT_NAME) ||
  trim(process.env.NEXT_PUBLIC_AI_PRODUCT_NAME) ||
  defaultProductName;

const productDescription =
  trim(process.env.APP_AI_PRODUCT_DESCRIPTION) ||
  'plataforma de gestao pecuaria inteligente';

const vertical =
  trim(process.env.APP_AI_VERTICAL) ||
  defaultVertical;

const operationLabel =
  trim(process.env.APP_AI_OPERATION_LABEL) ||
  defaultOperationLabel;

const assistantLabel =
  trim(process.env.APP_AI_ASSISTANT_LABEL) ||
  `${assistantName} Assistente`;

const productTag =
  trim(process.env.APP_AI_PRODUCT_TAG) ||
  productName.toUpperCase();

const logTag =
  trim(process.env.APP_AI_LOG_TAG) ||
  assistantName.toUpperCase();

const defaultWelcomeMessage = `Ola! Sou o ${assistantName}, seu assistente ${vertical} inteligente. Como posso ajudar com sua ${operationLabel} hoje?`;

export const AI_BRAND = {
  assistantName,
  assistantLabel,
  productName,
  productDescription,
  vertical,
  operationLabel,
  welcomeMessage:
    trim(process.env.APP_AI_WELCOME_MESSAGE) ||
    defaultWelcomeMessage,
  productTag,
  logTag,
};

export const BRAND_TEXT = {
  assistantTitle: `Ola! Sou o ${AI_BRAND.assistantName}`,
  assistantLabel: AI_BRAND.assistantLabel,
  welcomeMessage: AI_BRAND.welcomeMessage,
  newGoalLabel: `Meta criada via ${AI_BRAND.assistantName}`,
  streamStartedMessage: `${AI_BRAND.assistantName} Stream iniciado`,
  healthMessage: `${AI_BRAND.productName} Backend API is running`,
  twilioPrefix: `*${AI_BRAND.productTag}*`,
};

export const SYSTEM_PROMPT = `Voce e ${AI_BRAND.assistantName}, o assistente inteligente do ${AI_BRAND.productName} - ${AI_BRAND.productDescription}.

PERSONALIDADE:
- Natural, amigavel e profissional
- Conciso e objetivo - respostas curtas e praticas
- Proativo em sugerir melhorias e proximos passos
- Usa terminologia do setor (arroba, GMD, UA/ha, manejo sanitario, etc.)

FUNCOES PRINCIPAIS:
- Registrar custos e receitas da ${AI_BRAND.operationLabel} (racao, vacinas, combustivel, vendas)
- Acompanhar metas e investimentos rurais (equipamentos, terra, gado)
- Analisar performance do rebanho (peso, GMD, taxa de desmame)
- Dar insights sobre mercado bovino e precos da arroba
- Ajudar com planejamento e calendario de manejos

CONHECIMENTO ESPECIALIZADO:
- Zootecnia e manejo de gado de corte e leite
- Mercado bovino brasileiro (B3, frigorificos, leiloes)
- Nutricao animal (racao, sal mineral, suplementacao)
- Sanidade e vacinacao (aftosa, brucelose, vermifugacao)
- Reproducao e melhoramento genetico (IATF, TE, DEPs)
- Pastagem e forragicultura (formacao, adubacao, rotacao)
- Gestao financeira rural (custo por arroba, margem, ROI)

REGRAS:
- Sempre consulte os dados reais da ${AI_BRAND.operationLabel} antes de responder
- Se o usuario pergunta sobre rebanho, manejos ou vendas, mostre dados reais
- Se nao existir o que ele pergunta, informe e sugira cadastrar
- Responda em portugues brasileiro, informal mas profissional
- Use emojis com moderacao (1-2 por resposta, maximo)
- Nao seja verboso ou repetitivo
- Nao mencione limitacoes tecnicas ou que e uma IA
- Nao peca desculpas desnecessarias
- Nao invente dados - use apenas o que esta no contexto`;

export const CONTEXT_PROMPT_TEMPLATE = `
DADOS REAIS DA ${AI_BRAND.operationLabel.toUpperCase()} (CONSULTE SEMPRE ANTES DE CRIAR NOVOS):

REBANHO ({animalsCount} animais):
{animalsList}

MANEJOS ({manejosCount} registros):
{manejosList}

VENDAS ({vendasCount} vendas):
{vendasList}

PRODUCAO ({producaoCount} registros):
{producaoList}

METAS ({metasCount}):
{metasList}

TRANSACOES ({transactionsCount}):
{transactionsList}

INVESTIMENTOS ({investmentsCount}):
{investmentsList}`;

export const ADDITIONAL_INSTRUCTIONS = `IMPORTANTE PARA ${AI_BRAND.assistantName}:
1. SEMPRE consulte os dados reais da ${AI_BRAND.operationLabel} antes de responder
2. Se o usuario pergunta sobre rebanho, animais, manejos, vendas ou producao, mostre os dados reais
3. Se nao existir o que ele esta perguntando, informe que nao encontrou e sugira cadastrar
4. A ${AI_BRAND.operationLabel} ja tem dados - use-os nas respostas
5. Use terminologia pecuaria adequada (arroba, GMD, UA/ha, etc.)
6. Personalize com o nome do fazendeiro e da ${AI_BRAND.operationLabel} quando disponivel`;

export const QUICK_RESPONSES = {
  GREETING: `Ola! Sou o ${AI_BRAND.assistantName}, seu assistente do ${AI_BRAND.productName}. Como posso ajudar com sua ${AI_BRAND.operationLabel} hoje?`,
  HELP: 'Posso ajudar com rebanho, manejo, vendas, producao, metas e investimentos. Tente: "mostrar meu rebanho" ou "resumir minha fazenda".',
  UNKNOWN: 'Entendi sua mensagem. Posso ajudar com rebanho, manejo, vendas, producao, metas e investimentos da sua fazenda.',
  ERROR: 'Tive um problema tecnico. Tente novamente em instantes ou reformule a pergunta.',
  NO_DATA: 'Ainda nao encontrei dados cadastrados. Que tal comecar registrando seus animais no menu Rebanho?',
};

export const FALLBACK_RESPONSES = [
  'Ola! Como posso ajudar com sua fazenda hoje?',
  'Entendi! Como posso ajudar com a gestao do seu rebanho?',
  'Claro! Estou aqui para ajudar com sua operacao pecuaria!',
  'Perfeito! O que voce gostaria de fazer na fazenda?',
];

export const INTENT_KEYWORDS = {
  GREETINGS: ['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'eae', 'fala'],
  HELP: ['ajuda', 'ajudar', 'como', 'funciona', 'o que posso', 'tutorial'],
  ANIMALS: ['animal', 'gado', 'rebanho', 'boi', 'vaca', 'bezerro', 'novilha', 'touro', 'nelore', 'angus'],
  MANAGEMENT: ['manejo', 'vacinacao', 'vacina', 'vermifugo', 'pesagem', 'tratamento', 'sanitario'],
  SALES: ['venda', 'vendeu', 'frigorifico', 'leilao', 'arroba', 'preco'],
  PRODUCTION: ['producao', 'leite', 'ordenha', 'litros'],
  TRANSACTIONS: ['gasto', 'receita', 'despesa', 'racao', 'combustivel', 'diesel', 'paguei', 'comprei'],
  INVESTMENTS: ['investimento', 'investir', 'trator', 'equipamento', 'terra', 'hectare'],
  GOALS: ['meta', 'objetivo', 'plano', 'planejamento'],
  ANALYSIS: ['analise', 'relatorio', 'grafico', 'dashboard', 'resumo', 'balanco', 'performance'],
};

export const AI_MODEL_CONFIG = {
  temperature: 0.7,
  maxTokens: 1500,
  maxTokensStreaming: 2000,
  temperatureExtraction: 0.3,
  maxHistoryMessages: 5,
};
