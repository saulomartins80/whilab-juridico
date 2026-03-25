import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { contactPage } from '../content/publicPages';
import { dashboardBranding } from '../config/branding';

export default function ContatoPage() {
  return (
    <MarketingPageFrame
      metaTitle="Contato | WhiLab White-label"
      metaDescription="Converse sobre licenca, setup, rebranding e adaptacao do WhiLab white-label."
      eyebrow="Contato comercial"
      title="Conversa boa aqui ja precisa nascer perto de proposta, setup e fechamento."
      description="A frente de contato do WhiLab existe para encurtar o caminho entre interesse, escopo e venda. Menos ruído, mais clareza comercial."
      stats={[
        { label: 'Resposta', value: 'objetiva' },
        { label: 'Escopo', value: 'produto + servicos' },
        { label: 'Canal', value: 'direto' },
        { label: 'Fechamento', value: 'sem enrolacao' },
      ]}
      primaryCta={{ label: 'Comprar licenca', href: dashboardBranding.checkoutUrl }}
      secondaryCta={{ label: 'Ver precos', href: '/precos' }}
    >
      <MarketingSection
        eyebrow="Canais"
        title="As frentes certas para conversa comercial."
        description="Cada canal existe para acelerar um tipo de decisao sem prometer suporte infinito nem misturar escopos."
      >
        <MarketingCardGrid items={contactPage.methods} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Compromissos"
        title="Como essa frente deve operar."
      >
        <MarketingChecklist items={contactPage.checklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="FAQ"
        title="Perguntas mais comuns antes do fechamento."
      >
        <MarketingFaqGrid items={contactPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

