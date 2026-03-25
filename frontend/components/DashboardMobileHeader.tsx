import React from 'react';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

import { useTheme } from '../context/ThemeContext';
import { dashboardBranding } from '../config/branding';
import OptimizedLogo from './OptimizedLogo';

interface DashboardMobileHeaderProps {
  title: string;
  onMenuToggle?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const DashboardMobileHeader: React.FC<DashboardMobileHeaderProps> = ({ title, onMenuToggle }) => {
  const { resolvedTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:hidden"
    >
      <div
        className={`app-shell-header relative overflow-hidden rounded-[1.85rem] px-4 py-3 ${
          resolvedTheme === 'dark'
            ? 'shadow-[0_22px_72px_rgba(0,0,0,0.52)]'
            : 'shadow-[0_18px_48px_rgba(15,23,42,0.12)]'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_34%)]" />

        <div className="relative flex items-center justify-between gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onMenuToggle}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
              resolvedTheme === 'dark'
                ? 'border-slate-800 bg-slate-950/80 text-slate-300 hover:text-white'
                : 'border-slate-200 bg-white/80 text-slate-600 hover:text-slate-950'
            }`}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </motion.button>

          <div className="min-w-0 flex-1 text-center">
            <div className="app-shell-section-title truncate">{dashboardBranding.brandName}</div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.28 }}
              className={`mt-1 truncate text-base font-semibold ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-slate-950'
              }`}
            >
              {title}
            </motion.h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-[0_18px_30px_rgba(15,23,42,0.08)] dark:border-white/6 dark:bg-white/[0.03] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <OptimizedLogo size={28} href="/dashboard" />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardMobileHeader;
