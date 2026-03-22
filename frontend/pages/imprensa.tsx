import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { pressPage } from '../content/extendedPublicPages';

export default function ImprensaPage() {
  return (
    <MarketingPageFrame
      metaTitle="Imprensa | WhiLab White-label"
      metaDescription="Acesse a narrativa publica, os ativos de marca e o contexto oficial do WhiLab."
      eyebrow={pressPage.eyebrow}
      title={pressPage.title}
      description={pressPage.description}
      stats={pressPage.stats}
      primaryCta={{ label: 'Contato de imprensa', href: '/contato' }}
      secondaryCta={{ label: 'Ver empresa', href: '/empresa' }}
    >
      <MarketingSection
        eyebrow="Brand pack"
        title="Os elementos que a pagina de imprensa precisa organizar."
        description="Imprensa boa reduz ruido e faz a mensagem certa se repetir com consistencia."
      >
        <MarketingCardGrid items={pressPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Disciplina"
        title="Regras para a narrativa nao se perder."
      >
        <MarketingChecklist items={pressPage.checklist} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

