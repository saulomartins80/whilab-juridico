import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { cookiesPage } from '../content/extendedPublicPages';

export default function CookiesPage() {
  return (
    <MarketingPageFrame
      metaTitle="Cookies | BoviNext White-label"
      metaDescription="Veja como a base do BoviNext lida com cookies essenciais, preferencias e analytics opcionais."
      eyebrow={cookiesPage.eyebrow}
      title={cookiesPage.title}
      description={cookiesPage.description}
      stats={cookiesPage.stats}
      primaryCta={{ label: 'Ver privacidade', href: '/privacidade' }}
      secondaryCta={{ label: 'Ver seguranca', href: '/seguranca' }}
    >
      <MarketingSection
        eyebrow="Tipos"
        title="As categorias de cookies e preferencias da base."
      >
        <MarketingCardGrid items={cookiesPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Diretriz"
        title="Como manter transparencia na operacao."
      >
        <MarketingChecklist items={cookiesPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
