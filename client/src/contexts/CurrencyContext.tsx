import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'BRL' | 'MXN' | 'KRW' | 'AED';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('boptone-currency');
    if (saved && ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'BRL', 'MXN', 'KRW', 'AED'].includes(saved)) {
      return saved as Currency;
    }
    
    // Auto-detect from browser locale
    const locale = navigator.language;
    if (locale.startsWith('en-GB')) return 'GBP';
    if (locale.startsWith('es-ES')) return 'EUR';
    if (locale.startsWith('pt-BR')) return 'BRL';
    if (locale.startsWith('es-MX')) return 'MXN';
    if (locale.startsWith('fr')) return 'EUR';
    if (locale.startsWith('de')) return 'EUR';
    if (locale.startsWith('ja')) return 'JPY';
    if (locale.startsWith('ko')) return 'KRW';
    if (locale.startsWith('zh')) return 'CNY';
    if (locale.startsWith('hi')) return 'INR';
    if (locale.startsWith('ar-AE')) return 'AED';
    
    return 'USD';
  });

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('boptone-currency', newCurrency);
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
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
