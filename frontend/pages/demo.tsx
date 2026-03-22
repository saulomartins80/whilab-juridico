import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { demoPage } from '../content/extendedPublicPages';

export default function DemoPage() {
  return (
    <MarketingPageFrame
      metaTitle="Demo | BoviNext White-label"
      metaDescription="Entenda o que a demo do BoviNext precisa provar para vender a base white-label media."
      eyebrow={demoPage.eyebrow}
      title={demoPage.title}
      description={demoPage.description}
      stats={demoPage.stats}
      primaryCta={{ label: 'Abrir dashboard', href: '/dashboard' }}
      secondaryCta={{ label: 'Ver precos', href: '/precos' }}
    >
      <MarketingSection
        eyebrow="Pontos de prova"
        title="O que a demonstracao precisa deixar evidente."
        description="A demo e uma ferramenta comercial. Ela precisa mostrar densidade suficiente para vender, sem virar um museu de tudo que existe no repositorio."
      >
        <MarketingCardGrid items={demoPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Execucao"
        title="Como a demo fica mais forte comercialmente."
      >
        <MarketingChecklist items={demoPage.checklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas"
        title="Dilemas comuns na hora de demonstrar o produto."
      >
        <MarketingFaqGrid items={demoPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
