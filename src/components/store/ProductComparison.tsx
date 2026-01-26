import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { X, Plus, ShoppingBag, Package, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductComparisonProps {
  products: Product[];
  selectedProducts: Product[];
  onToggleProduct: (product: Product) => void;
  onClear: () => void;
}

export function ProductComparisonButton({ 
  selectedCount, 
  onClick 
}: { 
  selectedCount: number; 
  onClick: () => void;
}) {
  const { language } = useLanguage();

  if (selectedCount < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
    >
      <Button
        onClick={onClick}
        className="rounded-full gap-2 shadow-lg px-6"
      >
        <GitCompare className="w-4 h-4" />
        {language === 'so' ? `Isbarbar dhig (${selectedCount})` : `Compare (${selectedCount})`}
      </Button>
    </motion.div>
  );
}

export function ProductComparisonModal({
  isOpen,
  onClose,
  products,
}: {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}) {
  const { language } = useLanguage();
  const { addItem } = useCart();

  const getEffectivePrice = (product: Product) => {
    return product.is_on_sale && product.sale_price ? product.sale_price : product.price;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 bg-card rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold">
                  {language === 'so' ? 'Isbarbar dhig Alaabta' : 'Compare Products'}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Comparison Table */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(200px, 1fr))` }}>
                {products.map((product) => (
                  <div key={product.id} className="space-y-4">
                    {/* Image */}
                    <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-lg">{product.name}</h3>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        ${getEffectivePrice(product).toFixed(2)}
                      </span>
                      {product.is_on_sale && product.sale_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className={cn(
                      "text-sm font-medium",
                      product.stock === 0 ? "text-destructive" :
                      product.stock <= 5 ? "text-warning" : "text-success"
                    )}>
                      {product.stock === 0 
                        ? (language === 'so' ? 'Aan la helin' : 'Out of Stock')
                        : product.stock <= 5 
                          ? `${product.stock} ${language === 'so' ? 'hadhay' : 'left'}`
                          : (language === 'so' ? 'La heli karo' : 'In Stock')
                      }
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Add to Cart */}
                    <Button
                      onClick={() => addItem(product)}
                      disabled={product.stock === 0}
                      className="w-full gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {language === 'so' ? 'Ku dar' : 'Add to Cart'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Toggle button for product cards
export function CompareToggle({
  isSelected,
  onToggle,
  disabled,
}: {
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      className={cn(
        "absolute top-3 left-12 w-8 h-8 rounded-full flex items-center justify-center transition-all",
        isSelected 
          ? "bg-primary text-primary-foreground" 
          : "bg-background/80 hover:bg-background text-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      title="Add to compare"
    >
      {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
    </motion.button>
  );
}
