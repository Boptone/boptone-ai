import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, getDefaultCurrency } from '@shared/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boptone_currency');
      if (saved) {
        return saved as CurrencyCode;
      }
    }
    // Fall back to browser default
    return getDefaultCurrency();
  });

  // Save to localStorage when currency changes
  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boptone_currency', newCurrency);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
