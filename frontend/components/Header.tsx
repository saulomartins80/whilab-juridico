'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { dashboardBranding } from '../config/branding';

// Public marketing header. The authenticated dashboard uses ProtectedHeader.
interface HeaderProps {
  isSidebarOpen?: boolean;
  toggleMobileSidebar?: () => void;
}

export default function Header({ toggleMobileSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { label: 'Plataforma', href: '/recursos' },
    { label: 'Soluções', href: '/solucoes' },
    { label: 'Clientes', href: '/clientes' },
    { label: 'Preços', href: '/precos' },
    { label: 'Contato', href: '/contato' },
  ];

  const isActive = (href: string) => router.pathname === href;
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="app-shell-header fixed top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="app-shell-badge">{dashboardBranding.badgeLabel}</span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 dark:text-white">
              {dashboardBranding.brandName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {dashboardBranding.shellSubtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`app-shell-nav-link ${isActive(item.href) ? 'app-shell-nav-link-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-xl border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 md:inline-flex"
          >
            Ver demo
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            onClick={() => {
              if (toggleMobileSidebar) {
                toggleMobileSidebar();
                return;
              }
              setIsMenuOpen((current) => !current);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && !toggleMobileSidebar && (
        <div className="border-t border-slate-200/80 bg-white/96 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/96 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              onClick={closeMenu}
            >
              Ver demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
