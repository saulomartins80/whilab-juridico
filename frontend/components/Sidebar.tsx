/* eslint-disable no-unused-vars */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  List,
  Menu,
  PieChart,
  Settings,
  Target,
  TrendingUp,
  User,
  Users,
  Building,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardBranding } from '../config/branding';

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
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

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

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const menuGroups: MenuGroup[] = [
    {
      title: 'Visão geral',
      items: [{ path: '/dashboard', icon: PieChart, label: 'Dashboard' }],
    },
    {
      title: 'Operação',
      items: [
        { path: '/rebanho', icon: Users, label: 'Rebanho' },
        { path: '/manejo', icon: List, label: 'Manejo' },
        { path: '/producao', icon: Building, label: 'Produção' },
        { path: '/leite', icon: Activity, label: 'Leite' },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { path: '/vendas', icon: CreditCard, label: 'Vendas' },
        { path: '/transacoes', icon: CreditCard, label: 'Transações' },
        { path: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
        { path: '/metas', icon: Target, label: 'Metas' },
      ],
    },
    {
      title: 'Conta',
      items: [
        { path: '/configuracoes', icon: Settings, label: 'Configurações' },
        { path: '/profile', icon: User, label: 'Perfil' },
        { path: '/suporte', icon: HelpCircle, label: 'Suporte' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`mb-6 flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="app-shell-badge">{dashboardBranding.badgeLabel}</span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 dark:text-white">
                {dashboardBranding.brandName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {dashboardBranding.shellSubtitle}
              </span>
            </span>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center justify-center">
            <span className="app-shell-badge">{dashboardBranding.badgeLabel}</span>
          </Link>
        )}

        {isMobile ? (
          <button
            className="rounded-xl border border-slate-200/80 bg-white/80 p-2 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
            onClick={onClose}
            aria-label="Fechar menu"
            aria-expanded={isOpen}
          >
            <Menu size={22} />
          </button>
        ) : (
          <button
            className="rounded-xl border border-slate-200/80 bg-white/80 p-2 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
            onClick={() => {
              setCollapsed(!collapsed);
              onToggle();
            }}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="mb-6 px-4">
          <div className="app-shell-stat">
            <div className="app-shell-section-title">{dashboardBranding.workspaceLabel}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {dashboardBranding.shellDescription}
            </p>
          </div>
        </div>
      )}

      <nav aria-label="Navegação principal" className="flex-1 px-2">
        <div className="space-y-5">
          {menuGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  {group.title}
                </div>
              )}
              <ul className="space-y-2">
                {group.items.map(({ path, icon: Icon, label }) => {
                  const active = isActive(path);

                  return (
                    <li key={path}>
                      <Link
                        href={path}
                        className={`flex items-center rounded-xl px-3 py-3 transition ${
                          active
                            ? 'bg-teal-500/12 text-teal-700 dark:bg-teal-400/12 dark:text-teal-300'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                        } ${collapsed ? 'justify-center' : ''}`}
                        onClick={isMobile ? onClose : undefined}
                        aria-current={active ? 'page' : undefined}
                      >
                        <div className={`relative ${collapsed ? '' : 'mr-3'}`}>
                          <Icon
                            size={20}
                            className={active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}
                            aria-hidden="true"
                            strokeWidth={2.25}
                          />
                          {active && !collapsed && (
                            <motion.span
                              layoutId="sidebar-active-indicator"
                              className="absolute -left-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-teal-600 dark:bg-teal-400"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                        {!collapsed && <span className="text-sm font-medium">{label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {!collapsed && (
        <div className="px-4 pb-4 pt-6">
          <div className="app-shell-hero p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="app-shell-section-title">{dashboardBranding.whiteLabelPrompt}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Ajuste nome, cores e narrativa sem desmontar o produto.
                </p>
              </div>
              <span className="app-shell-badge !h-10 !w-10">{dashboardBranding.badgeLabel}</span>
            </div>
          </div>
        </div>
      )}
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
                className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
                onClick={onClose}
                aria-hidden="true"
              />

              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22, ease: 'easeInOut' }}
                className="app-shell-sidebar fixed left-0 top-0 z-50 flex h-full w-72 flex-col p-5 md:hidden"
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
          animate={{ width: collapsed ? 80 : 296 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.5,
          }}
          className="app-shell-sidebar hidden flex-col fixed inset-y-0 left-0 z-50 overflow-x-hidden md:flex"
          aria-label="Barra lateral"
        >
          <div className="h-full overflow-y-auto p-3">{sidebarContent}</div>
        </motion.aside>
      )}
    </>
  );
}
