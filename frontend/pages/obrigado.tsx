import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';

import {
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { dashboardBranding } from '../config/branding';

const nextSteps = [
  'Confirme a compra e siga para o onboarding com os dados do projeto.',
  'Envie objetivo, nicho, prazo e dominio para organizarmos a entrega.',
  'Receba o buyer kit, o checklist de ativacao e a trilha de setup.',
  'Alinhe rebrand, credenciais e deploy pelos canais oficiais do WhiLab.',
];

const faqItems = [
  {
    question: 'A compra libera tudo automaticamente?',
    answer:
      'Nao. A compra destrava o onboarding. A entrega e organizada para evitar perda de contexto e garantir que buyer kit, acessos e orientacoes saiam do jeito certo.',
  },
  {
    question: 'Quando eu recebo o grupo VIP?',
    answer:
      'O grupo VIP entra como camada de acompanhamento para lead quente e comprador. Depois do primeiro alinhamento no onboarding, liberamos o proximo passo mais adequado.',
  },
  {
    question: 'Preciso falar com alguem antes do deploy?',
    answer:
      'Sim. O fluxo foi desenhado para validar branding, dominio, credenciais e responsabilidade tecnica antes de qualquer publicacao.',
  },
];

export default function ObrigadoPage() {
  return (
    <MarketingPageFrame
      metaTitle={`Obrigado | ${dashboardBranding.brandName}`}
      metaDescription={`Pagina de obrigado e proximo passo comercial do ${dashboardBranding.brandName}.`}
      eyebrow="Compra recebida"
      title="Compra aprovada? Agora a meta e ativar o WhiLab sem perder tempo."
      description="Se o pagamento passou, siga para o onboarding e centralize as informacoes do projeto em um unico fluxo. Isso protege a entrega e acelera a ativacao."
      stats={[
        { label: 'Passo 1', value: 'Onboarding imediato' },
        { label: 'Passo 2', value: 'Buyer kit e checklist' },
        { label: 'Passo 3', value: 'Rebrand e deploy' },
      ]}
      primaryCta={{ label: 'Preencher onboarding', href: '/onboarding' }}
      secondaryCta={{ label: 'Voltar para o site', href: '/' }}
    >
      <MarketingSection
        eyebrow="Proximo passo"
        title="O que fazer logo depois da compra"
        description="Nao deixe a compra cair no vazio. O fluxo abaixo organiza a entrega desde o primeiro minuto."
      >
        <MarketingChecklist items={nextSteps} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Canais oficiais"
        title="Se precisar destravar algo agora, use estes caminhos"
        description="Tudo foi centralizado para reduzir ruido e manter o processo comercial previsivel."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-slate-900 dark:text-white">Onboarding</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500 dark:text-[#969696]">
              Centralize os dados do projeto e siga a trilha de entrega do comprador.
            </p>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-slate-900 transition-colors hover:text-[#0f766e] dark:text-white dark:hover:text-[#22d3ee]"
            >
              Abrir onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-slate-900 dark:text-white">WhatsApp oficial</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500 dark:text-[#969696]">
              Use o canal mais rapido para alinhar urgencia, entrega e desbloqueios comerciais.
            </p>
            <a
              href={`${dashboardBranding.whatsAppUrl}?text=${encodeURIComponent('Oi! Minha compra do WhiLab foi aprovada e eu quero iniciar o onboarding.')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-slate-900 transition-colors hover:text-[#0f766e] dark:text-white dark:hover:text-[#22d3ee]"
            >
              Falar no WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-slate-900 dark:text-white">Escopo da entrega</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500 dark:text-[#969696]">
              Buyer kit, setup, rebrand e deploy entram por fases. Customizacao extra segue como servico separado.
            </p>
            <Link
              href="/suporte"
              className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-slate-900 transition-colors hover:text-[#0f766e] dark:text-white dark:hover:text-[#22d3ee]"
            >
              Ver detalhes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="FAQ"
        title="Perguntas comuns logo depois do checkout"
      >
        <MarketingFaqGrid items={faqItems} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
