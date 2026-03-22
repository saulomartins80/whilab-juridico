import React from 'react';
import Link from 'next/link';
import { ArrowRight, Github, Instagram, Linkedin, Twitter } from 'lucide-react';
import { dashboardBranding } from '../../config/branding';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { label: 'Recursos', href: '/recursos' },
      { label: 'Solucoes', href: '/solucoes' },
      { label: 'Precos', href: '/precos' },
      { label: 'Demo', href: '/dashboard' },
    ],
    empresa: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Clientes', href: '/clientes' },
      { label: 'Carreiras', href: '/carreiras' },
      { label: 'Contato', href: '/contato' },
    ],
    legal: [
      { label: 'Termos', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Cookies', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com' },
    { icon: Twitter, href: 'https://twitter.com' },
    { icon: Linkedin, href: 'https://linkedin.com' },
    { icon: Instagram, href: 'https://instagram.com' },
  ];

  return (
    <footer className="border-t border-slate-200/80 bg-white/72 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="app-shell-hero p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="app-shell-chip">Pecuaria premium</span>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">
                Uma plataforma comercial pronta para lancar operacoes pecuarias com mais clareza, controle e marca propria.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {dashboardBranding.brandName} combina operacao pecuaria, IA aplicada e base white-label para acelerar implantacao, revenda e expansao.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register" className="app-shell-button-primary">
                Comecar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
              >
                Falar com vendas
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="app-shell-badge">{dashboardBranding.badgeLabel}</span>
              <span className="text-2xl font-semibold tracking-[0.18em] text-slate-950 dark:text-white">
                {dashboardBranding.brandName}
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
              Plataforma pecuaria premium com base white-label, pronta para implantar, revender e adaptar por operacao.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-900/60 dark:hover:text-teal-400"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="app-shell-section-title">Produto</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="app-shell-section-title">Empresa</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="app-shell-section-title">Juridico</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200/80 pt-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>&copy; {currentYear} {dashboardBranding.brandName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
