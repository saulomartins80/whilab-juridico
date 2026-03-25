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
    'Base SaaS white-label premium',
  shellDescription:
    trim(process.env.NEXT_PUBLIC_SHELL_DESCRIPTION) ||
    'Base SaaS com dashboard, auth, IA assistida e estrutura pronta para rebrand, ativacao e revenda.',
  whiteLabelPrompt:
    trim(process.env.NEXT_PUBLIC_WHITE_LABEL_PROMPT) ||
    'Troque marca, dominio e narrativa sem desmontar a base comercial.',
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
    'Licenca white-label de uma base SaaS pronta para marca propria.',
  seoKeywords:
    trim(process.env.NEXT_PUBLIC_SEO_KEYWORDS) ||
    'white-label saas, base saas, rebrand saas, dashboard white-label, licenca saas, supabase white-label',
  verticalLabel:
    trim(process.env.NEXT_PUBLIC_VERTICAL_LABEL) ||
    'White-label premium',
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
