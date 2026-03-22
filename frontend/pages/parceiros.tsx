import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { partnersPage } from '../content/extendedPublicPages';

export default function ParceirosPage() {
  return (
    <MarketingPageFrame
      metaTitle="Parceiros | WhiLab White-label"
      metaDescription="Veja como o programa de parceiros do WhiLab se conecta a revenda, setup e adaptacao por nicho."
      eyebrow={partnersPage.eyebrow}
      title={partnersPage.title}
      description={partnersPage.description}
      stats={partnersPage.stats}
      primaryCta={{ label: 'Virar parceiro', href: '/contato' }}
      secondaryCta={{ label: 'Ver licenca', href: '/licencas' }}
    >
      <MarketingSection
        eyebrow="Canal"
        title="Onde a parceria gera valor real."
        description="Parceria boa reforca a entrega. Parceria ruim so empilha promessa e desalinha o produto."
      >
        <MarketingCardGrid items={partnersPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Criterio"
        title="O que protege a qualidade da operacao."
      >
        <MarketingChecklist items={partnersPage.checklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas"
        title="As duvidas mais comuns sobre parceria."
      >
        <MarketingFaqGrid items={partnersPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

