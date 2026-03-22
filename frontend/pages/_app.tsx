import Head from 'next/head';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
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

  const page = <Component {...pageProps} />;

  return (
    <ThemeProvider>
      <Head>
        <title>{`${dashboardBranding.brandName} - Plataforma white-label`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
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
