/* eslint-disable no-unused-vars */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import DashboardShellHeader from './DashboardShellHeader';
import DashboardMobileHeader from './DashboardMobileHeader';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import OptimizedChatbot from './OptimizedChatbot';
import { ProtectedRoute } from './ProtectedRoute';
import { dashboardBranding } from '../config/branding';

const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (..._args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(..._args), wait);
  };
};

const MD_BREAKPOINT = 768;

interface LayoutContextType {
  registerAddItemCallback: (_callback: () => void) => void;
  unregisterAddItemCallback: () => void;
  registerExportPDFCallback: (_callback: () => void) => void;
  unregisterExportPDFCallback: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayoutContext must be used within Layout');
  }

  return context;
};

function getPageTitle(pathname: string): string {
  if (pathname === '/crm') return 'CRM juridico';
  if (pathname === '/processos') return 'Processos';
  if (pathname === '/peticoes') return 'Peticoes e IA';
  if (pathname === '/publicacoes') return 'Publicacoes';
  if (pathname === '/cobrancas') return 'Cobrancas';
  if (pathname === '/agenda') return 'Agenda';

    switch (pathname) {
      case '/dashboard':
        return 'Painel juridico';
    case '/rebanho':
      return 'Rebanho';
    case '/manejo':
      return 'Manejo';
    case '/producao':
      return 'Produção';
    case '/leite':
      return 'Leite';
    case '/vendas':
      return 'Vendas';
    case '/transacoes':
      return 'Transações';
    case '/investimentos':
      return 'Investimentos';
    case '/metas':
      return 'Metas';
    case '/milhas':
      return 'Milhas';
    case '/profile':
      return 'Perfil';
    case '/configuracoes':
      return 'Configurações';
    default:
      return dashboardBranding.brandName;
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT) {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }

    return false;
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(false);
  const [addItemCallback, setAddItemCallback] = useState<(() => void) | null>(null);
  const [exportPDFCallback, setExportPDFCallback] = useState<(() => void) | null>(null);

  const handleAddItem = (): void => {
    if (addItemCallback) {
      addItemCallback();
      return;
    }

    const currentPath = router.pathname;

    if (currentPath === '/crm') {
      router.push('/crm?action=new-contact');
      return;
    }

    if (currentPath === '/processos') {
      router.push('/processos?action=new-case');
      return;
    }

    if (currentPath === '/peticoes') {
      router.push('/peticoes?action=new-draft');
      return;
    }

    if (currentPath === '/publicacoes') {
      router.push('/publicacoes?action=new-monitoring');
      return;
    }

    if (currentPath === '/cobrancas') {
      router.push('/cobrancas?action=new-charge');
      return;
    }

    if (currentPath === '/agenda') {
      router.push('/agenda?action=new-event');
      return;
    }

    switch (currentPath) {
      case '/transacoes':
        router.push('/transacoes?action=new');
        break;
      case '/investimentos':
        router.push('/investimentos?action=new');
        break;
      case '/metas':
        router.push('/metas?action=new');
        break;
      case '/milhas':
        router.push('/milhas?action=new');
        break;
      default:
        if (isMobileView) {
          setIsMobileSidebarOpen((current) => !current);
        }
        break;
    }
  };

  const handleExportPDF = (): void => {
    exportPDFCallback?.();
  };

  const registerAddItemCallback = useCallback((callback: () => void): void => {
    setAddItemCallback(() => callback);
  }, []);

  const unregisterAddItemCallback = useCallback(() => {
    setAddItemCallback(null);
  }, []);

  const registerExportPDFCallback = useCallback((callback: () => void): void => {
    setExportPDFCallback(() => callback);
  }, []);

  const unregisterExportPDFCallback = useCallback(() => {
    setExportPDFCallback(null);
  }, []);

  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobileView(window.innerWidth < MD_BREAKPOINT);
    };

    checkMobile();

    const debouncedCheckMobile = debounce(checkMobile, 100);
    window.addEventListener('resize', debouncedCheckMobile);

    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
    };
  }, []);

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = (): void => {
      if (!ticking && isMobileView) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > 100 && currentScrollY > lastScrollY) {
            setShowMobileHeader(true);
          } else if (currentScrollY < lastScrollY - 10 || currentScrollY < 50) {
            setShowMobileHeader(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    if (isMobileView) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      setShowMobileHeader(false);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileView]);

  useEffect(() => {
    if (!isMobileView && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobileView, isMobileSidebarOpen]);

  useEffect(() => {
    setAddItemCallback(null);
    setExportPDFCallback(null);
  }, [router.pathname]);

  const toggleMobileSidebar = useCallback((): void => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const toggleDesktopSidebarCollapse = useCallback((): void => {
    setIsDesktopSidebarCollapsed((prev) => {
      const next = !prev;

      if (typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT) {
        localStorage.setItem('sidebarCollapsed', String(next));
      }

      return next;
    });
  }, []);

  const toggleChat = useCallback((): void => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const layoutContext: LayoutContextType = {
    registerAddItemCallback,
    unregisterAddItemCallback,
    registerExportPDFCallback,
    unregisterExportPDFCallback,
  };

  return (
    <LayoutContext.Provider value={layoutContext}>
      <ProtectedRoute>
        <div className="dashboard-theme-scope app-shell-page relative flex min-h-screen text-slate-900 dark:text-slate-100">
          {!isMobileView && (
            <Sidebar
              isMobile={false}
              initialCollapsed={isDesktopSidebarCollapsed}
              onToggle={toggleDesktopSidebarCollapse}
              isOpen={true}
              onClose={(): void => {}}
            />
          )}

          {isMobileView && (
            <Sidebar isOpen={isMobileSidebarOpen} onClose={toggleMobileSidebar} isMobile={true} />
          )}

          <div
            className={`relative flex min-h-screen flex-1 flex-col transition-[margin] duration-300 ease-in-out ${
              !isMobileView && isDesktopSidebarCollapsed ? 'md:ml-24' : 'md:ml-[21rem]'
            }`}
          >
            {!isMobileView && (
              <div className="sticky top-0 z-40 px-4 pb-2 pt-4 md:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1600px]">
                  <DashboardShellHeader title={getPageTitle(router.pathname)} />
                </div>
              </div>
            )}

            {isMobileView && showMobileHeader && (
              <DashboardMobileHeader
                title={getPageTitle(router.pathname)}
                onMenuToggle={toggleMobileSidebar}
                showBackButton={false}
              />
            )}

            <main
              className={`flex-1 ${
                isMobileView ? (showMobileHeader ? 'pb-24 pt-20' : 'pb-24 pt-6') : 'pb-10 pt-2'
              } px-4 md:px-6 lg:px-8`}
            >
              <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">{children}</div>
            </main>
          </div>

          {isMobileView && (
            <MobileNavigation
              onSidebarToggle={toggleMobileSidebar}
              onAddItem={handleAddItem}
              onExportPDF={handleExportPDF}
            />
          )}

          <OptimizedChatbot isOpen={isChatOpen} onToggle={toggleChat} />
        </div>
      </ProtectedRoute>
    </LayoutContext.Provider>
  );
}
