import { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';

const LazyGoogleAnalytics = lazy(() => import('./GoogleAnalytics'));

import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { isProtectedRoute, isAuthPage } from '../utils/routes';

interface MobileOptimizedAppProps extends AppProps {
  hasInteracted: boolean;
}

const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const CriticalStyles = () => (
  <style jsx global>{`
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-title {
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 700;
      color: white;
      text-align: center;
      margin-bottom: 1rem;
    }
    .hero-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.5rem);
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }
  `}</style>
);

export default function MobileOptimizedApp({ Component, pageProps, hasInteracted }: MobileOptimizedAppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [shouldLoadHeavyComponents, setShouldLoadHeavyComponents] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (hasInteracted || isProtectedRoute(router.pathname)) {
      setShouldLoadHeavyComponents(true);
    }
  }, [hasInteracted, router.pathname]);

  if (!isClient) {
    return (
      <>
        <CriticalStyles />
        <div className="hero-section">
          <div>
            <h1 className="hero-title">WhiLab</h1>
            <p className="hero-subtitle">Operacao pecuaria com IA</p>
          </div>
        </div>
      </>
    );
  }

  if (isAuthPage(router.pathname)) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    );
  }

  if (isProtectedRoute(router.pathname)) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Component {...pageProps} />
          </Suspense>
          {shouldLoadHeavyComponents && (
            <Suspense fallback={null}>
              <LazyGoogleAnalytics />
            </Suspense>
          )}
        </AuthProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <CriticalStyles />
        <Component {...pageProps} />
        {shouldLoadHeavyComponents && (
          <Suspense fallback={null}>
            <LazyGoogleAnalytics />
          </Suspense>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}
