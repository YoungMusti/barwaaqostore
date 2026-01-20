import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

// Simulated recent purchases
const purchases = [
  { name: 'Fatima', location: 'Mogadishu', product: 'Nike Air Max', time: '2 min ago' },
  { name: 'Ahmed', location: 'Hargeisa', product: 'Adidas Ultra Boost', time: '5 min ago' },
  { name: 'Amina', location: 'Mogadishu', product: 'Puma RS-X', time: '8 min ago' },
  { name: 'Hassan', location: 'Kismayo', product: 'Jordan 1 Retro', time: '12 min ago' },
  { name: 'Halima', location: 'Baidoa', product: 'Nike Dunk Low', time: '15 min ago' },
];

export function SocialProofPopup() {
  const [currentPurchase, setCurrentPurchase] = useState<typeof purchases[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    if (isDismissed) return;

    // Show first popup after 5 seconds
    const initialTimeout = setTimeout(() => {
      showRandomPurchase();
    }, 5000);

    return () => clearTimeout(initialTimeout);
  }, [isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    // Hide after 5 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Show next after 30 seconds
    const nextTimeout = setTimeout(() => {
      showRandomPurchase();
    }, 30000);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [isVisible, isDismissed]);

  const showRandomPurchase = () => {
    const randomPurchase = purchases[Math.floor(Math.random() * purchases.length)];
    setCurrentPurchase(randomPurchase);
    setIsVisible(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 z-40 max-w-xs bg-card border border-border rounded-xl shadow-lg p-4"
        >
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                <span className="text-primary">{currentPurchase.name}</span>
                {' '}
                {language === 'so' ? 'wuxuu iibsaday' : 'purchased'}
              </p>
              <p className="text-sm text-foreground font-semibold">{currentPurchase.product}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {currentPurchase.location} • {currentPurchase.time}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
