import Link from 'next/link';
import {
  CircleHelp,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Users,
  Zap,
} from 'lucide-react';

import {
  MarketingCardGrid,
  MarketingFaqGrid,
  MarketingPageFrame,
  MarketingSection,
} from '../components/marketing/MarketingPage';
import { dashboardBranding } from '../config/branding';

const supportChannels = [
  {
    id: 'operations',
    title: 'Atendimento',
    description: 'Canal principal para onboarding, alinhamento operacional e contexto do projeto.',
    detail: 'atendimentos@whilab.com.br',
    href: 'mailto:atendimentos@whilab.com.br',
    icon: MessageCircle,
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Canal rapido para suporte e implantacao com retorno mais agil.',
    detail: '+55 62 99966-7963',
    href: 'https://wa.me/5562999667963',
    icon: Zap,
  },
  {
    id: 'support',
    title: 'Suporte tecnico',
    description: 'Use para erros, acesso, comportamento inesperado e duvidas tecnicas.',
    detail: 'suporte@whilab.com.br',
    href: 'mailto:suporte@whilab.com.br',
    icon: Mail,
  },
  {
    id: 'sales',
    title: 'Vendas',
    description: 'Canal comercial para licencas, escopo, proposta e fechamento.',
    detail: 'vendas@whilab.com.br',
    href: 'mailto:vendas@whilab.com.br',
    icon: Users,
  },
];

const supportHours = [
  {
    title: 'Suporte tecnico',
    description: 'Segunda a sexta, das 8h as 20h. Sabado, das 9h as 15h.',
  },
  {
    title: 'Comercial e implantacao',
    description: 'Segunda a sexta, das 9h as 18h, com alinhamentos sob demanda.',
  },
];

const resources = [
  {
    title: 'Recursos',
    description: 'Visao geral da base, docs e materiais publicos para avaliacao.',
    href: '/recursos',
    icon: FileText,
  },
  {
    title: 'Planos e licencas',
    description: 'Entenda faixas de entrada, setup e escada comercial.',
    href: '/precos',
    icon: CircleHelp,
  },
  {
    title: 'Contato comercial',
    description: 'Canal direto para proposta, escopo e fechamento da operacao.',
    href: '/contato',
    icon: Users,
  },
];

const faqItems = [
  {
    question: 'Como funciona o onboarding inicial?',
    answer:
      'Depois do primeiro contato, alinhamos escopo, acesso, setup e a trilha de implantacao mais adequada para sua operacao.',
  },
  {
    question: 'O que eu recebo no suporte?',
    answer:
      'Orientacao de acesso, esclarecimento de duvidas operacionais, suporte tecnico e encaminhamento comercial quando houver customizacao ou implantacao.',
  },
  {
    question: 'Posso usar a base com minha marca?',
    answer:
      'Sim. A estrutura comercial do WhiLab foi pensada para setup, rebranding e adaptacao com mais rapidez, dentro do escopo contratado.',
  },
  {
    question: 'Qual e o melhor canal para falar com humano rapido?',
    answer:
      'Para urgencia operacional use WhatsApp. Para suporte tecnico use suporte@whilab.com.br. Para vendas e implantacao use vendas@whilab.com.br.',
  },
];

export default function SuportePage() {
  return (
    <MarketingPageFrame
      metaTitle={`Suporte | ${dashboardBranding.brandName}`}
      metaDescription={`Central de suporte, atendimento e implantacao do ${dashboardBranding.brandName}.`}
      eyebrow="Central de suporte"
      title="Atendimento, suporte e implantacao em um fluxo claro."
      description={`Fale com a equipe certa para onboarding, suporte tecnico, implantacao e proposta comercial do ${dashboardBranding.brandName}.`}
      stats={[
        { label: 'Canais ativos', value: '4 frentes de contato' },
        { label: 'Cobertura', value: 'Suporte tecnico + comercial' },
        { label: 'Operacao', value: 'Fluxo pensado para onboarding' },
      ]}
      primaryCta={{ label: 'Falar com vendas', href: '/contato' }}
      secondaryCta={{ label: 'Ver planos', href: '/precos' }}
    >
      <MarketingSection
        eyebrow="Canais"
        title="Escolha o canal certo para cada situacao"
        description="Cada frente foi organizada para reduzir atrito e acelerar resposta sem perder contexto."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {supportChannels.map((channel) => {
            const Icon = channel.icon;
            const external = channel.href.startsWith('http');

            return (
              <a
                key={channel.id}
                href={channel.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-white/[0.05] p-3 text-[#22d3ee]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/20 transition-colors group-hover:text-[#22d3ee]" />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-white">{channel.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#969696]">{channel.description}</p>
                <p className="mt-4 text-[13px] font-medium text-white/75">{channel.detail}</p>
              </a>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Horario"
        title="Janelas de atendimento"
        description="Mantemos uma trilha simples para urgencia operacional, suporte tecnico e comercial."
      >
        <MarketingCardGrid
          items={supportHours.map((item) => ({
            title: item.title,
            description: item.description,
          }))}
        />
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white/[0.05] p-3 text-[#22d3ee]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-white">Prioridade operacional</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#969696]">
                Para situacoes urgentes, use o WhatsApp e depois centralize o contexto no e-mail de atendimento para manter a trilha organizada.
              </p>
              <a
                href="https://wa.me/5562999667963"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#121212] transition-all hover:bg-[#22d3ee]"
              >
                <Phone className="h-4 w-4" />
                Abrir canal prioritario
              </a>
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Recursos"
        title="Atalhos uteis antes de chamar a equipe"
        description="Algumas respostas e caminhos operacionais ficam mais rapidos por aqui."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((resource) => {
            const Icon = resource.icon;

            return (
              <Link
                key={resource.href}
                href={resource.href}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
              >
                <div className="rounded-xl bg-white/[0.05] p-3 text-[#22d3ee] w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-white">{resource.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#969696]">{resource.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-white/70 transition-colors group-hover:text-[#22d3ee]">
                  Acessar
                  <ExternalLink className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="FAQ"
        title="Perguntas frequentes"
        description="As respostas abaixo ajudam a reduzir o tempo ate a operacao ficar clara para o cliente."
      >
        <MarketingFaqGrid items={faqItems} />
      </MarketingSection>
    </MarketingPageFrame>
  );
}
