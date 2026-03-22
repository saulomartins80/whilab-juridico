import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { communityPage } from '../content/extendedPublicPages';

export default function ComunidadePage() {
  return (
    <MarketingPageFrame
      metaTitle="Comunidade | BoviNext White-label"
      metaDescription="Veja como a comunidade do BoviNext pode sustentar distribuicao, prova e parceiros."
      eyebrow={communityPage.eyebrow}
      title={communityPage.title}
      description={communityPage.description}
      stats={communityPage.stats}
      primaryCta={{ label: 'Entrar em contato', href: '/contato' }}
      secondaryCta={{ label: 'Ver parceiros', href: '/parceiros' }}
    >
      <MarketingSection
        eyebrow="Ecossistema"
        title="Os blocos que transformam comunidade em ativo."
        description="Comunidade boa fortalece retencao, prova social e canal de implantacao."
      >
        <MarketingCardGrid items={communityPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Diretriz"
        title="Como evitar que comunidade vire so barulho."
      >
        <MarketingChecklist items={communityPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
