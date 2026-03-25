import {
  MarketingCardGrid,
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { dashboardBranding } from '../config/branding';
import { demoPage } from '../content/extendedPublicPages';

export default function DemoPage() {
  return (
    <MarketingPageFrame
      metaTitle="Demo | WhiLab White-label"
      metaDescription="Entenda o que a demo do WhiLab precisa provar para vender a base white-label media."
      eyebrow={demoPage.eyebrow}
      title={demoPage.title}
      description={demoPage.description}
      stats={demoPage.stats}
      primaryCta={{ label: 'Comprar licenca', href: dashboardBranding.checkoutUrl }}
      secondaryCta={{ label: 'Falar com vendas', href: '/contato' }}
    >
      <MarketingSection
        eyebrow="Pontos de prova"
        title="O que a demonstracao precisa deixar evidente."
        description="A demo e uma ferramenta comercial. Ela precisa mostrar densidade suficiente para vender, sem virar um museu de tudo que existe no repositorio."
      >
        <MarketingCardGrid items={demoPage.cards} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Execucao"
        title="Como a demo fica mais forte comercialmente."
      >
        <MarketingChecklist items={demoPage.checklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Leitura comercial"
        title="Hoje a demonstracao publica precisa vender o proximo passo."
        description="A melhor rota agora e proteger o app autenticado, manter a prova de valor publica e levar o comprador para compra ou conversa."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Compra direta',
              value: 'R$ 997',
              description: 'A oferta ativa vive no checkout da Kiwify com uma mensagem comercial unica.',
            },
            {
              title: 'Onboarding guiado',
              value: 'Kickoff claro',
              description: 'Compra, onboarding, buyer kit e rebrand seguem um fluxo unico sem perder contexto.',
            },
            {
              title: 'Fechamento no X1',
              value: 'WhatsApp primeiro',
              description: 'Lead frio entra pelo WhatsApp e o fechamento fica mais forte na conversa certa.',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696]">{item.title}</div>
              <div className="mt-3 text-lg font-semibold text-[#0f766e] dark:text-[#22d3ee]">{item.value}</div>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-500 dark:text-[#969696]">{item.description}</p>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Perguntas"
        title="Dilemas comuns na hora de demonstrar o produto."
      >
        <MarketingFaqGrid items={demoPage.faqs} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}

