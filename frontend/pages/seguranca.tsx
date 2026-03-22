import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { securityPage } from '../content/extendedPublicPages';

export default function SegurancaPage() {
  return (
    <MarketingPageFrame
      metaTitle="Seguranca | WhiLab White-label"
      metaDescription="Conheca os principios de seguranca operacional do WhiLab para auth, ambiente e entrega."
      eyebrow={securityPage.eyebrow}
      title={securityPage.title}
      description={securityPage.description}
      stats={securityPage.stats}
      primaryCta={{ label: 'Ver privacidade', href: '/privacidade' }}
      secondaryCta={{ label: 'Falar com a equipe', href: '/contato' }}
    >
      <MarketingSection
        eyebrow="Baseline"
        title="O que a camada de seguranca precisa cobrir."
      >
        <MarketingCardGrid items={securityPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Checklist"
        title="Cuidados minimos para uma operacao confiavel."
      >
        <MarketingChecklist items={securityPage.checklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas"
        title="As principais duvidas sobre seguranca da base."
      >
        <MarketingFaqGrid items={securityPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

