import { useCurrency } from '@/contexts/CurrencyContext';
import { convertCurrency, formatCurrency } from '@shared/currency';

interface PriceDisplayProps {
  amountUSD: number;
  className?: string;
  showCurrencyCode?: boolean;
}

/**
 * Display price in user's selected currency
 * Automatically converts from USD to target currency
 */
export default function PriceDisplay({ 
  amountUSD, 
  className = '',
  showCurrencyCode = false 
}: PriceDisplayProps) {
  const { currency } = useCurrency();
  
  const convertedAmount = convertCurrency(amountUSD, currency);
  const formatted = formatCurrency(convertedAmount, currency);
  
  return (
    <span className={className}>
      {formatted}
      {showCurrencyCode && ` ${currency}`}
    </span>
  );
}
