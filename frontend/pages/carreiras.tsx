import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { careersPage } from '../content/extendedPublicPages';

export default function CarreirasPage() {
  return (
    <MarketingPageFrame
      metaTitle="Carreiras | BoviNext White-label"
      metaDescription="Entenda o tipo de time e cultura que sustenta a evolucao do BoviNext como produto white-label."
      eyebrow={careersPage.eyebrow}
      title={careersPage.title}
      description={careersPage.description}
      stats={careersPage.stats}
      primaryCta={{ label: 'Falar com a operacao', href: '/contato' }}
      secondaryCta={{ label: 'Ver empresa', href: '/empresa' }}
    >
      <MarketingSection
        eyebrow="Cultura"
        title="O tipo de operador que faz essa base crescer."
        description="Carreiras aqui nao vende glamour. Vende o tipo de mentalidade que transforma uma base tecnica em produto de verdade."
      >
        <MarketingCardGrid items={careersPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Principios"
        title="Como esse time precisa funcionar no dia a dia."
      >
        <MarketingChecklist items={careersPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
