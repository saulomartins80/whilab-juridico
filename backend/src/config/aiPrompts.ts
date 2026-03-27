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

const defaultProductName = runtimeConfig.brandName || 'WhiLab';
const defaultAssistantName = buildAssistantName(defaultProductName);
const defaultVertical = 'juridico';
const defaultOperationLabel = 'escritorio';

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
  'plataforma juridica com crm, gestao operacional e automacao assistida por ia';

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
- Usa terminologia juridica e operacional de escritorio com clareza

FUNCOES PRINCIPAIS:
- Apoiar a triagem e organizacao operacional da ${AI_BRAND.operationLabel}
- Sugerir proximos passos para processos, clientes, tarefas e documentos
- Apoiar a criacao de rascunhos, resumos e fluxos juridicos
- Ajudar com priorizacao, agenda, comunicacao e cobranca
- Organizar informacoes em linguagem clara, profissional e acionavel

CONHECIMENTO ESPECIALIZADO:
- Operacao de escritorio juridico
- Organizacao de clientes, processos, prazos e documentos
- Linguagem juridica clara para apoio a peticoes, recursos e contratos
- Atendimento, relacionamento e captacao via CRM
- Automacoes administrativas e cobranca recorrente
- Boas praticas de segregacao multi-tenant e confidencialidade

REGRAS:
- Sempre consulte os dados reais da ${AI_BRAND.operationLabel} antes de responder
- Se o usuario pergunta sobre clientes, processos, tarefas ou documentos, mostre dados reais
- Se nao existir o que ele pergunta, informe e sugira cadastrar
- Responda em portugues brasileiro, informal mas profissional
- Use emojis com moderacao (1-2 por resposta, maximo)
- Nao seja verboso ou repetitivo
- Nao mencione limitacoes tecnicas ou que e uma IA
- Nao peca desculpas desnecessarias
- Nao invente dados - use apenas o que esta no contexto
- Nao substitua revisao juridica humana em decisoes sensiveis`;

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
2. Se o usuario pergunta sobre clientes, processos, tarefas, documentos ou cobrancas, mostre os dados reais
3. Se nao existir o que ele esta perguntando, informe que nao encontrou e sugira cadastrar
4. A ${AI_BRAND.operationLabel} ja tem dados - use-os nas respostas
5. Use terminologia juridica adequada e linguagem clara
6. Personalize com o nome do escritorio e do usuario quando disponivel`;

export const QUICK_RESPONSES = {
  GREETING: `Ola! Sou o ${AI_BRAND.assistantName}, seu assistente do ${AI_BRAND.productName}. Como posso ajudar com sua ${AI_BRAND.operationLabel} hoje?`,
  HELP: 'Posso ajudar com clientes, processos, tarefas, documentos, cobrancas e fluxos juridicos. Tente: "resumir meus processos" ou "mostrar tarefas pendentes".',
  UNKNOWN: 'Entendi sua mensagem. Posso ajudar com clientes, processos, tarefas, documentos e automacoes do seu escritorio.',
  ERROR: 'Tive um problema tecnico. Tente novamente em instantes ou reformule a pergunta.',
  NO_DATA: 'Ainda nao encontrei dados cadastrados. Que tal comecar registrando clientes, processos ou tarefas?',
};

export const FALLBACK_RESPONSES = [
  'Ola! Como posso ajudar com seu escritorio hoje?',
  'Entendi! Como posso ajudar com sua operacao juridica?',
  'Claro! Estou aqui para apoiar sua rotina juridica e operacional.',
  'Perfeito! O que voce gostaria de organizar agora?',
];

export const INTENT_KEYWORDS = {
  GREETINGS: ['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'eae', 'fala'],
  HELP: ['ajuda', 'ajudar', 'como', 'funciona', 'o que posso', 'tutorial'],
  ANIMALS: ['cliente', 'clientes', 'contato', 'lead', 'crm', 'atendimento'],
  MANAGEMENT: ['processo', 'prazo', 'tarefa', 'agenda', 'andamento', 'publicacao'],
  SALES: ['cobranca', 'cobrancas', 'fatura', 'pagamento', 'honorario', 'honorarios'],
  PRODUCTION: ['peticao', 'recurso', 'contrato', 'documento', 'procuracao'],
  TRANSACTIONS: ['gasto', 'receita', 'despesa', 'paguei', 'recebi', 'financeiro'],
  INVESTMENTS: ['investimento', 'crescimento', 'captacao', 'marketing'],
  GOALS: ['meta', 'objetivo', 'plano', 'planejamento'],
  ANALYSIS: ['analise', 'relatorio', 'grafico', 'dashboard', 'resumo', 'performance', 'jurisprudencia'],
};

export const AI_MODEL_CONFIG = {
  temperature: 0.7,
  maxTokens: 1500,
  maxTokensStreaming: 2000,
  temperatureExtraction: 0.3,
  maxHistoryMessages: 5,
};
