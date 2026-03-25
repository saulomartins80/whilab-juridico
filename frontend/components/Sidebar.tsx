/* eslint-disable no-unused-vars */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowUpRight,
  Building,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe2,
  HelpCircle,
  List,
  Menu,
  Package,
  PieChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { dashboardBranding } from '../config/branding';
import OptimizedLogo from './OptimizedLogo';

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  initialCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  description: string;
  badge?: string;
}

interface MenuGroup {
  title: string;
  eyebrow: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'App de Encomendas',
    eyebrow: 'Ordering',
    items: [
      {
        path: '/encomendas',
        icon: PieChart,
        label: 'Resumo',
        description: 'Pedidos do dia, status e operacao comercial',
        badge: 'new',
      },
      {
        path: '/encomendas/clientes',
        icon: Users,
        label: 'Clientes',
        description: 'Base de clientes, contato e recorrencia',
      },
      {
        path: '/encomendas/catalogo',
        icon: Package,
        label: 'Catalogo',
        description: 'Produtos, preco e disponibilidade',
      },
      {
        path: '/encomendas/cobrancas',
        icon: CreditCard,
        label: 'Cobrancas',
        description: 'Pendencias, links de pagamento e repasse',
      },
    ],
  },
  {
    title: 'Painel central',
    eyebrow: 'Overview',
    items: [
      {
        path: '/dashboard',
        icon: PieChart,
        label: 'Dashboard',
        description: 'Leituras de performance, agenda e alertas',
      },
    ],
  },
  {
    title: 'Operacao',
    eyebrow: 'Execution',
    items: [
      {
        path: '/rebanho',
        icon: Users,
        label: 'Rebanho',
        description: 'Base ativa, categorias e rastreio',
        badge: 'core',
      },
      {
        path: '/manejo',
        icon: List,
        label: 'Manejo',
        description: 'Rotinas, protocolos e checklist diario',
      },
      {
        path: '/producao',
        icon: Building,
        label: 'Producao',
        description: 'Capacidade, eficiencia e ritmos de entrega',
      },
      {
        path: '/leite',
        icon: Activity,
        label: 'Leite',
        description: 'Volume, estabilidade e leitura de lote',
      },
    ],
  },
  {
    title: 'Receita',
    eyebrow: 'Revenue',
    items: [
      {
        path: '/vendas',
        icon: CreditCard,
        label: 'Vendas',
        description: 'Comercial, pipeline e fechamento',
      },
      {
        path: '/transacoes',
        icon: CreditCard,
        label: 'Transacoes',
        description: 'Fluxo de caixa, entradas e saidas',
      },
      {
        path: '/investimentos',
        icon: TrendingUp,
        label: 'Investimentos',
        description: 'Alocacao de capital e retorno',
      },
      {
        path: '/metas',
        icon: Target,
        label: 'Metas',
        description: 'Objetivos, progresso e ownership',
        badge: 'okrs',
      },
    ],
  },
  {
    title: 'Governanca',
    eyebrow: 'Account',
    items: [
      {
        path: '/configuracoes',
        icon: Settings,
        label: 'Configuracoes',
        description: 'Marca, parametros e controles',
      },
      {
        path: '/profile',
        icon: User,
        label: 'Perfil',
        description: 'Conta, papel de acesso e identidade',
      },
      {
        path: '/suporte',
        icon: HelpCircle,
        label: 'Suporte',
        description: 'Ajuda, onboarding e escalacao',
      },
    ],
  },
];

const quickLinks = [
  { href: '/encomendas', label: 'Abrir pedidos', detail: 'Leitura comercial do dia' },
  { href: '/encomendas/catalogo', label: 'Ajustar catalogo', detail: 'Produtos, preco e estoque' },
  { href: '/encomendas/cobrancas', label: 'Cobrar pendentes', detail: 'Links e follow-up rapido' },
];

const sidebarSignals = [
  { label: 'Deploy', value: 'Live' },
  { label: 'Mobile', value: 'Ready' },
  { label: 'Pagto', value: 'Link' },
];

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
  onToggle = () => {},
  isMobile = false,
  initialCollapsed = false,
  onCollapseChange = () => {},
}: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const isActive = (path: string) => router.pathname === path;

  useEffect(() => {
    if (!isMobile) {
      setCollapsed(initialCollapsed);
    }
  }, [initialCollapsed, isMobile]);

  useEffect(() => {
    onCollapseChange(collapsed);
  }, [collapsed, onCollapseChange]);

  useEffect(() => {
    if (!isMobile) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isMobile]);

  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    }
  }, [collapsed, isMobile]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`px-2 ${collapsed ? 'pt-2' : 'pt-3'}`}>
        <div
          className={`dashboard-surface-soft relative overflow-hidden ${collapsed ? 'p-3' : 'p-4'}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.16),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.2),transparent_36%)]" />
          <div className="relative">
            <div
              className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}
            >
              <div className="flex items-center gap-3">
                <OptimizedLogo
                  href="/dashboard"
                  size={collapsed ? 34 : 40}
                  showText={!collapsed}
                  gapClassName="gap-3"
                  textClassName="text-[18px] tracking-tight"
                />
              </div>

              {isMobile ? (
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
                  onClick={onClose}
                  aria-label="Fechar menu"
                  aria-expanded={isOpen}
                >
                  <Menu size={20} />
                </button>
              ) : (
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
                  onClick={() => {
                    setCollapsed(!collapsed);
                    onToggle();
                  }}
                  aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                  aria-expanded={!collapsed}
                >
                  {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
              )}
            </div>

            {!collapsed && (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="app-shell-chip border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    workspace live
                  </span>
                  <span className="app-shell-chip">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    pronto para venda
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {dashboardBranding.shellDescription}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="dashboard-surface-muted px-3 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      stack
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      Auth + IA + SaaS
                    </div>
                  </div>
                  <div className="dashboard-surface-muted px-3 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      release
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      Operacao publica
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {sidebarSignals.map((signal) => (
                    <div key={signal.label} className="dashboard-surface-muted px-3 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                        {signal.label}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                        {signal.value}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pt-5">
          <div className="app-shell-stat">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="app-shell-section-title">{dashboardBranding.workspaceLabel}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Camada executiva pronta para vender operacao de pedidos com clientes, catalogo,
                  cobranca e acompanhamento do dia.
                </p>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      <nav aria-label="Navegacao principal" className="flex-1 px-3 pb-4 pt-5">
        <div className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="mb-3 px-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                    {group.eyebrow}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                    {group.title}
                  </div>
                </div>
              )}

              <ul className="space-y-2">
                {group.items.map(({ path, icon: Icon, label, description, badge }) => {
                  const active = isActive(path);

                  return (
                    <li key={path}>
                      <Link
                        href={path}
                        className={`group relative block overflow-hidden rounded-[1.35rem] border transition ${
                          active
                            ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-500/14 via-transparent to-sky-500/14 text-slate-950 shadow-[0_24px_60px_rgba(15,118,110,0.18)] dark:border-emerald-500/20 dark:text-white'
                            : 'border-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900/70 dark:hover:text-white'
                        } ${collapsed ? 'px-3 py-3' : 'px-4 py-3.5'}`}
                        onClick={isMobile ? onClose : undefined}
                        aria-current={active ? 'page' : undefined}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active-indicator"
                            className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-emerald-500"
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                          />
                        )}

                        <div
                          className={`flex ${collapsed ? 'justify-center' : 'items-start gap-3'}`}
                        >
                          <div
                            className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${
                              active
                                ? 'border-emerald-400/30 bg-emerald-500/14 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/14 dark:text-emerald-300'
                                : 'border-slate-200/80 bg-white/80 text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400'
                            }`}
                          >
                            <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
                          </div>

                          {!collapsed && (
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold">{label}</span>
                                {badge && (
                                  <span className="rounded-full bg-slate-950/6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-white/8 dark:text-slate-400">
                                    {badge}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {description}
                              </p>
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="px-4 pb-4">
        {collapsed ? (
          <Link
            href="/configuracoes"
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
            onClick={isMobile ? onClose : undefined}
            aria-label="Abrir configuracoes"
          >
            <Settings className="h-5 w-5" />
          </Link>
        ) : (
          <div className="dashboard-surface-soft overflow-hidden p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="app-shell-section-title">Control tower</div>
                <h3 className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                  Escale o vertical sem desmontar a base
                </h3>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-slate-200/80 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/14 dark:text-emerald-300">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Foco do dia
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Manter pedidos, clientes e cobrancas com leitura clara no desktop e no
                    mobile, sem perder a estrutura white-label da plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="dashboard-secondary-button justify-between"
                  onClick={isMobile ? onClose : undefined}
                >
                  <span>
                    <span className="block text-sm font-semibold">{link.label}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                      {link.detail}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
                onClick={onClose}
                aria-hidden="true"
              />

              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22, ease: 'easeInOut' }}
                className="app-shell-sidebar fixed left-0 top-0 z-50 flex h-full w-[21rem] flex-col p-4 md:hidden"
                role="dialog"
                aria-modal="true"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}

      {!isMobile && (
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 96 : 336 }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 28,
            mass: 0.5,
          }}
          className="app-shell-sidebar fixed inset-y-0 left-0 z-50 hidden overflow-x-hidden md:flex"
          aria-label="Barra lateral"
        >
          <div className="h-full w-full overflow-y-auto px-3 py-4">{sidebarContent}</div>
        </motion.aside>
      )}
    </>
  );
}
