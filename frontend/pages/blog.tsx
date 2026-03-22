import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { blogPage } from '../content/extendedPublicPages';

export default function BlogPage() {
  return (
    <MarketingPageFrame
      metaTitle="Blog | BoviNext White-label"
      metaDescription="Veja como o blog do BoviNext deve sustentar marca, SEO e demanda para o produto white-label."
      eyebrow={blogPage.eyebrow}
      title={blogPage.title}
      description={blogPage.description}
      stats={blogPage.stats}
      primaryCta={{ label: 'Ver demo', href: '/demo' }}
      secondaryCta={{ label: 'Falar com vendas', href: '/contato' }}
    >
      <MarketingSection
        eyebrow="Editorial"
        title="Os pilares que fazem o blog trabalhar para venda."
        description="O blog precisa mostrar entendimento de produto, setup, IA e monetizacao sem virar um amontoado de postagens genericas."
      >
        <MarketingCardGrid items={blogPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Operacao"
        title="Como o conteudo sustenta a proposta comercial."
      >
        <MarketingChecklist items={blogPage.checklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas"
        title="O que costuma gerar duvida na estrategia de conteudo."
      >
        <MarketingFaqGrid items={blogPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
