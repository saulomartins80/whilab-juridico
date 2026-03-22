import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart2,
  Brain,
  Check,
  Database,
  Minus,
  Paintbrush,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import MegaMenu from '../components/marketing/MegaMenu';

/* ================================================================
   DESIGN TOKENS
   ================================================================ */

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ================================================================
   PRIMITIVOS
   ================================================================ */

function Section({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={`relative px-5 md:px-10 ${className}`}
    >
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </motion.section>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-[#969696] tracking-wide mb-3">
      {children}
    </motion.p>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white">
      {children}
    </motion.h2>
  );
}

function SectionSub({ children }: { children: ReactNode }) {
  return (
    <motion.p variants={fadeUp} custom={2} className="mt-4 text-[16px] leading-relaxed text-[#969696] max-w-[520px]">
      {children}
    </motion.p>
  );
}

function PillButton({ children, href, variant = 'white' }: { children: ReactNode; href: string; variant?: 'white' | 'dark' | 'outline' }) {
  const base = 'inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium transition-all duration-300';
  const styles = {
    white: `${base} bg-white text-[#121212] hover:bg-[#22d3ee] hover:text-[#121212]`,
    dark: `${base} bg-[#121212] text-white border border-white/[0.2] hover:bg-white/[0.08]`,
    outline: `${base} border border-white/[0.2] text-white hover:bg-white/[0.06]`,
  };
  return <Link href={href} className={styles[variant]}>{children}</Link>;
}

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden py-5">
      <div className="flex animate-[marquee_25s_linear_infinite] gap-10 whitespace-nowrap">
        {children}
        {children}
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.08]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-[16px] font-medium text-white group-hover:text-[#22d3ee] transition-colors">{q}</span>
        {open ? <Minus className="w-5 h-5 text-[#969696] flex-shrink-0" /> : <Plus className="w-5 h-5 text-[#969696] flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] leading-relaxed text-[#969696]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnimStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let s = 0;
    const dur = 1600, step = 16, inc = value / (dur / step);
    const t = setInterval(() => { s += inc; if (s >= value) { setCount(value); clearInterval(t); } else setCount(Math.floor(s)); }, step);
    return () => clearInterval(t);
  }, [inView, value]);
  return <span ref={ref}>{count.toLocaleString('pt-BR')}{suffix}</span>;
}

/* ================================================================
   PAGINA PRINCIPAL
   ================================================================ */

export default function HomePage() {
  const router = useRouter();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const redirecting = useRef(false);

  useEffect(() => {
    let mounted = true;

    const goToDashboard = () => {
      if (!mounted || redirecting.current) return;
      redirecting.current = true;
      router.replace('/dashboard');
    };

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) goToDashboard();
      } catch {
        // Supabase nao configurado — ignora
      }
    };

    void checkSession();

    let listener: { subscription: { unsubscribe: () => void } } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) goToDashboard();
      });
      listener = result.data;
    } catch {
      // Supabase nao configurado — ignora
    }

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>WhiLab | Operacao Pecuaria Premium</title>
        <meta name="description" content="Plataforma pecuaria premium com dashboard executivo, IA aplicada, base white-label e estrutura pronta para implantar, operar e revender." />
        <meta name="theme-color" content="#121212" />
      </Head>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="min-h-screen bg-[#121212] text-white antialiased selection:bg-[#22d3ee]/30 overflow-x-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>

        {/* MEGA MENU */}
        <MegaMenu />

        {/* HERO */}
        <div ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20">
          <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '256px 256px' }} />

          <motion.div style={{ opacity: heroOpacity }} className="relative z-10 mx-auto grid w-full max-w-[1200px] gap-12 px-5 md:px-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
            <div className="max-w-[640px]">
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
                <span className="text-[13px] font-medium text-[#969696]">Operacao Pecuaria Premium</span>
              </motion.div>

              <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                Seu rebanho<br />merece<span className="text-[#22d3ee]"> controle real.</span>
              </motion.h1>

              <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mt-6 max-w-[560px] text-[16px] md:text-[18px] leading-relaxed text-[#969696]">
                WhiLab une pecuaria, inteligencia artificial e infraestrutura moderna para transformar a operacao do campo em decisoes mais claras, rastreaveis e comerciais.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <PillButton href="/demo" variant="white">Ver demonstracao <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
                <PillButton href="#precos" variant="outline">Ver planos</PillButton>
              </motion.div>

              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-10 grid gap-3 sm:grid-cols-2">
                {['Dashboard executivo com KPIs em tempo real', 'Supabase como infraestrutura oficial', 'IA aplicada ao manejo e producao', 'White-label pronto para revenda'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-sm text-white/75">{item}</div>
                ))}
              </motion.div>
            </div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="relative">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_58%)] blur-3xl" />
              <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_40px_110px_rgba(2,8,20,0.42)] backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.08]">
                  <Image src="/real/dashboard-finnextho.png" alt="Dashboard WhiLab" width={1280} height={900} priority className="h-[420px] w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/72 via-transparent to-transparent" />
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
                    <div className="rounded-full border border-white/[0.1] bg-[#121212]/75 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur">Dashboard executivo</div>
                    <div className="hidden rounded-full border border-white/[0.1] bg-[#121212]/75 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#22d3ee] backdrop-blur sm:block">WhiLab</div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="rounded-[1.25rem] border border-white/[0.1] bg-[#121212]/78 p-4 backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#22d3ee]">Visao completa da operacao</p>
                      <p className="mt-2 text-sm leading-6 text-white/80">KPIs de rebanho, producao, vendas e rotina operacional em uma unica tela.</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/[0.1] bg-[#121212]/78 px-4 py-3 backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Modelo</p>
                      <p className="mt-1 text-sm font-semibold text-white">SaaS + White-label</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="absolute bottom-0 inset-x-0 border-t border-white/[0.06]">
            <Marquee>
              {['Pecuaria premium', 'Inteligencia artificial', 'Supabase', 'White-label', 'Dashboard executivo', 'Manejo inteligente'].map((t) => (
                <span key={t} className="flex items-center gap-3 text-[14px] font-medium text-white/20 uppercase tracking-[0.15em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]/50" />{t}
                </span>
              ))}
            </Marquee>
          </motion.div>
        </div>

        {/* SOBRE */}
        <Section className="py-24" id="about">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionLabel>Sobre o WhiLab</SectionLabel>
              <SectionHeading>Tecnologia que entende o campo.</SectionHeading>
              <SectionSub>Nascemos para resolver a distancia entre a gestao pecuaria real e as ferramentas digitais disponiveis. Combinamos IA, dados e experiencia de usuario para quem opera no campo e decide no escritorio.</SectionSub>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: 50, suffix: 'K+', label: 'Cabecas gerenciadas' },
                { value: 120, suffix: '+', label: 'Fazendas conectadas' },
                { value: 98, suffix: '%', label: 'Uptime da plataforma' },
                { value: 3, suffix: 'x', label: 'Mais rapido que planilhas' },
              ].map((s, i) => (
                <motion.div key={s.label} variants={fadeUp} custom={i} className="text-left">
                  <p className="text-[clamp(2.5rem,5vw,3.5rem)] font-semibold tracking-[-0.03em] text-white"><AnimStat value={s.value} suffix={s.suffix} /></p>
                  <p className="mt-1 text-[14px] text-[#969696]">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* SOLUCOES */}
        <Section className="py-24" id="solucoes">
          <SectionLabel>Solucoes</SectionLabel>
          <SectionHeading>Tudo que sua operacao precisa.</SectionHeading>
          <SectionSub>Modulos integrados para cobrir cada etapa da gestao pecuaria.</SectionSub>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: BarChart2, title: 'Dashboard Executivo', desc: 'Visao consolidada de KPIs, alertas e metricas de producao em tempo real.', features: ['KPIs de rebanho', 'Alertas inteligentes', 'Graficos interativos', 'Exportacao PDF'] },
              { icon: Target, title: 'Gestao de Rebanho', desc: 'Controle completo do ciclo de vida dos animais com historico rastreavel.', features: ['Cadastro individual', 'Historico de manejo', 'Genealogia', 'Rastreabilidade'] },
              { icon: Brain, title: 'Inteligencia Artificial', desc: 'IA aplicada ao fluxo real: previsoes, alertas de saude e sugestoes.', features: ['Previsao de producao', 'Deteccao de anomalias', 'Chatbot especializado', 'Insights automaticos'] },
              { icon: Database, title: 'Infraestrutura Supabase', desc: 'Banco, auth e storage configurados para performance e escala.', features: ['Auth multi-provider', 'PostgreSQL', 'Storage de arquivos', 'APIs real-time'] },
              { icon: Paintbrush, title: 'White-label', desc: 'Estrutura para troca de marca, cores e posicionamento.', features: ['Marca customizavel', 'Temas e cores', 'Dominio proprio', 'Copy editavel'] },
              { icon: TrendingUp, title: 'Vendas e Producao', desc: 'Controle financeiro com vendas, producao leiteira e margem.', features: ['Registro de vendas', 'Producao de leite', 'Analise de custos', 'Margem por animal'] },
            ].map((svc, i) => (
              <motion.div key={svc.title} variants={fadeUp} custom={i} className="group rounded-2xl border border-white/[0.08] bg-[#121212] p-7 hover:border-white/[0.15] transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="rounded-xl bg-white/[0.05] p-3 text-[#22d3ee]"><svc.icon className="w-5 h-5" /></div>
                  <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-[#22d3ee] transition-colors" />
                </div>
                <h3 className="text-[18px] font-semibold tracking-tight mb-2">{svc.title}</h3>
                <p className="text-[14px] text-[#969696] leading-relaxed mb-5">{svc.desc}</p>
                <div className="space-y-2.5">
                  {svc.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/50"><div className="w-1 h-1 rounded-full bg-[#22d3ee]" />{f}</div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* PROCESSO */}
        <Section className="py-24" id="processo">
          <SectionLabel>Processo</SectionLabel>
          <SectionHeading>Da contratacao a operacao em dias.</SectionHeading>
          <SectionSub>Um processo direto para colocar sua gestao no ar com seguranca.</SectionSub>
          <div className="mt-14 grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Descoberta', desc: 'Entendemos sua operacao, tamanho do rebanho e necessidades.' },
              { step: '2', title: 'Setup', desc: 'Configuramos Supabase, importamos dados e ajustamos a plataforma.' },
              { step: '3', title: 'Treinamento', desc: 'Capacitamos sua equipe para operar dashboard, manejos e IA.' },
              { step: '4', title: 'Operacao', desc: 'Acompanhamos os primeiros ciclos e otimizamos com dados reais.' },
            ].map((p, i) => (
              <motion.div key={p.step} variants={fadeUp} custom={i} className="rounded-2xl border border-white/[0.08] bg-[#121212] p-7">
                <div className="w-10 h-10 rounded-full bg-[#22d3ee] flex items-center justify-center text-[#121212] text-[14px] font-bold mb-5">{p.step}</div>
                <h3 className="text-[17px] font-semibold tracking-tight mb-2">{p.title}</h3>
                <p className="text-[14px] text-[#969696] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* RESULTADOS */}
        <Section className="py-24" id="resultados">
          <SectionLabel>Resultados</SectionLabel>
          <SectionHeading>Impacto real no campo.</SectionHeading>
          <SectionSub>Veja como a plataforma transforma operacoes pecuarias.</SectionSub>
          <div className="mt-14 space-y-4">
            {[
              { name: 'Fazenda Santa Clara', tag: 'Gado de Corte', desc: 'Operacao de 2.800 cabecas que substituiu planilhas e ganhou visibilidade total sobre manejo e ciclo reprodutivo.', stats: [{ value: 34, suffix: '%', label: 'Reducao no tempo de manejo' }, { value: 22, suffix: '%', label: 'Aumento na margem' }], img: '/real/dashboard-finnextho.png' },
              { name: 'Laticinio Vale Verde', tag: 'Producao Leiteira', desc: 'Controle de producao diaria de 450 vacas com monitoramento de qualidade e previsao via IA.', stats: [{ value: 18, suffix: '%', label: 'Aumento na producao' }, { value: 45, suffix: '%', label: 'Reducao em perdas' }], img: '/real/reports-finnextho.png' },
              { name: 'Agropecuaria Horizonte', tag: 'Operacao Mista', desc: 'Gestao integrada de corte e leite com dashboard unificado e rastreabilidade completa.', stats: [{ value: 3, suffix: 'x', label: 'Mais rapido nas decisoes' }, { value: 60, suffix: '%', label: 'Menos retrabalho' }], img: '/real/assistant-finnextho.png' },
            ].map((cs, i) => (
              <motion.div key={cs.name} variants={fadeUp} custom={i} className="group rounded-2xl border border-white/[0.08] bg-[#121212] overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto overflow-hidden">
                    <Image src={cs.img} alt={cs.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/50 to-transparent lg:from-transparent lg:to-[#121212]/80" />
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <h3 className="text-[28px] font-semibold tracking-tight">{cs.name}</h3>
                    <p className="text-[15px] text-[#22d3ee] font-medium mt-1">{cs.tag}</p>
                    <p className="text-[14px] text-[#969696] leading-relaxed mt-3">{cs.desc}</p>
                    <div className="mt-6 grid grid-cols-2 gap-6">
                      {cs.stats.map((st) => (
                        <div key={st.label}>
                          <p className="text-[32px] font-semibold tracking-tight text-white"><AnimStat value={st.value} suffix={st.suffix} /></p>
                          <p className="text-[12px] text-[#969696] mt-0.5">{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* COMPARACAO */}
        <Section className="py-24">
          <SectionLabel>Diferencial</SectionLabel>
          <SectionHeading>Por que escolher o WhiLab.</SectionHeading>
          <div className="mt-14 rounded-2xl border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/[0.08]"><th className="px-6 py-4 text-[13px] font-medium text-[#969696]" /><th className="px-6 py-4 text-[14px] font-semibold text-[#22d3ee]">WhiLab</th><th className="px-6 py-4 text-[14px] font-semibold text-[#969696]">Tradicionais</th></tr></thead>
              <tbody>
                {[
                  { label: 'Abordagem', bovi: 'Digital-first com IA integrada', other: 'Planilhas e controle manual' },
                  { label: 'Infraestrutura', bovi: 'Supabase + cloud escalavel', other: 'Servidor local ou sem infra' },
                  { label: 'Implantacao', bovi: 'Dias, nao meses', other: 'Semanas a meses de setup' },
                  { label: 'White-label', bovi: 'Rebrandeavel e revendavel', other: 'Marca fixa' },
                  { label: 'Inteligencia', bovi: 'IA aplicada ao fluxo real', other: 'Sem camada inteligente' },
                  { label: 'Evolucao', bovi: 'Updates continuos', other: 'Produto estatico' },
                ].map((row, i) => (
                  <tr key={row.label} className={i < 5 ? 'border-b border-white/[0.06]' : ''}>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#969696]">{row.label}</td>
                    <td className="px-6 py-4 text-[14px] text-white">{row.bovi}</td>
                    <td className="px-6 py-4 text-[14px] text-white/40">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* DEPOIMENTO */}
        <Section className="py-24">
          <SectionLabel>Depoimentos</SectionLabel>
          <SectionHeading>O que nossos clientes dizem.</SectionHeading>
          <motion.div variants={fadeUp} custom={3} className="mt-14 rounded-2xl border border-white/[0.08] bg-[#121212] p-8 md:p-10">
            <div className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
              <div>
                <p className="text-[18px] md:text-[20px] leading-relaxed text-white/80">&quot;Antes do WhiLab, a gestao era feita em cadernos e planilhas. Hoje temos visao completa em tempo real, e a IA nos alerta sobre problemas antes que virem prejuizo.&quot;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#06b6d4] flex items-center justify-center text-[12px] font-bold text-[#121212]">RS</div>
                  <div><p className="text-[14px] font-semibold">Ricardo Silva</p><p className="text-[13px] text-[#969696]">Gestor, Fazenda Santa Clara</p></div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-6">
                <div><p className="text-[32px] font-semibold tracking-tight text-[#22d3ee]">34%</p><p className="text-[12px] text-[#969696]">menos tempo no manejo</p></div>
                <div><p className="text-[32px] font-semibold tracking-tight text-white">2.800</p><p className="text-[12px] text-[#969696]">cabecas gerenciadas</p></div>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* PRECOS */}
        <Section className="py-24" id="precos">
          <SectionLabel>Planos</SectionLabel>
          <SectionHeading>Simples e flexivel.</SectionHeading>
          <SectionSub>Escolha o plano que se encaixa na sua operacao.</SectionSub>
          <div className="mt-14 grid md:grid-cols-3 gap-4 max-w-[1000px]">
            <motion.div variants={fadeUp} custom={0} className="rounded-2xl border border-white/[0.08] bg-[#121212] p-7">
              <p className="text-[13px] font-medium text-[#969696] uppercase tracking-wider mb-4">Starter</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-[48px] font-semibold tracking-tight">R$297</span><span className="text-[14px] text-[#969696]">/mes</span></div>
              <p className="text-[14px] text-[#969696] leading-relaxed mb-6">Ideal para pequenas fazendas.</p>
              <PillButton href="/contato" variant="outline">Comecar agora <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <div className="mt-7 pt-6 border-t border-white/[0.06] space-y-3">
                {['Ate 500 cabecas', 'Dashboard executivo', 'Gestao de rebanho', 'Registro de manejos', 'Suporte por email'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/60"><Check className="w-4 h-4 text-[#22d3ee] flex-shrink-0" />{f}</div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="rounded-2xl border border-[#22d3ee]/30 bg-[#121212] p-7 relative">
              <div className="absolute -top-3 left-7 rounded-full bg-[#22d3ee] px-3 py-1 text-[11px] font-bold text-[#121212] uppercase tracking-wider">Popular</div>
              <p className="text-[13px] font-medium text-[#969696] uppercase tracking-wider mb-4">Profissional</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-[48px] font-semibold tracking-tight">R$597</span><span className="text-[14px] text-[#969696]">/mes</span></div>
              <p className="text-[14px] text-[#969696] leading-relaxed mb-6">IA e controle completo.</p>
              <PillButton href="/contato" variant="white">Comecar agora <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <div className="mt-7 pt-6 border-t border-white/[0.06] space-y-3">
                {['Ate 3.000 cabecas', 'Inteligencia artificial', 'Producao e vendas', 'Relatorios avancados', 'Suporte prioritario', 'Integracao com APIs'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/60"><Check className="w-4 h-4 text-[#22d3ee] flex-shrink-0" />{f}</div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={2} className="rounded-2xl border border-white/[0.08] bg-[#121212] p-7">
              <p className="text-[13px] font-medium text-[#969696] uppercase tracking-wider mb-4">Enterprise</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-[48px] font-semibold tracking-tight">Custom</span></div>
              <p className="text-[14px] text-[#969696] leading-relaxed mb-6">White-label completo.</p>
              <PillButton href="/contato" variant="dark">Falar com vendas <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <div className="mt-7 pt-6 border-t border-white/[0.06] space-y-3">
                {['Cabecas ilimitadas', 'White-label completo', 'Dominio e marca propria', 'SLA dedicado', 'Onboarding personalizado', 'API e webhooks'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/60"><Check className="w-4 h-4 text-[#22d3ee] flex-shrink-0" />{f}</div>
                ))}
              </div>
            </motion.div>
          </div>
        </Section>

        {/* FAQ */}
        <Section className="py-24" id="faq">
          <SectionLabel>FAQ</SectionLabel>
          <SectionHeading>Perguntas frequentes</SectionHeading>
          <SectionSub>Tudo que voce precisa saber antes de comecar.</SectionSub>
          <div className="mt-14 max-w-[700px]">
            {[
              { q: 'O que e a WhiLab?', a: 'Plataforma pecuaria premium com dashboard executivo, controle de rebanho, manejos, producao, vendas e IA em infraestrutura Supabase.' },
              { q: 'Funciona para gado de corte e leite?', a: 'Sim. O WhiLab atende operacoes de corte, leite e mistas com modulos e KPIs especificos para cada modelo.' },
              { q: 'Preciso de internet na fazenda?', a: 'Para acesso completo sim. Estamos desenvolvendo funcionalidades offline com sincronizacao automatica.' },
              { q: 'Como funciona o white-label?', a: 'No plano Enterprise voce recebe a plataforma completa com sua marca, cores, dominio e copy para revender.' },
              { q: 'Quanto tempo leva a implantacao?', a: 'De 3 a 7 dias para operacoes basicas. Ate 15 dias para operacoes maiores com importacao de dados.' },
              { q: 'A IA substitui o veterinario?', a: 'Nao. A IA e ferramenta de apoio a decisao — analisa padroes, gera alertas e sugere acoes. A decisao final e do profissional.' },
            ].map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </Section>

        {/* CTA FINAL */}
        <Section className="py-32">
          <motion.div variants={fadeUp} custom={0} className="text-center">
            <p className="text-[13px] text-[#22d3ee] font-medium mb-4">Vagas limitadas para onboarding</p>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.04em]">Pare de adivinhar.<br />Comece a <span className="text-[#22d3ee]">gerenciar.</span></h2>
            <p className="mt-5 text-[16px] text-[#969696] max-w-[480px] mx-auto">Leve sua operacao pecuaria para o proximo nivel com dados, IA e uma plataforma que cresce junto com voce.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <PillButton href="/demo" variant="white">Ver demonstracao <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <PillButton href="/contato" variant="outline">Falar com vendas <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
            </div>
          </motion.div>
        </Section>

        {/* FOOTER */}
        <footer className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-14">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10">
              <div className="max-w-[280px]">
                <div className="flex items-center gap-2.5 mb-3">
                  <Image src="/logo.svg" alt="WhiLab" width={24} height={24} />
                  <p className="text-[15px] font-semibold">WhiLab</p>
                </div>
                <p className="text-[13px] text-[#969696] leading-relaxed">Plataforma pecuaria premium com IA, dashboard executivo e infraestrutura pronta para implantar, operar e revender.</p>
              </div>
              <div className="flex gap-12 sm:gap-16">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#969696] mb-4">Plataforma</p>
                  <div className="space-y-2.5">
                    {[{ l: 'Solucoes', h: '/solucoes' }, { l: 'Recursos', h: '/recursos' }, { l: 'Precos', h: '/precos' }, { l: 'Demo', h: '/demo' }, { l: 'Dashboard', h: '/dashboard' }].map((x) => (
                      <Link key={x.h} href={x.h} className="block text-[13px] text-white/40 hover:text-white transition-colors">{x.l}</Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#969696] mb-4">Empresa</p>
                  <div className="space-y-2.5">
                    {[{ l: 'Sobre', h: '/sobre' }, { l: 'Blog', h: '/blog' }, { l: 'Contato', h: '/contato' }, { l: 'Parceiros', h: '/parceiros' }, { l: 'Carreiras', h: '/carreiras' }].map((x) => (
                      <Link key={x.h} href={x.h} className="block text-[13px] text-white/40 hover:text-white transition-colors">{x.l}</Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#969696] mb-4">Legal</p>
                  <div className="space-y-2.5">
                    {[{ l: 'Termos', h: '/termos' }, { l: 'Privacidade', h: '/privacidade' }, { l: 'Cookies', h: '/cookies' }, { l: 'Seguranca', h: '/seguranca' }, { l: 'Licencas', h: '/licencas' }].map((x) => (
                      <Link key={x.h} href={x.h} className="block text-[13px] text-white/40 hover:text-white transition-colors">{x.l}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-[12px] text-white/20">&copy; 2026 WhiLab. Todos os direitos reservados.</p>
              <p className="text-[12px] text-white/20">Operacao pecuaria premium com <span className="text-white/40">IA</span></p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}


