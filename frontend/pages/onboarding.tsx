import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardList, MessageCircle } from 'lucide-react';

import {
  MarketingChecklist,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { dashboardBranding } from '../config/branding';

type GoalValue = 'saas' | 'clientes' | 'operacao' | '';
type TimelineValue = 'imediato' | '7-dias' | '30-dias' | 'sem-prazo' | '';

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  niche: string;
  goal: GoalValue;
  domain: string;
  timeline: TimelineValue;
  notes: string;
};

const goalLabels: Record<Exclude<GoalValue, ''>, string> = {
  saas: 'Lancar meu proprio SaaS',
  clientes: 'Atender clientes com white-label',
  operacao: 'Estruturar uma operacao interna',
};

const timelineLabels: Record<Exclude<TimelineValue, ''>, string> = {
  imediato: 'Quero comecar agora',
  '7-dias': 'Quero ativar em ate 7 dias',
  '30-dias': 'Quero organizar em ate 30 dias',
  'sem-prazo': 'Ainda estou definindo o cronograma',
};

const initialForm: FormState = {
  name: '',
  email: '',
  whatsapp: '',
  niche: '',
  goal: '',
  domain: '',
  timeline: '',
  notes: '',
};

const onboardingChecklist = [
  'Confirme nome, e-mail e WhatsApp do responsavel pelo projeto.',
  'Explique o nicho e o objetivo principal da base white-label.',
  'Informe se ja existe dominio, marca e prazo de ativacao.',
  'Use o WhatsApp oficial para centralizar o kickoff e os proximos passos.',
];

const faqItems = [
  {
    question: 'Preciso preencher tudo para falar com a equipe?',
    answer:
      'Nao. O basico ja basta para abrir o atendimento. Quanto mais contexto voce mandar, mais rapido fica o kickoff.',
  },
  {
    question: 'Esse onboarding substitui o suporte manual?',
    answer:
      'Nao. Ele organiza o ponto de partida. O atendimento manual continua sendo a camada que destrava buyer kit, setup e alinhamento de entrega.',
  },
  {
    question: 'Posso usar minha propria equipe depois?',
    answer:
      'Sim. O fluxo foi pensado para quem quer comprar a base e seguir com execucao propria ou com apoio adicional sob escopo.',
  },
];

const buildOnboardingMessage = (form: FormState): string => {
  const sections = [
    'Oi! Minha compra do WhiLab foi aprovada e eu quero iniciar o onboarding.',
    '',
    `Nome: ${form.name || '-'}`,
    `E-mail: ${form.email || '-'}`,
    `WhatsApp: ${form.whatsapp || '-'}`,
    `Objetivo: ${form.goal ? goalLabels[form.goal] : '-'}`,
    `Nicho: ${form.niche || '-'}`,
    `Dominio atual: ${form.domain || '-'}`,
    `Prazo: ${form.timeline ? timelineLabels[form.timeline] : '-'}`,
    `Observacoes: ${form.notes || '-'}`,
  ];

  return sections.join('\n');
};

export default function OnboardingPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false);
  const [copied, setCopied] = useState(false);

  const onboardingMessage = useMemo(() => buildOnboardingMessage(form), [form]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.goal) {
      return;
    }

    const url = `${dashboardBranding.whatsAppUrl}?text=${encodeURIComponent(onboardingMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setHasOpenedWhatsApp(true);
  };

  const handleCopy = async () => {
    if (!navigator?.clipboard) return;

    await navigator.clipboard.writeText(onboardingMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <MarketingPageFrame
      metaTitle={`Onboarding | ${dashboardBranding.brandName}`}
      metaDescription={`Fluxo de onboarding comercial e operacional do ${dashboardBranding.brandName}.`}
      eyebrow="Onboarding do comprador"
      title="Organize o kickoff da licenca em um fluxo unico."
      description="Depois da compra, o caminho certo e simples: centralize os dados do projeto, abra o WhatsApp oficial e destrave buyer kit, rebrand e deploy sem perder contexto."
      stats={[
        { label: 'Canal oficial', value: dashboardBranding.whatsAppDisplay },
        { label: 'Fluxo', value: 'Compra -> onboarding -> entrega' },
        { label: 'Escopo', value: 'Licenca + setup guiado' },
      ]}
      primaryCta={{ label: 'Voltar para obrigado', href: '/obrigado' }}
      secondaryCta={{ label: 'Ver suporte', href: '/suporte' }}
    >
      <MarketingSection
        eyebrow="Checklist"
        title="O que precisamos para abrir sua entrega direito"
        description="Este onboarding foi desenhado para organizar o primeiro contato e acelerar o alinhamento do projeto."
      >
        <MarketingChecklist items={onboardingChecklist} />
      </MarketingSection>

      <MarketingSection
        eyebrow="Formulario"
        title="Preencha os dados e abra o atendimento no WhatsApp"
        description="Assim que voce enviar o contexto inicial, a equipe consegue responder com menos atrito e mais clareza."
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">Nome responsavel</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                  placeholder="Quem vai conduzir o projeto"
                  required
                />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">E-mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                  placeholder="Seu melhor e-mail"
                  required
                />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">WhatsApp</span>
                <input
                  value={form.whatsapp}
                  onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                  placeholder="+55 64 99999-9999"
                />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">Objetivo principal</span>
                <select
                  value={form.goal}
                  onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value as GoalValue }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="saas">Lancar meu proprio SaaS</option>
                  <option value="clientes">Atender clientes com white-label</option>
                  <option value="operacao">Estruturar uma operacao interna</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">Nicho ou mercado</span>
                <input
                  value={form.niche}
                  onChange={(event) => setForm((current) => ({ ...current, niche: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                  placeholder="Ex.: servicos, saude, operacao interna"
                />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">Dominio ou marca atual</span>
                <input
                  value={form.domain}
                  onChange={(event) => setForm((current) => ({ ...current, domain: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                  placeholder="Ex.: minhasaas.com.br"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">Prazo desejado</span>
                <select
                  value={form.timeline}
                  onChange={(event) => setForm((current) => ({ ...current, timeline: event.target.value as TimelineValue }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                >
                  <option value="">Selecione</option>
                  <option value="imediato">Quero comecar agora</option>
                  <option value="7-dias">Quero ativar em ate 7 dias</option>
                  <option value="30-dias">Quero organizar em ate 30 dias</option>
                  <option value="sem-prazo">Ainda estou definindo o cronograma</option>
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/80">Observacoes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] dark:border-white/[0.08] dark:bg-[#0f1115] dark:text-white"
                  placeholder="Conte o que ja existe, o que quer lancar e onde precisa de ajuda."
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[14px] font-medium text-white transition-all duration-300 hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]"
              >
                Abrir WhatsApp com onboarding
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleCopy();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-[14px] font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.15] dark:text-white/70 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                Copiar resumo
                <ClipboardList className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-slate-500 dark:text-[#969696]">
              Ao abrir o WhatsApp, o resumo do seu onboarding vai junto para acelerar o kickoff.
            </p>
          </form>

          <aside className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#0f1115]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Canal oficial</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#969696]">{dashboardBranding.whatsAppDisplay}</p>
                </div>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-slate-500 dark:text-[#969696]">
                Use esse numero para centralizar confirmacao de compra, buyer kit, kickoff e proximos passos da entrega.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#0f1115]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Status do fluxo</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#969696]">
                    {hasOpenedWhatsApp ? 'WhatsApp aberto com o onboarding pronto.' : 'Preencha e abra o WhatsApp para concluir o kickoff.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#0f1115]">
              <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Resumo pronto para envio</h3>
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-[12px] leading-relaxed text-slate-700 dark:bg-black/40 dark:text-white/75">
                {onboardingMessage}
              </pre>
              <p className="mt-3 text-[13px] text-slate-500 dark:text-[#969696]">
                {copied ? 'Resumo copiado para a area de transferencia.' : 'Se preferir, copie o resumo e envie manualmente.'}
              </p>
            </div>
          </aside>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="FAQ"
        title="Duvidas comuns sobre o kickoff"
      >
        <MarketingFaqGrid items={faqItems} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
