import { useEffect, useMemo, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

type InstallOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };
type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as NavigatorWithStandalone).standalone)
  );
}

function isIosDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function EncomendasInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const legacyMediaQuery = mediaQuery as LegacyMediaQueryList;

    const syncInstalledState = () => {
      setInstalled(isStandaloneMode());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      syncInstalledState();
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    syncInstalledState();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncInstalledState);
    } else if (typeof legacyMediaQuery.addListener === 'function') {
      legacyMediaQuery.addListener(syncInstalledState);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncInstalledState);
      } else if (typeof legacyMediaQuery.removeListener === 'function') {
        legacyMediaQuery.removeListener(syncInstalledState);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showIosInstructions = useMemo(
    () => isIosDevice() && !installed && !installEvent,
    [installEvent, installed],
  );

  if (installed || (!installEvent && !showIosInstructions)) {
    return null;
  }

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    setInstalling(true);

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;

      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }

      setInstallEvent(null);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <section className="dashboard-surface-soft overflow-hidden border border-emerald-500/20">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
            <Smartphone className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Leve o App de Encomendas para a tela inicial
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              O modulo ja pode rodar como app instalavel no Android e no iPhone sem uma base mobile separada.
            </p>
            {showIosInstructions ? (
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                iPhone: Safari &gt; Compartilhar &gt; Adicionar a Tela Inicial
              </p>
            ) : (
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                Instalacao pronta para pedidos, clientes e cobrancas
              </p>
            )}
          </div>
        </div>

        {installEvent ? (
          <button
            type="button"
            onClick={() => void handleInstall()}
            disabled={installing}
            className="app-shell-button-primary shrink-0"
          >
            <Download className="h-4 w-4" />
            {installing ? 'Preparando...' : 'Instalar app'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
