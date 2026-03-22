import {
  MarketingCardGrid,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { pricingPage } from '../content/publicPages';

export default function PrecosPage() {
  return (
    <MarketingPageFrame
      metaTitle="Precos | WhiLab White-label"
      metaDescription="Faixas de preco recomendadas para o WhiLab white-label, com produto base e upsells."
      eyebrow="Precificacao"
      title="Produto medio, margem saudavel e espaco claro para upsell."
      description="A precificacao certa protege caixa, melhora conversao e abre espaco para instalacao, rebranding e adaptacao por nicho."
      stats={[
        { label: 'Entrada', value: 'R$ 697' },
        { label: 'Preco cheio', value: 'R$ 1.497' },
        { label: 'Teto atual', value: 'R$ 1.997' },
        { label: 'Upsell', value: 'margem alta' },
      ]}
      primaryCta={{ label: 'Falar com vendas', href: '/contato' }}
      secondaryCta={{ label: 'Ver solucoes', href: '/solucoes' }}
    >
      <MarketingSection
        eyebrow="Faixas"
        title="Como pensar o valor do produto final."
        description="O foco nao e parecer caro. O foco e vender com margem e com verdade sobre o que esta sendo entregue."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPage.plans.map((plan) => (
            <article key={plan.name} className="app-shell-panel p-6">
              <div className="app-shell-section-title">{plan.note}</div>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{plan.name}</h3>
              <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{plan.price}</div>
              <ul className="mt-5 space-y-3">
                {plan.highlights.map((item) => (
                  <li key={item} className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Upsells"
        title="Onde a margem tende a crescer de verdade."
        description="O produto base vende a entrada. Os servicos certos aumentam ticket e sustentam a operacao."
      >
        <MarketingCardGrid items={pricingPage.upsells} />
      </MarketingSection>

      <MarketingSection
        eyebrow="FAQ"
        title="Como apresentar preco sem perder credibilidade."
      >
        <MarketingFaqGrid items={pricingPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

