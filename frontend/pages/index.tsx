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
import OptimizedLogo from '../components/OptimizedLogo';
import { dashboardBranding } from '../config/branding';

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
    <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-slate-400 dark:text-[#969696] tracking-wide mb-3">
      {children}
    </motion.p>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-slate-900 dark:text-white">
      {children}
    </motion.h2>
  );
}

function SectionSub({ children }: { children: ReactNode }) {
  return (
    <motion.p variants={fadeUp} custom={2} className="mt-4 text-[16px] leading-relaxed text-slate-500 dark:text-[#969696] max-w-[520px]">
      {children}
    </motion.p>
  );
}

function PillButton({ children, href, variant = 'white' }: { children: ReactNode; href: string; variant?: 'white' | 'dark' | 'outline' }) {
  const base = 'inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium transition-all duration-300';
  const styles = {
    white: `${base} bg-slate-900 text-white hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee]`,
    dark: `${base} bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-[#121212] dark:text-white dark:border-white/[0.2] dark:hover:bg-white/[0.08]`,
    outline: `${base} border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/[0.2] dark:text-white dark:hover:bg-white/[0.06]`,
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
    <div className="border-b border-slate-200 dark:border-white/[0.08]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-[16px] font-medium text-slate-900 dark:text-white group-hover:text-[#0f766e] dark:group-hover:text-[#22d3ee] transition-colors">{q}</span>
        {open ? <Minus className="w-5 h-5 text-slate-400 dark:text-[#969696] flex-shrink-0" /> : <Plus className="w-5 h-5 text-slate-400 dark:text-[#969696] flex-shrink-0" />}
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
            <p className="pb-5 text-[14px] leading-relaxed text-slate-500 dark:text-[#969696]">{a}</p>
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
        <title>WhiLab | Base SaaS White-label Premium</title>
        <meta name="description" content="Licenca white-label de uma base SaaS pronta para rebrand, com auth, dashboard, Supabase, IA assistida e documentacao de setup." />
        <meta name="theme-color" content="#121212" />
      </Head>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-[#22d3ee]/30 overflow-x-hidden dark:bg-[#0a0a0a] dark:text-white" style={{ fontFamily: '"Inter", sans-serif' }}>

        {/* MEGA MENU */}
        <MegaMenu />

        {/* HERO */}
        <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-[#050505]">
          <div className="absolute inset-0">
            <Image
              src="/real/whilab-home-hero.webp"
              alt="Operacao no campo com suporte de tecnologia"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,12,0.58)_0%,rgba(4,7,12,0.16)_22%,rgba(4,7,12,0.74)_68%,rgba(4,7,12,0.94)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_32%,rgba(34,211,238,0.18),transparent_32%)]" />
          </div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1320px] items-end px-5 pb-24 pt-28 md:px-10"
          >
            <div className="w-full max-w-[760px]">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d1117]/68 px-4 py-2 backdrop-blur-xl"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
                <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/72">Licenca White-label SaaS</span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-8 text-[clamp(3.35rem,8vw,7rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-white"
              >
                Tenha sua propria
                <br />
                base SaaS
                <span className="text-[#22d3ee]"> pronta para rebrand.</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-6 max-w-[620px] text-[17px] leading-relaxed text-white/74 md:text-[19px]"
              >
                WhiLab vende uma base comercial com auth, dashboard, Supabase e IA assistida para voce trocar marca, dominio e narrativa sem comecar do zero.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PillButton href={dashboardBranding.checkoutUrl} variant="white">
                  Comprar licenca
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </PillButton>
                <PillButton href="/demo" variant="outline">
                  Ver demo
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </PillButton>
              </motion.div>

              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-10 grid gap-3 sm:grid-cols-3"
              >
                {[
                  'Base pronta para rebrand',
                  'Dashboard, auth e Supabase',
                  'Demo operacional para adaptar'
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-[#0d1117]/58 px-4 py-4 text-sm text-white/72 backdrop-blur-xl"
                  >
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="absolute bottom-0 inset-x-0 border-t border-white/10">
            <Marquee>
              {['White-label premium', 'IA assistida', 'Supabase', 'Auth pronta', 'Dashboard executivo', 'Rebrand rapido'].map((t) => (
                <span key={t} className="flex items-center gap-3 text-[14px] font-medium text-white/36 uppercase tracking-[0.15em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]/50" />{t}
                </span>
              ))}
            </Marquee>
          </motion.div>
        </div>

        {/* DASHBOARD SPOTLIGHT */}
        <Section className="py-24" id="visao-executiva">
          <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-[620px]">
              <SectionLabel>Dashboard executivo</SectionLabel>
              <SectionHeading>Uma base pronta para vender, adaptar e publicar com sua marca.</SectionHeading>
              <SectionSub>
                Mostramos um painel real para reduzir a cara de template cru. O comprador enxerga estrutura, fluxo e capacidade de rebranding antes de decidir.
              </SectionSub>

              <motion.div variants={fadeUp} custom={3} className="mt-8">
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-700 transition-colors hover:text-[#0f766e] dark:text-white/72 dark:hover:text-[#22d3ee]"
                >
                  Ver leitura executiva
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Dashboard, auth e fluxo base em uma unica superficie',
                  'Demo operacional que acelera proposta e rebrand'
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-sm text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/72"
                  >
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={2} className="relative">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.12),transparent_58%)] dark:bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_58%)] blur-3xl" />
              <div className="rounded-[2rem] border border-slate-200 bg-white/60 p-4 shadow-[0_40px_110px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_40px_110px_rgba(2,8,20,0.42)]">
                <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 dark:border-white/[0.08]">
                  <Image
                    src="/real/whilab-hero-dashboard.png"
                    alt="Visao executiva da operacao WhiLab"
                    width={1280}
                    height={900}
                    className="h-[440px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/72 via-transparent to-transparent" />
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
                    <div className="rounded-full border border-white/[0.1] bg-[#121212]/75 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur">
                      Dashboard executivo
                    </div>
                    <div className="hidden rounded-full border border-white/[0.1] bg-[#121212]/75 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#22d3ee] backdrop-blur sm:block">
                      WhiLab
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="rounded-[1.25rem] border border-white/[0.1] bg-[#121212]/78 p-4 backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#22d3ee]">Visao completa da base</p>
                      <p className="mt-2 text-sm leading-6 text-white/80">
                        Leitura executiva, modulos, auth e camada comercial em uma unica tela.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/[0.1] bg-[#121212]/78 px-4 py-3 backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Modelo</p>
                      <p className="mt-1 text-sm font-semibold text-white">SaaS + White-label</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* SOBRE */}
        <Section className="py-24" id="about">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionLabel>Sobre o WhiLab</SectionLabel>
              <SectionHeading>Tecnologia pronta para virar produto com a sua marca.</SectionHeading>
              <SectionSub>WhiLab nao vende codigo solto. Vende uma base SaaS com docs honestas, demo operacional e estrutura de rebranding para acelerar colocacao em producao.</SectionSub>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: 1, suffix: ' base', label: 'para varias vendas' },
                { value: 3, suffix: ' frentes', label: 'setup, rebrand e deploy' },
                { value: 1, suffix: ' checkout', label: 'mensagem comercial unica' },
                { value: 997, suffix: '', label: 'oferta de lancamento' },
              ].map((s, i) => (
                <motion.div key={s.label} variants={fadeUp} custom={i} className="text-left">
                  <p className="text-[clamp(2.5rem,5vw,3.5rem)] font-semibold tracking-[-0.03em] text-slate-900 dark:text-white"><AnimStat value={s.value} suffix={s.suffix} /></p>
                  <p className="mt-1 text-[14px] text-slate-500 dark:text-[#969696]">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* SOLUCOES */}
        <Section className="py-24" id="solucoes">
          <SectionLabel>Solucoes</SectionLabel>
          <SectionHeading>O que entra na licenca.</SectionHeading>
          <SectionSub>A oferta foca no que o comprador realmente recebe para ativar uma operacao com menos atrito.</SectionSub>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: BarChart2, title: 'Dashboard Executivo', desc: 'Painel base para leitura de KPIs, modulos e demonstracao comercial.', features: ['Visao pronta', 'Componentes reais', 'Demo navegavel', 'Exportacao PDF'] },
              { icon: Target, title: 'Autenticacao e Acesso', desc: 'Login, cadastro, recuperacao e fluxo inicial de usuarios ja conectados.', features: ['Cadastro', 'Login', 'Recuperacao', 'Acesso inicial'] },
              { icon: Brain, title: 'IA Assistida', desc: 'Camada de IA aplicada para perguntas, orientacao e leitura contextual da base.', features: ['Assistente contextual', 'Respostas guiadas', 'Insights iniciais', 'Leitura comercial'] },
              { icon: Database, title: 'Infraestrutura Supabase', desc: 'Banco, auth e storage configurados para performance e escala.', features: ['Auth multi-provider', 'PostgreSQL', 'Storage de arquivos', 'APIs real-time'] },
              { icon: Paintbrush, title: 'White-label', desc: 'Estrutura para trocar marca, cores, narrativa e posicionamento.', features: ['Marca customizavel', 'Temas e cores', 'Dominio proprio', 'Copy editavel'] },
              { icon: TrendingUp, title: 'Setup e Deploy', desc: 'Guias para conectar ambiente, ajustar dominio e publicar com menos risco.', features: ['Variaveis de ambiente', 'Deploy guiado', 'Checklist minimo', 'Ativacao mais rapida'] },
            ].map((svc, i) => (
              <motion.div key={svc.title} variants={fadeUp} custom={i} className="group rounded-2xl border border-slate-200 bg-white p-7 dark:border-white/[0.08] dark:bg-[#121212] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-300 hover:shadow-lg dark:hover:shadow-none">
                <div className="flex items-start justify-between mb-5">
                  <div className="rounded-xl bg-[#0f766e]/10 p-3 text-[#0f766e] dark:bg-white/[0.05] dark:text-[#22d3ee]"><svc.icon className="w-5 h-5" /></div>
                  <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#0f766e] dark:text-white/20 dark:group-hover:text-[#22d3ee] transition-colors" />
                </div>
                <h3 className="text-[18px] font-semibold tracking-tight mb-2 text-slate-900 dark:text-white">{svc.title}</h3>
                <p className="text-[14px] text-slate-500 dark:text-[#969696] leading-relaxed mb-5">{svc.desc}</p>
                <div className="space-y-2.5">
                  {svc.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-[13px] text-slate-400 dark:text-white/50"><div className="w-1 h-1 rounded-full bg-[#0f766e] dark:bg-[#22d3ee]" />{f}</div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* PROCESSO */}
        <Section className="py-24" id="processo">
          <SectionLabel>Processo</SectionLabel>
          <SectionHeading>Da compra a ativacao em poucos passos.</SectionHeading>
          <SectionSub>Um fluxo simples para o comprador sair do checkout e chegar no rebrand com contexto.</SectionSub>
          <div className="mt-14 grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Compra', desc: 'A licenca white-label e aprovada no checkout da Kiwify.' },
              { step: '2', title: 'Onboarding', desc: 'O comprador informa marca, nicho e contexto minimo da operacao.' },
              { step: '3', title: 'Entrega', desc: 'Buyer kit, documentacao e checklist seguem com escopo claro.' },
              { step: '4', title: 'Rebrand', desc: 'Marca, dominio e credenciais sao configurados para publicacao.' },
            ].map((p, i) => (
              <motion.div key={p.step} variants={fadeUp} custom={i} className="rounded-2xl border border-slate-200 bg-white p-7 dark:border-white/[0.08] dark:bg-[#121212]">
                <div className="w-10 h-10 rounded-full bg-[#0f766e] dark:bg-[#22d3ee] flex items-center justify-center text-white dark:text-[#121212] text-[14px] font-bold mb-5">{p.step}</div>
                <h3 className="text-[17px] font-semibold tracking-tight mb-2 text-slate-900 dark:text-white">{p.title}</h3>
                <p className="text-[14px] text-slate-500 dark:text-[#969696] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* RESULTADOS */}
        <Section className="py-24" id="resultados">
          <SectionLabel>Resultados</SectionLabel>
          <SectionHeading>Uma demo que ja ajuda a vender a base.</SectionHeading>
          <SectionSub>O ativo fica mais convincente quando o comprador enxerga estrutura real, nao so promessa.</SectionSub>
          <div className="mt-14 space-y-4">
            {[
              { name: 'Painel Executivo', tag: 'Leitura comercial', desc: 'Camada visual para apresentar a base com mais credibilidade e menos cara de prototipo vazio.', stats: [{ value: 1, suffix: ' tela', label: 'para explicar o produto' }, { value: 3, suffix: ' blocos', label: 'de leitura imediata' }], img: '/real/whilab-hero-dashboard.png' },
              { name: 'Operacao Configuravel', tag: 'Setup modular', desc: 'Fluxo base com estrutura suficiente para adaptar narrativa, marca e contexto com mais velocidade.', stats: [{ value: 1, suffix: ' base', label: 'para varios nichos' }, { value: 4, suffix: ' frentes', label: 'de configuracao inicial' }], img: '/real/whilab-operations-overview.png' },
              { name: 'Assistente Contextual', tag: 'IA assistida', desc: 'Uma camada de IA que ajuda a reforcar a percepcao de produto serio, guiado e evolutivo.', stats: [{ value: 1, suffix: ' camada', label: 'de apoio contextual' }, { value: 2, suffix: ' usos', label: 'suporte e demonstracao' }], img: '/real/whilab-assistant-panel.png' },
            ].map((cs, i) => (
              <motion.div key={cs.name} variants={fadeUp} custom={i} className="group rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-white/[0.08] dark:bg-[#121212]">
                <div className="grid lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto overflow-hidden">
                    <Image src={cs.img} alt={cs.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/50 to-transparent lg:from-transparent lg:to-[#121212]/80" />
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <h3 className="text-[28px] font-semibold tracking-tight text-slate-900 dark:text-white">{cs.name}</h3>
                    <p className="text-[15px] text-[#0f766e] dark:text-[#22d3ee] font-medium mt-1">{cs.tag}</p>
                    <p className="text-[14px] text-slate-500 dark:text-[#969696] leading-relaxed mt-3">{cs.desc}</p>
                    <div className="mt-6 grid grid-cols-2 gap-6">
                      {cs.stats.map((st) => (
                        <div key={st.label}>
                          <p className="text-[32px] font-semibold tracking-tight text-slate-900 dark:text-white"><AnimStat value={st.value} suffix={st.suffix} /></p>
                          <p className="text-[12px] text-slate-400 dark:text-[#969696] mt-0.5">{st.label}</p>
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
          <div className="mt-14 rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b border-slate-200 dark:border-white/[0.08]"><th className="px-6 py-4 text-[13px] font-medium text-slate-400 dark:text-[#969696]" /><th className="px-6 py-4 text-[14px] font-semibold text-[#0f766e] dark:text-[#22d3ee]">WhiLab</th><th className="px-6 py-4 text-[14px] font-semibold text-slate-400 dark:text-[#969696]">Tradicionais</th></tr></thead>
              <tbody>
                {[
                  { label: 'Abordagem', bovi: 'Digital-first com IA integrada', other: 'Planilhas e controle manual' },
                  { label: 'Infraestrutura', bovi: 'Supabase + cloud escalavel', other: 'Servidor local ou sem infra' },
                  { label: 'Implantacao', bovi: 'Dias, nao meses', other: 'Semanas a meses de setup' },
                  { label: 'White-label', bovi: 'Rebrandeavel e revendavel', other: 'Marca fixa' },
                  { label: 'Inteligencia', bovi: 'IA aplicada ao fluxo real', other: 'Sem camada inteligente' },
                  { label: 'Evolucao', bovi: 'Updates continuos', other: 'Produto estatico' },
                ].map((row, i) => (
                  <tr key={row.label} className={i < 5 ? 'border-b border-slate-100 dark:border-white/[0.06]' : ''}>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-400 dark:text-[#969696]">{row.label}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-900 dark:text-white">{row.bovi}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-400 dark:text-white/40">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* DEPOIMENTO */}
        <Section className="py-24">
          <SectionLabel>Depoimentos</SectionLabel>
          <SectionHeading>O que a base precisa transmitir.</SectionHeading>
          <motion.div variants={fadeUp} custom={3} className="mt-14 rounded-2xl border border-slate-200 bg-white p-8 dark:border-white/[0.08] dark:bg-[#121212] md:p-10">
            <div className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
              <div>
                <p className="text-[18px] md:text-[20px] leading-relaxed text-slate-600 dark:text-white/80">&quot;Nao parece codigo cru nem promessa vazia. Parece uma base organizada para rebrand, ativacao e venda com mais seguranca.&quot;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#06b6d4] flex items-center justify-center text-[12px] font-bold text-[#121212]">RS</div>
                  <div><p className="text-[14px] font-semibold text-slate-900 dark:text-white">Leitura ideal do comprador</p><p className="text-[13px] text-slate-400 dark:text-[#969696]">Oferta white-label com contexto claro</p></div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-6">
                <div><p className="text-[32px] font-semibold tracking-tight text-[#0f766e] dark:text-[#22d3ee]">1</p><p className="text-[12px] text-slate-400 dark:text-[#969696]">mensagem comercial clara</p></div>
                <div><p className="text-[32px] font-semibold tracking-tight text-slate-900 dark:text-white">R$997</p><p className="text-[12px] text-slate-400 dark:text-[#969696]">oferta ativa de lancamento</p></div>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* PRECOS */}
        <Section className="py-24" id="precos">
          <SectionLabel>Oferta</SectionLabel>
          <SectionHeading>Uma licenca, uma mensagem, um checkout.</SectionHeading>
          <SectionSub>A oferta ativa hoje e pagamento unico com ancora de lancamento. O resto entra depois, sem confundir a compra inicial.</SectionSub>
          <div className="mt-14 grid md:grid-cols-3 gap-4 max-w-[1000px]">
            <motion.div variants={fadeUp} custom={0} className="rounded-2xl border border-slate-200 bg-white p-7 dark:border-white/[0.08] dark:bg-[#121212]">
              <p className="text-[13px] font-medium text-slate-400 dark:text-[#969696] uppercase tracking-wider mb-4">Licenca ativa</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-[48px] font-semibold tracking-tight text-slate-900 dark:text-white">R$997</span><span className="text-[14px] text-slate-400 dark:text-[#969696]">pagamento unico</span></div>
              <p className="text-[14px] text-slate-500 dark:text-[#969696] leading-relaxed mb-6">Entrada mais simples para comprar a base e iniciar o rebrand.</p>
              <PillButton href={dashboardBranding.checkoutUrl} variant="outline">Comprar agora <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <div className="mt-7 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                {['Base white-label', 'Auth e dashboard', 'Supabase preparado', 'IA assistida', 'Docs de setup'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-slate-500 dark:text-white/60"><Check className="w-4 h-4 text-[#0f766e] dark:text-[#22d3ee] flex-shrink-0" />{f}</div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="rounded-2xl border border-[#0f766e]/30 bg-white p-7 relative dark:border-[#22d3ee]/30 dark:bg-[#121212]">
              <div className="absolute -top-3 left-7 rounded-full bg-[#0f766e] dark:bg-[#22d3ee] px-3 py-1 text-[11px] font-bold text-white dark:text-[#121212] uppercase tracking-wider">Oferta de lancamento</div>
              <p className="text-[13px] font-medium text-slate-400 dark:text-[#969696] uppercase tracking-wider mb-4">Valor percebido</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-[48px] font-semibold tracking-tight text-slate-900 dark:text-white">R$1.997</span><span className="text-[14px] text-slate-400 dark:text-[#969696]">referencia</span></div>
              <p className="text-[14px] text-slate-500 dark:text-[#969696] leading-relaxed mb-6">Ancora comercial para sustentar a oferta atual sem parecer liquidacao aleatoria.</p>
              <PillButton href={dashboardBranding.checkoutUrl} variant="white">Ir para checkout <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <div className="mt-7 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                {['Uma mensagem comercial', 'Um checkout publico', 'Buyer kit guiado', 'Onboarding organizado', 'Escopo honesto', 'Sem mensalidade inicial'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-slate-500 dark:text-white/60"><Check className="w-4 h-4 text-[#0f766e] dark:text-[#22d3ee] flex-shrink-0" />{f}</div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={2} className="rounded-2xl border border-slate-200 bg-white p-7 dark:border-white/[0.08] dark:bg-[#121212]">
              <p className="text-[13px] font-medium text-slate-400 dark:text-[#969696] uppercase tracking-wider mb-4">Servicos extras</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-[48px] font-semibold tracking-tight text-slate-900 dark:text-white">Sob consulta</span></div>
              <p className="text-[14px] text-slate-500 dark:text-[#969696] leading-relaxed mb-6">Entram depois da compra quando houver necessidade real e escopo fechado.</p>
              <PillButton href="/contato" variant="dark">Falar com vendas <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <div className="mt-7 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                {['Deploy assistido', 'Rebranding guiado', 'Adaptacao por nicho', 'Customizacao sob escopo', 'Apoio tecnico extra', 'Operacao adicional'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-slate-500 dark:text-white/60"><Check className="w-4 h-4 text-[#0f766e] dark:text-[#22d3ee] flex-shrink-0" />{f}</div>
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
              { q: 'O que e a WhiLab?', a: 'Uma licenca white-label de base SaaS com dashboard, auth, Supabase, IA assistida e documentacao para rebrand.' },
              { q: 'O que eu recebo na compra?', a: 'Base white-label, autenticacao, dashboard inicial, estrutura para Supabase, docs de setup, deploy e rebranding.' },
              { q: 'Eu recebo tudo imediatamente apos pagar?', a: 'Nao. A compra libera o fluxo de onboarding para organizarmos a entrega do pacote e do checklist de ativacao.' },
              { q: 'Posso trocar nome, logo e dominio?', a: 'Sim. A licenca foi pensada para rebrand, desde que o comprador configure a propria estrutura.' },
              { q: 'Serve para qualquer nicho?', a: 'A base e flexivel, mas toda operacao white-label exige ajuste de marca, copy e configuracao.' },
              { q: 'O deploy ja vem pronto?', a: 'Nao. O comprador recebe base, documentacao e orientacao. Suporte adicional pode ser contratado.' },
            ].map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </Section>

        {/* CTA FINAL */}
        <Section className="py-32">
          <motion.div variants={fadeUp} custom={0} className="text-center">
            <p className="text-[13px] text-[#0f766e] dark:text-[#22d3ee] font-medium mb-4">Oferta de lancamento</p>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white">Compre a licenca.<br />Troque a <span className="text-[#0f766e] dark:text-[#22d3ee]">marca.</span></h2>
            <p className="mt-5 text-[16px] text-slate-500 dark:text-[#969696] max-w-[480px] mx-auto">Saia do zero com uma base SaaS white-label mais pronta para operacao, onboarding e ativacao.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <PillButton href={dashboardBranding.checkoutUrl} variant="white">Ir para checkout <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
              <PillButton href="/demo" variant="outline">Ver demonstracao <ArrowUpRight className="w-3.5 h-3.5" /></PillButton>
            </div>
          </motion.div>
        </Section>

        {/* FOOTER */}
        <footer className="border-t border-slate-100 dark:border-white/[0.06]">
          <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-14">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10">
              <div className="max-w-[280px]">
                <div className="mb-3">
                  <OptimizedLogo
                    href="/"
                    size={30}
                    showText
                    gapClassName="gap-2.5"
                    textClassName="text-[18px] tracking-tight"
                  />
                </div>
                <p className="text-[13px] text-slate-500 dark:text-[#969696] leading-relaxed">Base SaaS white-label com auth, dashboard, IA assistida e documentacao pronta para rebrand, setup e deploy.</p>
              </div>
              <div className="flex gap-12 sm:gap-16">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-[#969696] mb-4">Plataforma</p>
                  <div className="space-y-2.5">
                    {[{ l: 'Solucoes', h: '/solucoes' }, { l: 'Recursos', h: '/recursos' }, { l: 'Precos', h: '/precos' }, { l: 'Demo', h: '/demo' }, { l: 'Onboarding', h: '/onboarding' }].map((x) => (
                      <Link key={x.h} href={x.h} className="block text-[13px] text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white transition-colors">{x.l}</Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-[#969696] mb-4">Empresa</p>
                  <div className="space-y-2.5">
                    {[{ l: 'Sobre', h: '/sobre' }, { l: 'Blog', h: '/blog' }, { l: 'Contato', h: '/contato' }, { l: 'Parceiros', h: '/parceiros' }, { l: 'Carreiras', h: '/carreiras' }].map((x) => (
                      <Link key={x.h} href={x.h} className="block text-[13px] text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white transition-colors">{x.l}</Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-[#969696] mb-4">Legal</p>
                  <div className="space-y-2.5">
                    {[{ l: 'Termos', h: '/termos' }, { l: 'Privacidade', h: '/privacidade' }, { l: 'Cookies', h: '/cookies' }, { l: 'Seguranca', h: '/seguranca' }, { l: 'Licencas', h: '/licencas' }].map((x) => (
                      <Link key={x.h} href={x.h} className="block text-[13px] text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white transition-colors">{x.l}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-14 pt-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-[12px] text-slate-400 dark:text-white/20">&copy; 2026 WhiLab. Todos os direitos reservados.</p>
              <p className="text-[12px] text-slate-400 dark:text-white/20">Base white-label premium com <span className="text-slate-600 dark:text-white/40">IA</span></p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
