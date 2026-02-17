import { useCurrency, Currency } from '@/contexts/CurrencyContext';

// Static exchange rates (base: USD)
// For production, replace with real-time API (e.g., Open Exchange Rates)
const exchangeRates: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.91,
  GBP: 0.79,
  JPY: 149.5,
  CNY: 7.24,
  INR: 83.2,
  BRL: 5.02,
  MXN: 17.1,
  KRW: 1340.0,
  AED: 3.67,
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  KRW: '₩',
  AED: 'د.إ',
};

interface PriceDisplayProps {
  usdAmount: number;
  className?: string;
}

export function PriceDisplay({ usdAmount, className = '' }: PriceDisplayProps) {
  const { currency } = useCurrency();
  
  const convertedAmount = usdAmount * exchangeRates[currency];
  const symbol = currencySymbols[currency];
  
  // Format based on currency
  let formattedAmount: string;
  if (currency === 'JPY' || currency === 'KRW') {
    // No decimals for yen and won
    formattedAmount = Math.round(convertedAmount).toLocaleString();
  } else {
    // 2 decimals for other currencies
    formattedAmount = convertedAmount.toFixed(0);
  }
  
  return (
    <span className={className}>
      {symbol}{formattedAmount}
    </span>
  );
}
