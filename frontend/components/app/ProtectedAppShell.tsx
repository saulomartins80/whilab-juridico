import type { ReactNode } from 'react';

import AuthInitializer from '../AuthInitializer';
import Layout from '../Layout';
import { AuthProvider } from '../../context/AuthContext';
import { BovinextProvider } from '../../context/BovinextContext';
import { NotificationProvider } from '../../context/NotificationContext';

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BovinextProvider>
        <NotificationProvider>
          <AuthInitializer>
            <Layout>{children}</Layout>
          </AuthInitializer>
        </NotificationProvider>
      </BovinextProvider>
    </AuthProvider>
  );
}

export default ProtectedAppShell;
