import type { ReactNode } from 'react';

import { AuthProvider } from '../../context/AuthContext';

export function AuthAppShell({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default AuthAppShell;
