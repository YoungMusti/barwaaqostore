import { createContext, useContext, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

type Currency = 'USD' | 'SOS';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (usdPrice: number) => string;
  rate: number;
}

const EXCHANGE_RATE = 571; // 1 USD ≈ 571 SOS (approximate)

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  
  const formatPrice = (usdPrice: number) => {
    if (currency === 'SOS') {
      const sosPrice = usdPrice * EXCHANGE_RATE;
      return `Sh${sosPrice.toLocaleString('en', { maximumFractionDigits: 0 })}`;
    }
    return `$${usdPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rate: EXCHANGE_RATE }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setCurrency(currency === 'USD' ? 'SOS' : 'USD')}
      className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border hover:border-primary/30"
    >
      {currency === 'USD' ? '💵 USD' : '🇸🇴 SOS'}
    </motion.button>
  );
}
