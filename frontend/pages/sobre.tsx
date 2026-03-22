import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { aboutPage } from '../content/publicPages';

export default function SobrePage() {
  return (
    <MarketingPageFrame
      metaTitle="Sobre | BoviNext White-label"
      metaDescription="Entenda a tese do BoviNext como base SaaS white-label media, premium e facil de adaptar."
      eyebrow={aboutPage.eyebrow}
      title={aboutPage.title}
      description={aboutPage.description}
      stats={aboutPage.stats}
      primaryCta={{ label: 'Ver demo', href: '/dashboard' }}
      secondaryCta={{ label: 'Falar com vendas', href: '/contato' }}
    >
      <MarketingSection
        eyebrow="Tese"
        title="Um ativo comercial em transformacao, nao um experimento largado."
        description="Essa camada publica deixa claro o que o produto e, o que ele nao e e por que ele pode virar uma oferta seria."
      >
        <MarketingCardGrid items={aboutPage.storyCards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Direcao"
        title="O que sustenta a proposta de valor."
        description="O produto so pode ser vendido bem se visual, setup, auth e docs puxarem juntos."
      >
        <MarketingChecklist items={aboutPage.checklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas comuns"
        title="O que o mercado costuma querer entender antes de comprar."
      >
        <MarketingFaqGrid items={aboutPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
