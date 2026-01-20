import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

export function StickyCartBar() {
  const { items, totalAmount, totalItems, isOpen, setIsOpen } = useCart();
  const { t } = useLanguage();

  // Only show when cart has items and drawer is closed
  const shouldShow = items.length > 0 && !isOpen;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg p-4 md:hidden"
        >
          <div className="container flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                <p className="text-lg font-bold">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              className="h-12 px-6 rounded-xl"
            >
              {t('checkout')}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
