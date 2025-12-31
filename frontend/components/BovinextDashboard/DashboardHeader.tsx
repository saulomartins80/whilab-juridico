import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  User,
  Sun,
  Menu,
  RefreshCw,
  Wifi,
  Calendar,
  Moon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTheme } from '../../context/ThemeContext';
  
interface DashboardHeaderProps {
  farmName: string;
  userName?: string;
  onMenuClick?: () => void;
  onRefresh?: () => void;
  isOnline?: boolean;
  location?: string;
}
  
export default function DashboardHeader({
  farmName = "Fazenda Boi Forte",
  userName = "João Silva",
  onMenuClick,
  onRefresh,
  isOnline = true,
  location = "Goiânia, GO"
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 backdrop-blur-xl ${resolvedTheme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'} border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left Section - Logo and Farm Name */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
  
            <div className="flex items-center space-x-3">
              {/* Logo Empresarial - Ícone de Boi/Fazenda */}
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  {/* Ícone de Cabeça de Boi Nelore */}
                  <svg
                    className="w-8 h-8 lg:w-9 lg:h-9 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C9.5 2 7.5 3 6 5C5.5 5.5 5 6.5 4.5 8C4 9.5 3.5 11 3 12C2.5 13 2.5 14 3 15C3.5 16 4.5 17 6 17.5C7 18 8 18 9 17.5C9.5 17.3 10 17 10.5 16.5C11 16 11.5 15.5 12 15.5C12.5 15.5 13 16 13.5 16.5C14 17 14.5 17.3 15 17.5C16 18 17 18 18 17.5C19.5 17 20.5 16 21 15C21.5 14 21.5 13 21 12C20.5 11 20 9.5 19.5 8C19 6.5 18.5 5.5 18 5C16.5 3 14.5 2 12 2Z"/>
                    <circle cx="8" cy="10" r="1.5" fill="white"/>
                    <circle cx="16" cy="10" r="1.5" fill="white"/>
                    <path d="M9 13C9 13 10.5 14.5 12 14.5C13.5 14.5 15 13 15 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} border-2 border-white dark:border-gray-900`} />
              </div>
  
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {farmName}
                </h1>
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span>{location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Wifi className="h-3 w-3" />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Center Section - Date (Desktop) */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
  
          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Refresh Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 lg:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw 
                className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </motion.button>
  
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 lg:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>
  
            {/* Notifications */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="relative p-2 lg:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>
  
            {/* User Profile */}
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrador
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
    );
  }
