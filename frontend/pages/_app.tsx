import Head from 'next/head';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';

import AppLoadingFallback from '../components/app/AppLoadingFallback';
import PublicAppShell from '../components/app/PublicAppShell';
import { dashboardBranding } from '../config/branding';
import { ThemeProvider } from '../context/ThemeContext';
import { isAuthPage, isProtectedRoute } from '../utils/routes';

import '../styles/globals.css';
import '../styles/compatibility.css';
import '../styles/splide.css';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';

const AuthAppShell = dynamic(
  () => import('../components/app/AuthAppShell').then((module) => module.AuthAppShell),
  {
    loading: () => <AppLoadingFallback />,
    ssr: false,
  },
);

const ProtectedAppShell = dynamic(
  () => import('../components/app/ProtectedAppShell').then((module) => module.ProtectedAppShell),
  {
    loading: () => <AppLoadingFallback />,
    ssr: false,
  },
);

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const routeMode = isProtectedRoute(router.pathname)
    ? 'protected'
    : isAuthPage(router.pathname)
      ? 'auth'
      : 'public';

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register, { once: true });

    return () => {
      window.removeEventListener('load', register);
    };
  }, []);

  const page = <Component {...pageProps} />;

  return (
    <ThemeProvider>
      <Head>
        <title>{`${dashboardBranding.brandName} - Plataforma juridica`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#020617" />
        <meta
          name="description"
          content="Plataforma juridica com CRM, processos, documentos, cobrancas e IA aplicada."
        />
        <meta name="application-name" content={dashboardBranding.brandName} />
        <meta name="apple-mobile-web-app-title" content={dashboardBranding.brandName} />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {routeMode === 'protected' ? (
        <ProtectedAppShell>{page}</ProtectedAppShell>
      ) : routeMode === 'auth' ? (
        <AuthAppShell>{page}</AuthAppShell>
      ) : (
        <PublicAppShell>{page}</PublicAppShell>
      )}
    </ThemeProvider>
  );
}
