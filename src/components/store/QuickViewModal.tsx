import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Eye } from 'lucide-react';
import { Product } from '@/types/database';
import { useCart, getEffectivePrice } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
}

export function QuickViewModal({ product, isOpen, onClose, onViewDetails }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const effectivePrice = getEffectivePrice(product);
  const isOnSale = product.is_on_sale && product.sale_price;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            <div className="relative aspect-square bg-secondary/30">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-muted-foreground/30" />
                </div>
              )}
              
              {isOnSale && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium bg-destructive text-destructive-foreground">
                  {t('sale')}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display text-xl font-bold mb-2">{product.name}</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold">${effectivePrice.toFixed(2)}</span>
                {isOnSale && (
                  <span className="text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 gap-2 transition-all",
                    isAdding && "bg-success"
                  )}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {product.stock === 0 ? t('outOfStock') : t('addToCart')}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart className={cn("w-4 h-4", inWishlist && "fill-current text-destructive")} />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onViewDetails}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
