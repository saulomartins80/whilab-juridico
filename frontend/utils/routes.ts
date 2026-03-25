/**
 * Centralized route configuration for the application
 * This file defines which routes are public, protected, or auth-related
 */

// Routes that require authentication (financial features and user dashboard)
export const PROTECTED_ROUTES = [
  '/arquivos',
  '/dashboard',
  '/encomendas',
  '/rebanho',
  '/manejo',
  '/producao',
  '/vendas',
  '/leite',
  '/transacoes',
  '/investimentos',
  '/metas',
  '/milhas',
  '/cartoes',
  '/configuracoes',
  '/profile',
  '/relatorios',
  '/payment',
  '/ebook',
  '/sistema',
  '/test-toast',
];

// Authentication pages (login, register, etc.) - these get minimal layout
export const AUTH_PAGES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/complete-registration',
];

// Public pages (everything else) - marketing, legal, company info, blog, community, etc.
// These are automatically determined as any route NOT in PROTECTED_ROUTES or AUTH_PAGES
export const SAMPLE_PUBLIC_ROUTES = [
  '/',
  '/assinaturas',
  '/recursos',
  '/solucoes',
  '/precos',
  '/clientes',
  '/contato',
  '/sobre',
  '/termos',
  '/blog',
  '/comunidade',
  '/carreiras',
  '/imprensa',
  '/privacidade',
  '/cookies',
  '/seguranca',
  '/juridico',
  '/empresa',
  '/licencas',
  '/parceiros',
  '/demo',
  '/obrigado',
  '/onboarding',
  '/payment/sucesso',
  '/connect',
  '/test-toast',
  // Add any other public routes here
];

const isExplicitPublicRoute = (pathname: string): boolean => SAMPLE_PUBLIC_ROUTES.includes(pathname);

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  if (isExplicitPublicRoute(pathname)) return false;

  // Protect explicit routes and prefixes (for example /profile/123).
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Check if a route is an authentication page
 */
export const isAuthPage = (pathname: string): boolean => {
  return AUTH_PAGES.includes(pathname);
};

/**
 * Check if a route is public (doesn't require authentication)
 */
export const isPublicRoute = (pathname: string): boolean => {
  return !isProtectedRoute(pathname) && !isAuthPage(pathname);
};
