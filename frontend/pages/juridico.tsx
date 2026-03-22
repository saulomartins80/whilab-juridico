import {
  MarketingCardGrid,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { legalPage } from '../content/extendedPublicPages';

export default function JuridicoPage() {
  return (
    <MarketingPageFrame
      metaTitle="Juridico | WhiLab White-label"
      metaDescription="Veja os principios juridicos e operacionais que estruturam a venda do WhiLab."
      eyebrow={legalPage.eyebrow}
      title={legalPage.title}
      description={legalPage.description}
      stats={legalPage.stats}
      primaryCta={{ label: 'Ver termos', href: '/termos' }}
      secondaryCta={{ label: 'Contato comercial', href: '/contato' }}
    >
      <MarketingSection
        eyebrow="Base contratual"
        title="Os pilares juridicos que sustentam a oferta."
      >
        <MarketingCardGrid items={legalPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas"
        title="Duvidas que costumam aparecer antes do fechamento."
      >
        <MarketingFaqGrid items={legalPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

