import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { termsPage } from '../content/extendedPublicPages';

export default function TermosPage() {
  return (
    <MarketingPageFrame
      metaTitle="Termos | BoviNext White-label"
      metaDescription="Leia os termos de uso do BoviNext para a base de produto, ambiente e documentacao."
      eyebrow={termsPage.eyebrow}
      title={termsPage.title}
      description={termsPage.description}
      stats={termsPage.stats}
      primaryCta={{ label: 'Ver privacidade', href: '/privacidade' }}
      secondaryCta={{ label: 'Ver seguranca', href: '/seguranca' }}
    >
      <MarketingSection
        eyebrow="Uso da base"
        title="Os pontos que definem o uso do produto."
      >
        <MarketingCardGrid items={termsPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Boas praticas"
        title="Comportamentos esperados de quem opera a base."
      >
        <MarketingChecklist items={termsPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
