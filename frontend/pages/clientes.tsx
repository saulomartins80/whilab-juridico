import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { clientsPage } from '../content/publicPages';

export default function ClientesPage() {
  return (
    <MarketingPageFrame
      metaTitle="Clientes ideais | BoviNext White-label"
      metaDescription="Veja para quem o BoviNext faz sentido: agencias, consultores, estudios e operacoes que querem marca propria."
      eyebrow={clientsPage.eyebrow}
      title={clientsPage.title}
      description={clientsPage.description}
      stats={clientsPage.stats}
      primaryCta={{ label: 'Falar com vendas', href: '/contato' }}
      secondaryCta={{ label: 'Ver precos', href: '/precos' }}
    >
      <MarketingSection
        eyebrow="Perfis de compra"
        title="Quem mais tende a ganhar com essa base."
        description="O comprador certo valoriza velocidade, margem e possibilidade de adaptacao sem reconstruir tudo."
      >
        <MarketingCardGrid items={clientsPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Filtro comercial"
        title="O que ajuda a manter a oferta saudavel."
      >
        <MarketingChecklist items={clientsPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
