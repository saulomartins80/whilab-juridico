import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { licensesPage } from '../content/extendedPublicPages';

export default function LicencasPage() {
  return (
    <MarketingPageFrame
      metaTitle="Licencas | BoviNext White-label"
      metaDescription="Entenda o modelo de licenca do BoviNext e como codigo, setup e servicos adicionais se separam."
      eyebrow={licensesPage.eyebrow}
      title={licensesPage.title}
      description={licensesPage.description}
      stats={licensesPage.stats}
      primaryCta={{ label: 'Falar sobre licenca', href: '/contato' }}
      secondaryCta={{ label: 'Ver juridico', href: '/juridico' }}
    >
      <MarketingSection
        eyebrow="Estrutura"
        title="O que a licenca precisa deixar preto no branco."
      >
        <MarketingCardGrid items={licensesPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Protecao"
        title="Como a licenca protege venda e expectativa."
      >
        <MarketingChecklist items={licensesPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
