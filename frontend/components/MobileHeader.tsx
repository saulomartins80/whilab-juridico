import React from 'react';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

import { useTheme } from '../context/ThemeContext';
import { dashboardBranding } from '../config/branding';

// Protected mobile header for the authenticated dashboard shell.
interface MobileHeaderProps {
  title: string;
  onMenuToggle?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, onMenuToggle }) => {
  const { resolvedTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`app-shell-header fixed left-0 right-0 top-0 z-50 md:hidden ${
        resolvedTheme === 'dark'
          ? 'shadow-[0_12px_40px_rgba(2,6,23,0.35)]'
          : 'shadow-[0_12px_40px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onMenuToggle}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
            resolvedTheme === 'dark'
              ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white'
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
            transition={{ delay: 0.1, duration: 0.3 }}
            className={`mt-1 truncate text-base font-semibold ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-slate-950'
            }`}
          >
            {title}
          </motion.h1>
        </div>

        <div className="flex h-10 w-10 items-center justify-center">
          <span className="app-shell-badge !h-10 !w-10">{dashboardBranding.badgeLabel}</span>
        </div>
      </div>
    </motion.header>
  );
};

export default MobileHeader;
