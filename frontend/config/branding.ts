const trim = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildBadgeLabel = (brandName: string): string => {
  const initials = brandName
    .split(/\s+/)
    .map((token) => token[0])
    .join('')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase();

  if (initials) return initials;
  return brandName.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'BX';
};

const buildAssistantName = (brandName: string): string => {
  const compact = brandName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '');

  return compact.slice(0, 4).toUpperCase() || 'AI';
};

const brandName =
  trim(process.env.NEXT_PUBLIC_BRAND_NAME) ||
  'WhiLab Juridico';

const assistantName =
  trim(process.env.NEXT_PUBLIC_ASSISTANT_NAME) ||
  buildAssistantName(brandName);

const brandSlug =
  trim(process.env.NEXT_PUBLIC_BRAND_SLUG) ||
  slugify(brandName) ||
  'whilab';

const supportEmailExample =
  trim(process.env.NEXT_PUBLIC_SUPPORT_EMAIL_EXAMPLE) ||
  `suporte@${brandSlug}.com.br`;

const canonicalHost =
  trim(process.env.NEXT_PUBLIC_CANONICAL_HOST) ||
  'whilab.com.br';

const whatsAppNumber =
  trim(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
  '5564935018001';

const whatsAppDisplay =
  trim(process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY) ||
  '+55 64 93501-8001';

export const dashboardBranding = {
  brandName,
  brandNameUpper:
    trim(process.env.NEXT_PUBLIC_BRAND_NAME_UPPER) ||
    brandName.toUpperCase(),
  assistantName,
  assistantLabel:
    trim(process.env.NEXT_PUBLIC_ASSISTANT_LABEL) ||
    `${assistantName} Assistente`,
  assistantGreeting:
    trim(process.env.NEXT_PUBLIC_ASSISTANT_GREETING) ||
    `Ola! Sou o ${assistantName}`,
  workspaceLabel:
    trim(process.env.NEXT_PUBLIC_WORKSPACE_LABEL) ||
    `${brandName} workspace`,
  shellSubtitle:
    trim(process.env.NEXT_PUBLIC_SHELL_SUBTITLE) ||
    'Plataforma juridica com CRM, IA e automacao',
  shellDescription:
    trim(process.env.NEXT_PUBLIC_SHELL_DESCRIPTION) ||
    'Plataforma juridica multi-tenant com dashboard, captacao, gestao operacional e estrutura pronta para evolucao por fases.',
  whiteLabelPrompt:
    trim(process.env.NEXT_PUBLIC_WHITE_LABEL_PROMPT) ||
    'Centralize atendimento, processos, documentos e automacoes em uma operacao juridica segura.',
  supportTeamName:
    trim(process.env.NEXT_PUBLIC_SUPPORT_TEAM_NAME) ||
    `equipe ${brandName}`,
  supportEmailExample,
  canonicalHost,
  siteUrl: `https://${canonicalHost}`,
  whatsAppNumber,
  whatsAppDisplay,
  whatsAppUrl: `https://wa.me/${whatsAppNumber}`,
  marketingTagline:
    trim(process.env.NEXT_PUBLIC_MARKETING_TAGLINE) ||
    'CRM juridico, gestao de processos, nuvem juridica e IA aplicada em uma unica plataforma.',
  seoKeywords:
    trim(process.env.NEXT_PUBLIC_SEO_KEYWORDS) ||
    'software juridico, crm juridico, gestao de processos, peticoes com ia, nuvem juridica, plataforma juridica',
  verticalLabel:
    trim(process.env.NEXT_PUBLIC_VERTICAL_LABEL) ||
    'Juridico',
  checkoutUrl:
    trim(process.env.NEXT_PUBLIC_CHECKOUT_URL) ||
    'https://pay.kiwify.com.br/JFkbSsJ',
  thankYouUrl:
    trim(process.env.NEXT_PUBLIC_THANK_YOU_URL) ||
    `https://${canonicalHost}/obrigado`,
  onboardingUrl:
    trim(process.env.NEXT_PUBLIC_ONBOARDING_URL) ||
    `https://${canonicalHost}/onboarding`,
  logoAlt:
    trim(process.env.NEXT_PUBLIC_LOGO_ALT) ||
    `Logo ${brandName}`,
  assistantAvatarSrc:
    trim(process.env.NEXT_PUBLIC_ASSISTANT_AVATAR_SRC) ||
    '/logo.svg',
  assistantAvatarAlt:
    trim(process.env.NEXT_PUBLIC_ASSISTANT_AVATAR_ALT) ||
    assistantName,
  badgeLabel:
    trim(process.env.NEXT_PUBLIC_BRAND_BADGE) ||
    'WH',
  authStorageKey:
    trim(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY) ||
    `${brandSlug}-auth-token`,
  twoFactorIssuer:
    trim(process.env.NEXT_PUBLIC_2FA_ISSUER) ||
    brandName.toUpperCase(),
  backupCodesFilenamePrefix:
    trim(process.env.NEXT_PUBLIC_BACKUP_CODES_PREFIX) ||
    brandSlug,
};

export default dashboardBranding;
