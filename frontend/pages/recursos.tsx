import {
  MarketingCardGrid,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { resourcesPage } from '../content/publicPages';

export default function RecursosPage() {
  return (
    <MarketingPageFrame
      metaTitle="Recursos | WhiLab White-label"
      metaDescription="Conheca o kit de entrega do WhiLab: setup, dashboard, rebranding, docs e base tecnica."
      eyebrow={resourcesPage.eyebrow}
      title={resourcesPage.title}
      description={resourcesPage.description}
      stats={resourcesPage.stats}
      primaryCta={{ label: 'Explorar dashboard', href: '/dashboard' }}
      secondaryCta={{ label: 'Ver precos', href: '/precos' }}
    >
      <MarketingSection
        eyebrow="Recursos de entrega"
        title="O valor nao esta so no layout. Esta no que acelera a operacao."
        description="Quanto menos friccao no setup e no rebranding, mais rapido o comprador enxerga valor no pacote."
      >
        <MarketingCardGrid items={resourcesPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas comuns"
        title="O que normalmente precisa ficar claro antes do fechamento."
      >
        <MarketingFaqGrid items={resourcesPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

