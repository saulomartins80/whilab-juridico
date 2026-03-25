import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { dashboardBranding } from '../config/branding';
import { solutionsPage } from '../content/publicPages';

export default function SolucoesPage() {
  return (
    <MarketingPageFrame
      metaTitle="Solucoes | WhiLab White-label"
      metaDescription="Veja como o WhiLab organiza home, auth, dashboard, IA e rebranding em uma base vendavel."
      eyebrow={solutionsPage.eyebrow}
      title={solutionsPage.title}
      description={solutionsPage.description}
      stats={solutionsPage.stats}
      primaryCta={{ label: 'Comprar licenca', href: dashboardBranding.checkoutUrl }}
      secondaryCta={{ label: 'Ver recursos', href: '/recursos' }}
    >
      <MarketingSection
        eyebrow="Blocos principais"
        title="O produto medio precisa parecer completo sem inflar escopo."
        description="Esses blocos deixam a plataforma com cara de produto de verdade e ainda mantem margem para customizacao futura."
      >
        <MarketingCardGrid items={solutionsPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Por que funciona"
        title="A base vende melhor quando o escopo e claro."
        description="Nao estamos vendendo um universo de promessas. Estamos vendendo uma plataforma media, bonita e comercial."
      >
        <MarketingChecklist items={solutionsPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

