import {
  MarketingCardGrid,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { pricingPage } from '../content/publicPages';
import { dashboardBranding } from '../config/branding';

export default function PrecosPage() {
  const offerCards = [
    {
      note: 'Licenca ativa',
      name: 'Licenca White Label SaaS Premium',
      price: 'R$ 997',
      highlights: [
        'Pagamento unico',
        'Base white-label pronta para rebrand',
        'Dashboard, auth e estrutura inicial',
        'Supabase e IA assistida',
        'Docs de setup, deploy e rebranding',
      ],
    },
    {
      note: 'Referencia comercial',
      name: 'Ancora de valor',
      price: 'R$ 1.997',
      highlights: [
        'Preco percebido oficial da oferta',
        'Sustenta a oferta de lancamento',
        'Evita cara de promocao solta',
        'Mantem uma mensagem comercial unica',
        'Apoia a percepcao de produto serio',
      ],
    },
    {
      note: 'Escopo extra',
      name: 'Servicos adicionais',
      price: 'Sob consulta',
      highlights: [
        'Deploy assistido',
        'Rebranding guiado',
        'Adaptacao por nicho',
        'Customizacao sob escopo',
        'Apoio tecnico adicional',
      ],
    },
  ];

  return (
    <MarketingPageFrame
      metaTitle="Precos | WhiLab White-label"
      metaDescription="Oferta ativa do WhiLab white-label, com licenca principal, ancora comercial e servicos adicionais."
      eyebrow="Precificacao"
      title="Uma oferta principal, uma ancora clara e servicos extras separados."
      description="A pagina de precos precisa ajudar a comprar a licenca sem confundir a entrada com customizacao ou suporte infinito."
      stats={[
        { label: 'Lancamento', value: 'R$ 997' },
        { label: 'Referencia', value: 'R$ 1.997' },
        { label: 'Modelo', value: 'pagamento unico' },
        { label: 'Fluxo', value: 'onboarding guiado' },
      ]}
      primaryCta={{ label: 'Comprar licenca', href: dashboardBranding.checkoutUrl }}
      secondaryCta={{ label: 'Ver solucoes', href: '/solucoes' }}
    >
      <MarketingSection
        eyebrow="Oferta ativa"
        title="Como a oferta deve aparecer para o comprador hoje."
        description="A entrada precisa ser simples: a licenca vende a base, o resto fica separado para nao contaminar a conversao."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {offerCards.map((plan) => (
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

