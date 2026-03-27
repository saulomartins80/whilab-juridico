import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  BarChart3,
  Building,
  CreditCard,
  Download,
  Menu,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTheme } from '../context/ThemeContext';

interface MobileNavigationProps {
  onSidebarToggle: () => void;
  onAddItem?: () => void;
  onExportPDF?: () => void;
}

interface NavigationItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  type?: string;
  action?: () => void;
}

interface PageAction {
  type: 'add' | 'export';
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onSidebarToggle,
  onAddItem,
  onExportPDF,
}) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  const getCurrentPageActions = (): PageAction[] => {
    switch (router.pathname) {
      case '/crm':
        return [
          {
            type: 'add',
            icon: <Plus size={18} />,
            label: 'Novo contato',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            },
          },
        ];
      case '/processos':
        return [
          {
            type: 'add',
            icon: <Plus size={18} />,
            label: 'Novo processo',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            },
          },
        ];
      case '/peticoes':
        return [
          {
            type: 'add',
            icon: <Plus size={18} />,
            label: 'Nova peticao',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            },
          },
        ];
      case '/cobrancas':
        return [
          {
            type: 'add',
            icon: <Plus size={18} />,
            label: 'Nova cobranca',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            },
          },
          {
            type: 'export',
            icon: <Download size={18} />,
            label: 'Exportar',
            action: () => {
              onExportPDF?.();
              setIsActionMenuOpen(false);
            },
          },
        ];
      case '/agenda':
        return [
          {
            type: 'add',
            icon: <Plus size={18} />,
            label: 'Novo compromisso',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            },
          },
        ];
      default:
        return [
          {
            type: 'add',
            icon: <Plus size={18} />,
            label: 'Contato',
            action: () => {
              router.push('/crm?action=new-contact');
              setIsActionMenuOpen(false);
            },
          },
          {
            type: 'add',
            icon: <Building size={18} />,
            label: 'Processo',
            action: () => {
              router.push('/processos?action=new-case');
              setIsActionMenuOpen(false);
            },
          },
          {
            type: 'add',
            icon: <Sparkles size={18} />,
            label: 'Peticao',
            action: () => {
              router.push('/peticoes?action=new-draft');
              setIsActionMenuOpen(false);
            },
          },
        ];
    }
  };

  const handleCenterButtonClick = () => {
    const actions = getCurrentPageActions();

    if (actions.length === 1) {
      actions[0].action();
      return;
    }

    setIsActionMenuOpen((current) => !current);
  };

  useEffect(() => {
    setIsActionMenuOpen(false);
  }, [router.pathname]);

  const navigationItems: NavigationItem[] = [
    {
      path: '/dashboard',
      icon: <BarChart3 size={18} />,
      label: 'Painel',
    },
    {
      path: '',
      type: 'add-button',
      icon: <Plus size={20} />,
      label: '+',
      action: handleCenterButtonClick,
    },
    {
      path: '/processos',
      icon: <Building size={18} />,
      label: 'Processos',
    },
    {
      path: '/cobrancas',
      icon: <CreditCard size={18} />,
      label: 'Cobrancas',
    },
  ];

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden ${
          resolvedTheme === 'dark'
            ? 'border-t border-slate-800/60 bg-[#040b15]/94'
            : 'border-t border-slate-200/80 bg-white/92'
        } backdrop-blur-xl shadow-[0_-18px_40px_rgba(15,23,42,0.12)]`}
      >
        <div className="relative flex items-center justify-around px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSidebarToggle}
            className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 transition ${
              resolvedTheme === 'dark'
                ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Menu size={20} />
            <span className="mt-1 text-xs font-medium">Menu</span>
          </motion.button>

          {navigationItems.map((item, index) => {
            if (item.type === 'add-button') {
              return (
                <motion.button
                  key={`add-button-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.action}
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950"
                  aria-label="Acoes rapidas"
                >
                  <motion.div
                    animate={{ rotate: isActionMenuOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isActionMenuOpen ? <X size={20} /> : <Plus size={20} />}
                  </motion.div>
                  {getCurrentPageActions().length > 1 && !isActionMenuOpen && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white bg-teal-500"
                    />
                  )}
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 transition ${
                  isActive(item.path)
                    ? resolvedTheme === 'dark'
                      ? 'bg-white/[0.04] text-white'
                      : 'text-slate-950'
                    : resolvedTheme === 'dark'
                      ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {item.icon}
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {isActionMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm md:hidden"
            onClick={() => setIsActionMenuOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              className={`absolute bottom-20 left-1/2 w-[min(92vw,22rem)] -translate-x-1/2 rounded-3xl border p-4 shadow-2xl ${
                resolvedTheme === 'dark'
                  ? 'border-slate-800 bg-[#040b15]'
                  : 'border-slate-200 bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="app-shell-section-title">Acoes rapidas</div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Atalhos contextuais da tela atual
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-sm font-bold text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
                  AI
                </span>
              </div>

              <div className="space-y-2">
                {getCurrentPageActions().map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      resolvedTheme === 'dark'
                        ? 'border-slate-800 bg-slate-900/70 text-slate-100 hover:bg-slate-800'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      {action.icon}
                    </span>
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;
