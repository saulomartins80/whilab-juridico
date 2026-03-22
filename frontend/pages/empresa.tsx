import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { companyPage } from '../content/extendedPublicPages';

export default function EmpresaPage() {
  return (
    <MarketingPageFrame
      metaTitle="Empresa | BoviNext White-label"
      metaDescription="Conheca a operacao por tras do BoviNext e como ela organiza licenca, setup e adaptacao."
      eyebrow={companyPage.eyebrow}
      title={companyPage.title}
      description={companyPage.description}
      stats={companyPage.stats}
      primaryCta={{ label: 'Falar com a equipe', href: '/contato' }}
      secondaryCta={{ label: 'Ver licencas', href: '/licencas' }}
    >
      <MarketingSection
        eyebrow="Base da operacao"
        title="Como a empresa sustenta a proposta do produto."
        description="O produto vende melhor quando a camada institucional mostra metodo, limites e direcao."
      >
        <MarketingCardGrid items={companyPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Compromissos"
        title="O que precisa ficar claro para o mercado."
      >
        <MarketingChecklist items={companyPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
