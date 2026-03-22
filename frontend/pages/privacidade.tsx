import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { privacyPage } from '../content/extendedPublicPages';

export default function PrivacidadePage() {
  return (
    <MarketingPageFrame
      metaTitle="Privacidade | WhiLab White-label"
      metaDescription="Entenda como o WhiLab trata autenticacao, dados de operacao e responsabilidade de implantacao."
      eyebrow={privacyPage.eyebrow}
      title={privacyPage.title}
      description={privacyPage.description}
      stats={privacyPage.stats}
      primaryCta={{ label: 'Ver cookies', href: '/cookies' }}
      secondaryCta={{ label: 'Ver juridico', href: '/juridico' }}
    >
      <MarketingSection
        eyebrow="Dados e ambiente"
        title="Como a base se relaciona com privacidade."
      >
        <MarketingCardGrid items={privacyPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Responsabilidade"
        title="O que precisa ser respeitado antes de subir em producao."
      >
        <MarketingChecklist items={privacyPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

