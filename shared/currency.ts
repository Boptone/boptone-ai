/**
 * Currency configuration and utilities for global pricing
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'BRL' | 'MXN' | 'KRW' | 'AED';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string; // For Intl.NumberFormat
  exchangeRate: number; // Relative to USD
}

/**
 * Supported currencies with exchange rates (relative to USD)
 * Exchange rates are approximate and should be updated periodically
 * or fetched from an API in production
 */
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 1.0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    exchangeRate: 0.92, // 1 USD = 0.92 EUR
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    exchangeRate: 0.79, // 1 USD = 0.79 GBP
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    exchangeRate: 149.0, // 1 USD = 149 JPY
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
    exchangeRate: 7.2, // 1 USD = 7.2 CNY
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    exchangeRate: 83.0, // 1 USD = 83 INR
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    locale: 'pt-BR',
    exchangeRate: 5.0, // 1 USD = 5 BRL
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    locale: 'es-MX',
    exchangeRate: 17.0, // 1 USD = 17 MXN
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    locale: 'ko-KR',
    exchangeRate: 1320.0, // 1 USD = 1320 KRW
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    exchangeRate: 3.67, // 1 USD = 3.67 AED
  },
};

/**
 * Convert USD amount to target currency
 */
export function convertCurrency(
  amountUSD: number,
  targetCurrency: CurrencyCode
): number {
  const currency = CURRENCIES[targetCurrency];
  return Math.round(amountUSD * currency.exchangeRate);
}

/**
 * Format currency amount with proper locale formatting
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode
): string {
  const currency = CURRENCIES[currencyCode];
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get currency from language code (best guess)
 */
export function getCurrencyFromLanguage(languageCode: string): CurrencyCode {
  const mapping: Record<string, CurrencyCode> = {
    'en': 'USD',
    'es': 'MXN', // Default to Mexican Peso for Spanish
    'pt': 'BRL', // Brazilian Real for Portuguese
    'fr': 'EUR',
    'de': 'EUR',
    'ja': 'JPY',
    'ko': 'KRW',
    'zh': 'CNY',
    'hi': 'INR',
    'ar': 'AED',
  };
  
  return mapping[languageCode] || 'USD';
}

/**
 * Get default currency based on browser locale
 */
export function getDefaultCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  
  const browserLang = navigator.language.split('-')[0];
  return getCurrencyFromLanguage(browserLang);
}
