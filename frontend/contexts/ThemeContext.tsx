import type { ReactNode } from 'react';

import { ThemeProvider as UnifiedThemeProvider, useTheme as useUnifiedTheme } from '../context/ThemeContext';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Delegamos ao ThemeProvider unificado para garantir uma única instância do contexto em toda a app
  return <UnifiedThemeProvider>{children}</UnifiedThemeProvider>;
}

export function useTheme() {
  // Utiliza o hook unificado para ler do mesmo provider
  return useUnifiedTheme();
}