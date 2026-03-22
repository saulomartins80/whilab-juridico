import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import MegaMenu from './MegaMenu';
import { dashboardBranding } from '../../config/branding';

type Stat = {
  label: string;
  value: string;
};

type CTA = {
  label: string;
  href: string;
};

type Bullet = {
  title: string;
  description: string;
  value?: string;
};

type Faq = {
  question: string;
  answer: string;
};

/* ================================================================
   MARKETING PAGE FRAME — Unificado com home (#121212 dark theme)
   ================================================================ */

export function MarketingPageFrame({
  metaTitle,
  metaDescription,
  eyebrow,
  title,
  description,
  stats,
  primaryCta,
  secondaryCta,
  children,
}: {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  stats?: Stat[];
  primaryCta?: CTA;
  secondaryCta?: CTA;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#121212] text-white antialiased" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Background effects */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#22d3ee]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />

      <MegaMenu />

      {/* Spacer for fixed navbar */}
      <div className="h-[72px]" />

      <main className="relative z-10 mx-auto w-full max-w-[1200px] px-5 md:px-10 pb-20 pt-10">
        {/* Hero section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-[#22d3ee]/[0.08] blur-[100px]" />
          <div className="pointer-events-none absolute -right-12 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/[0.06] blur-[100px]" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[#969696]">
                {eyebrow}
              </div>
              <h1 className="mt-5 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[#969696]">{description}</p>

              {(primaryCta || secondaryCta) && (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {primaryCta && (
                    <Link
                      href={primaryCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[#121212] transition-all duration-300 hover:bg-[#22d3ee]"
                    >
                      {primaryCta.label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {secondaryCta && (
                    <Link
                      href={secondaryCta.href}
                      className="inline-flex items-center justify-center rounded-full border border-white/[0.15] px-6 py-3 text-[14px] font-medium text-white/70 transition-all hover:text-white hover:bg-white/[0.05]"
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {stats && stats.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#969696]">{stat.label}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mt-10 space-y-10">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#121212]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#969696]">&copy; {new Date().getFullYear()} {dashboardBranding.brandName}. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-[13px] text-[#969696]">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/seguranca" className="hover:text-white transition-colors">Seguranca</Link>
            <Link href="/contato" className="hover:text-white transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================
   MARKETING SECTION — Card container
   ================================================================ */

export function MarketingSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[#969696]">
          {eyebrow}
        </div>
        <h2 className="mt-4 text-[clamp(1.5rem,3vw,2.2rem)] font-semibold tracking-[-0.02em] text-white">{title}</h2>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-[#969696]">{description}</p>}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ================================================================
   MARKETING CARD GRID
   ================================================================ */

export function MarketingCardGrid({ items }: { items: Bullet[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-white/[0.15] hover:bg-white/[0.05]">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#969696]">{item.title}</div>
          {item.value && <div className="mt-3 text-lg font-semibold text-[#22d3ee]">{item.value}</div>}
          <p className="mt-3 text-[14px] leading-relaxed text-[#969696]">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

/* ================================================================
   MARKETING CHECKLIST
   ================================================================ */

export function MarketingChecklist({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-white/[0.15]">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#22d3ee]" />
          <span className="text-[14px] leading-relaxed text-[#969696]">{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   MARKETING FAQ GRID
   ================================================================ */

export function MarketingFaqGrid({ items }: { items: Faq[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <article key={item.question} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-white/[0.15]">
          <h3 className="text-[16px] font-semibold text-white">{item.question}</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[#969696]">{item.answer}</p>
        </article>
      ))}
    </div>
  );
}
