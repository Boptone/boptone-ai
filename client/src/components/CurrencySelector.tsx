import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CURRENCIES, CurrencyCode } from '@shared/currency';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function CurrencySelector() {
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrency = CURRENCIES[currency];

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={t('currency.selectCurrency')}
      >
        <span>{currentCurrency.symbol} {currentCurrency.code}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                {t('currency.selectCurrency')}
              </div>
              {Object.values(CURRENCIES).map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencyChange(curr.code)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    curr.code === currency
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{curr.name}</span>
                    <span className="text-gray-500">{curr.symbol} {curr.code}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
