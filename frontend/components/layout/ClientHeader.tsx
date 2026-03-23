'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Sun, Moon } from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import OptimizedLogo from '../OptimizedLogo';

export function ClientHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Recursos', path: '/recursos' },
    { name: 'Solucoes', path: '/solucoes' },
    { name: 'Precos', path: '/precos' },
    { name: 'Clientes', path: '/clientes' },
    { name: 'Contato', path: '/contato' },
  ];

  const currentPath = router.pathname;
  const filteredMenuItems = menuItems.filter((item) => item.path !== currentPath);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <OptimizedLogo
            href="/"
            size={40}
            showText
            gapClassName="gap-3"
            textClassName="text-[18px] md:text-[21px] tracking-tight"
          />

          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm uppercase tracking-wider"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3 md:space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                resolvedTheme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
              aria-label={resolvedTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              href="/auth/login"
              className="px-3 md:px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              Comecar agora
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-3">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm uppercase tracking-wider py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                  resolvedTheme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
                aria-label={resolvedTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5 mr-2" />
                    Modo claro
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 mr-2" />
                    Modo escuro
                  </>
                )}
              </button>

              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comecar agora
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
