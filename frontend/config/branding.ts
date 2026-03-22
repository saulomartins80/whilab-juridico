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
  'BoviNext';

const assistantName =
  trim(process.env.NEXT_PUBLIC_ASSISTANT_NAME) ||
  buildAssistantName(brandName);

const brandSlug =
  trim(process.env.NEXT_PUBLIC_BRAND_SLUG) ||
  slugify(brandName) ||
  'bovinext';

const supportEmailExample =
  trim(process.env.NEXT_PUBLIC_SUPPORT_EMAIL_EXAMPLE) ||
  `usuario@${brandSlug}.com`;

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
    'Base white-label premium',
  shellDescription:
    trim(process.env.NEXT_PUBLIC_SHELL_DESCRIPTION) ||
    'Shell neutro com modulos verticais demonstrativos, pronto para virar produto de marca propria.',
  whiteLabelPrompt:
    trim(process.env.NEXT_PUBLIC_WHITE_LABEL_PROMPT) ||
    'Ajuste nome, cores e narrativa sem desmontar o produto.',
  supportTeamName:
    trim(process.env.NEXT_PUBLIC_SUPPORT_TEAM_NAME) ||
    `equipe ${brandName}`,
  supportEmailExample,
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
    buildBadgeLabel(brandName),
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
