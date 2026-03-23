import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Briefcase,
  ChevronDown,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  Mail,
  Menu,
  Moon,
  Newspaper,
  Shield,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import OptimizedLogo from '../OptimizedLogo';
import { useTheme } from '../../context/ThemeContext';

/* ================================================================
   MEGA MENU — WhiLab Navigation
   Componente reutilizavel para todas as paginas publicas
   ================================================================ */

type NavLink = {
  label: string;
  href: string;
  desc: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  links: NavLink[];
};

type NavGroup = {
  id: string;
  label: string;
  sections: NavSection[];
};

const navGroups: NavGroup[] = [
  {
    id: 'plataforma',
    label: 'Plataforma',
    sections: [
      {
        title: 'Produto',
        links: [
          { label: 'Solucoes', href: '/solucoes', desc: 'Modulos e estrutura base do produto.', icon: Sparkles },
          { label: 'Recursos', href: '/recursos', desc: 'Setup, docs e camada operacional.', icon: Database },
          { label: 'Demo', href: '/demo', desc: 'Demonstracao visual e fluxo do produto.', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Comercial',
        links: [
          { label: 'Precos', href: '/precos', desc: 'Planos e escada de valor.', icon: TrendingUp },
          { label: 'Licencas', href: '/licencas', desc: 'Estrutura de licenciamento.', icon: FileText },
          { label: 'Entrar no painel', href: '/auth/login', desc: 'Acesso ao ambiente autenticado.', icon: BarChart2 },
        ],
      },
    ],
  },
  {
    id: 'empresa',
    label: 'Empresa',
    sections: [
      {
        title: 'Marca',
        links: [
          { label: 'Sobre', href: '/sobre', desc: 'Tese, direcao e historia.', icon: Globe },
          { label: 'Clientes', href: '/clientes', desc: 'Perfis que operam melhor.', icon: Users },
        ],
      },
      {
        title: 'Ecossistema',
        links: [
          { label: 'Parceiros', href: '/parceiros', desc: 'Canal de revenda e implantacao.', icon: Target },
          { label: 'Blog', href: '/blog', desc: 'Conteudo e autoridade.', icon: BookOpen },
          { label: 'Comunidade', href: '/comunidade', desc: 'Rede de usuarios e operadores.', icon: Users },
        ],
      },
    ],
  },
  {
    id: 'mais',
    label: 'Mais',
    sections: [
      {
        title: 'Institucional',
        links: [
          { label: 'Carreiras', href: '/carreiras', desc: 'Cultura e oportunidades.', icon: Briefcase },
          { label: 'Imprensa', href: '/imprensa', desc: 'Marca e brand assets.', icon: Newspaper },
          { label: 'Contato', href: '/contato', desc: 'Canal comercial direto.', icon: Mail },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Termos', href: '/termos', desc: 'Condicoes de uso.', icon: FileText },
          { label: 'Privacidade', href: '/privacidade', desc: 'Politica de dados.', icon: Shield },
          { label: 'Seguranca', href: '/seguranca', desc: 'Baseline tecnico.', icon: Shield },
        ],
      },
    ],
  },
];

const ease = [0.25, 0.46, 0.45, 0.94] as const;

/* ================================================================
   DESKTOP MEGA MENU
   ================================================================ */

function DesktopMegaMenu({ scrolled }: { scrolled: boolean }) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  const openGroup = navGroups.find((g) => g.id === openGroupId) ?? null;

  const handleEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenGroupId(id);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenGroupId(null), 150);
  };

  const handlePanelEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="hidden lg:block">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200 dark:bg-[#0a0a0a]/80 dark:border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 md:px-10 py-4">
          {/* Logo */}
          <OptimizedLogo
            href="/"
            size={40}
            showText
            gapClassName="gap-3"
            textClassName="text-[18px] md:text-[20px] tracking-tight"
          />

          {/* Nav groups */}
          <div className="flex items-center gap-1">
            {navGroups.map((group) => {
              const isActive = openGroupId === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onMouseEnter={() => handleEnter(group.id)}
                  onMouseLeave={handleLeave}
                  className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.1] dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
                  }`}
                >
                  {group.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                </button>
              );
            })}

            {/* Direct links */}
            <Link href="/precos" className="px-4 py-2 text-[14px] font-medium text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white transition-colors rounded-full">
              Precos
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all dark:border-white/[0.1] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.05]"
              aria-label={resolvedTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/auth/login"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-[14px] font-medium text-slate-500 hover:text-slate-900 dark:text-white/70 dark:hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee] transition-all duration-300"
            >
              Falar com vendas
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dropdown panel */}
        <AnimatePresence>
          {openGroup && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={handlePanelEnter}
              onMouseLeave={handleLeave}
              className="border-t border-slate-200 bg-white/95 backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0a0a0a]/95"
            >
              <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-6">
                <div className="grid grid-cols-2 gap-6">
                  {openGroup.sections.map((section) => (
                    <div key={section.title}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696] mb-3">
                        {section.title}
                      </p>
                      <div className="space-y-1">
                        {section.links.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setOpenGroupId(null)}
                              className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-all hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                            >
                              <div className="rounded-lg bg-[#0f766e]/10 p-2 text-[#0f766e] group-hover:bg-[#0f766e]/15 dark:bg-white/[0.05] dark:text-[#22d3ee] dark:group-hover:bg-[#22d3ee]/10 transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[14px] font-medium text-slate-900 group-hover:text-[#0f766e] dark:text-white dark:group-hover:text-[#22d3ee] transition-colors">
                                  {link.label}
                                </p>
                                <p className="text-[12px] text-slate-400 dark:text-[#969696] mt-0.5">{link.desc}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}

/* ================================================================
   MOBILE MENU
   ================================================================ */

function MobileMenu({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="lg:hidden">
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled || open
            ? 'bg-white/90 backdrop-blur-2xl border-b border-slate-200 dark:bg-[#0a0a0a]/90 dark:border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <OptimizedLogo
            href="/"
            size={34}
            showText
            gapClassName="gap-2.5"
            textClassName="text-[17px] tracking-tight"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/60"
              aria-label={resolvedTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/98 backdrop-blur-xl pt-[72px] overflow-y-auto dark:bg-[#0a0a0a]/98"
          >
            <div className="px-5 py-6 space-y-2">
              {navGroups.map((group) => (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-white/[0.05] transition-colors"
                  >
                    {group.label}
                    <ChevronDown className={`w-4 h-4 text-[#969696] transition-transform ${expandedGroup === group.id ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {expandedGroup === group.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 pb-2 space-y-1">
                          {group.sections.map((section) => (
                            <div key={section.title} className="pt-2">
                              <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#969696] mb-2">
                                {section.title}
                              </p>
                              {section.links.map((link) => {
                                const Icon = link.icon;
                                return (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                                  >
                                    <Icon className="w-4 h-4 text-[#0f766e] dark:text-[#22d3ee]" />
                                    <div>
                                      <p className="text-[14px] font-medium text-slate-900 dark:text-white">{link.label}</p>
                                      <p className="text-[12px] text-slate-400 dark:text-[#969696]">{link.desc}</p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Direct links */}
              <Link
                href="/precos"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-white/[0.05] transition-colors"
              >
                Precos
              </Link>

              {/* CTA buttons */}
              <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-white/[0.06]">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full border border-slate-300 py-3 text-center text-[14px] font-medium text-slate-700 hover:bg-slate-50 dark:border-white/[0.15] dark:text-white dark:hover:bg-white/[0.05] transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/contato"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full bg-slate-900 py-3 text-center text-[14px] font-medium text-white hover:bg-[#0f766e] dark:bg-white dark:text-[#121212] dark:hover:bg-[#22d3ee] transition-colors"
                >
                  Falar com vendas
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   EXPORT — MegaMenu principal
   ================================================================ */

export default function MegaMenu() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <>
      <DesktopMegaMenu scrolled={scrolled} />
      <MobileMenu scrolled={scrolled} />
    </>
  );
}
