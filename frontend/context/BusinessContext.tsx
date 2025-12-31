'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Company {
  id: string;
  name: string;
  cnpj?: string;
  type?: string;
}

interface BusinessContextType {
  mode: 'personal' | 'business';
  setMode: (mode: 'personal' | 'business') => void;
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  isBusinessMode: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'personal' | 'business'>('personal');
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const isBusinessMode = mode === 'business';

  return (
    <BusinessContext.Provider
      value={{
        mode,
        setMode,
        currentCompany,
        setCurrentCompany,
        companies,
        setCompanies,
        isBusinessMode,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextType {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    // Retornar valores padrão se não estiver dentro do Provider
    return {
      mode: 'personal',
      setMode: () => {},
      currentCompany: null,
      setCurrentCompany: () => {},
      companies: [],
      setCompanies: () => {},
      isBusinessMode: false,
    };
  }
  return context;
}

export default BusinessContext;
