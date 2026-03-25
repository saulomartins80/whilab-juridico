import type { ReactNode } from 'react';

import AuthInitializer from '../AuthInitializer';
import Layout from '../Layout';
import { AuthProvider } from '../../context/AuthContext';
import { WhiLabProvider } from '../../context/WhiLabContext';
import { NotificationProvider } from '../../context/NotificationContext';

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WhiLabProvider>
        <NotificationProvider>
          <AuthInitializer>
            <Layout>{children}</Layout>
          </AuthInitializer>
        </NotificationProvider>
      </WhiLabProvider>
    </AuthProvider>
  );
}

export default ProtectedAppShell;
