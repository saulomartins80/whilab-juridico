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
  'WhiLab';

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
    'Plataforma pecuaria premium',
  shellDescription:
    trim(process.env.NEXT_PUBLIC_SHELL_DESCRIPTION) ||
    'Operacao pecuaria com dashboard executivo, IA aplicada e estrutura pronta para implantar, revender e evoluir.',
  whiteLabelPrompt:
    trim(process.env.NEXT_PUBLIC_WHITE_LABEL_PROMPT) ||
    'Troque marca, dominio e narrativa sem desmontar a base comercial.',
  supportTeamName:
    trim(process.env.NEXT_PUBLIC_SUPPORT_TEAM_NAME) ||
    `equipe ${brandName}`,
  supportEmailExample,
  canonicalHost,
  siteUrl: `https://${canonicalHost}`,
  marketingTagline:
    trim(process.env.NEXT_PUBLIC_MARKETING_TAGLINE) ||
    'Operacao pecuaria premium pronta para marca propria.',
  seoKeywords:
    trim(process.env.NEXT_PUBLIC_SEO_KEYWORDS) ||
    'pecuaria premium, software pecuario, gestao de rebanho, manejo, producao, dashboard pecuario, plataforma pecuaria',
  verticalLabel:
    trim(process.env.NEXT_PUBLIC_VERTICAL_LABEL) ||
    'Pecuaria premium',
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
